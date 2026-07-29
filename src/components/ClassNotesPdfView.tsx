import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  Moon,
  Sun,
  X,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
  GitFork,
  BrainCircuit,
  CheckCircle2,
  Award
} from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';

interface ClassNotesPdfViewProps {
  analysis: VideoNoteAnalysis;
  onClose: () => void;
}

export const ClassNotesPdfView: React.FC<ClassNotesPdfViewProps> = ({
  analysis,
  onClose
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  const handlePrint = () => {
    window.print();
  };

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
              MindTube PDF Handbook
            </div>
          </div>

          {/* Mobile Direct Download Button */}
          {window.innerWidth < 640 && (
            <button
              onClick={handlePrint}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #16a34a, #0d9488)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Printer style={{ width: 14, height: 14 }} />
              <span>Print</span>
            </button>
          )}
        </div>

        {/* Row 2 / Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: window.innerWidth < 640 ? 'space-between' : 'flex-end', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
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
            <span>{themeMode === 'light' ? 'Night Mode' : 'Light Mode'}</span>
          </button>

          {/* Desktop Print / Download Button */}
          {window.innerWidth >= 640 && (
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #16a34a, #0d9488)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Printer style={{ width: 14, height: 14 }} />
              <span>Download / Print PDF Handbook</span>
            </button>
          )}

          {/* Close Icon */}
          <button onClick={onClose} style={{ padding: 6, color: '#64748b' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* Printable Multi-Page PDF Sheet */}
      <div className={`pdf-document-page ${themeMode === 'light' ? 'pdf-theme-light' : 'pdf-theme-dark'}`}>
        <div className="pdf-watermark">mindtube.ai</div>

        {/* Top Header Banner */}
        <header className="pdf-header-banner">
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, color: '#0d9488', marginBottom: 4 }}>
            Exhaustive Academic Study Guide & Comprehensive Revision Handbook
          </div>
          <h1 className="pdf-header-title">
            Master Class Notes Handbook
          </h1>
          <div className="pdf-header-subtitle">
            MindTube AI Student Preparation Engine • mindtube.ai
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
            <span><strong>Date Generated:</strong> {new Date().toLocaleDateString()}</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, wordBreak: 'break-all' }}>
            <strong>Source Video Link:</strong> {analysis.videoUrl}
          </div>
        </div>

        {/* SECTION 1: Executive Synthesis & Mental Models */}
        <section className="pdf-section-container">
          <div className="pdf-level-badge level-purple">
            <BookOpen style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
            SECTION 1: Executive Synthesis & Core Mental Models
          </div>

          <div style={{ background: themeMode === 'light' ? '#f8fafc' : '#1e293b', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
            <h3 className="pdf-sub-badge sub-emerald">Deep Executive Summary</h3>
            <p className="pdf-text-paragraph" style={{ fontSize: 13.5, lineHeight: 1.65 }}>{analysis.overallSummary}</p>
          </div>

          {analysis.keyTakeaways && analysis.keyTakeaways.length > 0 && (
            <div style={{ background: themeMode === 'light' ? '#ffffff' : '#0f172a', padding: 16, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
              <h3 className="pdf-sub-badge sub-gold">Key Academic Principles & High-Yield Takeaways</h3>
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
                    <p style={{ margin: 0, fontSize: 12.5, color: '#334155', lineHeight: 1.55 }}>
                      {point.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Golden Rules & Pro Tips */}
          {analysis.proTipsGlobal && analysis.proTipsGlobal.length > 0 && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #16a34a', padding: 14, borderRadius: 10, marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 style={{ width: 16, height: 16 }} />
                <span>💡 Golden Rules for Exam Mastery</span>
              </h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {analysis.proTipsGlobal.map((tip, idx) => (
                  <li key={idx} style={{ fontSize: 12, color: '#166534', marginBottom: 4, lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Traps & Pitfalls to Avoid */}
          {analysis.trapsToAvoidGlobal && analysis.trapsToAvoidGlobal.length > 0 && (
            <div style={{ background: '#fff1f2', border: '1.5px solid #be123c', padding: 14, borderRadius: 10, marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#be123c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle style={{ width: 16, height: 16 }} />
                <span>⚠️ Critical Exam Traps & Common Mistakes to Avoid</span>
              </h3>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {analysis.trapsToAvoidGlobal.map((trap, idx) => (
                  <li key={idx} style={{ fontSize: 12, color: '#9f1239', marginBottom: 4, lineHeight: 1.5 }}>
                    {trap}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* SECTION 2: Granular Chapter Breakdown & Outlines */}
        {analysis.outline && analysis.outline.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <Sparkles style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              SECTION 2: Granular Chapter Breakdown & Complete Topic Outlines
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {analysis.outline.map((chap, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#2563eb', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#eff6ff', border: '1px solid #dbeafe', fontSize: 11, fontWeight: 800 }}>
                      {chap.timestamp}
                    </span>
                    <span>{chap.title}</span>
                  </div>

                  <p className="pdf-text-paragraph" style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                    {chap.summary}
                  </p>

                  {chap.keyPoints && chap.keyPoints.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Key Topic Concepts:</div>
                      <ul style={{ paddingLeft: 16, margin: 0 }}>
                        {chap.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx} style={{ fontSize: 12, color: '#475569', marginBottom: 2 }}>{kp}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Code Snippets if Technical */}
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

        {/* SECTION 3: Mindmap Concept Tree */}
        {analysis.mindmap && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-indigo">
              <GitFork style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              SECTION 3: Hierarchical Concept MindMap Tree
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                        {branch.children.map((leaf, lIdx) => (
                          <span key={lIdx} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#e0e7ff', color: '#3730a3', fontWeight: 600 }}>
                            • {leaf.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 4: Active Recall Flashcards Deck */}
        {analysis.flashcards && analysis.flashcards.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-burgundy">
              <BrainCircuit style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              SECTION 4: Active Recall Spaced Repetition Flashcards ({analysis.flashcards.length} Cards)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr', gap: 10 }}>
              {analysis.flashcards.map((card, idx) => (
                <div key={idx} style={{ border: '1px solid #cbd5e1', padding: 12, borderRadius: 10, background: themeMode === 'light' ? '#ffffff' : '#0f172a', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', color: '#ea580c' }}>
                    Card #{idx + 1} • {card.topic || 'General'}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#2563eb' }}>
                    Q: {card.question}
                  </div>
                  <div style={{ fontSize: 12, color: themeMode === 'light' ? '#334155' : '#cbd5e1', lineHeight: 1.45, paddingTop: 4, borderTop: '1px solid #f1f5f9' }}>
                    <strong>A:</strong> {card.answer}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5: Complete Exam Practice Test & MCQ Answer Key */}
        {analysis.quiz && analysis.quiz.length > 0 && (
          <section className="pdf-section-container">
            <div className="pdf-level-badge level-purple">
              <Award style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
              SECTION 5: Complete MCQ Exam Practice Test ({analysis.quiz.length} Questions)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {analysis.quiz.map((item, idx) => (
                <div key={idx} style={{ padding: 14, borderRadius: 10, background: themeMode === 'light' ? '#f8fafc' : '#1e293b', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
                    Q{idx + 1}: {item.question}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {item.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === item.correctOptionIndex;
                      return (
                        <div key={oIdx} style={{ padding: '6px 10px', borderRadius: 6, background: isCorrect ? '#f0fdf4' : '#ffffff', border: isCorrect ? '1.5px solid #22c55e' : '1px solid #e2e8f0', fontSize: 11.5, fontWeight: isCorrect ? 700 : 400, color: isCorrect ? '#15803d' : '#475569' }}>
                          {String.fromCharCode(65 + oIdx)}. {opt} {isCorrect ? '✓ (Correct)' : ''}
                        </div>
                      );
                    })}
                  </div>
                  {item.explanation && (
                    <div style={{ fontSize: 11, color: '#6b21a8', marginTop: 2, background: '#f3e8ff', padding: '4px 8px', borderRadius: 6 }}>
                      <strong>Rationale:</strong> {item.explanation}
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
