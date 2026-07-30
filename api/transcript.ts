import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YoutubeTranscript } from 'youtube-transcript';

const SYSTEM_RAPIDAPI_KEY = "410bbf96b4msh8cd91df5fc3db0cp1c1b6ajsn0fd7d874c865";

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
  const userRapidKey = (req.query.rapidKey || req.headers['x-rapidapi-key']) as string;
  const rapidApiKey = (userRapidKey && userRapidKey.trim().length > 5) ? userRapidKey.trim() : SYSTEM_RAPIDAPI_KEY;

  if (!videoId) {
    return res.status(400).json({ success: false, error: 'Missing video ID parameter (e.g. /api/transcript?v=Q7xuIH69dPM)' });
  }

  // 1. Primary Attempt: RapidAPI YouTube Transcriptor with System Key
  try {
    const rapidUrl = `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${encodeURIComponent(videoId)}`;
    const response = await fetch(rapidUrl, {
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'youtube-transcriptor.p.rapidapi.com'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const firstElem = Array.isArray(data) ? data[0] : data;

      if (firstElem) {
        const rawArray = firstElem.transcription || firstElem.transcript || firstElem.transcripts || (Array.isArray(firstElem) ? firstElem : null);

        let segments: any[] = [];

        if (Array.isArray(rawArray) && rawArray.length > 0) {
          segments = rawArray.map((item: any) => {
            const startSec = typeof item.start === 'number' ? item.start : parseFloat(item.start || '0');
            const m = Math.floor(startSec / 60);
            const s = Math.floor(startSec % 60);
            const timestamp = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            const cleanText = (item.subtitle || item.text || item.content || '').replace(/<[^>]+>/g, '').trim();
            return {
              start: startSec,
              duration: typeof item.dur === 'number' ? item.dur : (typeof item.duration === 'number' ? item.duration : 3),
              text: cleanText,
              timestamp
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
          return res.status(200).json({
            success: true,
            videoId,
            segments,
            fullTranscriptText,
            totalDurationSeconds: lastSeg ? Math.ceil(lastSeg.start + lastSeg.duration) : (firstElem.lengthInSeconds || 0),
            totalCharacterCount: fullTranscriptText.length,
            methodUsed: 'System RapidAPI Engine (100% Grounded)'
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('System RapidAPI serverless fetch notice:', err?.message || err);
  }

  // 2. Secondary Fallback: youtube-transcript library
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
  }

  return res.status(200).json({
    success: false,
    videoId,
    error: 'Transcript tracks not found for this video',
    methodUsed: 'Fallback (No Spoken Captions Available)'
  });
}
