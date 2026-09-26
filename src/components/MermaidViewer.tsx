import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { ZoomIn, ZoomOut, RotateCcw, Copy, Check, Code, Eye, Download, AlertCircle } from 'lucide-react';

interface MermaidViewerProps {
  chart: string;
  onChartChange?: (newChart: string) => void;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, onChartChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableCode, setEditableCode] = useState<string>(chart);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setEditableCode(chart);
  }, [chart]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0f172a',
        primaryColor: '#3b82f6',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#60a5fa',
        lineColor: '#94a3b8',
        secondaryColor: '#1e293b',
        tertiaryColor: '#0f172a',
        fontFamily: 'ui-monospace, monospace, system-ui',
      },
      flowchart: {
        curve: 'basis',
        htmlLabels: true,
        useMaxWidth: false,
      },
      securityLevel: 'loose',
    });
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function renderChart() {
      if (!editableCode.trim()) {
        setSvgContent('');
        return;
      }

      try {
        setRenderError(null);
        const uniqueId = `mermaid-graph-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, editableCode);
        if (isCurrent) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isCurrent) {
          console.error('Mermaid render error:', err);
          setRenderError(err?.message || 'Syntax error in Mermaid flowchart definition.');
        }
      }
    }

    renderChart();

    return () => {
      isCurrent = false;
    };
  }, [editableCode]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(editableCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-architecture-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCodeChange = (newCode: string) => {
    setEditableCode(newCode);
    if (onChartChange) {
      onChartChange(newCode);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-750 bg-slate-900 overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur-sm gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Mermaid.js Flowchart (graph TD)
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Components &bull; Inputs &bull; Layers &bull; Outputs
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.5, prev - 0.15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1.5 min-w-[42px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 hover:bg-slate-700 rounded text-slate-300 hover:text-white transition ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle View / Edit */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
              isEditing
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                Visual
              </>
            ) : (
              <>
                <Code className="w-3.5 h-3.5" />
                Edit / Syntax
              </>
            )}
          </button>

          {/* Copy Mermaid */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Copy raw Mermaid code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>

          {/* Download SVG */}
          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent || !!renderError}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition disabled:opacity-40"
            title="Export Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="relative min-h-[460px] max-h-[640px] overflow-auto bg-slate-950 p-6 flex items-center justify-center">
        {renderError && (
          <div className="absolute top-4 left-4 right-4 z-20 flex items-start gap-3 p-3 bg-red-950/80 border border-red-800 rounded-lg text-red-200 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-300">Mermaid Rendering Error</p>
              <p className="text-red-400/90 mt-0.5">{renderError}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 text-xs underline text-red-300 hover:text-white"
              >
                Switch to syntax editor to adjust diagram definition
              </button>
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="w-full h-full min-h-[420px] flex flex-col">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-400 font-mono">
              <span>Mermaid.js Flowchart Source Code:</span>
              <span>Label: [FLOWCHART]</span>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full flex-1 min-h-[380px] p-4 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-emerald-400 focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y selection:bg-blue-600/30"
              spellCheck={false}
              placeholder="graph TD&#10;    A[Input] --> B[Layer]"
            />
          </div>
        ) : (
          <div
            ref={containerRef}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            className="transition-transform duration-150 flex items-center justify-center w-full select-none"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/60 px-4 py-2 text-[11px] text-slate-400 font-mono">
        <span>Clean syntactically validated Mermaid graph TD</span>
        <span>Drag &amp; zoom enabled &bull; No markdown delimiters</span>
      </div>
    </div>
  );
};
