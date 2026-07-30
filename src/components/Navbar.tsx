import React, { useState, useRef, useEffect } from 'react';
import { PanelLeft, Sparkles, ChevronDown, Check, HelpCircle, Calendar, ExternalLink, FileText } from 'lucide-react';
import { ApiCostSummary } from '../types/cost';

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
  onSelectModel?: (model: string) => void;
  onOpenSettings?: () => void;
  apiCostSummary?: ApiCostSummary;
  onOpenCostDashboard?: () => void;
  onOpenYtToText?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isDesktop = false,
  isSidebarOpen = true,
  selectedModel = 'Gemini 2.5 Flash Lite',
  onSelectModel,
  onOpenSettings,
  apiCostSummary,
  onOpenCostDashboard,
  onOpenYtToText
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isCreditsPopupOpen, setIsCreditsPopupOpen] = useState(false);

  const modelRef = useRef<HTMLDivElement>(null);
  const creditsRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (creditsRef.current && !creditsRef.current.contains(event.target as Node)) {
        setIsCreditsPopupOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const modelsList = [
    {
      id: 'Gemini 2.5 Flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Pro',
      badgeColor: '#3b82f6',
      badgeBg: '#eff6ff',
      desc: 'High-performance agent designed for complex tasks.'
    },
    {
      id: 'Gemini 2.5 Flash Lite',
      name: 'Gemini 2.5 Flash Lite',
      badge: 'Lite',
      badgeColor: '#64748b',
      badgeBg: '#f1f5f9',
      desc: 'A lightweight agent for everyday tasks.'
    },
    {
      id: 'Gemini 3.5 Flash',
      name: 'Gemini 3.5 Flash',
      badge: 'Pro',
      badgeColor: '#8b5cf6',
      badgeBg: '#f3e8ff',
      desc: 'Next-gen multimodal reasoning agent.'
    }
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isDesktop ? '12px 24px' : '10px 16px',
        background: '#fafafa',
        borderBottom: 'none',
        height: 52,
        zIndex: 50,
        position: 'relative'
      }}
    >
      {/* Left Area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Toggle Sidebar Button (shown when sidebar is collapsed or on mobile) */}
        {(!isSidebarOpen || !isDesktop) && (
          <button
            onClick={onToggleSidebar}
            title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#ffffff',
              border: '1px solid #e4e4e7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3f3f46',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              flexShrink: 0
            }}
          >
            <PanelLeft style={{ width: 17, height: 17 }} />
          </button>
        )}

        {/* Manus Style Model Selector Dropdown Pill */}
        <div ref={modelRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: isModelDropdownOpen ? '#f4f4f5' : 'transparent',
              border: 'none',
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#09090b',
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
          >
            <span>{selectedModel}</span>
            <ChevronDown style={{ width: 15, height: 15, color: '#71717a' }} />
          </button>

          {/* Manus Floating Model Selector Card */}
          {isModelDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: 320,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)',
                padding: '8px',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              {modelsList.map((m) => {
                const isSelected = selectedModel === m.name;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      onSelectModel?.(m.name);
                      setIsModelDropdownOpen(false);
                    }}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: isSelected ? '#fafafa' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 10,
                      transition: 'background 0.12s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f4f4f5';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: '#09090b' }}>
                          {m.name}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 6, background: m.badgeBg, color: m.badgeColor }}>
                          {m.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: 11.5, color: '#71717a', lineHeight: 1.35 }}>
                        {m.desc}
                      </div>
                    </div>
                    {isSelected && (
                      <Check style={{ width: 16, height: 16, color: '#09090b', marginTop: 2, flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* YT to Text Dedicated Page Pill */}
        {onOpenYtToText && (
          <button
            onClick={onOpenYtToText}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              color: '#2563eb',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText style={{ width: 14, height: 14, color: '#2563eb' }} />
            <span>📜 YT to Text</span>
          </button>
        )}
      </div>

      {/* Center: Manus Free plan | Upgrade Pill */}
      {isDesktop && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 9999, background: '#f4f4f5', border: '1px solid #e4e4e7', fontSize: 12, fontWeight: 500, color: '#71717a' }}>
          <span>Free plan</span>
          <span style={{ color: '#d4d4d8' }}>|</span>
          <button onClick={onOpenSettings} style={{ border: 'none', background: 'transparent', color: '#2563eb', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            Upgrade
          </button>
        </div>
      )}

      {/* Right: Manus Sparkles Credits Badge & Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div ref={creditsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsCreditsPopupOpen(!isCreditsPopupOpen)}
            style={{
              padding: '6px 12px',
              borderRadius: 8,
              background: '#f4f4f5',
              border: '1px solid #e4e4e7',
              fontSize: 13,
              fontWeight: 600,
              color: '#09090b',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer'
            }}
          >
            <Sparkles style={{ width: 15, height: 15, color: '#09090b' }} />
            <span>{apiCostSummary ? `$${apiCostSummary.totalCostUsd.toFixed(4)}` : '✧ 672'}</span>
          </button>

          {/* Manus Floating Credits Breakdown Popup Card */}
          {isCreditsPopupOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 300,
                background: '#ffffff',
                border: '1px solid #e4e4e7',
                borderRadius: 16,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.03)',
                padding: '16px',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#09090b', fontFamily: 'Georgia, serif' }}>
                  Free
                </span>
                <button
                  onClick={onOpenSettings}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 8,
                    background: '#09090b',
                    color: '#ffffff',
                    fontSize: 12,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Upgrade
                </button>
              </div>

              <div style={{ borderTop: '1px dashed #e4e4e7', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                    <Sparkles style={{ width: 15, height: 15 }} />
                    <span>Credits</span>
                    <HelpCircle style={{ width: 13, height: 13, color: '#a1a1aa' }} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>
                      {apiCostSummary ? `$${apiCostSummary.totalCostUsd.toFixed(4)}` : '372'}
                    </div>
                    <div style={{ fontSize: 11, color: '#a1a1aa' }}>
                      {apiCostSummary ? `₹${apiCostSummary.totalCostInr.toFixed(2)}` : 'Free credits'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#09090b' }}>
                    <Calendar style={{ width: 15, height: 15 }} />
                    <span>Daily refresh credits</span>
                    <HelpCircle style={{ width: 13, height: 13, color: '#a1a1aa' }} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#09090b' }}>300</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#a1a1aa', lineHeight: 1.3 }}>
                  Refresh to 300 at 00:30 every day
                </div>

                <button
                  onClick={() => {
                    setIsCreditsPopupOpen(false);
                    onOpenCostDashboard?.();
                  }}
                  style={{
                    paddingTop: 8,
                    background: 'transparent',
                    border: 'none',
                    borderTop: '1px solid #f4f4f5',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#09090b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                    marginTop: 4
                  }}
                >
                  <span>View detailed API usage</span>
                  <ExternalLink style={{ width: 12, height: 12 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
