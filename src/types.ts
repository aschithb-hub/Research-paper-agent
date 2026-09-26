export interface CoreConcept {
  problemStatement: string;
  primaryMethodology: string;
  mathematicalBreakthroughs: string;
  wordCount?: number;
  fullSummaryUnder300Words: string;
}

export interface StudentOpportunity {
  id: number;
  title: string;
  exactExtension: string;
  targetedMetric: string;
  metricCategory?: string;
  techStack: string[];
  implementationRoadmap?: string[];
  resumeBullet: string;
  codeSnippet?: string;
}

export interface PaperAnalysisData {
  paperTitle: string;
  authors: string[];
  venueOrYear?: string;
  githubUrl?: string;
  coreConcept: CoreConcept;
  mermaidDiagram: string;
  studentOpportunities: StudentOpportunity[];
  agentAnalysisLog?: string;
}

export interface AnalysisResponse {
  success: boolean;
  data: PaperAnalysisData;
  plainTextBriefing: string;
  usage: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  tokenLimit: number;
  isUnderBudget: boolean;
}

export interface SamplePaper {
  id: string;
  title: string;
  url: string;
  arxivId: string;
  venue: string;
  category: string;
  description: string;
}
