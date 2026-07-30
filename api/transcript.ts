import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS headers for API requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-RapidAPI-Key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const videoId = (req.query.v || req.query.videoId || req.query.id) as string;
  const rapidApiKey = (req.query.rapidKey || req.headers['x-rapidapi-key'] || process.env.RAPIDAPI_KEY) as string;

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Missing video ID parameter (e.g. /api/transcript?v=Q7xuIH69dPM)' });
  }

  // 1. Attempt RapidAPI fetch if key is provided or configured in environment
  if (rapidApiKey && rapidApiKey.trim().length > 5) {
    try {
      const rapidUrl = `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${encodeURIComponent(videoId)}`;
      const response = await fetch(rapidUrl, {
        headers: {
          'x-rapidapi-key': rapidApiKey.trim(),
          'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const rawArray = Array.isArray(data) ? data : (data[0] && Array.isArray(data[0]) ? data[0] : data.transcript || data.transcripts);

        if (Array.isArray(rawArray) && rawArray.length > 0) {
          const segments = rawArray.map((item: any) => {
            const startSec = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
            const m = Math.floor(startSec / 60);
            const s = Math.floor(startSec % 60);
            const timestamp = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            const cleanText = (item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
            return {
              start: startSec,
              duration: typeof item.duration === 'number' ? item.duration : 3,
              text: cleanText,
              timestamp
            };
          }).filter((s) => s.text.length > 0);

          if (segments.length > 0) {
            const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
            const lastSeg = segments[segments.length - 1];
            return res.status(200).json({
              success: true,
              videoId,
              segments,
              fullTranscriptText,
              totalDurationSeconds: Math.ceil(lastSeg.start + lastSeg.duration),
              totalCharacterCount: fullTranscriptText.length,
              methodUsed: 'RapidAPI YouTube Transcriptor'
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('RapidAPI serverless fetch notice:', err?.message || err);
    }
  }

  // 2. Fallback to youtube-transcript library
  try {
    let transcriptItems: any[] = [];
    try {
      transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'hi' });
    } catch {
      try {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
      } catch {
        transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      }
    }

    if (transcriptItems && transcriptItems.length > 0) {
      const segments = transcriptItems.map((item) => {
        const offsetSec = Math.floor(item.offset / 1000);
        const m = Math.floor(offsetSec / 60);
        const s = offsetSec % 60;
        const timestamp = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        const cleanText = item.text
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .trim();
        return {
          start: offsetSec,
          duration: Math.ceil(item.duration / 1000),
          text: cleanText,
          timestamp
        };
      });

      const fullTranscriptText = segments.map((s) => `[${s.timestamp}] ${s.text}`).join('\n');
      const lastSeg = segments[segments.length - 1];

      return res.status(200).json({
        success: true,
        videoId,
        segments,
        fullTranscriptText,
        totalDurationSeconds: lastSeg ? lastSeg.start + lastSeg.duration : 0,
        totalCharacterCount: fullTranscriptText.length,
        methodUsed: 'Vercel Serverless YoutubeTranscript API'
      });
    }
  } catch (err: any) {
    console.error(`Vercel transcript error for ${videoId}:`, err?.message || err);
    return res.status(200).json({
      success: false,
      videoId,
      error: err?.message || 'Could not fetch YouTube transcript automatically for this video',
      methodUsed: 'Vercel Serverless YoutubeTranscript API (Failed)'
    });
  }

  return res.status(200).json({
    success: false,
    videoId,
    error: 'Transcript tracks not found for this video',
    methodUsed: 'Vercel Serverless YoutubeTranscript API (No Tracks)'
  });
}
