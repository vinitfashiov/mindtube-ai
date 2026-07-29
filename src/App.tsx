import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VideoInputSection } from './components/VideoInputSection';
import { ChatGptSidebar } from './components/ChatGptSidebar';
import { ClassNotesPdfView } from './components/ClassNotesPdfView';
import { ChatWithVideoDrawer } from './components/ChatWithVideoDrawer';
import { PlaylistInputModal } from './components/PlaylistInputModal';

import { VideoNoteAnalysis, ChatSession, MasterChatMessage } from './types/notes';
import { generateVideoAnalysis, translateAnalysis, chatWithMasterAi, SAMPLE_ANALYSIS } from './services/geminiService';

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('mindtube_gemini_key') || '';
  });

  // Responsive desktop detection
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Multi-Session Chat Engine
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('mindtube_chat_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Failed to load chat sessions:', err);
    }
    // Fresh clean initial session for new devices & browsers
    const freshSession: ChatSession = {
      id: 'sess-' + Date.now(),
      title: 'New chat',
      createdAt: new Date().toISOString(),
      messages: [],
      analysis: null
    };
    return [freshSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('mindtube_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch {}
    }
    return '';
  });

  const [analysis, setAnalysis] = useState<VideoNoteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // Modals & Drawers (Default sidebar open on Desktop, CLOSED on Mobile!)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => window.innerWidth >= 768);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mindtube_chat_sessions', JSON.stringify(sessions));
    } catch (err) {
      console.warn('Failed to save sessions:', err);
    }
  }, [sessions]);

  // Active Session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('mindtube_gemini_key', key);
  };

  // Start a fresh brand new Chat Session (+ New Chat)
  const handleNewChat = () => {
    const newSessId = 'sess-' + Date.now();
    const newSession: ChatSession = {
      id: newSessId,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      messages: [],
      analysis: null
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessId);
    setAnalysis(null);
    setErrorMsg(null);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    const found = sessions.find((s) => s.id === sessionId);
    if (found) {
      setAnalysis(found.analysis || null);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        // If all deleted, create fresh new session
        const fresh: ChatSession = {
          id: 'sess-' + Date.now(),
          title: 'New chat',
          createdAt: new Date().toISOString(),
          messages: [],
          analysis: null
        };
        setActiveSessionId(fresh.id);
        setAnalysis(null);
        return [fresh];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
        setAnalysis(filtered[0].analysis || null);
      }
      return filtered;
    });
  };

  // Single Unified Input Handler (YouTube URL or General Q&A)
  const handleSendMessage = async (inputText: string) => {
    const query = inputText.trim();
    if (!query) return;

    // Ensure we have an active session
    let currentSessId = activeSessionId;
    if (!currentSessId || !sessions.some((s) => s.id === currentSessId)) {
      const freshId = 'sess-' + Date.now();
      const freshSession: ChatSession = {
        id: freshId,
        title: 'New chat',
        createdAt: new Date().toISOString(),
        messages: [],
        analysis: null
      };
      setSessions((prev) => [freshSession, ...prev]);
      setActiveSessionId(freshId);
      currentSessId = freshId;
    }

    const isYouTubeUrl = /(youtu\.be\/|youtube\.com\/(watch\?|embed\/|v\/|shorts\/))/i.test(query);

    const userMsg: MasterChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Append User Message to Active Session
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSessId) {
          const isNewTitle = s.title === 'New chat';
          const newTitle = isNewTitle ? (query.length > 24 ? query.substring(0, 24) + '...' : query) : s.title;
          return {
            ...s,
            title: newTitle,
            messages: [...s.messages, userMsg]
          };
        }
        return s;
      })
    );

    if (isYouTubeUrl) {
      // Add Processing Placeholder Card
      const procMsg: MasterChatMessage = {
        id: 'proc-' + Date.now(),
        sender: 'assistant',
        text: 'Analyzing YouTube Video Request...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isProcessing: true
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessId ? { ...s, messages: [...s.messages, procMsg] } : s))
      );

      setIsLoading(true);
      setErrorMsg(null);

      try {
        const result = await generateVideoAnalysis(query, apiKey, currentLanguage);
        setAnalysis(result);

        const cardMsg: MasterChatMessage = {
          id: 'card-' + Date.now(),
          sender: 'assistant',
          text: `✨ Master Class Notes PDF & Mindmap generated for: "${result.videoTitle}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysisCard: result
        };

        // Replace processing placeholder with finished Card
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessId) {
              const filteredMsgs = s.messages.filter((m) => !m.isProcessing);
              return {
                ...s,
                title: result.videoTitle,
                analysis: result,
                messages: [...filteredMsgs, cardMsg]
              };
            }
            return s;
          })
        );
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || 'Failed to process YouTube video.');
        const errorMsgCard: MasterChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: `Error processing video: ${err.message || 'Please check your YouTube URL or Gemini API Key.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === currentSessId) {
              const filteredMsgs = s.messages.filter((m) => !m.isProcessing);
              return { ...s, messages: [...filteredMsgs, errorMsgCard] };
            }
            return s;
          })
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // General ChatGPT Reasoning Q&A
      setIsAiResponding(true);
      try {
        const responseText = await chatWithMasterAi(query, activeSession?.analysis, apiKey, currentLanguage);
        const aiMsg: MasterChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setSessions((prev) =>
          prev.map((s) => (s.id === currentSessId ? { ...s, messages: [...s.messages, aiMsg] } : s))
        );
      } catch (err: any) {
        console.error(err);
        const errorMsgCard: MasterChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          text: 'Sorry, I ran into an error generating the AI response. Please check your Gemini API key.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === currentSessId ? { ...s, messages: [...s.messages, errorMsgCard] } : s))
        );
      } finally {
        setIsAiResponding(false);
      }
    }
  };

  const handleAnalyzePlaylist = (_playlistUrl: string) => {
    setIsPlaylistModalOpen(false);
    handleSendMessage('https://www.youtube.com/watch?v=1PXFAFMgdns');
  };

  const handleSelectLanguage = async (lang: string) => {
    setCurrentLanguage(lang);
    if (!analysis || lang === 'en') return;

    try {
      const translated = await translateAnalysis(analysis, lang, apiKey);
      setAnalysis(translated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', background: '#ffffff', overflowX: 'hidden' }}>
      {/* ChatGPT Left Docked Sidebar on Desktop / Slide-out on Mobile */}
      <ChatGptSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isDesktop={isDesktop}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#ffffff', minWidth: 0 }}>
        {/* Top Header Bar */}
        <Navbar
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          onOpenHistory={() => setIsSidebarOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
          historyCount={sessions.length}
          onLoadSample={handleNewChat}
          onNewChat={handleNewChat}
          currentLanguage={currentLanguage}
          onSelectLanguage={handleSelectLanguage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isDesktop={isDesktop}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Main Content Workspace Container */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', position: 'relative' }}>
          {/* Error Alert */}
          {errorMsg && (
            <div style={{
              padding: 12,
              borderRadius: 12,
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '8px 16px'
            }}>
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} style={{ color: '#dc2626', fontSize: 12, textDecoration: 'underline' }}>
                Dismiss
              </button>
            </div>
          )}

          {/* Persistent Master Chatbot Interface */}
          <VideoInputSection
            messages={activeSession ? activeSession.messages : []}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isAiResponding={isAiResponding}
            onOpenPdf={(specificAnalysis) => {
              if (specificAnalysis) setAnalysis(specificAnalysis);
              else if (!analysis) setAnalysis(SAMPLE_ANALYSIS);
              setIsPdfModalOpen(true);
            }}
            onOpenChat={() => {
              if (!analysis) setAnalysis(SAMPLE_ANALYSIS);
              setIsChatOpen(true);
            }}
            currentLanguage={currentLanguage}
            onSelectLanguage={handleSelectLanguage}
            analysis={analysis}
            activeSessionTitle={activeSession?.title}
            apiKey={apiKey}
          />
        </main>
      </div>

      {/* Modals & Overlays */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <PlaylistInputModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onAnalyzePlaylist={handleAnalyzePlaylist}
        isLoading={isLoading}
      />

      {isPdfModalOpen && (analysis || SAMPLE_ANALYSIS) && (
        <ClassNotesPdfView
          analysis={analysis || SAMPLE_ANALYSIS}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}

      {isChatOpen && (analysis || SAMPLE_ANALYSIS) && (
        <ChatWithVideoDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          analysis={analysis || SAMPLE_ANALYSIS}
          apiKey={apiKey}
        />
      )}
    </div>
  );
};
