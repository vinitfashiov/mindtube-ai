import React from 'react';
import { PanelLeft, Sparkles, Plus, Cpu, Settings } from 'lucide-react';

interface NavbarProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  onOpenHistory: () => void;
  onOpenChat: () => void;
  onOpenPlaylistModal: () => void;
  historyCount: number;
  onLoadSample: () => void;
  onNewChat: () => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  onToggleSidebar: () => void;
  isDesktop?: boolean;
  isSidebarOpen?: boolean;
  selectedModel?: string;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewChat,
  onToggleSidebar,
  isDesktop = false,
  isSidebarOpen = true,
  selectedModel = 'Gemini 2.5 Flash Lite',
  onOpenSettings
}) => {
  // On desktop, if sidebar is open, hide redundant header. If sidebar is collapsed, show toggle bar!
  if (isDesktop && isSidebarOpen) return null;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
        height: 54,
        zIndex: 50
      }}
    >
      {/* Left: Sidebar Toggle & Premium Brand Mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease',
            flexShrink: 0
          }}
        >
          <PanelLeft style={{ width: 18, height: 18 }} />
        </button>

        <div onClick={onNewChat} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}
          >
            <Sparkles style={{ width: 18, height: 18, color: '#ffffff' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', fontFamily: 'Outfit, sans-serif' }}>
              MindTube AI
            </span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 9999, background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
              v2.5
            </span>
          </div>
        </div>
      </div>

      {/* Center: Active Model Pill Badge (Desktop Only) */}
      {isDesktop && (
        <div
          onClick={onOpenSettings}
          style={{
            padding: '5px 12px',
            borderRadius: 9999,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            fontSize: 12,
            fontWeight: 700,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Click to Switch AI Models"
        >
          <Cpu style={{ width: 14, height: 14, color: '#2563eb' }} />
          <span>{selectedModel}</span>
          <Settings style={{ width: 12, height: 12, color: '#94a3b8' }} />
        </div>
      )}

      {/* Right: Premium Dark + New Chat Pill Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={onNewChat}
          style={{
            padding: '7px 16px',
            borderRadius: 9999,
            background: '#09090b',
            color: '#ffffff',
            fontSize: 12.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: 'none',
            boxShadow: '0 4px 12px rgba(9, 9, 11, 0.2)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease'
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          <span>New chat</span>
        </button>
      </div>
    </header>
  );
};
