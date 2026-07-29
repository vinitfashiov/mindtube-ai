import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ChevronRight,
  Info,
  Sparkles,
  FileCode,
  Check,
  X
} from 'lucide-react';
import { MindMapNode } from '../types/notes';

interface MindMapCanvasProps {
  rootNode: MindMapNode;
  videoTitle: string;
}

interface LayoutNode {
  node: MindMapNode;
  x: number;
  y: number;
  depth: number;
  collapsed: boolean;
  parent?: LayoutNode;
  children: LayoutNode[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Root: '#6366f1',
  Concept: '#3b82f6',
  Architecture: '#8b5cf6',
  Optimization: '#ec4899',
  Production: '#10b981',
  Default: '#0284c7'
};

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({ rootNode, videoTitle }) => {
  const [zoom, setZoom] = useState(0.9);
  const [pan, setPan] = useState({ x: 60, y: 260 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(rootNode);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Auto adjust initial pan for mobile screens
  useEffect(() => {
    if (window.innerWidth < 768) {
      setZoom(0.7);
      setPan({ x: 20, y: 180 });
    }
  }, []);

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const layout = useMemo(() => {
    let currentY = 0;
    const horizontalGap = 260;
    const verticalGap = 75;

    function buildLayout(node: MindMapNode, depth: number, parent?: LayoutNode): LayoutNode {
      const isCollapsed = Boolean(collapsedMap[node.id]);
      const lNode: LayoutNode = {
        node,
        x: depth * horizontalGap,
        y: 0,
        depth,
        collapsed: isCollapsed,
        parent,
        children: []
      };

      if (!isCollapsed && node.children && node.children.length > 0) {
        lNode.children = node.children.map((child) => buildLayout(child, depth + 1, lNode));
        const firstChildY = lNode.children[0].y;
        const lastChildY = lNode.children[lNode.children.length - 1].y;
        lNode.y = (firstChildY + lastChildY) / 2;
      } else {
        lNode.y = currentY;
        currentY += verticalGap;
      }

      return lNode;
    }

    return buildLayout(rootNode, 0);
  }, [rootNode, collapsedMap]);

  const flatNodes = useMemo(() => {
    const nodesList: LayoutNode[] = [];
    function collect(n: LayoutNode) {
      nodesList.push(n);
      if (!n.collapsed && n.children) {
        n.children.forEach(collect);
      }
    }
    collect(layout);
    return nodesList;
  }, [layout]);

  // Mouse & Touch Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof SVGElement || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.2));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.4));
  const resetView = () => {
    setZoom(window.innerWidth < 768 ? 0.7 : 0.9);
    setPan({ x: window.innerWidth < 768 ? 20 : 60, y: window.innerWidth < 768 ? 180 : 260 });
  };

  const handleExportSVG = () => {
    const svgElement = document.getElementById('mindmap-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}_mindmap.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyAsMarkdown = () => {
    function generateMd(node: MindMapNode, indent = 0): string {
      let md = `${'  '.repeat(indent)}- **${node.label}**${node.details ? `: ${node.details}` : ''}\n`;
      if (node.children) {
        node.children.forEach((c) => {
          md += generateMd(c, indent + 1);
        });
      }
      return md;
    }

    const markdownText = `# Mindmap: ${videoTitle}\n\n` + generateMd(rootNode);
    navigator.clipboard.writeText(markdownText);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
    if (window.innerWidth < 768) {
      setIsMobileDrawerOpen(true);
    }
  };

  return (
    <div className="mindmap-wrapper">
      {/* Main Viewport Canvas */}
      <div
        ref={containerRef}
        id="canvas-bg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        className="canvas-viewport"
      >
        {/* Left Toolbar Controls */}
        <div className="canvas-toolbar-left">
          <button onClick={zoomIn} className="tool-btn" title="Zoom In (+)">
            <ZoomIn style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={zoomOut} className="tool-btn" title="Zoom Out (-)">
            <ZoomOut style={{ width: 16, height: 16 }} />
          </button>
          <button onClick={resetView} className="tool-btn" title="Reset View">
            <Maximize2 style={{ width: 16, height: 16 }} />
          </button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: '#a5b4fc', padding: '0 4px' }}>
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Right Action Export Tools */}
        <div className="canvas-toolbar-right">
          <button onClick={copyAsMarkdown} className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
            {copiedMd ? <Check style={{ width: 14, height: 14, color: '#34d399' }} /> : <FileCode style={{ width: 14, height: 14, color: '#a5b4fc' }} />}
            <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>Copy Markdown</span>
          </button>
          <button onClick={handleExportSVG} className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>
            <Download style={{ width: 14, height: 14 }} />
            <span>Export SVG</span>
          </button>
        </div>

        {/* High Contrast SVG Node Canvas */}
        <svg
          id="mindmap-svg"
          style={{
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <defs>
            <linearGradient id="gradient-root" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Curved Connector Lines */}
          {flatNodes.map((item) => {
            if (!item.parent) return null;
            const x1 = item.parent.x + 200;
            const y1 = item.parent.y;
            const x2 = item.x;
            const y2 = item.y;
            const dx = (x2 - x1) * 0.5;
            const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            return (
              <path
                key={`edge-${item.parent.node.id}-${item.node.id}`}
                d={pathData}
                fill="none"
                stroke="url(#line-gradient)"
                strokeWidth={item.depth === 1 ? 3 : 2}
                strokeDasharray={item.depth > 2 ? '4 3' : 'none'}
                opacity={0.8}
              />
            );
          })}

          {/* High-Contrast Readable Nodes */}
          {flatNodes.map((item) => {
            const { node, x, y, depth, collapsed } = item;
            const hasChildren = node.children && node.children.length > 0;
            const isSelected = selectedNode?.id === node.id;
            const categoryColor =
              node.color || CATEGORY_COLORS[node.category || ''] || CATEGORY_COLORS.Default;

            const nodeWidth = depth === 0 ? 220 : 200;
            const nodeHeight = 52;

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${x}, ${y})`}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node Main Outer Rect */}
                <rect
                  x={0}
                  y={-nodeHeight / 2}
                  width={nodeWidth}
                  height={nodeHeight}
                  rx={12}
                  fill={depth === 0 ? 'url(#gradient-root)' : '#1e293b'}
                  stroke={isSelected ? '#ffffff' : categoryColor}
                  strokeWidth={isSelected ? 3 : 2}
                />

                {/* Left Category Accent Strip */}
                {depth > 0 && (
                  <rect x={0} y={-nodeHeight / 2} width={7} height={nodeHeight} rx={3} fill={categoryColor} />
                )}

                {/* Readable Title Label Text */}
                <text
                  x={depth > 0 ? 18 : 16}
                  y={5}
                  fill="#ffffff"
                  fontSize={depth === 0 ? 14 : 13}
                  fontWeight={depth === 0 ? '800' : '600'}
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  pointerEvents="none"
                >
                  {node.label.length > 24 ? `${node.label.substring(0, 22)}...` : node.label}
                </text>

                {/* Expand / Collapse Circular Icon */}
                {hasChildren && (
                  <g
                    transform={`translate(${nodeWidth - 18}, 0)`}
                    onClick={(e) => toggleCollapse(node.id, e)}
                  >
                    <circle r={11} fill="#0f172a" stroke={categoryColor} strokeWidth={2} />
                    <text
                      x={-4}
                      y={4}
                      fill="#ffffff"
                      fontSize={12}
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {collapsed ? '+' : '−'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Desktop Side Inspector Sidebar */}
      <div className="sidebar-inspector">
        {selectedNode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
              <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, color: '#818cf8' }}>
                {selectedNode.category || 'Mindmap Node'}
              </span>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
              {selectedNode.label}
            </h3>

            {selectedNode.details ? (
              <div style={{ padding: 14, borderRadius: 12, background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#cbd5e1', marginBottom: 6 }}>
                  <Info style={{ width: 14, height: 14, color: '#818cf8' }} />
                  <span>Topic Details</span>
                </div>
                <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>
                  {selectedNode.details}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                Click on any node in the canvas to view detailed notes & subtopic relationships.
              </p>
            )}

            {selectedNode.children && selectedNode.children.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Subtopics ({selectedNode.children.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedNode.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleNodeClick(child)}
                      style={{
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(15, 23, 42, 0.6)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        fontSize: 12,
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{child.label}</span>
                      <ChevronRight style={{ width: 14, height: 14, color: '#64748b' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <Sparkles style={{ width: 32, height: 32, color: '#818cf8', margin: '0 auto 8px auto' }} />
            <p style={{ fontSize: 12 }}>Select any node on the Mindmap to view notes</p>
          </div>
        )}
      </div>

      {/* Mobile Touch Drawer Modal (Pops up when a node is clicked on mobile screens) */}
      {isMobileDrawerOpen && selectedNode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 120, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', background: '#0f172a', borderTop: '2px solid var(--accent-primary)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#818cf8' }}>
                {selectedNode.category || 'Mindmap Node'}
              </span>
              <button onClick={() => setIsMobileDrawerOpen(false)} style={{ color: '#cbd5e1', padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 10 }}>
              {selectedNode.label}
            </h3>

            {selectedNode.details && (
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, background: '#1e293b', padding: 12, borderRadius: 10, marginBottom: 14 }}>
                {selectedNode.details}
              </p>
            )}

            {selectedNode.children && selectedNode.children.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Subtopics ({selectedNode.children.length})
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedNode.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => handleNodeClick(child)}
                      style={{ textAlign: 'left', padding: '10px 14px', borderRadius: 8, background: '#1e293b', color: '#fff', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>{child.label}</span>
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
