import React, { useState } from 'react';
import { CoreConcept } from '../types';
import { BookOpen, CheckCircle, Lightbulb, Binary, Volume2, VolumeX, Copy, Check, FileText } from 'lucide-react';

interface CoreConceptViewProps {
  concept: CoreConcept;
  paperTitle: string;
  authors?: string[];
  venueOrYear?: string;
  githubUrl?: string;
}

export const CoreConceptView: React.FC<CoreConceptViewProps> = ({
  concept,
  paperTitle,
  authors,
  venueOrYear,
  githubUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Calculate actual word count of the synthesis
  const countWords = (str: string) => {
    return str ? str.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  const wordCount = concept.wordCount || countWords(concept.fullSummaryUnder300Words);

  const handleCopySummary = () => {
    const text = `CORE CONCEPT EXTRACTION: ${paperTitle}\n\nProblem Statement:\n${concept.problemStatement}\n\nPrimary Methodology:\n${concept.primaryMethodology}\n\nMathematical & Algorithmic Breakthroughs:\n${concept.mathematicalBreakthroughs}\n\nSynthesis (<300 words):\n${concept.fullSummaryUnder300Words}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        `Problem Statement: ${concept.problemStatement}. Primary Methodology: ${concept.primaryMethodology}. Algorithmic Breakthroughs: ${concept.mathematicalBreakthroughs}`
      );
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Metadata Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                1. Core Concept Extraction
              </span>
              {venueOrYear && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-slate-800 border border-slate-700">
                  {venueOrYear}
                </span>
              )}
              {wordCount > 0 && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border ${
                    wordCount <= 300
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {wordCount} words {wordCount <= 300 ? '(Under 300 words)' : '(Target: <300w)'}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {paperTitle}
            </h2>

            {authors && authors.length > 0 && (
              <p className="text-xs text-slate-400 font-mono">
                Authors: {authors.join(', ')}
              </p>
            )}

            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono transition"
              >
                <span>GitHub Reference Repository &rarr;</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {'speechSynthesis' in window && (
              <button
                onClick={toggleSpeech}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition"
                title={isSpeaking ? 'Stop Audio Readout' : 'Listen to Synthesis'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Copy Summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3 Pillars of Core Extraction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Problem Statement */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Lightbulb className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
              Problem Statement
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal flex-1">
            {concept.problemStatement}
          </p>
        </div>

        {/* Pillar 2: Primary Methodology */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
              Primary Methodology
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal flex-1">
            {concept.primaryMethodology}
          </p>
        </div>

        {/* Pillar 3: Mathematical/Algorithmic Breakthroughs */}
        <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Binary className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-white font-mono uppercase tracking-wide">
              Algorithmic Breakthroughs
            </h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-normal flex-1">
            {concept.mathematicalBreakthroughs}
          </p>
        </div>
      </div>

      {/* Unified Accessible Synthesis Card */}
      {concept.fullSummaryUnder300Words && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Full Synthesis in Plain Accessible Language</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Plain English &bull; Under 300 Words
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal bg-slate-950/70 p-4 rounded-lg border border-slate-800">
            {concept.fullSummaryUnder300Words}
          </p>
        </div>
      )}
    </div>
  );
};
