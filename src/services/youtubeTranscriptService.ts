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

// Fetch with hard 3.5-second timeout so UI never freezes or gets stuck
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 3500): Promise<Response> {
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
export async function fetchYouTubeTranscript(videoId: string): Promise<VideoTranscriptResult> {
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

  // METHOD 0: Direct Vercel Serverless Backend API Route (Zero CORS, 3.5s Timeout)
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${origin}/api/transcript?v=${encodeURIComponent(videoId)}`;
    const res = await fetchWithTimeout(apiUrl, {}, 3500);
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
          methodUsed: 'Automatic Vercel Serverless Backend (100% Grounded)'
        };
      }
    }
  } catch (err) {
    console.warn("Method 0 (Serverless API timeout/notice):", err);
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
    console.warn("Method 1 (corsproxy timeout/notice):", err);
  }

  // METHOD 2: Secondary Proxy (AllOrigins) (3.5s Timeout)
  try {
    const videoPageUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetchWithTimeout(videoPageUrl, {}, 3500);
    
    if (res.ok) {
      const html = await res.text();
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      
      if (playerResponseMatch && playerResponseMatch[1]) {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        if (tracks && tracks.length > 0) {
          const track = tracks[0];
          const captionUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(track.baseUrl)}`;
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
                methodUsed: 'YouTube CaptionTrack API (Secondary Proxy)'
              };
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Method 2 (allorigins timeout/notice):", err);
  }

  // If all automated transcript methods fail or time out
  return {
    videoId,
    success: false,
    segments: [],
    fullTranscriptText: '',
    totalDurationSeconds: 0,
    totalCharacterCount: 0,
    warning: 'Transcript could not be retrieved automatically. Please paste transcript text in the "Paste Video Transcript" drawer for 100% video fidelity.',
    methodUsed: 'Timed Out / Fallback'
  };
}
