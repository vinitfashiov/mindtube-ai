import React, { useState, useRef, useEffect } from 'react';
import {
  FileDown,
  GitFork,
  Zap,
  Bot,
  Send,
  Plus,
  Mic,
  MicOff,
  AudioLines,
  Languages,
  Volume2,
  Sparkles,
  Loader2,
  BookOpen,
  BrainCircuit,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Award,
  Coins,
  Copy,
  FileText,
  X
} from 'lucide-react';
import { VideoNoteAnalysis, MasterChatMessage } from '../types/notes';
import { createSpeechRecognizer, speakNaturalVoice, stopSpeech } from '../services/voiceService';

interface VideoInputSectionProps {
  messages: MasterChatMessage[];
  onSendMessage: (text: string, customTranscript?: string) => void;
  isLoading: boolean;
  isAiResponding: boolean;
  onOpenPdf: (specificAnalysis?: VideoNoteAnalysis | null) => void;
  onOpenChat: () => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  pdfStyle?: 'handbook' | 'tree';
  onSelectPdfStyle?: (style: 'handbook' | 'tree') => void;
  analysis?: VideoNoteAnalysis | null;
  activeSessionTitle?: string;
  apiKey?: string;
}

// Helper: Parse bold Markdown **text** into styled strong tags
function parseBoldMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 700, color: '#0f172a' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// Helper: Render Rich Formatted Markdown, Headers, Lists & Code Blocks
function renderMasterRichContent(text: string) {
  if (text.includes('```')) {
    const segments = text.split(/(```[\s\S]*?```)/g);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((seg, idx) => {
          if (seg.startsWith('```') && seg.endsWith('```')) {
            const codeContent = seg.slice(3, -3).replace(/^[a-zA-Z]+\n/, '');
            return (
              <pre
                key={idx}
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 12.5,
                  fontFamily: 'Consolas, Monaco, monospace',
                  overflowX: 'auto',
                  lineHeight: 1.45,
                  margin: '6px 0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <code>{codeContent.trim()}</code>
              </pre>
            );
          }
          return <div key={idx}>{renderMasterParagraphs(seg)}</div>;
        })}
      </div>
    );
  }

  return renderMasterParagraphs(text);
}

function renderMasterParagraphs(rawText: string) {
  const normalized = rawText
    .replace(/(###|\*\*Level|\*\*स्तर|\*\*क्या|\*\*परिणाम|\*\*सीख|\*\*Takeaway)/g, '\n$1')
    .replace(/\s*\*\s*\*\*/g, '\n* **');

  const lines = normalized.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const title = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          return (
            <div
              key={idx}
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#1e293b',
                marginTop: 8,
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <div style={{ width: 3.5, height: 15, background: '#2563eb', borderRadius: 2 }} />
              <span>{title}</span>
            </div>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[*•-]\s*/, '');
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                margin: '2px 0 2px 4px',
                fontSize: 13.5,
                color: '#334155',
                lineHeight: 1.55
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 7 }} />
              <div>{parseBoldMarkdown(content)}</div>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#334155' }}>
            {parseBoldMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export const VideoInputSection: React.FC<VideoInputSectionProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isAiResponding,
  onOpenPdf,
  onOpenChat,
  currentLanguage,
  onSelectLanguage,
  pdfStyle = 'handbook',
  onSelectPdfStyle
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState<Record<string, 'summary' | 'flashcards' | 'quiz' | 'mindmap' | null>>({});
  const [quizQuantities, setQuizQuantities] = useState<Record<string, number>>({});
  const [quizStates, setQuizStates] = useState<Record<string, { userAnswers: Record<number, number>; isSubmitted?: boolean; score?: number }>>({});
  const [flashcardIndices, setFlashcardIndices] = useState<Record<string, number>>({});
  const [flashcardFlips, setFlashcardFlips] = useState<Record<string, boolean>>({});

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (text) => setInputText(text),
      () => setIsListening(true),
      () => setIsListening(false),
      (err) => {
        console.warn('Voice input notice:', err);
        setIsListening(false);
      },
      currentLanguage
    );

    if (recognizer) {
      recognitionRef.current = recognizer;
      recognizer.start();
    } else {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
    }
  };

  const handleSpeakText = (text: string) => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
      return;
    }
    setIsPlayingAudio(true);
    speakNaturalVoice(text, currentLanguage);
  };

  const [customTranscriptText, setCustomTranscriptText] = useState('');
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputText.trim();
    if (!query || isAiResponding) return;

    setInputText('');
    onSendMessage(query, customTranscriptText || undefined);
    setCustomTranscriptText('');
  };

  const handleSampleClick = (url: string) => {
    onSendMessage(url);
  };

  const toggleWidget = (msgId: string, type: 'summary' | 'flashcards' | 'quiz' | 'mindmap') => {
    setActiveWidgets((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  const handleSelectOption = (msgId: string, qIdx: number, optIdx: number) => {
    setQuizStates((prev) => {
      const current = prev[msgId] || { userAnswers: {} };
      if (current.isSubmitted) return prev;
      return {
        ...prev,
        [msgId]: {
          ...current,
          userAnswers: {
            ...current.userAnswers,
            [qIdx]: optIdx
          }
        }
      };
    });
  };

  const handleSubmitQuiz = (msgId: string, questions: any[]) => {
    const currentState = quizStates[msgId] || { userAnswers: {} };
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (currentState.userAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    setQuizStates((prev) => ({
      ...prev,
      [msgId]: {
        ...currentState,
        isSubmitted: true,
        score: Math.round((correctCount / questions.length) * 100)
      }
    }));
  };

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
      {/* If Active Chat Session Messages is Empty: Show Fresh Hero + 4 Action Cards */}
      {messages.length === 0 && !isLoading ? (
        <div className="no-scrollbar hero-scroll-container" style={{ flex: 1, height: '100%', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, paddingTop: '12px', paddingBottom: 12, paddingLeft: 12, paddingRight: 12, margin: '0 auto', width: '100%', maxWidth: 680 }}>
          {/* Central Manus Hero Heading */}
          <div style={{ textAlign: 'center', padding: '16px 0 8px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <h1 className="hero-heading-title" style={{ fontSize: 32, fontWeight: 500, color: '#18181b', fontFamily: 'Georgia, serif', letterSpacing: '-0.5px', marginBottom: 2 }}>
              What can I do for you?
            </h1>
            <p className="hero-subtext" style={{ fontSize: 13.5, color: '#71717a', fontWeight: 400, maxWidth: 480, margin: '0 auto', lineHeight: 1.5 }}>
              Ask any Math, Coding, Physics or Study question, or paste a YouTube URL to generate Class Notes PDFs, MCQ Quizzes & Mindmaps!
            </p>
          </div>

          {/* Manus Horizontal Action Suggestion Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 8, maxWidth: 680, margin: '0 auto', width: '100%' }}>
            <button
              onClick={() => onOpenPdf()}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                fontSize: 12.5,
                fontWeight: 500,
                color: '#3f3f46',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <FileDown style={{ width: 14, height: 14, color: '#16a34a' }} />
              <span>Class Notes PDF</span>
            </button>

            <button
              onClick={() => handleSampleClick('https://www.youtube.com/watch?v=1PXFAFMgdns')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                fontSize: 12.5,
                fontWeight: 500,
                color: '#3f3f46',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <GitFork style={{ width: 14, height: 14, color: '#2563eb' }} />
              <span>Interactive MindMap</span>
            </button>

            <button
              onClick={() => handleSampleClick('https://www.youtube.com/watch?v=aircAruvnKk')}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                fontSize: 12.5,
                fontWeight: 500,
                color: '#3f3f46',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <Zap style={{ width: 14, height: 14, color: '#ea580c' }} />
              <span>Active Recall</span>
            </button>

            <button
              onClick={onOpenChat}
              style={{
                padding: '6px 14px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                fontSize: 12.5,
                fontWeight: 500,
                color: '#3f3f46',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f4f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
            >
              <Bot style={{ width: 14, height: 14, color: '#7c3aed' }} />
              <span>Voice Copilot</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Chat Session Stream */
        <div className="no-scrollbar" style={{ flex: 1, height: '100%', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 740, margin: '0 auto', width: '100%', padding: '20px 16px 20px 16px' }}>
          {messages.map((msg) => {
            const card = msg.analysisCard;
            const currentActiveWidget = activeWidgets[msg.id] || null;

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  gap: 6,
                  width: '100%'
                }}
              >
                {/* User Message Rendering (Manus 1:1 Style - No Duplication) */}
                {msg.sender === 'user' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, maxWidth: '85%' }}>
                    {msg.text.includes('youtube.com') || msg.text.includes('watch?v=') || msg.text.startsWith('http') ? (
                      <div>
                        <div style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'right', marginBottom: 4 }}>
                          🔒 YouTube Video • {msg.timestamp}
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: 14, background: '#ffffff', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                            P
                          </div>
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                              {msg.text}
                            </div>
                            <div style={{ fontSize: 11, color: '#71717a' }}>YouTube Video • URL</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 11, color: '#a1a1aa', textAlign: 'right', marginBottom: 4 }}>
                          You • {msg.timestamp}
                        </div>
                        <div style={{ padding: '9px 15px', borderRadius: '14px 14px 2px 14px', background: '#ffffff', border: '1px solid #e4e4e7', color: '#09090b', fontSize: 13.5, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, width: '100%' }}>
                    {/* Assistant Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: '#09090b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles style={{ width: 12, height: 12 }} />
                      </div>
                      <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 14, color: '#09090b' }}>
                        mindtube
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: '#f4f4f5', color: '#71717a' }}>
                        Lite
                      </span>
                      <span style={{ fontSize: 11, color: '#a1a1aa', marginLeft: 2 }}>• {msg.timestamp}</span>

                      {!msg.isProcessing && (
                        <button
                          onClick={() => handleSpeakText(msg.text)}
                          title="Read aloud with Voice AI"
                          style={{ color: '#71717a', padding: 2, background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          <Volume2 style={{ width: 13, height: 13 }} />
                        </button>
                      )}

                      {msg.usageCost && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <Coins style={{ width: 10, height: 10 }} />
                          ${msg.usageCost.costUsd.toFixed(4)}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        maxWidth: '100%',
                        width: card ? '100%' : 'auto',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        background: '#ffffff',
                        border: '1px solid #e4e4e7',
                        color: '#09090b',
                        fontSize: 13.5,
                        lineHeight: 1.55,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                      }}
                    >
                      {msg.isProcessing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#09090b', fontWeight: 600, fontSize: 13 }}>
                            <Loader2 style={{ width: 15, height: 15, color: '#2563eb' }} className="animate-spin" />
                            <span>MindTube is working</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#71717a', paddingLeft: 23, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div>✓ Extracting YouTube transcript & key concepts</div>
                            <div>✓ Generating Class Notes PDF, Mindmap & Quiz</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {renderMasterRichContent(msg.text)}

                          {/* Video Note Analysis Interactive Action Bar */}
                          {card && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f4f4f5', display: 'flex', flexDirection: 'column', gap: 12 }}>
                              {/* 5 Interactive Student Study Action Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => toggleWidget(msg.id, 'summary')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: currentActiveWidget === 'summary' ? '#eff6ff' : '#f8fafc',
                                    border: currentActiveWidget === 'summary' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                    color: currentActiveWidget === 'summary' ? '#2563eb' : '#334155',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <BookOpen style={{ width: 14, height: 14, color: '#2563eb' }} />
                                  <span>विस्तार से सारांश (Detailed Summary)</span>
                                </button>

                                <button
                                  onClick={() => toggleWidget(msg.id, 'flashcards')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: currentActiveWidget === 'flashcards' ? '#fff7ed' : '#f8fafc',
                                    border: currentActiveWidget === 'flashcards' ? '1px solid #ea580c' : '1px solid #e2e8f0',
                                    color: currentActiveWidget === 'flashcards' ? '#ea580c' : '#334155',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <BrainCircuit style={{ width: 14, height: 14, color: '#ea580c' }} />
                                  <span>फ्लैशकार्ड्स ({card.flashcards?.length || 0})</span>
                                </button>

                                <button
                                  onClick={() => toggleWidget(msg.id, 'quiz')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: currentActiveWidget === 'quiz' ? '#f3e8ff' : '#f8fafc',
                                    border: currentActiveWidget === 'quiz' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                                    color: currentActiveWidget === 'quiz' ? '#7c3aed' : '#334155',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <HelpCircle style={{ width: 14, height: 14, color: '#7c3aed' }} />
                                  <span>MCQ टेस्ट (Custom Quantity)</span>
                                </button>

                                <button
                                  onClick={() => toggleWidget(msg.id, 'mindmap')}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: currentActiveWidget === 'mindmap' ? '#e0e7ff' : '#f8fafc',
                                    border: currentActiveWidget === 'mindmap' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                                    color: currentActiveWidget === 'mindmap' ? '#4f46e5' : '#334155',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <GitFork style={{ width: 14, height: 14, color: '#4f46e5' }} />
                                  <span>माइंडमैप (MindMap Tree)</span>
                                </button>

                                <button
                                  onClick={() => onOpenPdf(card)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: 8,
                                    background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)',
                                    color: '#ffffff',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    border: 'none',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.2)'
                                  }}
                                >
                                  <FileDown style={{ width: 14, height: 14 }} />
                                  <span>Print PDF Handbook</span>
                                </button>
                              </div>

                              {/* INLINE EXPANDABLE WIDGET 1: Detailed Executive Summary */}
                              {currentActiveWidget === 'summary' && (
                                <div style={{ marginTop: 8, padding: 16, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <BookOpen style={{ width: 16, height: 16, color: '#2563eb' }} />
                                    <span>Detailed Executive Synthesis & Mental Models</span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#334155' }}>
                                    {card.overallSummary}
                                  </p>

                                  {card.keyTakeaways?.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e293b' }}>
                                        Key Takeaways & Core Concepts:
                                      </div>
                                      {card.keyTakeaways.map((kt, i) => (
                                        <div key={i} style={{ padding: '8px 12px', borderRadius: 10, background: '#ffffff', border: '1px solid #e2e8f0', fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                          <div style={{ fontWeight: 700, color: '#2563eb' }}>{i + 1}. {kt.title}</div>
                                          <div style={{ color: '#475569', lineHeight: 1.4 }}>{kt.description}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* INLINE EXPANDABLE WIDGET 2: Flashcards Interactive Deck */}
                              {currentActiveWidget === 'flashcards' && (
                                <div style={{ marginTop: 8, padding: 16, borderRadius: 16, background: '#fff7ed', border: '1px solid #ffedd5', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                  {(() => {
                                    const flashcards = card.flashcards || [];
                                    const fcIndex = flashcardIndices[msg.id] || 0;
                                    const isFlipped = flashcardFlips[msg.id] || false;

                                    if (flashcards.length === 0) {
                                      return <div style={{ fontSize: 13, color: '#9a3412' }}>No flashcards generated for this topic yet.</div>;
                                    }

                                    const currentCard = flashcards[fcIndex];

                                    return (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#ea580c' }}>
                                          <span>Card {fcIndex + 1} of {flashcards.length}</span>
                                          <span style={{ fontSize: 11, background: '#ffedd5', padding: '2px 8px', borderRadius: 9999 }}>
                                            {currentCard.topic || 'General'}
                                          </span>
                                        </div>

                                        {/* Flip Card Component */}
                                        <div
                                          onClick={() => setFlashcardFlips(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                          style={{
                                            minHeight: 120,
                                            padding: 16,
                                            borderRadius: 12,
                                            background: '#ffffff',
                                            border: '1.5px solid #fed7aa',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)',
                                            transition: 'transform 0.2s ease'
                                          }}
                                        >
                                          <div style={{ fontSize: 11, fontWeight: 700, color: isFlipped ? '#16a34a' : '#ea580c', marginBottom: 6, textTransform: 'uppercase' }}>
                                            {isFlipped ? 'Answer (उत्तर)' : 'Question (प्रश्न - Click to Flip)'}
                                          </div>
                                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
                                            {isFlipped ? currentCard.answer : currentCard.question}
                                          </div>
                                        </div>

                                        {/* Navigation Controls */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                                          <button
                                            disabled={fcIndex === 0}
                                            onClick={() => {
                                              setFlashcardIndices(prev => ({ ...prev, [msg.id]: Math.max(0, fcIndex - 1) }));
                                              setFlashcardFlips(prev => ({ ...prev, [msg.id]: false }));
                                            }}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: '#ffffff', border: '1px solid #fed7aa', fontSize: 12, fontWeight: 600, color: '#ea580c', opacity: fcIndex === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}
                                          >
                                            <ChevronLeft style={{ width: 14, height: 14 }} />
                                            <span>Previous</span>
                                          </button>

                                          <button
                                            onClick={() => setFlashcardFlips(prev => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: '#fff7ed', border: '1px solid #fed7aa', fontSize: 12, fontWeight: 600, color: '#c2410c', display: 'flex', alignItems: 'center', gap: 4 }}
                                          >
                                            <RotateCw style={{ width: 14, height: 14 }} />
                                            <span>Flip</span>
                                          </button>

                                          <button
                                            disabled={fcIndex === flashcards.length - 1}
                                            onClick={() => {
                                              setFlashcardIndices(prev => ({ ...prev, [msg.id]: Math.min(flashcards.length - 1, fcIndex + 1) }));
                                              setFlashcardFlips(prev => ({ ...prev, [msg.id]: false }));
                                            }}
                                            style={{ padding: '6px 12px', borderRadius: 8, background: '#ffffff', border: '1px solid #fed7aa', fontSize: 12, fontWeight: 600, color: '#ea580c', opacity: fcIndex === flashcards.length - 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}
                                          >
                                            <span>Next</span>
                                            <ChevronRight style={{ width: 14, height: 14 }} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* INLINE EXPANDABLE WIDGET 3: Custom Quantity MCQ Quiz Test */}
                              {currentActiveWidget === 'quiz' && (
                                <div style={{ marginTop: 8, padding: 16, borderRadius: 16, background: '#f3e8ff', border: '1px solid #e9d5ff', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                  {(() => {
                                    const allQuiz = card.quiz || [];
                                    const targetQty = quizQuantities[msg.id] || 5;
                                    const activeQuestions = allQuiz.slice(0, targetQty);
                                    const qState = quizStates[msg.id] || { userAnswers: {} };

                                    return (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {/* Top Quantity Selector Bar */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <HelpCircle style={{ width: 16, height: 16 }} />
                                            <span>Interactive MCQ Test ({activeQuestions.length} Questions)</span>
                                          </div>

                                          {/* Quantity Picker Pills */}
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#7e22ce' }}>Quantity:</span>
                                            {[5, 10, 15, 20].map((qty) => (
                                              <button
                                                key={qty}
                                                onClick={() => setQuizQuantities(prev => ({ ...prev, [msg.id]: qty }))}
                                                style={{
                                                  padding: '2px 8px',
                                                  borderRadius: 6,
                                                  fontSize: 11,
                                                  fontWeight: 700,
                                                  background: targetQty === qty ? '#7c3aed' : '#ffffff',
                                                  color: targetQty === qty ? '#ffffff' : '#6b21a8',
                                                  border: '1px solid #c084fc',
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                {qty} Qs
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Questions List */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                          {activeQuestions.map((q, qIdx) => {
                                            const selectedOpt = qState.userAnswers[qIdx];
                                            const isSubmitted = qState.isSubmitted;

                                            return (
                                              <div key={q.id || qIdx} style={{ padding: 12, borderRadius: 12, background: '#ffffff', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                                                  {qIdx + 1}. {q.question}
                                                </div>

                                                {/* Options */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                  {q.options?.map((opt: string, optIdx: number) => {
                                                    let isCorrect = isSubmitted && optIdx === q.correctOptionIndex;
                                                    let isWrong = isSubmitted && selectedOpt === optIdx && selectedOpt !== q.correctOptionIndex;
                                                    let isSelected = selectedOpt === optIdx;

                                                    let bg = '#f8fafc';
                                                    let borderColor = '#e2e8f0';
                                                    let textColor = '#334155';

                                                    if (isCorrect) {
                                                      bg = '#f0fdf4';
                                                      borderColor = '#22c55e';
                                                      textColor = '#15803d';
                                                    } else if (isWrong) {
                                                      bg = '#fef2f2';
                                                      borderColor = '#ef4444';
                                                      textColor = '#b91c1c';
                                                    } else if (isSelected) {
                                                      bg = '#eff6ff';
                                                      borderColor = '#2563eb';
                                                      textColor = '#1d4ed8';
                                                    }

                                                    return (
                                                      <div
                                                        key={optIdx}
                                                        onClick={() => handleSelectOption(msg.id, qIdx, optIdx)}
                                                        style={{
                                                          padding: '8px 12px',
                                                          borderRadius: 8,
                                                          background: bg,
                                                          border: `1px solid ${borderColor}`,
                                                          color: textColor,
                                                          fontSize: 12.5,
                                                          fontWeight: isSelected || isCorrect ? 600 : 400,
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: 8,
                                                          cursor: isSubmitted ? 'default' : 'pointer'
                                                        }}
                                                      >
                                                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                                                          {String.fromCharCode(65 + optIdx)}
                                                        </div>
                                                        <span>{opt}</span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>

                                                {/* Explanation feedback */}
                                                {isSubmitted && (
                                                  <div style={{ marginTop: 4, padding: '6px 10px', borderRadius: 6, background: '#f5f3ff', fontSize: 11.5, color: '#5b21b6', lineHeight: 1.4 }}>
                                                    <strong>Explanation:</strong> {q.explanation}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>

                                        {/* Submit Quiz Action */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
                                          {!qState.isSubmitted ? (
                                            <button
                                              onClick={() => handleSubmitQuiz(msg.id, activeQuestions)}
                                              style={{
                                                padding: '8px 18px',
                                                borderRadius: 10,
                                                background: '#7c3aed',
                                                color: '#ffffff',
                                                fontSize: 12.5,
                                                fontWeight: 700,
                                                border: 'none',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)'
                                              }}
                                            >
                                              Submit Quiz Answers
                                            </button>
                                          ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b21a8', fontWeight: 800, fontSize: 14 }}>
                                              <Award style={{ width: 18, height: 18, color: '#7c3aed' }} />
                                              <span>Quiz Completed! Score: {qState.score}%</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* INLINE EXPANDABLE WIDGET 4: Mindmap Concept Tree */}
                              {currentActiveWidget === 'mindmap' && (
                                <div style={{ marginTop: 8, padding: 16, borderRadius: 16, background: '#e0e7ff', border: '1px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#3730a3', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <GitFork style={{ width: 16, height: 16 }} />
                                    <span>Concept Tree: "{card.mindmap?.label || card.videoTitle}"</span>
                                  </div>

                                  <div style={{ padding: 12, borderRadius: 12, background: '#ffffff', border: '1px solid #c7d2fe', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {card.mindmap?.children?.map((node, i) => (
                                      <div key={node.id || i} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8, borderLeft: '2px solid #4f46e5' }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e1b4b' }}>
                                          {node.label}
                                        </div>
                                        {node.details && <div style={{ fontSize: 12, color: '#4338ca' }}>{node.details}</div>}

                                        {node.children?.map((sub, j) => (
                                          <div key={sub.id || j} style={{ fontSize: 12, color: '#475569', paddingLeft: 10 }}>
                                            • {sub.label}
                                          </div>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          )}

                          {/* Manus Action Bar (Copy & Regenerate Icons) */}
                          {!msg.isProcessing && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, paddingTop: 4 }}>
                              <button
                                onClick={() => navigator.clipboard.writeText(msg.text)}
                                title="Copy response"
                                style={{ border: 'none', background: 'transparent', color: '#a1a1aa', cursor: 'pointer', padding: 2 }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#09090b')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                              >
                                <Copy style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isAiResponding && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#2563eb', fontSize: 13, fontStyle: 'italic', paddingLeft: 8 }}>
              <Sparkles style={{ width: 16, height: 16, animation: 'spin 1.5s linear infinite' }} />
              <span>MindTube AI is reasoning & answering...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Single ChatGPT Master Input Capsule (Fixed Bottom Sticky 24/7) */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 12px max(10px, env(safe-area-inset-bottom)) 12px', background: '#fafafa', width: '100%', maxWidth: 720, margin: '0 auto', position: 'sticky', bottom: 0, zIndex: 100 }}>
        <form onSubmit={handleSubmit} className="agent-input-container" style={{ background: '#ffffff', borderRadius: 28, padding: '16px 20px', border: isListening ? '1.5px solid #ef4444' : '1.5px solid #e4e4e7', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={isListening ? "🎙️ Listening... speak now..." : "Ask any question, code, math problem, or paste YouTube URL..."}
            className="agent-input-field"
            style={{ resize: 'none', fontSize: 14.5, minHeight: 40, lineHeight: 1.45 }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: 4 }}>
            {/* Left Controls: '+' Icon, PDF Style, and Transcript Drawer Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f4f4f5', border: '1px solid #e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b', cursor: 'pointer' }}>
                <Plus style={{ width: 14, height: 14 }} />
              </div>

              {/* PDF Style Selector Pill */}
              <div style={{ background: '#f4f4f5', borderRadius: 9999, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4, border: '1px solid #e4e4e7' }}>
                <FileDown style={{ width: 12, height: 12, color: '#7c3aed' }} />
                <select
                  value={pdfStyle}
                  onChange={(e) => onSelectPdfStyle && onSelectPdfStyle(e.target.value as 'handbook' | 'tree')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="handbook">📚 Academic Handbook PDF</option>
                  <option value="tree">🌳 Revisemap Tree PDF</option>
                </select>
              </div>

              {/* Transcript Drawer Button */}
              <button
                type="button"
                onClick={() => setShowTranscriptModal(true)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 9999,
                  background: customTranscriptText ? '#f0fdf4' : '#fef3c7',
                  border: customTranscriptText ? '1px solid #86efac' : '1px solid #fde047',
                  color: customTranscriptText ? '#15803d' : '#854d0e',
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer'
                }}
              >
                <FileText style={{ width: 12, height: 12, color: customTranscriptText ? '#16a34a' : '#ca8a04' }} />
                <span>{customTranscriptText ? '✅ Transcript Attached (100% Grounded)' : '⚠️ 📝 Paste Video Transcript'}</span>
              </button>
            </div>

            {/* Right Controls: LANGUAGE SELECTOR + Voice Mic + Send Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Language Selector Pill */}
              <div style={{ background: '#f4f4f5', borderRadius: 9999, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Languages style={{ width: 12, height: 12, color: '#2563eb' }} />
                <select
                  value={currentLanguage}
                  onChange={(e) => onSelectLanguage(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#0f172a',
                    cursor: 'pointer'
                  }}
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>

              {/* Working Voice Recognition Mic Button */}
              <button
                type="button"
                onClick={toggleVoiceRecognition}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: isListening ? '#fef2f2' : '#f4f4f5',
                  border: isListening ? '1px solid #fca5a5' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isListening ? '#ef4444' : '#52525b',
                  cursor: 'pointer',
                  animation: isListening ? 'pulse 1.5s infinite' : 'none'
                }}
              >
                {isListening ? <MicOff style={{ width: 15, height: 15 }} /> : <Mic style={{ width: 15, height: 15 }} />}
              </button>

              <button
                type="submit"
                disabled={!inputText.trim() || isAiResponding}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#09090b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  opacity: !inputText.trim() && !isAiResponding ? 0.6 : 1
                }}
              >
                {inputText.trim() ? (
                  <Send style={{ width: 14, height: 14 }} />
                ) : (
                  <AudioLines style={{ width: 15, height: 15 }} />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Manus Footer Disclaimer Text */}
        <div style={{ textAlign: 'center', fontSize: 11, color: '#a1a1aa', paddingBottom: 2 }}>
          MindTube can make mistakes. Please check before use.
        </div>
      </div>

      {/* FULL VIDEO TRANSCRIPT MODAL / DRAWER */}
      {showTranscriptModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 640, padding: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText style={{ width: 20, height: 20, color: '#2563eb' }} />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Paste Full Video Transcript (100% Exact Context)
                </h3>
              </div>
              <button onClick={() => setShowTranscriptModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#475569', margin: 0, lineHeight: 1.5 }}>
              Paste full spoken video transcript text here. Sending 100% untruncated transcript context guarantees <strong>zero hallucinations</strong> and exact coverage across Physics, Chemistry, Biology & Math!
            </p>

            <textarea
              rows={10}
              value={customTranscriptText}
              onChange={(e) => setCustomTranscriptText(e.target.value)}
              placeholder="Paste full spoken transcript lines here... (e.g. [00:15] Welcome students today we discuss resistance of a conductor, electric motor, kinetic energy...)"
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.5, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#64748b' }}>
              <span>Character count: {customTranscriptText.length.toLocaleString()} chars</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {customTranscriptText && (
                  <button onClick={() => setCustomTranscriptText('')} style={{ padding: '6px 12px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                    Clear
                  </button>
                )}
                <button onClick={() => setShowTranscriptModal(false)} style={{ padding: '6px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
                  Save & Attach
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
