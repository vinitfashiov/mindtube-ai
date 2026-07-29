import React, { useState, useRef } from 'react';
import {
  FileDown,
  Moon,
  Sun,
  X,
  Sparkles,
  BookOpen,
  ArrowLeft,
  GitFork,
  BrainCircuit,
  CheckCircle2,
  Award,
  Download,
  BookMarked,
  FlaskConical,
  List,
  Copy,
  Check,
  Zap,
  Flame,
  HelpCircle,
  Table as TableIcon
} from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';

interface ClassNotesPdfViewProps {
  analysis: VideoNoteAnalysis;
  onClose: () => void;
  onSwitchStyle?: (style: 'handbook' | 'tree') => void;
}

// Custom Markdown Renderer with Source Tags & Inline Formatting
function renderMarkdownText(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} style={{ height: 8 }} />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={i} style={{ fontSize: 15, fontWeight: 800, color: '#1e293b', margin: '16px 0 8px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: 5 }}>
          {trimmed.replace('## ', '')}
        </h3>
      );
    } else if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={i} style={{ fontSize: 13.5, fontWeight: 700, color: '#334155', margin: '12px 0 6px 0' }}>
          {trimmed.replace('### ', '')}
        </h4>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.7, paddingLeft: 14, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed.substring(2)) }} />
        </div>
      );
    } else if (trimmed.startsWith('```')) {
      // Skip raw code fence markers
    } else {
      elements.push(
        <p key={i} style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.75, marginBottom: 6, textAlign: 'justify' }}
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
        />
      );
    }
  });

  return <>{elements}</>;
}

function formatInlineMarkdown(text: string): string {
  let result = text;
  // Source tags
  result = result.replace(/\[FROM VIDEO\]/gi, '<span style="background:#eff6ff;color:#1d4ed8;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;border:1px solid #bfdbfe">From Video</span>');
  result = result.replace(/\[TEACHER EXAMPLE\]/gi, '<span style="background:#fef3c7;color:#b45309;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;border:1px solid #fde68a">Teacher Example</span>');
  result = result.replace(/\[AI EXPLANATION\]/gi, '<span style="background:#f3e8ff;color:#6d28d9;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;border:1px solid #ddd6fe">AI Explanation</span>');
  result = result.replace(/\[EXAM FACT\]/gi, '<span style="background:#f0fdf4;color:#15803d;font-weight:700;font-size:10px;padding:2px 6px;border-radius:4px;margin-right:6px;border:1px solid #bbf7d0">Exam Fact</span>');

  // Bold **text**
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f172a;font-weight:700">$1</strong>');
  // Inline code `code`
  result = result.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;font-family:Consolas,monospace;font-size:12px;color:#7c3aed">$1</code>');
  return result;
}

export const ClassNotesPdfView: React.FC<ClassNotesPdfViewProps> = ({
  analysis,
  onClose,
  onSwitchStyle
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleCopyNotes = () => {
    let fullText = `${analysis.videoTitle}\n${analysis.videoUrl}\n\n`;
    if (analysis.quickRevisionMap) fullText += `=== RAPID REVISION MAP ===\n${analysis.quickRevisionMap}\n\n`;
    if (analysis.smartRevisionNotes) fullText += `=== SMART STUDY NOTES ===\n${analysis.smartRevisionNotes}\n\n`;
    if (analysis.detailedNotes) fullText += `=== EXHAUSTIVE LECTURE NOTES ===\n${analysis.detailedNotes}\n\n`;
    
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!pdfContentRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = pdfContentRef.current;
      const filename = `MindTube_Notes_${analysis.videoTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`;

      const opt = {
        margin: [8, 10, 8, 10] as [number, number, number, number],
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

  // Content Counters
  const totalFlashcards = analysis.flashcards?.length || 0;
  const totalQuiz = analysis.quiz?.length || 0;
  const totalChapters = analysis.outline?.length || 0;
  const totalVocab = analysis.vocabularyTerms?.length || 0;
  const totalTables = analysis.comparisonTables?.length || 0;

  return (
    <div className={`pdf-modal-overlay ${themeMode === 'light' ? 'light-pdf-mode' : 'dark-pdf-mode'}`}>
      {/* Responsive Top Action Control Bar */}
      <div className="pdf-actions-bar">
        {/* Row 1: Brand & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: window.innerWidth < 640 ? '100%' : 'auto' }}>
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
              background: 'linear-gradient(135deg, #16a34a, #0d9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <FileDown style={{ width: 15, height: 15 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeMode === 'light' ? '#0f172a' : '#f8fafc' }}>
              MindTube Study Handbook
            </div>
          </div>
        </div>

        {/* Row 2 / Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: window.innerWidth < 640 ? 'space-between' : 'flex-end', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
          {/* Switch Style Toggle */}
          {onSwitchStyle && (
            <button
              onClick={() => onSwitchStyle('tree')}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: '#f3e8ff',
                border: '1px solid #ddd6fe',
                color: '#6d28d9',
                fontSize: 11.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <GitFork style={{ width: 13, height: 13 }} />
              <span>Switch to Tree PDF</span>
            </button>
          )}
          {/* Copy Notes Text */}
          <button
            onClick={handleCopyNotes}
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
            <span>{isCopied ? 'Copied!' : 'Copy Notes'}</span>
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

          {/* Direct PDF Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: isDownloading ? '#94a3b8' : 'linear-gradient(135deg, #16a34a, #0d9488)',
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
            <span>{isDownloading ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {/* Close Icon */}
          <button onClick={onClose} style={{ padding: 6, color: '#64748b' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ==================== PRINTABLE MULTI-PAGE PDF CONTENT ==================== */}
      <div
        ref={pdfContentRef}
        className={`pdf-document-page ${themeMode === 'light' ? 'pdf-theme-light' : 'pdf-theme-dark'}`}
      >
        <div className="pdf-watermark">mindtube.ai</div>

        {/* ===== COVER PAGE / TITLE HEADER ===== */}
        <header className="pdf-header-banner">
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#0d9488', marginBottom: 4 }}>
            Zero-Contradiction Academic Study Handbook & Complete Exam Companion
          </div>
          <h1 className="pdf-header-title">
            Master Class Notes Handbook
          </h1>
          <div className="pdf-header-subtitle">
            MindTube AI Academic Engine • mindtube.ai
          </div>
        </header>

        {/* Video Info Meta Card */}
        <div className="pdf-video-meta">
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#0f172a', lineHeight: 1.3 }}>
            {analysis.videoTitle}
          </h2>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
            {analysis.channelName && <span><strong>Channel / Creator:</strong> {analysis.channelName}</span>}
            {analysis.duration && <span><strong>Video Duration:</strong> {analysis.duration}</span>}
            <span><strong>Generated:</strong> {new Date().toLocaleDateString()}</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, wordBreak: 'break-all' }}>
            <strong>Source Video Link:</strong> {analysis.videoUrl}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10, fontSize: 11 }}>
            <span style={{ padding: '2px 10px', borderRadius: 9999, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontWeight: 700 }}>
              {totalChapters} Chapters
            </span>
            {totalTables > 0 && (
              <span style={{ padding: '2px 10px', borderRadius: 9999, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700 }}>
                {totalTables} Comparison Tables
              </span>
            )}
            <span style={{ padding: '2px 10px', borderRadius: 9999, background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', fontWeight: 700 }}>
              {totalFlashcards} Flashcards
            </span>
            <span style={{ padding: '2px 10px', borderRadius: 9999, background: '#f3e8ff', border: '1px solid #ddd6fe', color: '#6d28d9', fontWeight: 700 }}>
              {totalQuiz} MCQ Questions
            </span>
            {totalVocab > 0 && (
              <span style={{ padding: '2px 10px', borderRadius: 9999, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontWeight: 700 }}>
                {totalVocab} Key Terms
              </span>
            )}
          </div>
        </div>

        {/* ===== TABLE OF CONTENTS ===== */}
        <div style={{ padding: 16, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <List style={{ width: 18, height: 18, color: '#2563eb' }} />
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Handbook Table of Contents</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 8 }}>
            <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>1. Executive Synthesis & Core Principles</div>
            {analysis.quickRevisionMap && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>2. ⚡ Level 1: Rapid 5-Minute Revision Map</div>}
            {analysis.smartRevisionNotes && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>3. 📖 Level 2: Smart Study Notes</div>}
            {totalTables > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>4. 📊 Comparative Study Tables</div>}
            {analysis.teacherEmphasis && analysis.teacherEmphasis.length > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>5. 🔥 Teacher Emphasis & Exam Cues</div>}
            {analysis.detailedNotes && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>6. 📚 Level 3: Exhaustive Lecture Notes</div>}
            {totalChapters > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>7. Granular Chapter Breakdown</div>}
            {analysis.mindmap && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>8. Concept MindMap Tree</div>}
            {totalVocab > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>9. Key Terms Glossary ({totalVocab} Terms)</div>}
            {totalFlashcards > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>10. Active Recall Flashcards ({totalFlashcards} Cards)</div>}
            {totalQuiz > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>11. MCQ Exam Practice Test (Unsolved)</div>}
            {analysis.mcqAnswerKey && analysis.mcqAnswerKey.length > 0 && <div style={{ fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>12. MCQ Answer Key & Explanations</div>}
          </div>
        </div>

        {/* ===== SECTION 1: Executive Synthesis ===== */}
        <section className="pdf-section-container">
          <div className="pdf-level-badge level-purple">
            <BookOpen style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
            SECTION 1: Executive Synthesis & Core Principles
          </div>

          <div style={{ background: themeMode === 'light' ? '#f8fafc' : '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
            <h3 className="pdf-sub-badge sub-emerald">Deep Executive Thesis</h3>
            <p className="pdf-text-paragraph" style={{ fontSize: 13.5, lineHeight: 1.75 }}>{analysis.overallSummary}</p>
          </div>

          {analysis.keyTakeaways && analysis.keyTakeaways.length > 0 && (
            <div style={{ background: themeMode === 'light' ? '#ffffff' : '#0f172a', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <h3 className="pdf-sub-badge sub-gold">Key Academic Principles ({analysis.keyTakeaways.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                {analysis.keyTakeaways.map((point, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2563eb', marginBottom: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>{idx + 1}. {point.title}</span>
                      {point.impact && (
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, background: point.impact === 'Critical' ? '#fef2f2' : '#eff6ff', color: point.impact === 'Critical' ? '#dc2626' : '#2563eb', border: '1px solid #fca5a5' }}>
                          {point.impact} Impact
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: '#1e293b', lineHeight: 1.6 }}>
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ===== LEVEL 1: 5-MINUTE RAPID REVISION MAP ===== */}
        {analysis.quickRevisionMap && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo" style={{ background: 'linear-gradient(135deg, #ea580c, #c2410c)' }}>
              <Zap style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              LEVEL 1: 5-Minute Rapid Revision Map (Keywords & Key Traps Only)
            </div>
            <div style={{ background: themeMode === 'light' ? '#fff7ed' : '#1e293b', padding: 18, borderRadius: 10, border: '1.5px solid #fed7aa' }}>
              {renderMarkdownText(analysis.quickRevisionMap)}
            </div>
          </section>
        )}

        {/* ===== LEVEL 2: SMART STUDY NOTES ===== */}
        {analysis.smartRevisionNotes && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <BookMarked style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              LEVEL 2: Smart Revision Notes (Definitions, Comparisons & Exam Facts)
            </div>
            <div style={{ background: themeMode === 'light' ? '#ffffff' : '#0f172a', padding: 18, borderRadius: 10, border: '1px solid #cbd5e1' }}>
              {renderMarkdownText(analysis.smartRevisionNotes)}
            </div>
          </section>
        )}

        {/* ===== COMPARISON TABLES ===== */}
        {analysis.comparisonTables && analysis.comparisonTables.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo" style={{ background: '#0284c7' }}>
              <TableIcon style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Comparative Study Tables ({analysis.comparisonTables.length} Comparisons)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {analysis.comparisonTables.map((table, tIdx) => (
                <div key={tIdx} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #cbd5e1', background: '#ffffff' }}>
                  <div style={{ padding: '10px 14px', background: '#f0f9ff', borderBottom: '1px solid #bae6fd', fontSize: 13, fontWeight: 800, color: '#0369a1' }}>
                    📊 {table.title}
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a', width: '50%' }}>{table.headers[0]}</th>
                        <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a', width: '50%' }}>{table.headers[1]}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: rIdx === table.rows.length - 1 ? 'none' : '1px solid #f1f5f9', background: rIdx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '8px 12px', color: '#1e293b', lineHeight: 1.5 }}>{row[0]}</td>
                          <td style={{ padding: '8px 12px', color: '#1e293b', lineHeight: 1.5 }}>{row[1]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== TEACHER EMPHASIS & EXAM CUES ===== */}
        {analysis.teacherEmphasis && analysis.teacherEmphasis.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-burgundy" style={{ background: '#be123c' }}>
              <Flame style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Teacher Cues & Exam Emphasis ({analysis.teacherEmphasis.length} Highlights)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {analysis.teacherEmphasis.map((item, idx) => (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#ffffff', color: '#be123c', border: '1px solid #fda4af' }}>
                      {item.tag}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#881337', lineHeight: 1.4 }}>
                      {item.text}
                    </span>
                  </div>
                  {item.timestamp && (
                    <span style={{ fontSize: 11, color: '#9f1239', fontWeight: 700, flexShrink: 0 }}>
                      ⏱ {item.timestamp}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== LEVEL 3: EXHAUSTIVE LECTURE NOTES ===== */}
        {analysis.detailedNotes && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <BookMarked style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              LEVEL 3: Exhaustive Lecture Notes (Full Transcript-Based Coverage)
            </div>
            <div style={{ background: themeMode === 'light' ? '#ffffff' : '#0f172a', padding: 20, borderRadius: 10, border: '1px solid #cbd5e1' }}>
              {renderMarkdownText(analysis.detailedNotes)}
            </div>
          </section>
        )}

        {/* ===== GRANULAR CHAPTER BREAKDOWN ===== */}
        {analysis.outline && analysis.outline.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <Sparkles style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Granular Chapter Breakdown & Outlines ({totalChapters} Chapters)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {analysis.outline.map((chap, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#eff6ff', border: '1px solid #dbeafe', fontSize: 11, fontWeight: 800 }}>
                      {chap.timestamp}
                    </span>
                    <span>Chapter {idx + 1}: {chap.title}</span>
                  </div>

                  <p className="pdf-text-paragraph" style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 8, textAlign: 'justify' }}>
                    {chap.summary}
                  </p>

                  {chap.keyPoints && chap.keyPoints.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Key Topic Concepts:</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {chap.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} style={{ fontSize: 12, color: '#334155', marginBottom: 3, lineHeight: 1.55 }}>{kp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {chap.codeSnippets && chap.codeSnippets.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {chap.codeSnippets.map((cs, cIdx) => (
                        <div key={cIdx} style={{ background: '#0f172a', color: '#f8fafc', padding: 12, borderRadius: 8, fontSize: 12, fontFamily: 'Consolas, monospace', overflowX: 'auto', marginBottom: 4 }}>
                          <code>{cs.code}</code>
                          {cs.explanation && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontFamily: 'sans-serif' }}>// {cs.explanation}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== CONCEPT MINDMAP TREE ===== */}
        {analysis.mindmap && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <GitFork style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Hierarchical Concept MindMap Tree
            </div>

            <div style={{ padding: 16, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#4f46e5', marginBottom: 8 }}>
                Root Concept: {analysis.mindmap.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {analysis.mindmap.children?.map((branch, bIdx) => (
                  <div key={bIdx} style={{ padding: 10, borderRadius: 8, background: '#ffffff', border: '1px solid #e0e7ff', paddingLeft: 14, borderLeft: '3.5px solid #4f46e5' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b' }}>
                      {branch.label}
                    </div>
                    {branch.details && <div style={{ fontSize: 11.5, color: '#4338ca', marginTop: 2 }}>{branch.details}</div>}

                    {branch.children && branch.children.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6, paddingLeft: 12 }}>
                        {branch.children.map((leaf, lIdx) => (
                          <div key={lIdx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#3730a3' }}>
                              ├─ {leaf.label}
                            </span>
                            {leaf.details && <span style={{ fontSize: 11, color: '#6366f1', paddingLeft: 20 }}>{leaf.details}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ===== KEY TERMS GLOSSARY ===== */}
        {analysis.vocabularyTerms && analysis.vocabularyTerms.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-purple">
              <BookMarked style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Key Terms Glossary ({totalVocab} Terms)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {analysis.vocabularyTerms.map((item, idx) => (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #e2e8f0', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed', background: '#f3e8ff', padding: '2px 8px', borderRadius: 6, flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{item.term}</div>
                    <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.5 }}>{item.definition}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== FORMULAS & EQUATIONS ===== */}
        {analysis.formulasAndEquations && analysis.formulasAndEquations.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <FlaskConical style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Formulas, Equations & Technical Rules
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 8 }}>
              {analysis.formulasAndEquations.map((formula, idx) => (
                <div key={idx} style={{ padding: '10px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid #334155', color: '#f8fafc' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8', marginBottom: 4 }}>Formula #{idx + 1}</div>
                  <div style={{ fontSize: 13, fontFamily: 'Consolas, monospace', lineHeight: 1.5 }}>{formula}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== ACTIVE RECALL FLASHCARDS ===== */}
        {analysis.flashcards && analysis.flashcards.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-burgundy">
              <BrainCircuit style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              Active Recall Spaced Repetition Flashcards ({totalFlashcards} Cards)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 10 }}>
              {analysis.flashcards.map((card, idx) => (
                <div key={idx} style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 10, background: themeMode === 'light' ? '#ffffff' : '#0f172a', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#ea580c' }}>
                      Card #{idx + 1} • {card.topic || 'General'}
                    </div>
                    {card.cognitiveLevel && (
                      <span style={{ fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                        {card.cognitiveLevel}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb' }}>
                    Q: {card.question}
                  </div>
                  <div style={{ fontSize: 12, color: themeMode === 'light' ? '#334155' : '#cbd5e1', lineHeight: 1.5, paddingTop: 4, borderTop: '1px solid #f1f5f9' }}>
                    <strong>A:</strong> {card.answer}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== UNBIASED MCQ PRACTICE TEST ===== */}
        {analysis.quiz && analysis.quiz.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-purple">
              <HelpCircle style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              MCQ Exam Practice Test ({totalQuiz} Questions — Unsolved Test)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analysis.quiz.map((item, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Q{idx + 1}: {item.question}</span>
                    {item.difficulty && (
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569' }}>
                        {item.difficulty}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {item.options.map((opt, oIdx) => (
                      <div key={oIdx} style={{ padding: '8px 12px', borderRadius: 6, background: '#ffffff', border: '1px solid #e2e8f0', fontSize: 12, color: '#334155' }}>
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== SEPARATE MCQ ANSWER KEY & EXPLANATIONS ===== */}
        {analysis.mcqAnswerKey && analysis.mcqAnswerKey.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-purple" style={{ background: '#4c1d95' }}>
              <Award style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              MCQ Answer Key & Detailed Rationale
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {analysis.mcqAnswerKey.map((key, kIdx) => (
                <div key={kIdx} style={{ padding: 12, borderRadius: 8, background: '#f0fdf4', border: '1.5px solid #22c55e', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    <span>Q{key.questionIndex + 1} Correct Answer: {key.correctOption}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#166534', lineHeight: 1.5 }}>
                    <strong>Why it's correct:</strong> {key.explanation}
                  </div>
                  {key.whyOthersWrong && (
                    <div style={{ fontSize: 11.5, color: '#991b1b', lineHeight: 1.45, background: '#fef2f2', padding: '4px 8px', borderRadius: 6, marginTop: 2 }}>
                      <strong>Why others are wrong:</strong> {key.whyOthersWrong}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="pdf-footer-note" style={{ marginTop: 24, paddingTop: 12, borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
          Generated automatically by MindTube AI • Universal Academic Preparation Engine • mindtube.ai
        </footer>
      </div>
    </div>
  );
};
