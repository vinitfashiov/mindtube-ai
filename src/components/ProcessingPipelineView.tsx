import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, FileDown, Bot, Youtube, X } from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';

interface ProcessingPipelineViewProps {
  youtubeUrl: string;
  analysis: VideoNoteAnalysis | null;
  isLoading: boolean;
  onDownloadPdf: () => void;
  onOpenChat: () => void;
  onReset: () => void;
}

export const ProcessingPipelineView: React.FC<ProcessingPipelineViewProps> = ({
  youtubeUrl,
  analysis,
  isLoading,
  onDownloadPdf,
  onOpenChat,
  onReset
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setStepIndex(1);
      const t1 = setTimeout(() => setStepIndex(2), 1000);
      const t2 = setTimeout(() => setStepIndex(3), 2000);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (analysis) {
      setStepIndex(4); // Finished
    }
  }, [isLoading, analysis]);

  return (
    <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px', maxWidth: 680, margin: '0 auto' }}>
      {/* Top Header Status Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
          <Sparkles style={{ width: 14, height: 14, color: '#2563eb' }} />
          <span>Processing Pipeline</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 9999, background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
            ⚡ {analysis ? '100%' : '50%'} ready
          </span>
          {onReset && (
            <button onClick={onReset} style={{ color: '#94a3b8', padding: 4 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>

      {/* User Sent URL Badge */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <div style={{ padding: '8px 14px', borderRadius: 16, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 12, color: '#0f172a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
          <Youtube style={{ width: 14, height: 14, color: '#dc2626', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{youtubeUrl || 'YouTube Video Request'}</span>
        </div>
      </div>

      {/* Step-by-Step Progress Pipeline */}
      <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: stepIndex >= 1 ? 600 : 400, color: stepIndex >= 1 ? '#0f172a' : '#94a3b8' }}>
          {stepIndex > 1 ? (
            <CheckCircle2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} />
          ) : stepIndex === 1 ? (
            <Loader2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} className="animate-spin" />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />
          )}
          <span>Analyze Request...</span>
        </div>

        {/* Step 2 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: stepIndex >= 2 ? 600 : 400, color: stepIndex >= 2 ? '#0f172a' : '#94a3b8' }}>
          {stepIndex > 2 ? (
            <CheckCircle2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} />
          ) : stepIndex === 2 ? (
            <Loader2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} className="animate-spin" />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />
          )}
          <span>Extracting YouTube Transcript & Key Concepts...</span>
        </div>

        {/* Step 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, fontWeight: stepIndex >= 3 ? 600 : 400, color: stepIndex >= 3 ? '#0f172a' : '#94a3b8' }}>
          {stepIndex > 3 ? (
            <CheckCircle2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} />
          ) : stepIndex === 3 ? (
            <Loader2 style={{ width: 18, height: 18, color: '#2563eb', flexShrink: 0 }} className="animate-spin" />
          ) : (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #cbd5e1', flexShrink: 0 }} />
          )}
          <span>Structuring Mindmap & Class Notes PDF...</span>
        </div>

        {/* Step 4: Final Complete Status */}
        {stepIndex === 4 && (
          <div style={{ marginTop: 12, padding: 16, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 700, fontSize: 14 }}>
              <CheckCircle2 style={{ width: 18, height: 18 }} />
              <span>Master Class Notes PDF & Mindmap Ready!</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={onDownloadPdf}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                }}
              >
                <FileDown style={{ width: 16, height: 16 }} />
                <span>Open Class Notes PDF</span>
              </button>

              <button
                onClick={onOpenChat}
                style={{
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Bot style={{ width: 16, height: 16, color: '#2563eb' }} />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
