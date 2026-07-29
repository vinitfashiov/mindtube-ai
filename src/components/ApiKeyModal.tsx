import React, { useState } from 'react';
import { Key, X, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveApiKey('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
          width: '100%',
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 20,
          border: '1px solid #e2e8f0',
          padding: '22px 20px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#eff6ff',
              border: '1px solid #dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb'
            }}>
              <Key style={{ width: 18, height: 18 }} />
            </div>

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                Gemini API Key
              </h3>
              <p style={{ fontSize: 11, color: '#64748b' }}>
                Use your Google Gemini API Key for Unlimited Video Notes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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

        {/* Info Note */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <ShieldCheck style={{ width: 18, height: 18, color: '#16a34a', flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: '#475569', lineHeight: 1.4 }}>
            Your API Key is stored safely in your browser’s local storage and sent directly to Google AI Studio APIs.
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 6 }}>
              Enter Gemini API Key (e.g. AIzaSy...)
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Paste your Gemini API key here..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11.5,
              color: '#2563eb',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none'
            }}
          >
            <span>Get Free Gemini API Key from Google AI Studio</span>
            <ExternalLink style={{ width: 12, height: 12 }} />
          </a>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}
              >
                Clear Key
              </button>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: 12.5,
                  fontWeight: 600
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={{
                  padding: '8px 20px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  fontSize: 12.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                }}
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle style={{ width: 14, height: 14 }} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Key</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
