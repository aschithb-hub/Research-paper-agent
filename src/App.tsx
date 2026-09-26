import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  GitBranch,
  Briefcase,
  Sparkles,
  ExternalLink,
  Code2,
  Terminal,
  Layers,
  ArrowRight,
  RefreshCw,
  Cpu,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { AnalysisResponse, PaperAnalysisData, SamplePaper } from './types';
import { CoreConceptView } from './components/CoreConceptView';
import { MermaidViewer } from './components/MermaidViewer';
import { StudentProjectCard } from './components/StudentProjectCard';
import { TokenBudgetMonitor } from './components/TokenBudgetMonitor';
import { AgentRawOutput } from './components/AgentRawOutput';

export default function App() {
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'url' | 'text'>('url');
  const [focusArea, setFocusArea] = useState('All CS Specializations');

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [samplePapers, setSamplePapers] = useState<SamplePaper[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'flowchart' | 'concept' | 'opportunities' | 'raw'>('flowchart');

  // Load sample papers on mount
  useEffect(() => {
    fetch('/api/sample-papers')
      .then((res) => res.json())
      .then((data) => {
        if (data.samplePapers) {
          setSamplePapers(data.samplePapers);
        }
      })
      .catch((err) => console.error('Failed to load sample papers:', err));
  }, []);

  const handleAnalyze = async (overrideUrl?: string, overrideTitle?: string) => {
    const targetUrl = overrideUrl !== undefined ? overrideUrl : inputUrl;
    const targetTitle = overrideTitle !== undefined ? overrideTitle : inputTitle;

    if (!targetUrl.trim() && !targetTitle.trim() && !rawText.trim()) {
      setError('Please provide an academic paper URL, arXiv ID, paper title, or abstract text.');
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep('Ingesting paper context and retrieving academic metadata...');

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep('Synthesizing Core Concepts (<300 words accessible language)...');
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep('Extracting system architecture into syntactically valid Mermaid.js graph TD...');
      }, 3500);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep('Formulating 3 concrete student developer extensions & resume projects...');
      }, 5500);

      const response = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl.trim(),
          title: targetTitle.trim(),
          rawText: inputMode === 'text' ? rawText.trim() : undefined,
          focusArea,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete paper analysis.');
      }

      setAnalysisResult(data);
      setActiveTab('flowchart');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err?.message || 'An error occurred during paper analysis. Please check the URL or try again.');
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectSample = (paper: SamplePaper) => {
    setInputMode('url');
    setInputUrl(paper.url);
    setInputTitle(paper.title);
    handleAnalyze(paper.url, paper.title);
  };

  const currentData: PaperAnalysisData | undefined = analysisResult?.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">PaperArc</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  CS RESEARCH AGENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Academic Paper Parsing &bull; Architecture Extractor (Mermaid.js) &bull; Student Opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Gemini 3.8 Flash + Web Search Grounding</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Token Budget Monitor Bar */}
        <TokenBudgetMonitor
          usage={analysisResult?.usage}
          tokenLimit={analysisResult?.tokenLimit || 25000}
        />

        {/* Input & Search Section */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Computer Science Paper Analysis Terminal</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Provide an arXiv URL, paper DOI, title, or abstract to extract its core concept, system architecture, and 3 resume-defining student projects.
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setInputMode('url')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  inputMode === 'url' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paper URL / Title / arXiv
              </button>
              <button
                onClick={() => setInputMode('text')}
                className={`px-3 py-1.5 rounded-lg transition font-medium ${
                  inputMode === 'text' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Direct Abstract / Text
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {inputMode === 'url' ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-8 relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Enter arXiv URL (e.g. https://arxiv.org/abs/1706.03762), arXiv ID (e.g. 2312.00752), or title"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono"
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="All CS Specializations">Specialization: All Domains</option>
                    <option value="Edge AI & Low-Latency Deployment">Track: Edge AI &amp; Low-Latency</option>
                    <option value="High-Performance Systems & CUDA Kernels">Track: Systems, CUDA &amp; Hardware</option>
                    <option value="Model Compression & Quantization">Track: Compression &amp; Quantization</option>
                    <option value="Full-Stack Web & Real-Time AI">Track: Full-Stack &amp; Production API</option>
                    <option value="Multimodal & Computer Vision">Track: Multimodal &amp; Vision</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste paper abstract, introduction, or architecture excerpts here..."
                  rows={4}
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-y"
                />
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              {/* Presets */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                <span className="text-[11px] font-mono text-slate-400 shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  Quick Try:
                </span>
                {samplePapers.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    disabled={loading}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-800/90 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/80 transition shrink-0 disabled:opacity-50"
                  >
                    {sample.title.split(':')[0]}
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={() => handleAnalyze()}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs font-mono shadow-lg shadow-blue-600/25 transition disabled:opacity-50 ml-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Analyzing Paper...</span>
                  </>
                ) : (
                  <>
                    <span>Execute CS Agent Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="mt-5 p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-mono text-blue-300 font-semibold">{loadingStep || 'Executing analysis...'}</p>
                <p className="text-[11px] font-mono text-blue-400/70 mt-0.5">
                  Enforcing operational constraint: token consumption strictly monitored under 25k tokens.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-red-300">
                <p className="font-semibold text-red-200">Execution Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </section>

        {/* Results Area */}
        {analysisResult && currentData && (
          <div className="space-y-6">
            {/* View Switcher Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('flowchart')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition ${
                    activeTab === 'flowchart'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>2. Architectural Flowchart</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </button>

                <button
                  onClick={() => setActiveTab('concept')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition ${
                    activeTab === 'concept'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>1. Core Concept Extraction</span>
                </button>

                <button
                  onClick={() => setActiveTab('opportunities')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition ${
                    activeTab === 'opportunities'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>3. Student Resume &amp; Internship Projects</span>
                  <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded text-[10px]">3</span>
                </button>

                <button
                  onClick={() => setActiveTab('raw')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition ${
                    activeTab === 'raw'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Agent Standard Output [FLOWCHART]</span>
                </button>
              </div>

              <div className="text-xs font-mono text-slate-400">
                Paper: <span className="text-slate-200 font-semibold">{currentData.paperTitle}</span>
              </div>
            </div>

            {/* TAB CONTENT: 2. Architectural Flowchart */}
            {activeTab === 'flowchart' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-blue-400" />
                      <span>System Architecture Flowchart (Mermaid.js graph TD)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hierarchical mapping of system components, data inputs, model layers/transformations, and data outputs.
                    </p>
                  </div>
                </div>

                <MermaidViewer
                  chart={currentData.mermaidDiagram}
                  onChartChange={(newChart) => {
                    if (analysisResult?.data) {
                      analysisResult.data.mermaidDiagram = newChart;
                    }
                  }}
                />

                {/* Quick jump to Core Concept & Student Projects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('concept')}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono text-blue-400">Step 1: Core Concept</p>
                      <p className="text-sm font-semibold text-white mt-0.5">Read Problem &amp; Algorithmic Breakthroughs</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('opportunities')}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 text-left transition flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-mono text-emerald-400">Step 3: Student Projects</p>
                      <p className="text-sm font-semibold text-white mt-0.5">Explore 3 Resume Extension Projects</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 1. Core Concept Extraction */}
            {activeTab === 'concept' && (
              <CoreConceptView
                concept={currentData.coreConcept}
                paperTitle={currentData.paperTitle}
                authors={currentData.authors}
                venueOrYear={currentData.venueOrYear}
                githubUrl={currentData.githubUrl}
              />
            )}

            {/* TAB CONTENT: 3. Student Future Work & Internship Projects */}
            {activeTab === 'opportunities' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      <span>3rd-Year CS Student Developer Project Roadmap</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Concrete, realistic extension ideas tailored for portfolio impact, FAANG/AI startup internship interviews, and resume bullets.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Includes Google STAR Resume Bullets &amp; Code Starters</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {currentData.studentOpportunities.map((opportunity, idx) => (
                    <StudentProjectCard
                      key={opportunity.id || idx}
                      opportunity={opportunity}
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Agent Standard Output */}
            {activeTab === 'raw' && (
              <AgentRawOutput
                plainText={analysisResult.plainTextBriefing}
                paperTitle={currentData.paperTitle}
                usage={analysisResult.usage}
                agentLog={currentData.agentAnalysisLog}
              />
            )}
          </div>
        )}

        {/* Initial Welcome & Guide State if no analysis yet */}
        {!currentData && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
            <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white font-mono">1. Core Concept Extraction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Condenses dense 30-page ML papers into problem statements, methodologies, and mathematical breakthroughs in under 300 words.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <GitBranch className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white font-mono">2. Mermaid.js Flowchart</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Renders interactive DAG architecture diagrams (graph TD) showing data inputs, tensor operations, layer transformations, and outputs.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-white font-mono">3. Student Resume Extensions</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generates 3 realistic student project extensions with exact replacement hypotheses, target metrics, tech stacks, and STAR resume bullets.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 py-4 mt-12 text-center text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <span>PaperArc Research Agent &bull; Specialized for Computer Science Academics &amp; Students</span>
          <span className="text-slate-400">Operational Constraint Enforced: &lt;25,000 Total Token Budget</span>
        </div>
      </footer>
    </div>
  );
}
