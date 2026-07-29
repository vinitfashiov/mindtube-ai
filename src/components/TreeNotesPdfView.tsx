import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  X,
  ArrowLeft,
  Download,
  Copy,
  Check,
  GitFork,
  BookOpen
} from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';

interface TreeNotesPdfViewProps {
  analysis: VideoNoteAnalysis;
  onClose: () => void;
  onSwitchStyle?: (style: 'handbook' | 'tree') => void;
}

export const TreeNotesPdfView: React.FC<TreeNotesPdfViewProps> = ({
  analysis,
  onClose,
  onSwitchStyle
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    let text = `${analysis.videoTitle}\n${analysis.videoUrl}\n\n`;
    if (analysis.mindmap?.children) {
      analysis.mindmap.children.forEach((branch) => {
        text += `=== ${branch.label} ===\n`;
        if (branch.details) text += `${branch.details}\n`;
        if (branch.children) {
          branch.children.forEach((sub) => {
            text += `  |_ ${sub.label}\n`;
            if (sub.details) text += `     ${sub.details}\n`;
          });
        }
        text += '\n';
      });
    }
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!pdfContentRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = pdfContentRef.current;
      const filename = `MindTube_Tree_${analysis.videoTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF download failed:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Convert Outline chapters & Mindmap into Revisemap-style Tree Branches
  const chapters = analysis.outline || [];
  const mindmapBranches = analysis.mindmap?.children || [];
  const takeaways = analysis.keyTakeaways || [];
  const vocabulary = analysis.vocabularyTerms || [];

  return (
    <div className={`pdf-modal-overlay ${themeMode === 'light' ? 'light-pdf-mode' : 'dark-pdf-mode'}`}>
      {/* Top Controls Toolbar */}
      <div className="pdf-actions-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: window.innerWidth < 640 ? '100%' : 'auto', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Back to Chat</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <GitFork style={{ width: 15, height: 15 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeMode === 'light' ? '#0f172a' : '#f8fafc' }}>
              Revisemap-Style Tree PDF
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: window.innerWidth < 640 ? 'space-between' : 'flex-end', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
          {/* Switch Style Toggle */}
          {onSwitchStyle && (
            <button
              onClick={() => onSwitchStyle('handbook')}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: 11.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <BookOpen style={{ width: 13, height: 13 }} />
              <span>Switch to Academic Handbook</span>
            </button>
          )}

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: isCopied ? '#f0fdf4' : '#f8fafc',
              border: isCopied ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
              color: isCopied ? '#15803d' : '#0f172a',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            {isCopied ? <Check style={{ width: 13, height: 13, color: '#16a34a' }} /> : <Copy style={{ width: 13, height: 13 }} />}
            <span>{isCopied ? 'Copied!' : 'Copy Tree'}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: themeMode === 'light' ? '#f8fafc' : '#1e293b',
              border: '1px solid #cbd5e1',
              color: themeMode === 'light' ? '#0f172a' : '#f8fafc',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {themeMode === 'light' ? <Moon style={{ width: 13, height: 13, color: '#7c3aed' }} /> : <Sun style={{ width: 13, height: 13, color: '#f59e0b' }} />}
            <span>{themeMode === 'light' ? 'Night' : 'Light'}</span>
          </button>

          {/* Direct Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: isDownloading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Tree PDF'}</span>
          </button>

          <button onClick={onClose} style={{ padding: 6, color: '#64748b' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ==================== REVISEMAP-STYLE TREE PDF DOCUMENT ==================== */}
      <div
        ref={pdfContentRef}
        style={{
          width: '100%',
          maxWidth: 960,
          margin: '0 auto 40px auto',
          background: themeMode === 'light' ? '#ffffff' : '#090d16',
          color: themeMode === 'light' ? '#0f172a' : '#f8fafc',
          border: '2px solid #0d9488',
          borderRadius: 8,
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          fontFamily: 'serif',
          position: 'relative'
        }}
      >
        {/* REVISEMAP RED TOP HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
          color: '#ffffff',
          textAlign: 'center',
          padding: '16px 20px',
          borderBottom: '3px solid #f59e0b'
        }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, margin: 0, fontFamily: 'Georgia, serif' }}>
            YouTube Video To PDF
          </h1>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#fef08a', marginTop: 4 }}>
            mindtube.ai • Tree Revision Map
          </div>
        </div>

        {/* VIDEO TITLE METADATA BAR */}
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1', padding: '10px 20px', fontSize: 12, color: '#334155', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div><strong>Topic:</strong> {analysis.videoTitle}</div>
          {analysis.channelName && <div><strong>Creator:</strong> {analysis.channelName}</div>}
          <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
        </div>

        {/* 3-COLUMN TREE CONTAINER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(3, 1fr)',
          gap: 16,
          padding: '20px 16px',
          alignItems: 'start'
        }}>
          {/* COLUMN 1: Chapter Outlines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {chapters.slice(0, Math.ceil(chapters.length / 2)).map((chap, cIdx) => (
              <div key={cIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Level 1 Purple Badge Header */}
                <div style={{
                  background: '#581c87',
                  color: '#ffffff',
                  border: '1.5px solid #f59e0b',
                  padding: '5px 10px',
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 4
                }}>
                  Chapter {cIdx + 1}: {chap.title}
                </div>

                {/* Sub-branch Tree Lines */}
                <div style={{ paddingLeft: 8, borderLeft: '2px solid #2563eb', marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1d4ed8' }}>
                    |_ Timestamp: {chap.timestamp}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.45 }}>
                    |_ {chap.summary}
                  </div>

                  {chap.keyPoints?.map((kp, kIdx) => (
                    <div key={kIdx} style={{ fontSize: 11, color: '#334155', lineHeight: 1.4, paddingLeft: 6 }}>
                      |__ {kp}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* COLUMN 2: Rest of Chapters & Mindmap Branches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {chapters.slice(Math.ceil(chapters.length / 2)).map((chap, cIdx) => (
              <div key={cIdx + 100} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  background: '#581c87',
                  color: '#ffffff',
                  border: '1.5px solid #f59e0b',
                  padding: '5px 10px',
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 4
                }}>
                  Chapter {Math.ceil(chapters.length / 2) + cIdx + 1}: {chap.title}
                </div>

                <div style={{ paddingLeft: 8, borderLeft: '2px solid #2563eb', marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1d4ed8' }}>
                    |_ Timestamp: {chap.timestamp}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.45 }}>
                    |_ {chap.summary}
                  </div>

                  {chap.keyPoints?.map((kp, kIdx) => (
                    <div key={kIdx} style={{ fontSize: 11, color: '#334155', lineHeight: 1.4, paddingLeft: 6 }}>
                      |__ {kp}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Mindmap Concept Tree Nodes */}
            {mindmapBranches.map((branch, bIdx) => (
              <div key={bIdx} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  background: '#1e1b4b',
                  color: '#ffffff',
                  border: '1.5px solid #38bdf8',
                  padding: '5px 10px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  borderRadius: 4
                }}>
                  {branch.label}
                </div>
                <div style={{ paddingLeft: 8, borderLeft: '2px solid #0284c7', marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {branch.details && <div style={{ fontSize: 11.5, color: '#0369a1' }}>|_ {branch.details}</div>}
                  {branch.children?.map((sub, sIdx) => (
                    <div key={sIdx} style={{ fontSize: 11, color: '#334155' }}>
                      |__ {sub.label}
                      {sub.details && <span style={{ color: '#64748b' }}> ({sub.details})</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* COLUMN 3: Key Principles, Glossary & Exam Traps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Key Academic Takeaways */}
            {takeaways.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  background: '#831843',
                  color: '#ffffff',
                  border: '1.5px solid #f43f5e',
                  padding: '5px 10px',
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 4
                }}>
                  Key Exam Principles ({takeaways.length})
                </div>
                <div style={{ paddingLeft: 8, borderLeft: '2px solid #be123c', marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {takeaways.map((t, idx) => (
                    <div key={idx} style={{ fontSize: 11.5, color: '#1e293b', lineHeight: 1.4 }}>
                      <strong style={{ color: '#be123c' }}>|_ {t.title}:</strong> {t.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Glossary Terms */}
            {vocabulary.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{
                  background: '#166534',
                  color: '#ffffff',
                  border: '1.5px solid #86efac',
                  padding: '5px 10px',
                  fontSize: 13,
                  fontWeight: 800,
                  borderRadius: 4
                }}>
                  Key Terms Glossary
                </div>
                <div style={{ paddingLeft: 8, borderLeft: '2px solid #16a34a', marginLeft: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {vocabulary.map((v, idx) => (
                    <div key={idx} style={{ fontSize: 11, color: '#14532d', lineHeight: 1.4 }}>
                      <strong>|_ {v.term}:</strong> {v.definition}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM FOOTER BAR */}
        <div style={{
          background: '#0d9488',
          color: '#ffffff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: 11,
          fontWeight: 700,
          borderTop: '2px solid #0f766e'
        }}>
          mindtube.ai • This is a class notes pdf. It may contain class info. [Not for sale]
        </div>
      </div>
    </div>
  );
};
