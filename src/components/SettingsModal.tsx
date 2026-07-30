import React, { useState } from 'react';
import {
  X,
  Settings,
  Key,
  Cpu,
  Globe,
  Sliders,
  Sparkles,
  Trash2,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  defaultQuizQty: number;
  onSelectQuizQty: (qty: number) => void;
  onClearAllData: () => void;
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', badge: 'Ultra Fast & 80% Cheaper', desc: 'Lightweight, lightning fast, ultra low-cost model for daily study' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Recommended', desc: 'High-density academic reasoning & master note synthesis' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: 'Next-Gen', desc: 'Advanced multi-modal reasoning & deep technical proofing' },
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', badge: 'Experimental', desc: 'Ultra next-gen intelligence & complex math solver' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', badge: 'Stable', desc: 'Standard production flash model' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', badge: 'Legacy', desc: 'Previous generation fast model' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', badge: 'Deep Reasoning', desc: 'Pro model for massive context windows' }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
  currentLanguage,
  onSelectLanguage,
  defaultQuizQty,
  onSelectQuizQty,
  onClearAllData
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'api_key' | 'preferences' | 'data'>('models');
  const [keyInput, setKeyInput] = useState(apiKey);
  const [rapidKeyInput, setRapidKeyInput] = useState(typeof localStorage !== 'undefined' ? localStorage.getItem('mindtube_rapidapi_key') || '' : '');
  const [showKey, setShowKey] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#09090b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                Settings & Preferences
              </h2>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                Configure AI Models, API Keys & Study Defaults
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ padding: 6, borderRadius: '50%', background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Layout: Left Navigation Tabs + Right Content Panel */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 400 }}>
          {/* Left Navigation Bar */}
          <div style={{ width: 200, background: '#f8fafc', borderRight: '1px solid #f1f5f9', padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={() => setActiveTab('models')}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === 'models' ? '#ffffff' : 'transparent',
                color: activeTab === 'models' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'models' ? 700 : 500,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: activeTab === 'models' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Cpu style={{ width: 16, height: 16 }} />
              <span>AI Models</span>
            </button>

            <button
              onClick={() => setActiveTab('api_key')}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === 'api_key' ? '#ffffff' : 'transparent',
                color: activeTab === 'api_key' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'api_key' ? 700 : 500,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: activeTab === 'api_key' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Key style={{ width: 16, height: 16 }} />
              <span>Gemini API Key</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === 'preferences' ? '#ffffff' : 'transparent',
                color: activeTab === 'preferences' ? '#2563eb' : '#64748b',
                fontWeight: activeTab === 'preferences' ? 700 : 500,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: activeTab === 'preferences' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <Sliders style={{ width: 16, height: 16 }} />
              <span>Study Defaults</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === 'data' ? '#ffffff' : 'transparent',
                color: activeTab === 'data' ? '#dc2626' : '#64748b',
                fontWeight: activeTab === 'data' ? 700 : 500,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: activeTab === 'data' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: 'auto'
              }}
            >
              <Trash2 style={{ width: 16, height: 16 }} />
              <span>Data & Reset</span>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="no-scrollbar" style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {/* TAB 1: AI MODELS SELECTOR */}
            {activeTab === 'models' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Select Active Gemini AI Model
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                    Choose the primary Gemini model powering Video Notes, Mindmaps, Quizzes & Copilot Q&A.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectModel(m.id)}
                        style={{
                          padding: 14,
                          borderRadius: 12,
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: isSelected ? '6px solid #2563eb' : '2px solid #cbd5e1',
                            background: '#ffffff',
                            flexShrink: 0
                          }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>{m.name}</span>
                              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999, background: isSelected ? '#dbeafe' : '#f1f5f9', color: isSelected ? '#1e40af' : '#475569' }}>
                                {m.badge}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                              {m.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: GEMINI API KEY */}
            {activeTab === 'api_key' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Google Gemini API Key
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    Enter your personal Gemini API Key for unlimited video processing and real-time AI study Q&A. Keys are saved securely in your browser's LocalStorage.
                  </p>
                </div>

                <form onSubmit={handleSaveKey} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={keyInput}
                      onChange={(e) => setKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 14px',
                        borderRadius: 12,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 14,
                        fontFamily: 'Consolas, monospace',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{ position: 'absolute', right: 12, top: 12, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                    >
                      {showKey ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: apiKey ? '#16a34a' : '#64748b', fontWeight: 600 }}>
                      <ShieldCheck style={{ width: 16, height: 16 }} />
                      <span>{apiKey ? 'Gemini API Key Active ✓' : 'Currently in DEMO mode'}</span>
                    </div>

                    <button
                      type="submit"
                      style={{
                        padding: '9px 20px',
                        borderRadius: 10,
                        background: '#2563eb',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Save Gemini Key
                    </button>
                  </div>

                  {savedNotice && (
                    <div style={{ padding: '8px 12px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 style={{ width: 15, height: 15 }} />
                      <span>Gemini API Key updated successfully!</span>
                    </div>
                  )}
                </form>

                {/* ===== RAPIDAPI YOUTUBE TRANSCRIPT KEY SECTION ===== */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles style={{ width: 16, height: 16, color: '#7c3aed' }} />
                      RapidAPI YouTube Transcript Key (Automatic 100% Spoken Subtitles)
                    </h4>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      Connect your free RapidAPI key to automatically fetch 100% spoken transcripts for any YouTube video with zero CORS errors!
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="password"
                      value={rapidKeyInput}
                      onChange={(e) => setRapidKeyInput(e.target.value)}
                      placeholder="Paste RapidAPI Key (e.g. 8923ab1234msh...)"
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: '1.5px solid #cbd5e1',
                        fontSize: 13,
                        fontFamily: 'Consolas, monospace',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem('mindtube_rapidapi_key', rapidKeyInput.trim());
                        alert('RapidAPI YouTube Transcript Key Saved!');
                      }}
                      style={{
                        padding: '10px 18px',
                        borderRadius: 10,
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        color: '#ffffff',
                        fontSize: 12.5,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Save RapidAPI Key
                    </button>
                  </div>

                  {/* STEP BY STEP INSTRUCTIONS BOX */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 14, borderRadius: 12, fontSize: 12, color: '#334155', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                      🔑 4 Easy Steps to Get Your Free RapidAPI Key:
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <li>Go to <strong><a href="https://rapidapi.com/auth/sign-up" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>rapidapi.com</a></strong> and create a free account.</li>
                      <li>Search for <strong>"YouTube Transcriptor"</strong> or open <strong><a href="https://rapidapi.com/kstandard/api/youtube-transcriptor" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 700 }}>youtube-transcriptor API</a></strong>.</li>
                      <li>Click the blue <strong>"Subscribe to Test"</strong> button (Select the Free $0 plan - 500 requests/month free).</li>
                      <li>Copy your <strong>`X-RapidAPI-Key`</strong> from the header code snippet on the right side and paste it above!</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STUDY DEFAULTS */}
            {activeTab === 'preferences' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Study & Language Preferences
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                    Customize default question quantities and primary reasoning language.
                  </p>
                </div>

                {/* Preferred Language */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Globe style={{ width: 16, height: 16, color: '#2563eb' }} />
                    Default Reasoning Language
                  </label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => onSelectLanguage(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="en">English (US/UK)</option>
                    <option value="hi">Hindi (हिन्दी)</option>
                  </select>
                </div>

                {/* Default MCQ Quantity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles style={{ width: 16, height: 16, color: '#2563eb' }} />
                    Default MCQ Quiz Question Quantity
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[5, 10, 15, 20].map((qty) => (
                      <button
                        key={qty}
                        onClick={() => onSelectQuizQty(qty)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: defaultQuizQty === qty ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: defaultQuizQty === qty ? '#eff6ff' : '#ffffff',
                          color: defaultQuizQty === qty ? '#1e40af' : '#475569',
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: 'pointer'
                        }}
                      >
                        {qty} Questions
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DATA & RESET */}
            {activeTab === 'data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                    Data & Storage Management
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>
                    Manage saved chat sessions and local data stored in your browser.
                  </p>
                </div>

                <div style={{ border: '1px solid #fee2e2', borderRadius: 12, padding: 16, background: '#fef2f2', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>
                    Clear Local Chat History
                  </div>
                  <p style={{ fontSize: 12, color: '#b91c1c', margin: 0, lineHeight: 1.45 }}>
                    This will clear all saved chat sessions, cached video notes, and reset API usage trackers. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure you want to clear all saved chat history and data?")) {
                        onClearAllData();
                        onClose();
                      }
                    }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: 12.5,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Trash2 style={{ width: 14, height: 14 }} />
                    Clear All Local Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 22px', borderRadius: 9999, background: '#09090b', color: '#ffffff', fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
