import React, { useState, useEffect } from 'react';
import { FileText, Copy, Download, Sparkles, Youtube, Check, ArrowLeft, Search, Loader2, ArrowRight } from 'lucide-react';
import { fetchYouTubeTranscript, VideoTranscriptResult } from '../services/youtubeTranscriptService';
import { extractYouTubeId, fetchYouTubeMetadata } from '../services/geminiService';

interface YtToTextPageProps {
  onBackToApp: () => void;
  onSendTranscriptToNotes?: (transcriptText: string, videoUrl: string) => void;
}

export const YtToTextPage: React.FC<YtToTextPageProps> = ({
  onBackToApp,
  onSendTranscriptToNotes
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<VideoTranscriptResult | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check URL query parameters if user visited /yttotext?v=URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get('v') || params.get('url');
    if (vParam) {
      setVideoUrl(vParam);
      handleExtractTranscript(vParam);
    }
  }, []);

  const handleExtractTranscript = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || videoUrl).trim();
    if (!targetUrl) return;

    const videoId = extractYouTubeId(targetUrl);
    if (!videoId) {
      setErrorMsg('Invalid YouTube URL. Please enter a valid YouTube video link.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setTranscriptResult(null);
    setVideoTitle('');

    try {
      // Fetch oEmbed Title
      const meta = await fetchYouTubeMetadata(targetUrl);
      setVideoTitle(meta?.title || `YouTube Video (${videoId})`);

      // Fetch Spoken Transcript using System Pipeline
      const result = await fetchYouTubeTranscript(videoId);
      setTranscriptResult(result);

      if (!result.success || result.fullTranscriptText.length < 30) {
        setErrorMsg(result.warning || 'Could not fetch spoken captions automatically for this video.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to extract video transcript.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!transcriptResult?.fullTranscriptText) return;
    navigator.clipboard.writeText(transcriptResult.fullTranscriptText);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const handleDownload = () => {
    if (!transcriptResult?.fullTranscriptText) return;
    const blob = new Blob([transcriptResult.fullTranscriptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(videoTitle || 'youtube_transcript').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSegments = transcriptResult?.segments?.filter((s) =>
    s.text.toLowerCase().includes(searchQuery.toLowerCase()) || s.timestamp.includes(searchQuery)
  ) || [];

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', color: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBackToApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              fontSize: 12.5,
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft style={{ width: 15, height: 15 }} />
            <span>Back to Notes App</span>
          </button>

          <div style={{ height: 20, width: 1, background: '#cbd5e1' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText style={{ width: 20, height: 20, color: '#2563eb' }} />
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0f172a' }}>
              YouTube to Text (<code style={{ background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: 4, fontSize: 13 }}>/yttotext</code>)
            </h1>
          </div>
        </div>

        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
          ⚡ Powered by RapidAPI System Engine
        </span>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 900, width: '100%', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title Card */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h2 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: '#0f172a' }}>
            Direct Spoken YouTube Subtitle & Transcript Extractor
          </h2>
          <p style={{ fontSize: 13.5, color: '#64748b', margin: 0 }}>
            Paste any YouTube URL to extract 100% of spoken words with exact timestamps in seconds.
          </p>
        </div>

        {/* Input Form Box */}
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #cbd5e1', padding: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExtractTranscript();
            }}
            style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: 260, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Youtube style={{ position: 'absolute', left: 14, width: 18, height: 18, color: '#dc2626' }} />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=Q7xuIH69dPM)..."
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 12,
                  border: '1.5px solid #cbd5e1',
                  fontSize: 13.5,
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!videoUrl.trim() || isLoading}
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                opacity: !videoUrl.trim() || isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                  <span>Extracting Transcript...</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 16, height: 16 }} />
                  <span>Extract Spoken Transcript</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', fontSize: 12.5, fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* TRANSCRIPT RESULTS CONTAINER */}
        {transcriptResult && (
          <div style={{ background: '#ffffff', borderRadius: 16, border: '1.5px solid #cbd5e1', padding: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Header Metadata */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
              {videoTitle && (
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  🎥 {videoTitle}
                </h3>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', fontWeight: 700, color: '#0f172a' }}>
                  📜 {transcriptResult.segments?.length.toLocaleString() || 0} Spoken Lines
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', fontWeight: 700, color: '#0f172a' }}>
                  📝 {transcriptResult.totalCharacterCount.toLocaleString()} Characters
                </span>
                <span style={{ padding: '4px 10px', borderRadius: 6, background: '#eff6ff', fontWeight: 700, color: '#2563eb' }}>
                  ⚡ {transcriptResult.methodUsed || 'System RapidAPI Engine'}
                </span>
              </div>
            </div>

            {/* Action Buttons Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 240 }}>
                <Search style={{ position: 'absolute', left: 10, top: 9, width: 14, height: 14, color: '#94a3b8' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter transcript keywords..."
                  style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 12 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopy}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: copiedNotice ? '#f0fdf4' : '#ffffff',
                    border: copiedNotice ? '1px solid #86efac' : '1px solid #cbd5e1',
                    color: copiedNotice ? '#15803d' : '#334155',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {copiedNotice ? <Check style={{ width: 14, height: 14, color: '#16a34a' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  <span>{copiedNotice ? 'Copied to Clipboard!' : 'Copy Transcript'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                  <span>Download .txt</span>
                </button>

                {onSendTranscriptToNotes && (
                  <button
                    onClick={() => onSendTranscriptToNotes(transcriptResult.fullTranscriptText, videoUrl)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
                    }}
                  >
                    <span>Generate Master Notes from Transcript</span>
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Spoken Transcript Text Container */}
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 14, maxHeight: 450, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'Consolas, monospace', fontSize: 12, lineHeight: 1.6 }}>
              {filteredSegments.length > 0 ? (
                filteredSegments.map((seg, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0, userSelect: 'none' }}>
                      [{seg.timestamp}]
                    </span>
                    <span style={{ color: '#0f172a' }}>
                      {seg.text}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                  No matching transcript lines found for "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
