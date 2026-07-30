import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YoutubeTranscript } from 'youtube-transcript';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS headers for API requests
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const videoId = (req.query.v || req.query.videoId || req.query.id) as string;

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Missing video ID parameter (e.g. /api/transcript?v=Q7xuIH69dPM)' });
  }

  try {
    // Attempt 1: Fetch Hindi transcript first, then English, then default
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
