import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mic, MicOff, Sparkles, User, Volume2, VolumeX, Lightbulb, Code } from 'lucide-react';
import { VideoNoteAnalysis } from '../types/notes';
import { chatWithVideoAi } from '../services/geminiService';
import { createSpeechRecognizer, speakNaturalVoice, stopSpeech } from '../services/voiceService';

interface ChatWithVideoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: VideoNoteAnalysis;
  apiKey: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
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

// Helper: Render Rich Formatted Markdown, Headers, Lists & Code Blocks cleanly
function renderRichMessageContent(text: string) {
  // Check for code blocks
  if (text.includes('```')) {
    const segments = text.split(/(```[\s\S]*?```)/g);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {segments.map((seg, idx) => {
          if (seg.startsWith('```') && seg.endsWith('```')) {
            const codeContent = seg.slice(3, -3).replace(/^[a-zA-Z]+\n/, ''); // strip lang tag
            return (
              <pre
                key={idx}
                style={{
                  background: '#0f172a',
                  color: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: 12,
                  fontSize: 12,
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
          return <div key={idx}>{renderTextParagraphs(seg)}</div>;
        })}
      </div>
    );
  }

  return renderTextParagraphs(text);
}

function renderTextParagraphs(rawText: string) {
  // Normalize multi-header inline markdown like "### **Header** * **Item**" into lines
  const normalized = rawText
    .replace(/(###|\*\*Level|\*\*स्तर|\*\*क्या|\*\*परिणाम|\*\*सीख|\*\*Takeaway)/g, '\n$1')
    .replace(/\s*\*\s*\*\*/g, '\n* **');

  const lines = normalized.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Render Headers (###)
        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const title = trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, '');
          return (
            <div
              key={idx}
              style={{
                fontSize: 13.5,
                fontWeight: 800,
                color: '#1e293b',
                marginTop: 8,
                marginBottom: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <div style={{ width: 3, height: 14, background: '#7c3aed', borderRadius: 2 }} />
              <span>{title}</span>
            </div>
          );
        }

        // Render Bullet Points (* or -)
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
                fontSize: 13,
                color: '#334155',
                lineHeight: 1.5
              }}
            >
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 7 }} />
              <div>{parseBoldMarkdown(content)}</div>
            </div>
          );
        }

        // Regular Paragraph
        return (
          <p key={idx} style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#334155' }}>
            {parseBoldMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export const ChatWithVideoDrawer: React.FC<ChatWithVideoDrawerProps> = ({
  isOpen,
  onClose,
  analysis,
  apiKey
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: `Hello! I am your AI Study Copilot for "${analysis.videoTitle}". Ask me any question about this video, ask for code examples, or request deeper topic explanations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  if (!isOpen) return null;

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      (text) => setInputMessage(text),
      () => setIsListening(true),
      () => setIsListening(false),
      (err) => {
        console.warn('Voice input notice:', err);
        setIsListening(false);
      },
      analysis.language || 'en'
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
    speakNaturalVoice(text, analysis.language || 'en');
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsSending(true);

    try {
      const response = await chatWithVideoAi(query, analysis, [], apiKey);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Automatically speak AI response
      speakNaturalVoice(response, analysis.language || 'en');
      setIsPlayingAudio(true);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Sorry, I ran into an error retrieving the response. Please check your Gemini API key.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 250,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'flex-end'
      }}
      onClick={() => {
        stopSpeech();
        onClose();
      }}
    >
      {/* Pure White Light Mode Drawer */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 460,
          height: '100%',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 14,
          boxShadow: '-10px 0 30px rgba(15, 23, 42, 0.08)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#f3e8ff',
                border: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#7c3aed'
              }}>
                <Bot style={{ width: 18, height: 18 }} />
              </div>

              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                  Chat with Video AI
                </h3>
                <p style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>
                  Copilot for: {analysis.videoTitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isPlayingAudio && (
                <button
                  onClick={() => {
                    stopSpeech();
                    setIsPlayingAudio(false);
                  }}
                  title="Stop Audio Readout"
                  style={{
                    padding: '4px 8px',
                    borderRadius: 9999,
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#ef4444',
                    fontSize: 10.5,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <VolumeX style={{ width: 12, height: 12 }} />
                  <span>Stop Voice</span>
                </button>
              )}

              <button
                onClick={() => {
                  stopSpeech();
                  onClose();
                }}
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
          </div>

          {/* Quick Prompt Pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSend("Summarize 3 key points of this video")}
              style={{
                padding: '4px 10px',
                borderRadius: 9999,
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                color: '#2563eb',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Lightbulb style={{ width: 12, height: 12 }} />
              <span>Summarize 3 key points</span>
            </button>

            <button
              onClick={() => handleSend("Give me practical code examples or applications from this video")}
              style={{
                padding: '4px 10px',
                borderRadius: 9999,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                fontSize: 11,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Code style={{ width: 12, height: 12 }} />
              <span>Code Examples</span>
            </button>
          </div>
        </div>

        {/* Message History Container */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 4 }}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {msg.sender === 'assistant' ? (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot style={{ width: 12, height: 12 }} />
                  </div>
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User style={{ width: 12, height: 12 }} />
                  </div>
                )}
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{msg.timestamp}</span>

                {msg.sender === 'assistant' && (
                  <button
                    onClick={() => handleSpeakText(msg.text)}
                    title="Read aloud with Voice AI"
                    style={{ color: '#7c3aed', padding: 2 }}
                  >
                    <Volume2 style={{ width: 13, height: 13 }} />
                  </button>
                )}
              </div>

              <div
                style={{
                  maxWidth: '92%',
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.sender === 'user' ? '#2563eb' : '#ffffff',
                  border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(37, 99, 235, 0.2)' : '0 2px 8px rgba(15, 23, 42, 0.04)'
                }}
              >
                {msg.sender === 'assistant' ? (
                  renderRichMessageContent(msg.text)
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {isSending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#7c3aed', fontSize: 12, fontStyle: 'italic', paddingLeft: 6 }}>
              <Sparkles style={{ width: 14, height: 14, animation: 'spin 1.5s linear infinite' }} />
              <span>AI Copilot is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: isListening ? '1px solid #ef4444' : '1px solid #e2e8f0',
              borderRadius: 24,
              padding: '6px 12px'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? "🎙️ Listening... speak now..." : "Ask AI about this video..."}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 13,
                color: '#0f172a'
              }}
            />

            <button
              type="button"
              onClick={toggleVoiceRecognition}
              title={isListening ? "Stop Listening" : "Speak to AI"}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isListening ? '#fef2f2' : '#ffffff',
                border: isListening ? '1px solid #fca5a5' : '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isListening ? '#ef4444' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {isListening ? <MicOff style={{ width: 14, height: 14 }} /> : <Mic style={{ width: 14, height: 14 }} />}
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: inputMessage.trim() ? '#2563eb' : '#09090b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Send style={{ width: 14, height: 14 }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
