import React from 'react';
import { History, X, Trash2, Youtube, ArrowRight } from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: VideoNoteAnalysis[];
  onSelectHistoryItem: (item: VideoNoteAnalysis) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={onClose}
    >
      {/* Drawer Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          height: '100%',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 16,
          boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.08)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Outfit", sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <History style={{ width: 18, height: 18 }} />
              </div>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  Saved Video Sessions
                </h2>
                <div style={{ fontSize: 11, color: '#64748b' }}>
                  {history.length} {history.length === 1 ? 'session' : 'sessions'} stored locally
                </div>
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

          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
            Access your previously generated Class Notes PDFs, Mindmaps, and AI study chats anytime.
          </p>
        </div>

        {/* History Item List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
              <History style={{ width: 32, height: 32, margin: '0 auto 10px auto', opacity: 0.5 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#475569' }}>No saved sessions yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Paste a YouTube link to generate your first study session.</div>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
                }}
                className="history-item-card"
              >
                {/* Thumbnail */}
                <div style={{ width: 72, height: 46, borderRadius: 10, overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0, position: 'relative', background: '#0f172a' }}>
                  <img src={item.thumbnailUrl} alt={item.videoTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Youtube style={{ width: 14, height: 14, color: '#ffffff' }} />
                  </div>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                    {item.videoTitle}
                  </h4>
                  <div style={{ fontSize: 10.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{item.channelName || 'YouTube Note'}</span>
                    <span>•</span>
                    <span>{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    title="Delete session"
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      color: '#94a3b8',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>

                  <ArrowRight style={{ width: 14, height: 14, color: '#2563eb' }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 8,
                background: '#fef2f2',
                border: '1px solid #fecaca'
              }}
            >
              <Trash2 style={{ width: 13, height: 13 }} />
              <span>Clear All History</span>
            </button>
          )}

          <div style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}>
            Local Storage Persistence
          </div>
        </div>
      </div>
    </div>
  );
};
