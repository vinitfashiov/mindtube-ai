import React from 'react';
import {
  Sparkles,
  Plus,
  Folder,
  Languages,
  Key,
  X,
  User,
  MessageSquare,
  PanelLeftClose,
  Coins,
  Settings
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
  selectedModel,
  apiCostSummary,
  currentLanguage,
  onSelectLanguage,
  isDesktop = false
}) => {
  // Inner Sidebar content
  const sidebarContent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#ffffff',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#09090b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles style={{ width: 16, height: 16 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#09090b' }}>
              MindTube AI
            </span>
          </div>

          <button onClick={onClose} title="Collapse Sidebar" style={{ padding: 6, color: '#71717a' }}>
            <PanelLeftClose style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <button
          onClick={() => {
            onNewChat();
            if (!isDesktop) onClose();
          }}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 12,
            background: '#f4f4f5',
            border: '1px solid #e4e4e7',
            color: '#09090b',
            fontSize: 13.5,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus style={{ width: 16, height: 16, color: '#09090b' }} />
            <span>New chat</span>
          </div>
        </button>

        {/* Quick Navigation Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 4 }}>
          <button
            onClick={() => {
              onOpenPlaylistModal();
              if (!isDesktop) onClose();
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#3f3f46',
              fontWeight: 500
            }}
          >
            <Folder style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Playlist Binder</span>
          </button>

          <button
            onClick={() => {
              onOpenApiKeyModal();
              if (!isDesktop) onClose();
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#3f3f46',
              fontWeight: 500
            }}
          >
            <Key style={{ width: 16, height: 16, color: '#71717a' }} />
            <span>Gemini API Key</span>
          </button>

          <button
            onClick={() => {
              onOpenCostDashboard?.();
              if (!isDesktop) onClose();
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              fontSize: 13,
              color: '#15803d',
              fontWeight: 600,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)'
            }}
            title="Open API Cost & Token Usage Dashboard"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Coins style={{ width: 16, height: 16, color: '#16a34a' }} />
              <span>API Cost & Usage</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 9999, background: '#dcfce7', color: '#166534' }}>
              ${apiCostSummary?.totalCostUsd.toFixed(4) || '0.0000'}
            </span>
          </button>

          {/* Language Selector */}
          <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#3f3f46' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Languages style={{ width: 16, height: 16, color: '#71717a' }} />
              <span>Language</span>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value)}
              style={{ background: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 600, color: '#09090b' }}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recents Section (Saved Past Chat Sessions) */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#71717a', paddingLeft: 6, marginBottom: 4 }}>
          Recents ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div style={{ fontSize: 12, color: '#a1a1aa', paddingLeft: 6, fontStyle: 'italic' }}>
            No recent chats yet
          </div>
        ) : (
          sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => {
                  onSelectSession(sess.id);
                  if (!isDesktop) onClose();
                }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 8,
                  fontSize: 13,
                  color: isActive ? '#0f172a' : '#27272a',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#f1f5f9' : 'transparent',
                  border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="sidebar-recent-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <MessageSquare style={{ width: 14, height: 14, color: isActive ? '#2563eb' : '#71717a', flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {sess.title}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(sess.id);
                  }}
                  style={{ color: '#a1a1aa', padding: 2 }}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* User Account Footer & Settings Trigger */}
      <div
        onClick={() => {
          onOpenSettings?.();
          if (!isDesktop) onClose();
        }}
        style={{
          borderTop: '1px solid #f4f4f5',
          paddingTop: 10,
          paddingBottom: 4,
          paddingLeft: 6,
          paddingRight: 6,
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'background 0.15s ease'
        }}
        className="sidebar-recent-item"
        title="Open Settings & Preferences"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }}>
            <User style={{ width: 16, height: 16 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#09090b', lineHeight: 1.1 }}>
              Student User
            </span>
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, marginTop: 2 }}>
              Plus • {selectedModel || 'Gemini 2.5 Flash Lite'}
            </span>
          </div>
        </div>

        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f4f4f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#52525b' }}>
          <Settings style={{ width: 15, height: 15 }} />
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    if (!isOpen) return null;
    return (
      <aside
        style={{
          width: 260,
          height: '100vh',
          flexShrink: 0,
          borderRight: '1px solid #e4e4e7',
          background: '#ffffff'
        }}
      >
        {sidebarContent}
      </aside>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
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
