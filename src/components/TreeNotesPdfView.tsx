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

// Precise Recursive Renderer with Nested Vertical Guidelines matching Target Screenshots
const RenderRevisemapBranch: React.FC<{ node: RevisemapTreeNode; depth?: number }> = ({ node, depth = 0 }) => {
  if (!node || !node.title) return null;

  const title = node.title.trim();
  const details = node.details ? node.details.trim() : '';

  // Classify badge types matching exact Revisemap color system
  const isTopTopic = depth === 0 || title.includes('(Reproduction)') || node.badgeType === 'topic';
  const isPurpleBadge = title.includes('परिभाषा') || title.includes('महत्व') || title.includes('प्रकार') || title.includes('नर जनन तंत्र') || title.includes('मादा जनन तंत्र') || title.includes('प्रजनन तंत्र') || title.includes('अपरा') || title.includes('हॉर्मोनल गोलियां') || node.badgeType === 'section_purple';
  const isGreenBadge = title.includes('विशेषताएं') || title.includes('विधियाँ') || title.includes('मासिक चक्र') || title.includes('अस्थाई विधि') || title.includes('प्रक्रियों') || node.badgeType === 'badge_green';
  const isBrownBadge = title.includes('किन में होता है') || title.includes('कार्य') || title.includes('स्थिति') || title.includes('स्रोत') || title.includes('प्रजनन की प्रक्रिया') || node.badgeType === 'badge_brown';
  const isGreenTitle = title.includes('(Regeneration)') || title.includes('(Budding)') || title.includes('(Spore Formation)') || title.includes('(Vegetative') || title.includes('(Fragmentation)');
  const isPurpleTitle = title.includes('हॉर्मोन और उनका कार्य') || title.includes('मानव पुरुष जनन तंत्र') || title.includes('मादा प्रजनन तंत्र') || title.includes('सगर्भता') || title.includes('गर्भनिरोधक विधियाँ') || title.includes('स्थाई विधि');

  // 1. Top Level Root Box (Dark Olive + Gold Border)
  if (isTopTopic) {
    return (
      <div style={{ marginBottom: 8 }}>
        <div style={{
          background: '#3e3527',
          color: '#ffffff',
          border: '2px solid #ca8a04',
          padding: '3px 8px',
          fontSize: 12,
          fontWeight: 800,
          borderRadius: 3,
          display: 'inline-block',
          marginBottom: 3
        }}>
          {title} {details ? `(${details})` : ''}
        </div>
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Purple Badge (Deep Purple + Gold Border)
  if (isPurpleBadge) {
    return (
      <div style={{ marginTop: 4, marginBottom: 3 }}>
        <div style={{
          background: '#581c87',
          color: '#ffffff',
          border: '1.5px solid #facc15',
          padding: '2px 7px',
          fontSize: 11,
          fontWeight: 800,
          borderRadius: 2,
          display: 'inline-block',
          marginBottom: 2
        }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1d4ed8', paddingLeft: 4, marginBottom: 2 }}>
            |_ {details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Green Badge (Forest Green + Light Green Border)
  if (isGreenBadge) {
    return (
      <div style={{ marginTop: 4, marginBottom: 3 }}>
        <div style={{
          background: '#15803d',
          color: '#ffffff',
          border: '1.5px solid #86efac',
          padding: '2px 6px',
          fontSize: 11,
          fontWeight: 800,
          borderRadius: 2,
          display: 'inline-block',
          marginBottom: 2
        }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1e293b', paddingLeft: 4 }}>
            |_ {details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. Dark Brown Pill (Dark Brown + Gold Border)
  if (isBrownBadge) {
    return (
      <div style={{ marginTop: 3, marginBottom: 2 }}>
        <div style={{
          background: '#451a03',
          color: '#fef08a',
          border: '1.5px solid #fde047',
          padding: '1px 5px',
          fontSize: 10.5,
          fontWeight: 700,
          borderRadius: 2,
          display: 'inline-block',
          marginBottom: 2
        }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1e293b', paddingLeft: 4 }}>
            |_ {details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 5. Green Subtopic Title
  if (isGreenTitle) {
    return (
      <div style={{ marginTop: 4, marginBottom: 2 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#15803d' }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1e293b', paddingLeft: 4 }}>
            |_ {details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. Purple Subtopic Title
  if (isPurpleTitle) {
    return (
      <div style={{ marginTop: 4, marginBottom: 2 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#7e22ce' }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1e293b', paddingLeft: 4 }}>
            |_ {details}
          </div>
        )}
        {node.children && node.children.length > 0 && (
          <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {node.children.map((child, cIdx) => (
              <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 7. Blue Subtopic Title (with children)
  if (node.children && node.children.length > 0) {
    return (
      <div style={{ marginTop: 3, marginBottom: 2 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: '#1d4ed8' }}>
          {title}
        </div>
        {details && (
          <div style={{ fontSize: 10.5, color: '#1e293b', paddingLeft: 4 }}>
            |_ {details}
          </div>
        )}
        <div style={{ paddingLeft: 6, borderLeft: '1.5px solid #0d9488', marginLeft: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {node.children.map((child, cIdx) => (
            <RenderRevisemapBranch key={cIdx} node={child} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  // 8. Standard Tree Leaf Node (|_ text)
  return (
    <div style={{ fontSize: 10.5, color: '#1e293b', lineHeight: 1.45, marginTop: 1, paddingLeft: 2 }}>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
        <span style={{ color: '#0d9488', fontWeight: 'bold', fontFamily: 'monospace', flexShrink: 0 }}>|_</span>
        <div>
          <span>{title}</span>
          {details && <span style={{ color: '#475569', marginLeft: 3 }}>— {details}</span>}
        </div>
      </div>
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

  // Synthesize tree nodes from all available content (outline, detailedNotes, terms, takeaways)
  const treeNodes: RevisemapTreeNode[] = React.useMemo(() => {
    if (analysis.revisemapTree && analysis.revisemapTree.length >= 5) {
      return analysis.revisemapTree;
    }

    const synthesized: RevisemapTreeNode[] = [];

    // Main Topic Root Box
    const rootBox: RevisemapTreeNode = {
      title: analysis.videoTitle,
      badgeType: 'topic',
      details: analysis.channelName,
      children: []
    };

    // 1. All Chapters & Granular Points from Outline
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
            title: 'Key Concepts & Methods',
            badgeType: 'badge_brown',
            children: chap.keyPoints.map((kp) => ({ title: kp }))
          });
        }

        rootBox.children?.push(chapNode);
      });
    }

    synthesized.push(rootBox);

    // 2. Parse Detailed Lecture Notes Markdown into Granular Tree Nodes
    if (analysis.detailedNotes) {
      const markdownLines = analysis.detailedNotes.split('\n');
      let currentSection: RevisemapTreeNode | null = null;
      let currentSubtopic: RevisemapTreeNode | null = null;

      markdownLines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('## ')) {
          currentSection = {
            title: trimmed.replace(/^##\s*/, '').replace(/\[.*?\]/g, '').trim(),
            badgeType: 'section_purple',
            children: []
          };
          synthesized.push(currentSection);
          currentSubtopic = null;
        } else if (trimmed.startsWith('### ')) {
          const subTitle = trimmed.replace(/^###\s*/, '').replace(/\[.*?\]/g, '').trim();
          currentSubtopic = {
            title: subTitle,
            badgeType: 'subtopic_blue',
            children: []
          };
          if (currentSection) {
            currentSection.children = currentSection.children || [];
            currentSection.children.push(currentSubtopic);
          } else {
            synthesized.push(currentSubtopic);
          }
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[-*•]\s*/, '').replace(/\[.*?\]/g, '').trim();
          const parts = content.split(/:\s*/);
          const itemNode: RevisemapTreeNode = {
            title: parts[0],
            details: parts.slice(1).join(': ') || undefined
          };

          if (currentSubtopic) {
            currentSubtopic.children = currentSubtopic.children || [];
            currentSubtopic.children.push(itemNode);
          } else if (currentSection) {
            currentSection.children = currentSection.children || [];
            currentSection.children.push(itemNode);
          } else {
            synthesized.push(itemNode);
          }
        }
      });
    }

    // 3. Key Takeaways Section
    if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
      synthesized.push({
        title: 'महत्वपूर्ण नियम (Exam Principles)',
        badgeType: 'badge_green',
        children: analysis.keyTakeaways.map((kt) => ({
          title: kt.title,
          badgeType: 'subtopic_blue',
          details: kt.description
        }))
      });
    }

    // 4. Vocabulary Glossary Section
    if (analysis.vocabularyTerms && analysis.vocabularyTerms.length > 0) {
      synthesized.push({
        title: 'शब्दकोश (Glossary)',
        badgeType: 'badge_brown',
        children: analysis.vocabularyTerms.map((vt) => ({
          title: vt.term,
          details: vt.definition
        }))
      });
    }

    return synthesized;
  }, [analysis]);

  // Distribute tree nodes evenly across 4 parallel vertical columns
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

      {/* ==================== REVISEMAP TARGET PDF (EXACT IMAGE MATCH) ==================== */}
      <div
        ref={pdfContentRef}
        style={{
          width: '100%',
          maxWidth: 980,
          margin: '0 auto 40px auto',
          background: themeMode === 'light' ? '#ffffff' : '#090d16',
          color: themeMode === 'light' ? '#0f172a' : '#f8fafc',
          border: '3px solid #0d9488',
          padding: 4,
          borderRadius: 4,
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          position: 'relative'
        }}
      >
        <div style={{ border: '1px solid #0d9488', padding: '12px 10px', borderRadius: 2, background: '#ffffff', position: 'relative' }}>
          
          {/* REVISEMAP WATERMARK IN BACKGROUND */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-25deg)',
            fontSize: 70,
            fontWeight: 900,
            color: 'rgba(13, 148, 136, 0.04)',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 0
          }}>
            revisemap.com
          </div>

          {/* REVISEMAP HEADER BANNER WITH RED PATTERN */}
          <div style={{
            background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%)',
            color: '#ffffff',
            textAlign: 'center',
            padding: '16px 20px',
            borderRadius: 4,
            marginBottom: 14,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <h1 style={{ fontSize: 36, fontWeight: 900, textTransform: 'none', letterSpacing: 0.5, margin: 0, fontFamily: 'Georgia, serif', color: '#ffffff' }}>
              Youtube Video To PDF
            </h1>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginTop: 2 }}>
              revisemap.com
            </div>
          </div>

          {/* DENSE 4-COLUMN TREE GRID WITH Teal DIVIDER LINES */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(4, 1fr)',
            gap: 8,
            minHeight: 700,
            alignItems: 'start',
            position: 'relative',
            zIndex: 1
          }}>
            {/* COLUMN 1 */}
            <div style={{ borderRight: window.innerWidth >= 768 ? '1.5px solid #0d9488' : 'none', paddingRight: 6 }}>
              {col1.map((node, nIdx) => (
                <RenderRevisemapBranch key={nIdx} node={node} depth={0} />
              ))}
            </div>

            {/* COLUMN 2 */}
            <div style={{ borderRight: window.innerWidth >= 768 ? '1.5px solid #0d9488' : 'none', paddingRight: 6, paddingLeft: 4 }}>
              {col2.map((node, nIdx) => (
                <RenderRevisemapBranch key={nIdx} node={node} depth={0} />
              ))}
            </div>

            {/* COLUMN 3 */}
            <div style={{ borderRight: window.innerWidth >= 768 ? '1.5px solid #0d9488' : 'none', paddingRight: 6, paddingLeft: 4 }}>
              {col3.map((node, nIdx) => (
                <RenderRevisemapBranch key={nIdx} node={node} depth={0} />
              ))}
            </div>

            {/* COLUMN 4 */}
            <div style={{ paddingLeft: 4 }}>
              {col4.map((node, nIdx) => (
                <RenderRevisemapBranch key={nIdx} node={node} depth={0} />
              ))}
            </div>
          </div>

          {/* FOOTER BANNER */}
          <div style={{
            background: '#0d9488',
            color: '#ffffff',
            textAlign: 'center',
            padding: '6px 14px',
            fontSize: 11.5,
            fontWeight: 600,
            marginTop: 14,
            borderRadius: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            <span>revisemap.com</span>
            <span>This is a class notes pdf. It may contains class info. [Not for sale]</span>
          </div>

        </div>
      </div>
    </div>
  );
};
