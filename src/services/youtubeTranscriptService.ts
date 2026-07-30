// Multi-Method Resilient YouTube Transcript & Subtitle Fetcher Service
export interface TranscriptSegment {
  start: number;       // Start time in seconds
  duration: number;    // Duration in seconds
  text: string;        // Spoken transcript text
  timestamp: string;   // Formatted timestamp string (e.g. "02:14")
}

export interface VideoTranscriptResult {
  videoId: string;
  success: boolean;
  language?: string;
  segments: TranscriptSegment[];
  fullTranscriptText: string;
  totalDurationSeconds: number;
  totalCharacterCount: number;
  warning?: string;
  methodUsed?: string;
}

// Fetch with hard 4.5-second timeout so UI never freezes
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Format seconds into MM:SS or HH:MM:SS string
export function formatSecondsToTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Helper to parse XML caption track text
function parseCaptionXml(xmlText: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const textRegex = /<text\s+start="([\d.]+)"\s+(?:dur="([\d.]+)"\s+)?.*?>([\s\S]*?)<\/text>/gi;
  let match;
  
  while ((match = textRegex.exec(xmlText)) !== null) {
    const start = parseFloat(match[1]);
    const duration = match[2] ? parseFloat(match[2]) : 3.0;
    const rawText = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/<[^>]+>/g, '')
      .replace(/\n/g, ' ')
      .trim();
      
    if (rawText) {
      segments.push({
        start,
        duration,
        text: rawText,
        timestamp: formatSecondsToTimestamp(start)
      });
    }
  }
  return segments;
}

// Direct RapidAPI Fetch Helper
export async function fetchRapidApiTranscript(videoId: string, rapidApiKey: string): Promise<VideoTranscriptResult | null> {
  if (!videoId || !rapidApiKey) return null;
  const key = rapidApiKey.trim();

  // RapidAPI Host 1: youtube-transcriptor.p.rapidapi.com
  try {
    const url = `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${encodeURIComponent(videoId)}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
      }
    }, 6000);

    if (res.ok) {
      const data = await res.json();
      const rawArray = Array.isArray(data) ? data : (data[0] && Array.isArray(data[0]) ? data[0] : data.transcript || data.transcripts);

      if (Array.isArray(rawArray) && rawArray.length > 0) {
        const segments: TranscriptSegment[] = rawArray.map((item: any) => {
          const start = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
          const duration = typeof item.duration === 'number' ? item.duration : parseFloat(item.duration || '3');
          const text = (item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
          return {
            start,
            duration,
            text,
            timestamp: formatSecondsToTimestamp(start)
          };
        }).filter((s) => s.text.length > 0);

        if (segments.length > 0) {
          const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
          const lastSeg = segments[segments.length - 1];
          return {
            videoId,
            success: true,
            language: 'auto',
            segments,
            fullTranscriptText,
            totalDurationSeconds: Math.ceil(lastSeg.start + lastSeg.duration),
            totalCharacterCount: fullTranscriptText.length,
            methodUsed: 'RapidAPI YouTube Transcriptor'
          };
        }
      }
    }
  } catch (err) {
    console.warn("RapidAPI Host 1 notice:", err);
  }

  // RapidAPI Host 2: youtube-transcript3.p.rapidapi.com
  try {
    const url = `https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcript3.p.rapidapi.com'
      }
    }, 6000);

    if (res.ok) {
      const data = await res.json();
      const rawArray = Array.isArray(data) ? data : (data.transcript || data.transcripts);

      if (Array.isArray(rawArray) && rawArray.length > 0) {
        const segments: TranscriptSegment[] = rawArray.map((item: any) => {
          const start = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
          const duration = typeof item.duration === 'number' ? item.duration : parseFloat(item.duration || '3');
          const text = (item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
          return {
            start,
            duration,
            text,
            timestamp: formatSecondsToTimestamp(start)
          };
        }).filter((s) => s.text.length > 0);

        if (segments.length > 0) {
          const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
          const lastSeg = segments[segments.length - 1];
          return {
            videoId,
            success: true,
            language: 'auto',
            segments,
            fullTranscriptText,
            totalDurationSeconds: Math.ceil(lastSeg.start + lastSeg.duration),
            totalCharacterCount: fullTranscriptText.length,
            methodUsed: 'RapidAPI YouTube Transcript3'
          };
        }
      }
    }
  } catch (err) {
    console.warn("RapidAPI Host 2 notice:", err);
  }

  // RapidAPI Host 3: youtube-transcripts1.p.rapidapi.com (Supadata)
  try {
    const url = `https://youtube-transcripts1.p.rapidapi.com/transcript?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcripts1.p.rapidapi.com'
      }
    }, 6000);

    if (res.ok) {
      const data = await res.json();
      const rawArray = Array.isArray(data) ? data : (data.content || data.transcript || data.transcripts);

      if (Array.isArray(rawArray) && rawArray.length > 0) {
        const segments: TranscriptSegment[] = rawArray.map((item: any) => {
          const start = typeof item.offset === 'number' ? Math.floor(item.offset / 1000) : (typeof item.start === 'number' ? item.start : parseFloat(item.start || '0'));
          const duration = typeof item.duration === 'number' ? item.duration : 3;
          const text = (item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
          return {
            start,
            duration,
            text,
            timestamp: formatSecondsToTimestamp(start)
          };
        }).filter((s) => s.text.length > 0);

        if (segments.length > 0) {
          const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
          const lastSeg = segments[segments.length - 1];
          return {
            videoId,
            success: true,
            language: 'auto',
            segments,
            fullTranscriptText,
            totalDurationSeconds: Math.ceil(lastSeg.start + lastSeg.duration),
            totalCharacterCount: fullTranscriptText.length,
            methodUsed: 'RapidAPI Supadata YouTube Transcripts'
          };
        }
      }
    }
  } catch (err) {
    console.warn("RapidAPI Host 3 notice:", err);
  }

  return null;
}

// Parse plain text transcript into segments
export function parseRawTranscriptText(rawText: string): VideoTranscriptResult {
  const lines = rawText.split('\n');
  const segments: TranscriptSegment[] = [];
  let currentTime = 0;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Check if line starts with timestamp like [02:14] or 02:14
    const timeMatch = trimmed.match(/^\[?(\d{1,2}:)?(\d{1,2}):(\d{2})\]?\s*(.*)$/);
    if (timeMatch) {
      const hours = timeMatch[1] ? parseInt(timeMatch[1].replace(':', '')) : 0;
      const mins = parseInt(timeMatch[2]);
      const secs = parseInt(timeMatch[3]);
      const seconds = hours * 3600 + mins * 60 + secs;
      const content = timeMatch[4].trim();

      if (content) {
        segments.push({
          start: seconds,
          duration: 4,
          text: content,
          timestamp: formatSecondsToTimestamp(seconds)
        });
        currentTime = seconds;
      }
    } else {
      segments.push({
        start: currentTime,
        duration: 4,
        text: trimmed,
        timestamp: formatSecondsToTimestamp(currentTime)
      });
      currentTime += 4;
    }
  });

  const fullText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
  const lastSeg = segments[segments.length - 1];

  return {
    videoId: 'custom-pasted',
    success: true,
    language: 'custom',
    segments,
    fullTranscriptText: fullText,
    totalDurationSeconds: lastSeg ? lastSeg.start + 5 : 0,
    totalCharacterCount: fullText.length,
    methodUsed: 'User Pasted Transcript'
  };
}

// Fetch Real YouTube Subtitles / Captions via Multi-Method Pipeline
export async function fetchYouTubeTranscript(videoId: string, customRapidApiKey?: string): Promise<VideoTranscriptResult> {
  if (!videoId) {
    return {
      videoId: '',
      success: false,
      segments: [],
      fullTranscriptText: '',
      totalDurationSeconds: 0,
      totalCharacterCount: 0,
      warning: 'Invalid Video ID'
    };
  }

  const rapidKey = customRapidApiKey || (typeof localStorage !== 'undefined' ? localStorage.getItem('mindtube_rapidapi_key') || '' : '');

  // METHOD -1: Direct RapidAPI Key Fetching (if Key Exists)
  if (rapidKey && rapidKey.trim().length > 5) {
    try {
      const rapidResult = await fetchRapidApiTranscript(videoId, rapidKey);
      if (rapidResult && rapidResult.success) {
        return rapidResult;
      }
    } catch (err) {
      console.warn('RapidAPI direct fetch notice:', err);
    }
  }

  // METHOD 0: Direct Vercel Serverless Backend API Route (Zero CORS, 4.5s Timeout)
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${origin}/api/transcript?v=${encodeURIComponent(videoId)}${rapidKey ? `&rapidKey=${encodeURIComponent(rapidKey)}` : ''}`;
    const res = await fetchWithTimeout(apiUrl, {
      headers: rapidKey ? { 'x-rapidapi-key': rapidKey } : {}
    }, 4500);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.fullTranscriptText) {
        return {
          videoId,
          success: true,
          language: data.language || 'auto',
          segments: data.segments || [],
          fullTranscriptText: data.fullTranscriptText,
          totalDurationSeconds: data.totalDurationSeconds || 0,
          totalCharacterCount: data.totalCharacterCount || data.fullTranscriptText.length,
          methodUsed: data.methodUsed || 'Automatic Vercel Serverless Backend (100% Grounded)'
        };
      }
    }
  } catch (err) {
    console.warn("Method 0 (Serverless API notice):", err);
  }

  // METHOD 1: Client-Side CORS Proxy via ytInitialPlayerResponse (3.5s Timeout)
  try {
    const videoPageUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetchWithTimeout(videoPageUrl, { headers: { 'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8' } }, 3500);
    
    if (res.ok) {
      const html = await res.text();
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      
      if (playerResponseMatch && playerResponseMatch[1]) {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        if (tracks && tracks.length > 0) {
          const track = tracks.find((t: any) => t.languageCode === 'hi') || 
                        tracks.find((t: any) => t.languageCode === 'en') || 
                        tracks[0];
          
          const captionUrl = `https://corsproxy.io/?${encodeURIComponent(track.baseUrl)}`;
          const captionRes = await fetchWithTimeout(captionUrl, {}, 3500);
          
          if (captionRes.ok) {
            const xmlText = await captionRes.text();
            const segments = parseCaptionXml(xmlText);
            
            if (segments.length > 0) {
              const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
              const lastSeg = segments[segments.length - 1];
              return {
                videoId,
                success: true,
                language: track.languageCode,
                segments,
                fullTranscriptText,
                totalDurationSeconds: Math.ceil(lastSeg.start + lastSeg.duration),
                totalCharacterCount: fullTranscriptText.length,
                methodUsed: 'YouTube CaptionTrack API (Client Proxy)'
              };
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Method 1 (corsproxy notice):", err);
  }

  // If all automated transcript methods fail
  return {
    videoId,
    success: false,
    segments: [],
    fullTranscriptText: '',
    totalDurationSeconds: 0,
    totalCharacterCount: 0,
    warning: 'Transcript could not be retrieved automatically. Please paste transcript text in the "Paste Video Transcript" drawer for 100% video fidelity.',
    methodUsed: 'Fallback'
  };
}
