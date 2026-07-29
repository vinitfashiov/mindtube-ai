import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ApiKeyModal } from './components/ApiKeyModal';
import { VideoInputSection } from './components/VideoInputSection';
import { ChatGptSidebar } from './components/ChatGptSidebar';
import { ClassNotesPdfView } from './components/ClassNotesPdfView';
import { ChatWithVideoDrawer } from './components/ChatWithVideoDrawer';
import { PlaylistInputModal } from './components/PlaylistInputModal';
import { ApiCostDashboardModal } from './components/ApiCostDashboardModal';
import { SettingsModal } from './components/SettingsModal';

import { VideoNoteAnalysis, ChatSession, MasterChatMessage } from './types/notes';
import { ApiCostSummary, ApiUsageLog } from './types/cost';
import { generateVideoAnalysis, translateAnalysis, chatWithMasterAiDetailed, extractYouTubeId, SAMPLE_ANALYSIS } from './services/geminiService';

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('mindtube_gemini_key') || '';
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem('mindtube_selected_model') || 'gemini-2.5-flash-lite';
  });

  const [defaultQuizQty, setDefaultQuizQty] = useState<number>(() => {
    const saved = localStorage.getItem('mindtube_default_quiz_qty');
    return saved ? parseInt(saved, 10) : 10;
  });

  // Responsive desktop detection
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false); // ALWAYS CLOSED BY DEFAULT ON INITIAL LOAD!

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsSidebarOpen(false); // Force closed on mobile
      } else {
        setIsSidebarOpen(true); // Open on desktop
      }
    };
    handleResize();
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

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (sessions.length > 0) return sessions[0].id;
    return null;
  });

  const [analysis, setAnalysis] = useState<VideoNoteAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');

  // Modals & Drawers
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState<boolean>(false);
  const [isCostDashboardOpen, setIsCostDashboardOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    localStorage.setItem('mindtube_selected_model', modelId);
  };

  const handleSelectQuizQty = (qty: number) => {
    setDefaultQuizQty(qty);
    localStorage.setItem('mindtube_default_quiz_qty', qty.toString());
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setSessions([]);
    setActiveSessionId(null);
    setAnalysis(null);
    setApiKey('');
    setSelectedModel('gemini-2.5-flash-lite');
    setApiCostSummary({
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
      totalCostInr: 0,
      logs: []
    });
  };

  // Real-Time API Cost Tracking State
  const [apiCostSummary, setApiCostSummary] = useState<ApiCostSummary>(() => {
    try {
      const saved = localStorage.getItem('mindtube_api_cost_summary');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
      totalCostInr: 0,
      logs: []
    };
  });

  const recordApiUsage = (type: 'video_synthesis' | 'chat_qa' | 'translation', usage?: { inputTokens: number; outputTokens: number; costUsd: number; costInr: number }, details: string = '') => {
    if (!usage) return;
    setApiCostSummary((prev) => {
      const newLog: ApiUsageLog = {
        id: 'log-' + Date.now(),
        type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        model: 'gemini-2.5-flash',
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        costUsd: usage.costUsd,
        costInr: usage.costInr,
        details: details || type
      };
      const updated = {
        totalCalls: prev.totalCalls + 1,
        totalInputTokens: prev.totalInputTokens + usage.inputTokens,
        totalOutputTokens: prev.totalOutputTokens + usage.outputTokens,
        totalCostUsd: prev.totalCostUsd + usage.costUsd,
        totalCostInr: prev.totalCostInr + usage.costInr,
        logs: [newLog, ...prev.logs]
      };
      try {
        localStorage.setItem('mindtube_api_cost_summary', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleResetCostUsage = () => {
    const fresh = {
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
      totalCostInr: 0,
      logs: []
    };
    setApiCostSummary(fresh);
    localStorage.removeItem('mindtube_api_cost_summary');
  };

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

    const isYouTubeUrl = extractYouTubeId(query) !== null || /(youtu\.be|youtube\.com|\/watch|\/live|\/shorts|\/embed)/i.test(query);

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
        const result = await generateVideoAnalysis(query, apiKey, currentLanguage, selectedModel);
        setAnalysis(result);
        if (result.usageCost) {
          recordApiUsage('video_synthesis', result.usageCost, result.videoTitle);
        }

        const cardMsg: MasterChatMessage = {
          id: 'card-' + Date.now(),
          sender: 'assistant',
          text: `✨ Master Class Notes PDF & Mindmap generated for: "${result.videoTitle}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          analysisCard: result,
          usageCost: result.usageCost
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
        const res = await chatWithMasterAiDetailed(query, activeSession?.analysis, apiKey, currentLanguage, selectedModel);
        if (res.usageCost) {
          recordApiUsage('chat_qa', res.usageCost, query);
        }

        const aiMsg: MasterChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: res.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          usageCost: res.usageCost
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
        onOpenApiKeyModal={() => setIsSettingsModalOpen(true)}
        onOpenCostDashboard={() => setIsCostDashboardOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        selectedModel={selectedModel}
        apiCostSummary={apiCostSummary}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        isDesktop={isDesktop}
      />

      {/* Main Workspace Area */}
      <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', background: '#fafafa', minWidth: 0 }}>
        {/* Top Header Bar */}
        <Navbar
          apiKey={apiKey}
          onOpenApiKeyModal={() => setIsSettingsModalOpen(true)}
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
          selectedModel={selectedModel}
          onSelectModel={(model) => setSelectedModel(model)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          apiCostSummary={apiCostSummary}
          onOpenCostDashboard={() => setIsCostDashboardOpen(true)}
        />

        {/* Main Content Workspace Container */}
        <main style={{ flex: 1, height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%', position: 'relative' }}>
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

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        currentLanguage={currentLanguage}
        onSelectLanguage={setCurrentLanguage}
        defaultQuizQty={defaultQuizQty}
        onSelectQuizQty={handleSelectQuizQty}
        onClearAllData={handleClearAllData}
      />

      <PlaylistInputModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        onAnalyzePlaylist={handleAnalyzePlaylist}
        isLoading={isLoading}
      />

      <ApiCostDashboardModal
        summary={apiCostSummary}
        isOpen={isCostDashboardOpen}
        onClose={() => setIsCostDashboardOpen(false)}
        onResetUsage={handleResetCostUsage}
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
