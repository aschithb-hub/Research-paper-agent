import React, { useState } from 'react';
import { Copy, Check, Download, Terminal, Cpu } from 'lucide-react';

interface AgentRawOutputProps {
  plainText: string;
  paperTitle: string;
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  agentLog?: string;
}

export const AgentRawOutput: React.FC<AgentRawOutputProps> = ({
  plainText,
  paperTitle,
  usage,
  agentLog,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([plainText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${paperTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-research-briefing.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Operational Standard Output Format: [CORE CONCEPT] &bull; [FLOWCHART] &bull; [FUTURE WORK]</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Formatted Text'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      {/* Execution Diagnostics */}
      {usage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono text-xs">
            <span className="text-slate-400">Prompt Tokens:</span>
            <p className="text-base font-bold text-white mt-1">{usage.promptTokenCount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono text-xs">
            <span className="text-slate-400">Completion Tokens:</span>
            <p className="text-base font-bold text-white mt-1">{usage.candidatesTokenCount.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg font-mono text-xs">
            <span className="text-slate-400">Total Execution Tokens:</span>
            <p className="text-base font-bold text-emerald-400 mt-1">{usage.totalTokenCount.toLocaleString()} / 25,000</p>
          </div>
        </div>
      )}

      {/* Agent Analysis Log */}
      {agentLog && (
        <div className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Token-Efficient Retrieval Log:
          </div>
          <p>{agentLog}</p>
        </div>
      )}

      {/* Terminal-style code block */}
      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-h-[550px] font-mono text-xs text-slate-200 leading-relaxed selection:bg-blue-600/30">
        <pre className="whitespace-pre-wrap">{plainText}</pre>
      </div>
    </div>
  );
};
