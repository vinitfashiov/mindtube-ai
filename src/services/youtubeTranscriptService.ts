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

// User-provided System RapidAPI Key (Hardcoded into backend system)
export const SYSTEM_RAPIDAPI_KEY = "410bbf96b4msh8cd91df5fc3db0cp1c1b6ajsn0fd7d874c865";

// Fetch with hard 8-second timeout for RapidAPI
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
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
export function parseCaptionXml(xmlText: string): TranscriptSegment[] {
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

// Universal RapidAPI JSON Response Parser
function parseRapidApiResponse(data: any, videoId: string, methodLabel: string): VideoTranscriptResult | null {
  const firstElem = Array.isArray(data) ? data[0] : data;
  if (!firstElem) return null;

  const rawArray = firstElem.transcription || firstElem.transcript || firstElem.transcripts || (Array.isArray(firstElem) ? firstElem : null);

  let segments: TranscriptSegment[] = [];

  if (Array.isArray(rawArray) && rawArray.length > 0) {
    segments = rawArray.map((item: any) => {
      const start = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
      const duration = typeof item.dur === 'number' ? item.dur : (typeof item.duration === 'number' ? item.duration : 3);
      const text = (item.subtitle || item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
      return {
        start,
        duration,
        text,
        timestamp: formatSecondsToTimestamp(start)
      };
    }).filter((s) => s.text.length > 0);
  }

  let fullTranscriptText = '';
  if (segments.length > 0) {
    fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
  } else if (firstElem.transcriptionAsText && typeof firstElem.transcriptionAsText === 'string') {
    fullTranscriptText = firstElem.transcriptionAsText.trim();
    segments = [{
      start: 0,
      duration: 60,
      text: fullTranscriptText,
      timestamp: '00:00'
    }];
  }

  if (fullTranscriptText.length > 30) {
    const lastSeg = segments[segments.length - 1];
    return {
      videoId,
      success: true,
      language: 'auto',
      segments,
      fullTranscriptText,
      totalDurationSeconds: lastSeg ? Math.ceil(lastSeg.start + lastSeg.duration) : (firstElem.lengthInSeconds || 0),
      totalCharacterCount: fullTranscriptText.length,
      methodUsed: methodLabel
    };
  }
  return null;
}

// Multi-Proxy RapidAPI Fetch Helper using System Key
export async function fetchRapidApiTranscript(videoId: string, customRapidApiKey?: string): Promise<VideoTranscriptResult | null> {
  if (!videoId) return null;
  const key = (customRapidApiKey && customRapidApiKey.trim().length > 5) 
    ? customRapidApiKey.trim() 
    : (typeof localStorage !== 'undefined' && localStorage.getItem('mindtube_rapidapi_key')) 
      ? localStorage.getItem('mindtube_rapidapi_key')!.trim() 
      : SYSTEM_RAPIDAPI_KEY;

  const targetUrl = `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${encodeURIComponent(videoId)}`;

  // 1. Direct Fetch
  try {
    const res = await fetchWithTimeout(targetUrl, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
      }
    }, 8000);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseRapidApiResponse(data, videoId, 'System RapidAPI Engine Direct (100% Grounded)');
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("RapidAPI direct fetch notice:", err);
  }

  // 2. CORS Proxy 1 (corsproxy.io)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const res = await fetchWithTimeout(proxyUrl, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
      }
    }, 8000);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseRapidApiResponse(data, videoId, 'System RapidAPI Engine CorsProxy (100% Grounded)');
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("RapidAPI corsproxy notice:", err);
  }

  // 3. CORS Proxy 2 (allorigins.win)
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    const res = await fetchWithTimeout(proxyUrl, {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
      }
    }, 8000);
    if (res.ok) {
      const data = await res.json();
      const parsed = parseRapidApiResponse(data, videoId, 'System RapidAPI Engine AllOrigins (100% Grounded)');
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn("RapidAPI allorigins notice:", err);
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

  // METHOD -1: Primary Multi-Proxy System RapidAPI Key Fetch
  try {
    const rapidResult = await fetchRapidApiTranscript(videoId, customRapidApiKey);
    if (rapidResult && rapidResult.success && rapidResult.fullTranscriptText.length > 50) {
      return rapidResult;
    }
  } catch (err) {
    console.warn('RapidAPI direct system fetch notice:', err);
  }

  // METHOD 0: Direct Vercel Serverless Backend API Route
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const apiUrl = `${origin}/api/transcript?v=${encodeURIComponent(videoId)}`;
    const res = await fetchWithTimeout(apiUrl, {}, 8000);
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
          methodUsed: data.methodUsed || 'System RapidAPI Engine (100% Grounded)'
        };
      }
    }
  } catch (err) {
    console.warn("Method 0 (Serverless API notice):", err);
  }

  // If all automated transcript methods fail
  return {
    videoId,
    success: false,
    segments: [],
    fullTranscriptText: '',
    totalDurationSeconds: 0,
    totalCharacterCount: 0,
    warning: 'Transcript could not be retrieved automatically. Please click "⚠️ 📝 Paste Video Transcript" in the chat bar to attach the transcript lines for 100% video fidelity.',
    methodUsed: 'Fallback'
  };
}
