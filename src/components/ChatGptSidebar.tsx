import React from 'react';
import {
  Sparkles,
  Plus,
  Languages,
  X,
  PanelLeftClose,
  Coins,
  Settings,
  Search,
  Bot,
  Grid,
  Clock,
  BookOpen,
  SlidersHorizontal,
  FolderPlus,
  Key,
  MessageSquare,
  FileDown
} from 'lucide-react';
import { ChatSession } from '../types/notes';
import { ApiCostSummary } from '../types/cost';

interface ChatGptSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewChat: () => void;
  onOpenPlaylistModal: () => void;
  onOpenApiKeyModal: () => void;
  onOpenCostDashboard?: () => void;
  onOpenSettings?: () => void;
  selectedModel?: string;
  apiCostSummary?: ApiCostSummary;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  isDesktop?: boolean;
}

export const ChatGptSidebar: React.FC<ChatGptSidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  onOpenPlaylistModal,
  onOpenApiKeyModal,
  onOpenCostDashboard,
  onOpenSettings,
  selectedModel = 'Gemini 2.5 Flash Lite',
  apiCostSummary,
  currentLanguage,
  onSelectLanguage,
  isDesktop = false
}) => {
  // Inner Sidebar content matching Manus AI 1:1 design
  const sidebarContent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f2f2f4',
        borderRight: '1px solid #e4e4e7',
        padding: '14px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Top Header & Main Navigation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, flex: 1 }}>
        {/* Brand & Window Icons Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div onClick={onNewChat} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: '#09090b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles style={{ width: 13, height: 13 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#09090b', fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
              mindtube
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={{ border: 'none', background: 'transparent', padding: 5, color: '#71717a', cursor: 'pointer', borderRadius: 6 }}>
              <Search style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={onClose} title="Collapse Sidebar" style={{ border: 'none', background: 'transparent', padding: 5, color: '#71717a', cursor: 'pointer', borderRadius: 6 }}>
              <PanelLeftClose style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Primary Manus Action Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={() => {
              onNewChat();
              if (!isDesktop) onClose();
            }}
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#09090b',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Plus style={{ width: 16, height: 16, color: '#3f3f46' }} />
            <span>New task</span>
          </button>

          <button
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#3f3f46',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Bot style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Agent</span>
          </button>

          <button
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#3f3f46',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Grid style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Plugins</span>
          </button>

          <button
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#3f3f46',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Clock style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Scheduled</span>
          </button>

          <button
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#3f3f46',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <BookOpen style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Library</span>
          </button>

          {/* Language Selector */}
          <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: '#3f3f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Languages style={{ width: 15, height: 15, color: '#71717a' }} />
              <span>Language</span>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              style={{ background: '#ebebeb', border: 'none', borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 600, color: '#09090b', cursor: 'pointer' }}
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <button
            onClick={() => {
              onOpenCostDashboard?.();
              if (!isDesktop) onClose();
            }}
            style={{
              padding: '7px 10px',
              borderRadius: 8,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              fontSize: 12.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Coins style={{ width: 15, height: 15, color: '#16a34a' }} />
              <span>API Cost & Usage</span>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 9999, background: '#dcfce7', color: '#166534' }}>
              ${apiCostSummary?.totalCostUsd.toFixed(4) || '0.0000'}
            </span>
          </button>
        </div>

        {/* Projects Section */}
        <div style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px', fontSize: 11.5, fontWeight: 600, color: '#a1a1aa' }}>
            <span>Projects</span>
            <Plus style={{ width: 14, height: 14, cursor: 'pointer', color: '#71717a' }} />
          </div>
          <button
            onClick={onOpenPlaylistModal}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: '#3f3f46',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ebebeb')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <FolderPlus style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>New project</span>
          </button>
        </div>

        {/* Tasks Section (Recents Chat Sessions) */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px', fontSize: 11.5, fontWeight: 600, color: '#a1a1aa' }}>
            <span>Tasks</span>
            <SlidersHorizontal style={{ width: 13, height: 13, cursor: 'pointer', color: '#71717a' }} />
          </div>

          <div className="no-scrollbar" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0, paddingTop: 4 }}>
            {sessions.length === 0 ? (
              <div style={{ fontSize: 12, color: '#a1a1aa', padding: '10px', textAlign: 'center' }}>
                No active tasks yet
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const hasPdf = session.messages.some((m) => m.analysisCard != null || m.text.includes('youtube.com') || m.text.includes('watch?v='));

                return (
                  <div
                    key={session.id}
                    className="sidebar-recent-item"
                    onClick={() => {
                      onSelectSession(session.id);
                      if (!isDesktop) onClose();
                    }}
                    style={{
                      padding: '7px 10px',
                      borderRadius: 8,
                      background: isActive ? '#ebebeb' : 'transparent',
                      color: isActive ? '#09090b' : '#3f3f46',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 12.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                      {hasPdf ? (
                        <div title="Class Notes PDF Session" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <FileDown
                            style={{
                              width: 14,
                              height: 14,
                              color: isActive ? '#16a34a' : '#22c55e'
                            }}
                          />
                        </div>
                      ) : (
                        <div title="Text Chat Session" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <MessageSquare
                            style={{
                              width: 14,
                              height: 14,
                              color: isActive ? '#09090b' : '#71717a'
                            }}
                          />
                        </div>
                      )}
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session.title || 'Untitled Task'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      className="sidebar-delete-btn"
                      style={{
                        opacity: 0,
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: 2
                      }}
                    >
                      <X style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div style={{ borderTop: '1px solid #eaeaea', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 4, paddingRight: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            VK
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#09090b' }}>
              Vineet Kumar
            </div>
            <div style={{ fontSize: 10, color: '#71717a', fontWeight: 500 }}>
              {selectedModel}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={onOpenApiKeyModal} style={{ border: 'none', background: 'transparent', color: '#71717a', padding: 4, cursor: 'pointer' }}>
            <Key style={{ width: 15, height: 15 }} />
          </button>
          <button onClick={onOpenSettings} style={{ border: 'none', background: 'transparent', color: '#71717a', padding: 4, cursor: 'pointer' }}>
            <Settings style={{ width: 15, height: 15 }} />
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop docked view
  if (isDesktop) {
    if (!isOpen) return null;
    return (
      <aside
        style={{
          width: 240,
          height: '100dvh',
          maxHeight: '100dvh',
          flexShrink: 0,
          zIndex: 40
        }}
      >
        {sidebarContent}
      </aside>
    );
  }

  // Mobile Slide-out Drawer
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 280,
          maxWidth: '85vw',
          height: '100%',
          background: '#ffffff',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)'
        }}
      >
        {sidebarContent}
      </div>
    </div>
  );
};
