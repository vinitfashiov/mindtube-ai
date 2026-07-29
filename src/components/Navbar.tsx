import React from 'react';
import { PanelLeft, Sparkles, Plus } from 'lucide-react';

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
}

export const Navbar: React.FC<NavbarProps> = ({
  apiKey: _apiKey,
  onOpenApiKeyModal: _onOpenApiKeyModal,
  onOpenHistory: _onOpenHistory,
  onOpenChat: _onOpenChat,
  onOpenPlaylistModal: _onOpenPlaylistModal,
  historyCount: _historyCount,
  onLoadSample: _onLoadSample,
  onNewChat,
  currentLanguage: _currentLanguage,
  onSelectLanguage: _onSelectLanguage,
  onToggleSidebar,
  isDesktop = false,
  isSidebarOpen = true
}) => {
  // On desktop, if sidebar is open, hide redundant header. If sidebar is collapsed, show toggle bar!
  if (isDesktop && isSidebarOpen) return null;

  return (
    <header className="agent-header" style={isDesktop ? { maxWidth: '100%', borderBottom: 'none', background: 'transparent', padding: '12px 20px' } : undefined}>
      {/* Left Title & Sidebar Toggle Icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e4e4e7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#09090b',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}
        >
          <PanelLeft style={{ width: 18, height: 18 }} />
        </button>

        <div onClick={onNewChat} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: '#fff' }} />
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif', lineHeight: 1.1 }}>
              MindTube AI
            </div>
          </div>
        </div>
      </div>

      {/* Right Actions & New Chat Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={onNewChat}
          style={{
            padding: '6px 14px',
            borderRadius: 9999,
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            color: '#2563eb',
            fontSize: 12,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)',
            cursor: 'pointer'
          }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
};
