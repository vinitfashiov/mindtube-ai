import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  X,
  ArrowLeft,
  Download,
  Copy,
  Check,
  GitFork,
  BookOpen
} from 'lucide-react';
import { VideoNoteAnalysis, RevisemapTreeNode } from '../types/notes';

interface TreeNotesPdfViewProps {
  analysis: VideoNoteAnalysis;
  onClose: () => void;
  onSwitchStyle?: (style: 'handbook' | 'tree') => void;
}

// Render individual tree node matching exact Revisemap badge hierarchy
const RenderTreeNode: React.FC<{ node: RevisemapTreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  if (!node || !node.title) return null;

  const badgeType = node.badgeType || (depth === 0 ? 'topic' : depth === 1 ? 'section_purple' : depth === 2 ? 'badge_green' : depth === 3 ? 'badge_brown' : depth === 4 ? 'subtopic_blue' : 'item');

  // Level 0: Main Subject Box (Dark Olive / Gold Border)
  if (badgeType === 'topic' || depth === 0) {
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{
          background: '#423828',
          color: '#ffffff',
          border: '2px solid #a3e635',
          padding: '4px 10px',
          fontSize: 13,
          fontWeight: 800,
          borderRadius: 3,
          display: 'inline-block',
          marginBottom: 4,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {node.title} {node.details ? `(${node.details})` : ''}
        </div>
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0284c7', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {node.children.map((child, cIdx) => (
              <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 1: Purple Section Box (e.g. नर जनन तंत्र, मादा जनन तंत्र)
  if (badgeType === 'section_purple') {
    return (
      <div style={{ marginTop: 6, marginBottom: 4 }}>
        <div style={{
          background: '#4c1d95',
          color: '#ffffff',
          border: '1.5px solid #38bdf8',
          padding: '3px 8px',
          fontSize: 12,
          fontWeight: 800,
          borderRadius: 3,
          display: 'inline-block',
          marginBottom: 3
        }}>
          {node.title}
        </div>
        {node.details && (
          <div style={{ fontSize: 11, color: '#0369a1', paddingLeft: 6, marginBottom: 2 }}>
            |_ {node.details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0284c7', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {node.children.map((child, cIdx) => (
              <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 2: Green Category Badge (e.g. विशेषताएं, विधियाँ, मासिक चक्र)
  if (badgeType === 'badge_green') {
    return (
      <div style={{ marginTop: 4, marginBottom: 3 }}>
        <div style={{
          background: '#15803d',
          color: '#ffffff',
          border: '1.5px solid #4ade80',
          padding: '2px 7px',
          fontSize: 11.5,
          fontWeight: 800,
          borderRadius: 3,
          display: 'inline-block',
          marginBottom: 2
        }}>
          {node.title}
        </div>
        {node.details && (
          <div style={{ fontSize: 11, color: '#166534', paddingLeft: 6 }}>
            |_ {node.details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0284c7', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 3: Dark Brown/Yellow Pill Badge (e.g. किन में होता है, कार्य, स्थिति)
  if (badgeType === 'badge_brown') {
    return (
      <div style={{ marginTop: 3, marginBottom: 2 }}>
        <div style={{
          background: '#713f12',
          color: '#fef08a',
          border: '1px solid #fde047',
          padding: '2px 6px',
          fontSize: 11,
          fontWeight: 700,
          borderRadius: 3,
          display: 'inline-block',
          marginBottom: 2
        }}>
          {node.title}
        </div>
        {node.details && (
          <div style={{ fontSize: 11, color: '#854d0e', paddingLeft: 6 }}>
            |_ {node.details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0284c7', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 4: Blue Subtopic Title (e.g. द्विखंडन, बहुविखंडन, मुकुलन)
  if (badgeType === 'subtopic_blue') {
    return (
      <div style={{ marginTop: 3, marginBottom: 2 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1d4ed8' }}>
          {node.title}
        </div>
        {node.details && (
          <div style={{ fontSize: 11, color: '#1e293b', paddingLeft: 4 }}>
            |_ {node.details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0284c7', marginLeft: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 5: Standard Branch Leaf Item (|__ Item text)
  return (
    <div style={{ fontSize: 11, color: '#1e293b', lineHeight: 1.45, marginTop: 2 }}>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <span style={{ color: '#0284c7', fontWeight: 'bold', fontFamily: 'monospace', flexShrink: 0 }}>|_</span>
        <div>
          <span>{node.title}</span>
          {node.details && <span style={{ color: '#475569', marginLeft: 4 }}>— {node.details}</span>}
        </div>
      </div>
      {node.children && node.children.length > 0 && (
        <div style={{ paddingLeft: 8, borderLeft: '1px solid #cbd5e1', marginLeft: 4, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {node.children.map((child, cIdx) => (
            <RenderTreeNode key={cIdx} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeNotesPdfView: React.FC<TreeNotesPdfViewProps> = ({
  analysis,
  onClose,
  onSwitchStyle
}) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const handleCopyText = () => {
    let text = `${analysis.videoTitle}\n${analysis.videoUrl}\n\n`;
    if (analysis.revisemapTree && analysis.revisemapTree.length > 0) {
      const dumpNode = (n: RevisemapTreeNode, indent = 0) => {
        text += `${'  '.repeat(indent)}|_ ${n.title} ${n.details ? `(${n.details})` : ''}\n`;
        if (n.children) n.children.forEach((c) => dumpNode(c, indent + 1));
      };
      analysis.revisemapTree.forEach((t) => dumpNode(t));
    }
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!pdfContentRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = pdfContentRef.current;
      const filename = `MindTube_Tree_${analysis.videoTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 40)}.pdf`;

      const opt = {
        margin: [4, 4, 4, 4] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all' as const, 'css' as const, 'legacy' as const] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('PDF download failed:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Build Exhaustive Tree if revisemapTree is not present
  const treeNodes: RevisemapTreeNode[] = React.useMemo(() => {
    if (analysis.revisemapTree && analysis.revisemapTree.length > 0) {
      return analysis.revisemapTree;
    }

    // Synthesize exhaustive tree from outline, keyTakeaways, vocabularyTerms, and teacherEmphasis
    const synthesized: RevisemapTreeNode[] = [];

    // Main Topic Root
    const rootTopicNode: RevisemapTreeNode = {
      title: analysis.videoTitle,
      badgeType: 'topic',
      details: analysis.channelName,
      children: []
    };

    // 1. Chapters & Outlines
    if (analysis.outline && analysis.outline.length > 0) {
      analysis.outline.forEach((chap, idx) => {
        const chapNode: RevisemapTreeNode = {
          title: `Chapter ${idx + 1}: ${chap.title}`,
          badgeType: 'section_purple',
          details: chap.timestamp,
          children: [
            {
              title: 'Overview',
              badgeType: 'badge_green',
              children: [{ title: chap.summary }]
            }
          ]
        };

        if (chap.keyPoints && chap.keyPoints.length > 0) {
          chapNode.children?.push({
            title: 'Key Concepts',
            badgeType: 'badge_brown',
            children: chap.keyPoints.map((kp) => ({ title: kp }))
          });
        }

        rootTopicNode.children?.push(chapNode);
      });
    }

    synthesized.push(rootTopicNode);

    // 2. Key Exam Principles
    if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
      synthesized.push({
        title: 'Key Exam Principles',
        badgeType: 'section_purple',
        children: analysis.keyTakeaways.map((kt) => ({
          title: kt.title,
          badgeType: 'subtopic_blue',
          details: kt.description
        }))
      });
    }

    // 3. Glossary Terms
    if (analysis.vocabularyTerms && analysis.vocabularyTerms.length > 0) {
      synthesized.push({
        title: 'Key Terms Glossary',
        badgeType: 'section_purple',
        children: analysis.vocabularyTerms.map((vt) => ({
          title: vt.term,
          badgeType: 'badge_green',
          details: vt.definition
        }))
      });
    }

    // 4. Teacher Cues
    if (analysis.teacherEmphasis && analysis.teacherEmphasis.length > 0) {
      synthesized.push({
        title: 'Teacher Emphasis & Exam Cues',
        badgeType: 'section_purple',
        children: analysis.teacherEmphasis.map((te) => ({
          title: `${te.tag}: ${te.text}`,
          details: te.timestamp
        }))
      });
    }

    return synthesized;
  }, [analysis]);

  // Distribute tree nodes evenly across 4 parallel vertical columns (Revisemap 4-column flow)
  const col1: RevisemapTreeNode[] = [];
  const col2: RevisemapTreeNode[] = [];
  const col3: RevisemapTreeNode[] = [];
  const col4: RevisemapTreeNode[] = [];

  treeNodes.forEach((node, idx) => {
    if (idx % 4 === 0) col1.push(node);
    else if (idx % 4 === 1) col2.push(node);
    else if (idx % 4 === 2) col3.push(node);
    else col4.push(node);
  });

  return (
    <div className={`pdf-modal-overlay ${themeMode === 'light' ? 'light-pdf-mode' : 'dark-pdf-mode'}`}>
      {/* Top Controls Toolbar */}
      <div className="pdf-actions-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: window.innerWidth < 640 ? '100%' : 'auto', justifyContent: 'space-between' }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: 12,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Back to Chat</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <GitFork style={{ width: 15, height: 15 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: themeMode === 'light' ? '#0f172a' : '#f8fafc' }}>
              Revisemap 4-Column Tree PDF
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: window.innerWidth < 640 ? 'space-between' : 'flex-end', width: window.innerWidth < 640 ? '100%' : 'auto' }}>
          {/* Switch Style Toggle */}
          {onSwitchStyle && (
            <button
              onClick={() => onSwitchStyle('handbook')}
              style={{
                padding: '6px 12px',
                borderRadius: 9999,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: 11.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              <BookOpen style={{ width: 13, height: 13 }} />
              <span>Switch to Academic Handbook</span>
            </button>
          )}

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: isCopied ? '#f0fdf4' : '#f8fafc',
              border: isCopied ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
              color: isCopied ? '#15803d' : '#0f172a',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}
          >
            {isCopied ? <Check style={{ width: 13, height: 13, color: '#16a34a' }} /> : <Copy style={{ width: 13, height: 13 }} />}
            <span>{isCopied ? 'Copied!' : 'Copy Tree'}</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{
              padding: '6px 12px',
              borderRadius: 9999,
              background: themeMode === 'light' ? '#f8fafc' : '#1e293b',
              border: '1px solid #cbd5e1',
              color: themeMode === 'light' ? '#0f172a' : '#f8fafc',
              fontSize: 11.5,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {themeMode === 'light' ? <Moon style={{ width: 13, height: 13, color: '#7c3aed' }} /> : <Sun style={{ width: 13, height: 13, color: '#f59e0b' }} />}
            <span>{themeMode === 'light' ? 'Night' : 'Light'}</span>
          </button>

          {/* Direct Download Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: isDownloading ? '#94a3b8' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: isDownloading ? 0.7 : 1
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Tree PDF'}</span>
          </button>

          <button onClick={onClose} style={{ padding: 6, color: '#64748b' }}>
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>

      {/* ==================== REVISEMAP-STYLE DENSE 4-COLUMN TREE PDF DOCUMENT ==================== */}
      <div
        ref={pdfContentRef}
        style={{
          width: '100%',
          maxWidth: 1050,
          margin: '0 auto 40px auto',
          background: themeMode === 'light' ? '#ffffff' : '#090d16',
          color: themeMode === 'light' ? '#0f172a' : '#f8fafc',
          border: '2.5px solid #0d9488',
          borderRadius: 6,
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative'
        }}
      >
        {/* REVISEMAP RED TOP HEADER BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)',
          color: '#ffffff',
          textAlign: 'center',
          padding: '14px 20px',
          borderBottom: '3px solid #f59e0b'
        }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, margin: 0, fontFamily: 'Georgia, serif' }}>
            YouTube Video To PDF
          </h1>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fef08a', marginTop: 3 }}>
            revisemap.com • mindtube.ai
          </div>
        </div>

        {/* DENSE 4-COLUMN TREE CONTAINER (EXACT REVISEMAP MATCH) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)',
          gap: 12,
          padding: '16px 12px',
          alignItems: 'start'
        }}>
          {/* COLUMN 1 */}
          <div style={{ borderRight: window.innerWidth >= 768 ? '1px solid #cbd5e1' : 'none', paddingRight: 8 }}>
            {col1.map((node, nIdx) => (
              <RenderTreeNode key={nIdx} node={node} depth={0} />
            ))}
          </div>

          {/* COLUMN 2 */}
          <div style={{ borderRight: window.innerWidth >= 768 ? '1px solid #cbd5e1' : 'none', paddingRight: 8 }}>
            {col2.map((node, nIdx) => (
              <RenderTreeNode key={nIdx} node={node} depth={0} />
            ))}
          </div>

          {/* COLUMN 3 */}
          <div style={{ borderRight: window.innerWidth >= 768 ? '1px solid #cbd5e1' : 'none', paddingRight: 8 }}>
            {col3.map((node, nIdx) => (
              <RenderTreeNode key={nIdx} node={node} depth={0} />
            ))}
          </div>

          {/* COLUMN 4 */}
          <div>
            {col4.map((node, nIdx) => (
              <RenderTreeNode key={nIdx} node={node} depth={0} />
            ))}
          </div>
        </div>

        {/* BOTTOM FOOTER BAR */}
        <div style={{
          background: '#0d9488',
          color: '#ffffff',
          textAlign: 'center',
          padding: '8px 16px',
          fontSize: 11,
          fontWeight: 700,
          borderTop: '2px solid #0f766e'
        }}>
          revisemap.com • This is a class notes pdf. It may contains class info. [Not for sale]
        </div>
      </div>
    </div>
  );
};
