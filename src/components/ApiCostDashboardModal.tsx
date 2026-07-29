import React from 'react';
import {
  X,
  Coins,
  Receipt,
  Cpu,
  RefreshCw,
  Info,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileText,
  HelpCircle
} from 'lucide-react';
import { ApiCostSummary, INPUT_TOKEN_COST_PER_MILLION, OUTPUT_TOKEN_COST_PER_MILLION, USD_TO_INR_RATE } from '../types/cost';

interface ApiCostDashboardModalProps {
  summary: ApiCostSummary;
  isOpen: boolean;
  onClose: () => void;
  onResetUsage: () => void;
}

export const ApiCostDashboardModal: React.FC<ApiCostDashboardModalProps> = ({
  summary,
  isOpen,
  onClose,
  onResetUsage
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(15, 23, 42, 0.7)',
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
          maxWidth: 760,
          maxHeight: '90vh',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Modal Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins style={{ width: 20, height: 20 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
                API Cost & Token Usage Dashboard
              </h2>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                Real-Time Gemini 2.5 Flash Lite Cost Meter (USD & INR)
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

        {/* Modal Body */}
        <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top 4 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {/* Total USD Cost */}
            <div style={{ padding: 16, borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#15803d', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign style={{ width: 14, height: 14 }} /> Total Cost (USD)
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#166534' }}>
                ${summary.totalCostUsd.toFixed(5)}
              </div>
              <div style={{ fontSize: 11, color: '#15803d', marginTop: 2 }}>
                Flash Lite ultra-low cost
              </div>
            </div>

            {/* Total INR Cost */}
            <div style={{ padding: 16, borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1d4ed8', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp style={{ width: 14, height: 14 }} /> Total Cost (INR)
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#1e40af' }}>
                ₹{summary.totalCostInr.toFixed(3)}
              </div>
              <div style={{ fontSize: 11, color: '#1d4ed8', marginTop: 2 }}>
                {summary.totalCostInr < 1 ? `approx ${Math.round(summary.totalCostInr * 100)} paise` : 'INR Rupees'}
              </div>
            </div>

            {/* Total Tokens */}
            <div style={{ padding: 16, borderRadius: 14, background: '#fcf5ff', border: '1px solid #f0abfc' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#a21caf', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Cpu style={{ width: 14, height: 14 }} /> Total Tokens
              </div>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#86198f' }}>
                {(summary.totalInputTokens + summary.totalOutputTokens).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: '#a21caf', marginTop: 2 }}>
                In: {summary.totalInputTokens.toLocaleString()} | Out: {summary.totalOutputTokens.toLocaleString()}
              </div>
            </div>

            {/* Total Requests */}
            <div style={{ padding: 16, borderRadius: 14, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#7e22ce', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Receipt style={{ width: 14, height: 14 }} /> API Requests
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#6b21a8' }}>
                {summary.totalCalls}
              </div>
              <div style={{ fontSize: 11, color: '#7e22ce', marginTop: 2 }}>
                Successful Calls
              </div>
            </div>
          </div>

          {/* Official Pricing Formula Banner */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 16, borderRadius: 14 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info style={{ width: 15, height: 15, color: '#2563eb' }} />
              Official Gemini 2.5 Flash Lite API Rate Card
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 12, color: '#475569' }}>
              <div>
                <strong>Input Tokens:</strong> ${INPUT_TOKEN_COST_PER_MILLION} / 1M Tokens ($0.000015 / 1K)
              </div>
              <div>
                <strong>Output Tokens:</strong> ${OUTPUT_TOKEN_COST_PER_MILLION} / 1M Tokens ($0.000060 / 1K)
              </div>
              <div>
                <strong>FX Rate:</strong> 1 USD = ₹{USD_TO_INR_RATE} INR
              </div>
            </div>
          </div>

          {/* Operation Cost Matrix Table */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              Per-Operation Typical Unit Costs (Flash Lite)
            </h3>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '10px 14px' }}>Operation Type</th>
                    <th style={{ padding: '10px 14px' }}>Avg Tokens</th>
                    <th style={{ padding: '10px 14px' }}>Est. USD ($)</th>
                    <th style={{ padding: '10px 14px' }}>Est. INR (₹)</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#334155' }}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FileText style={{ width: 14, height: 14, color: '#16a34a' }} />
                      Full Video PDF Notes & Mindmap Synthesis
                    </td>
                    <td style={{ padding: '10px 14px' }}>2,500 In / 3,800 Out</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>~$0.000265</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#15803d' }}>~₹0.02 (2 paise)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HelpCircle style={{ width: 14, height: 14, color: '#2563eb' }} />
                      20 MCQ Quiz + 10 Flashcards Generation
                    </td>
                    <td style={{ padding: '10px 14px' }}>Included in Video Notes</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>$0.0000</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>₹0.00</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Cpu style={{ width: 14, height: 14, color: '#9333ea' }} />
                      ChatGPT AI Reasoning Q&A Prompt
                    </td>
                    <td style={{ padding: '10px 14px' }}>800 In / 600 Out</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>~$0.000048</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#15803d' }}>~₹0.004 (0.4 paise)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: '#ea580c' }} />
                      Hindi Language Academic Translation
                    </td>
                    <td style={{ padding: '10px 14px' }}>3,000 In / 3,500 Out</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#16a34a' }}>~$0.000255</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#15803d' }}>~₹0.02 (2 paise)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Audit Log */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Session API Call Audit History ({summary.logs.length})
              </h3>
              {summary.logs.length > 0 && (
                <button
                  onClick={onResetUsage}
                  style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1px solid #fca5a5', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  Reset Tracker
                </button>
              )}
            </div>

            {summary.logs.length === 0 ? (
              <div style={{ padding: 24, textTransform: 'uppercase', textAlign: 'center', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                No API calls recorded in this session yet. Generate a Video PDF Note or ask a question!
              </div>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', maxHeight: 220, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '8px 12px' }}>Time</th>
                      <th style={{ padding: '8px 12px' }}>Details / Title</th>
                      <th style={{ padding: '8px 12px' }}>Input Tokens</th>
                      <th style={{ padding: '8px 12px' }}>Output Tokens</th>
                      <th style={{ padding: '8px 12px' }}>Cost (USD)</th>
                      <th style={{ padding: '8px 12px' }}>Cost (INR)</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: '#334155' }}>
                    {summary.logs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', color: '#64748b' }}>{log.timestamp}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600 }}>{log.details}</td>
                        <td style={{ padding: '8px 12px' }}>{log.inputTokens.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px' }}>{log.outputTokens.toLocaleString()}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>${log.costUsd.toFixed(5)}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#15803d' }}>₹{log.costInr.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11.5, color: '#64748b' }}>
            Calculated based on Google Gemini 2.5 Flash official token pricing.
          </div>
          <button
            onClick={onClose}
            style={{ padding: '8px 20px', borderRadius: 9999, background: '#09090b', color: '#ffffff', fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
