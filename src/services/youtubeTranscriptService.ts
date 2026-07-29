// YouTube Transcript & Subtitle Fetcher Service for MindTube AI
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

// Fetch Real YouTube Subtitles / Captions
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

  try {
    // Attempt 1: Fetch YouTube timedtext track info via CORS proxy
    const videoPageUrl = `https://corsproxy.io/?${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
    const res = await fetch(videoPageUrl);
    
    if (res.ok) {
      const html = await res.text();
      
      // Extract ytInitialPlayerResponse JSON
      const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
      if (playerResponseMatch && playerResponseMatch[1]) {
        const playerResponse = JSON.parse(playerResponseMatch[1]);
        const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        
        if (tracks && tracks.length > 0) {
          // Prefer English or Hindi or first available track
          const track = tracks.find((t: any) => t.languageCode === 'hi') || 
                        tracks.find((t: any) => t.languageCode === 'en') || 
                        tracks[0];
          
          const captionUrl = `https://corsproxy.io/?${encodeURIComponent(track.baseUrl)}`;
          const captionRes = await fetch(captionUrl);
          
          if (captionRes.ok) {
            const xmlText = await captionRes.text();
            const segments: TranscriptSegment[] = [];
            
            // Parse XML <text start="12.34" dur="4.5">Text</text>
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
            
            if (segments.length > 0) {
              const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
              const lastSeg = segments[segments.length - 1];
              const totalDurationSeconds = Math.ceil(lastSeg.start + lastSeg.duration);
              
              return {
                videoId,
                success: true,
                language: track.languageCode,
                segments,
                fullTranscriptText,
                totalDurationSeconds,
                totalCharacterCount: fullTranscriptText.length
              };
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("YouTube transcript fetch error:", err);
  }

  // If transcript fetch failed (e.g. CORS proxy blocked or video has no captions)
  return {
    videoId,
    success: false,
    segments: [],
    fullTranscriptText: '',
    totalDurationSeconds: 0,
    totalCharacterCount: 0,
    warning: 'Transcript could not be retrieved automatically. Please verify or paste transcript content for 100% fidelity.'
  };
}
