import React, { useState } from 'react';
import { StudentOpportunity } from '../types';
import { Target, Layers, Briefcase, ChevronRight, Copy, Check, Terminal, Sparkles, Calendar } from 'lucide-react';

interface StudentProjectCardProps {
  opportunity: StudentOpportunity;
  index: number;
}

export const StudentProjectCard: React.FC<StudentProjectCardProps> = ({ opportunity, index }) => {
  const [copiedResume, setCopiedResume] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'roadmap' | 'code'>('overview');

  const handleCopyResume = () => {
    navigator.clipboard.writeText(opportunity.resumeBullet);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleCopyCode = () => {
    if (opportunity.codeSnippet) {
      navigator.clipboard.writeText(opportunity.codeSnippet);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-lg hover:border-slate-700 transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
              0{index + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {opportunity.title}
              </h3>
              {opportunity.metricCategory && (
                <span className="inline-block mt-0.5 text-[11px] font-mono font-medium text-blue-400 uppercase tracking-wider">
                  Target: {opportunity.metricCategory}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                activeTab === 'roadmap'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Milestones
            </button>
            {opportunity.codeSnippet && (
              <button
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-md transition font-medium ${
                  activeTab === 'code'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body content based on tab */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* The Exact Extension */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                The Exact Extension
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                {opportunity.exactExtension}
              </p>
            </div>

            {/* Targeted Performance Metric */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Targeted Performance Metric
              </div>
              <div className="flex items-center gap-2 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-300 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>{opportunity.targetedMetric}</span>
              </div>
            </div>

            {/* Recommended Tech Stack */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider font-mono">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Recommended Tech Stack
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(opportunity.techStack) ? opportunity.techStack : [opportunity.techStack]).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700/80 rounded-md text-xs font-mono font-medium shadow-sm hover:border-slate-600 transition"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              4-Week Implementation Roadmap
            </div>
            <div className="space-y-2">
              {(opportunity.implementationRoadmap || [
                'Week 1: Benchmark baseline architecture & build profiling suite',
                'Week 2: Implement custom kernel / architectural module replacement',
                'Week 3: Fine-tune & conduct rigorous ablation experiments',
                'Week 4: Profile latency/memory on target hardware and package GitHub repo'
              ]).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-xs text-slate-300 leading-normal"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Python / PyTorch Architecture Starter
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto max-h-[220px] leading-relaxed selection:bg-blue-600/30">
              <code>{opportunity.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Resume Bullet Point Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 font-mono">
              <Briefcase className="w-3.5 h-3.5 text-amber-400" />
              <span>Resume Bullet (Google STAR / XYZ format)</span>
            </div>
            <button
              onClick={handleCopyResume}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition"
              title="Copy resume bullet point"
            >
              {copiedResume ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[11px]">Copy Bullet</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 italic leading-relaxed">
            &ldquo;{opportunity.resumeBullet}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
