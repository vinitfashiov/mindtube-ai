import React, { useState } from 'react';
import { Layers, X, Sparkles } from 'lucide-react';

interface PlaylistInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalyzePlaylist: (url: string) => void;
  isLoading: boolean;
}

export const PlaylistInputModal: React.FC<PlaylistInputModalProps> = ({
  isOpen,
  onClose,
  onAnalyzePlaylist,
  isLoading
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;
    onAnalyzePlaylist(playlistUrl.trim());
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          padding: '22px 20px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a'
            }}>
              <Layers style={{ width: 18, height: 18 }} />
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                Playlist Batch Summarizer
              </h3>
              <p style={{ fontSize: 11, color: '#64748b' }}>
                Summarize full YouTube courses & playlists into a master textbook PDF
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 6 }}>
              YouTube Playlist Link
            </label>
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://www.youtube.com/playlist?list=..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 6 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                background: '#f1f5f9',
                color: '#475569',
                fontSize: 12.5,
                fontWeight: 600
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 20px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
              }}
            >
              <Sparkles style={{ width: 14, height: 14 }} />
              <span>{isLoading ? 'Processing Playlist...' : 'Summarize Playlist Binder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
