import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Try to extract arXiv ID from URL or input string
function extractArxivId(input: string): string | null {
  const match = input.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*|^)([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?)/i);
  return match ? match[1] : null;
}

// Helper: Query arXiv API for abstract & metadata (token-efficient, zero bloat)
async function fetchArxivMetadata(arxivId: string) {
  try {
    const cleanId = arxivId.replace(/v[0-9]+$/, '');
    const apiUrl = `https://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}&max_results=1`;
    const res = await fetch(apiUrl, { headers: { 'User-Agent': 'PaperArc-ResearchAgent/1.0' } });
    if (!res.ok) return null;
    const xml = await res.text();

    const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/g);
    // index 0 is feed title, index 1 is entry title
    const entryTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace(/<\/?title>/g, '').trim().replace(/\s+/g, ' ') : null;

    const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
    const summary = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : null;

    const authors: string[] = [];
    const authorMatches = xml.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g);
    for (const m of authorMatches) {
      authors.push(m[1].trim());
    }

    const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/);
    const published = publishedMatch ? publishedMatch[1].substring(0, 10) : null;

    if (entryTitle && summary) {
      return {
        title: entryTitle,
        abstract: summary,
        authors: authors.slice(0, 5),
        published,
        arxivId: cleanId,
      };
    }
  } catch (err) {
    console.error('Failed to fetch arXiv metadata:', err);
  }
  return null;
}

// System prompt as specified in the instructions
const RESEARCH_AGENT_SYSTEM_PROMPT = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student developer opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens. If a paper is too long to ingest entirely, use the Web Search tool to look up summaries, abstracts, and open-source implementations (e.g., GitHub) of the paper's title to gather context efficiently.

When a user provides a research paper URL, title, or text:
1. CORE CONCEPT EXTRACTION:
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper. Do not use Markdown code blocks inside the Mermaid string itself; output it as a clear text segment labeled [FLOWCHART].
Make sure the Mermaid diagram:
- Uses valid node IDs without forbidden symbols (use A["Label with text"] or letters/numbers).
- Accurately details input data, preprocessing/tokenization, intermediate layer operations (e.g. self-attention, SSM state space, feed-forward, projections, loss computation), and output artifacts.
- Renders cleanly in standard Mermaid.js.

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
- The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment")
- The targeted performance metric (e.g., latency reduction, accuracy trade-off)
- The recommended tech stack (e.g., PyTorch, ONNX Runtime)
- 3 implementation milestones (Week 1-4 roadmap)
- A high-impact Resume Bullet Point formatted using the Google/STAR standard (e.g., "Engineered... improving... measured by...")
- A brief starter code/scaffolding guidance snippet.

RESPONSE FORMAT:
You MUST provide your response in valid JSON matching this structure:
{
  "paperTitle": "Official or Identified Paper Title",
  "authors": ["Author 1", "Author 2"],
  "venueOrYear": "e.g., NeurIPS 2023 / arXiv 2024",
  "githubUrl": "https://github.com/... or relevant repo if known",
  "coreConcept": {
    "problemStatement": "Clear summary of the exact challenge/limitation addressed",
    "primaryMethodology": "The core technique, architecture, or formulation introduced",
    "mathematicalBreakthroughs": "Key mathematical, algorithmic, or theoretical mechanisms",
    "wordCount": 180,
    "fullSummaryUnder300Words": "Unified <300 word accessible synthesis"
  },
  "mermaidDiagram": "graph TD\\n    A[\\\"Input Data / Tokens\\\"] --> B[\\\"Preprocessing / Embedding\\\"]\\n...",
  "studentOpportunities": [
    {
      "id": 1,
      "title": "Short title of project",
      "exactExtension": "Replacing...",
      "targetedMetric": "e.g., 3.2x latency reduction on Raspberry Pi with <1.5% perplexity drop",
      "metricCategory": "Latency / Memory / Quantization / Multimodal",
      "techStack": ["PyTorch", "ONNX Runtime", "Hugging Face"],
      "implementationRoadmap": [
        "Week 1: Benchmark baseline model and establish inference latency profiling harness",
        "Week 2: Implement custom kernel / architectural replacement layer",
        "Week 3: Fine-tune on target dataset and perform ablation studies",
        "Week 4: Export to ONNX/TensorRT and package interactive demo"
      ],
      "resumeBullet": "Engineered a lightweight... achieving 3.2x inference speedup with <1.5% accuracy trade-off using PyTorch and ONNX Runtime.",
      "codeSnippet": "# Starter scaffold for student implementation\\n..."
    }
  ],
  "agentAnalysisLog": "Short summary of search & retrieval steps executed within token budget."
}`;

// API Route: Analyze Paper
app.post('/api/analyze-paper', async (req, res) => {
  try {
    const { url, title, rawText, focusArea } = req.body;

    if (!url && !title && !rawText) {
      return res.status(400).json({ error: 'Please provide a paper URL, arXiv ID, title, or abstract text.' });
    }

    const inputQuery = url || title || '';
    const arxivId = extractArxivId(inputQuery);
    let arxivMetadata: any = null;

    if (arxivId) {
      arxivMetadata = await fetchArxivMetadata(arxivId);
    }

    // Build the user prompt context
    let promptContent = `Analyze the following academic computer science paper:\n\n`;

    if (arxivMetadata) {
      promptContent += `[ARXIV METADATA RETRIEVED]\nTitle: ${arxivMetadata.title}\nAuthors: ${arxivMetadata.authors.join(', ')}\nPublished: ${arxivMetadata.published}\narXiv ID: ${arxivMetadata.arxivId}\nAbstract: ${arxivMetadata.abstract}\n\n`;
    } else if (rawText) {
      // Truncate raw text if extremely long to respect token budget
      const cleanRaw = rawText.slice(0, 15000);
      promptContent += `[PROVIDED PAPER TEXT / ABSTRACT]\n${cleanRaw}\n\n`;
    } else if (url) {
      promptContent += `Paper URL: ${url}\n`;
    }

    if (title && !arxivMetadata) {
      promptContent += `Paper Title: ${title}\n`;
    }

    if (focusArea) {
      promptContent += `Student Career / Technical Focus Area: ${focusArea}\n`;
    }

    promptContent += `\nPlease parse the paper, formulate the Core Concept (<300 words), build the clean syntactically valid Mermaid.js graph TD flowchart, and devise 3 realistic 3rd-year CS student resume/internship extension projects with exact extensions, targeted metrics, and tech stacks. Ensure your analysis stays strictly token-efficient.`;

    // Call Gemini 3.8 Flash with googleSearch tool enabled for token-efficient retrieval
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptContent,
      config: {
        systemInstruction: RESEARCH_AGENT_SYSTEM_PROMPT,
        temperature: 0.2, // Low temperature for high architectural accuracy and valid Mermaid syntax
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }],
      },
    });

    const outputText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(outputText);
    } catch (parseError) {
      console.warn('JSON direct parse failed, attempting regex cleanup:', parseError);
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse model output into structured JSON.');
      }
    }

    // Include usage metadata for token efficiency tracking
    const usage = response.usageMetadata || {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
      totalTokenCount: 0,
    };

    // Ensure raw Mermaid string conforms cleanly
    if (parsedData.mermaidDiagram) {
      parsedData.mermaidDiagram = parsedData.mermaidDiagram
        .replace(/```mermaid/g, '')
        .replace(/```/g, '')
        .trim();
    }

    // Format plain text representation for the user's operational requirement
    const plainTextBriefing = `[CORE CONCEPT EXTRACTION]\n` +
      `Problem Statement:\n${parsedData.coreConcept?.problemStatement || ''}\n\n` +
      `Primary Methodology:\n${parsedData.coreConcept?.primaryMethodology || ''}\n\n` +
      `Mathematical & Algorithmic Breakthroughs:\n${parsedData.coreConcept?.mathematicalBreakthroughs || ''}\n\n` +
      `Full Synthesis (<300 words):\n${parsedData.coreConcept?.fullSummaryUnder300Words || ''}\n\n` +
      `[FLOWCHART]\n${parsedData.mermaidDiagram || ''}\n\n` +
      `[FUTURE WORK & INTERNSHIP OPPORTUNITIES]\n` +
      (parsedData.studentOpportunities || []).map((opp: any, idx: number) =>
        `${idx + 1}. ${opp.title}\n- Exact Extension: ${opp.exactExtension}\n- Targeted Performance Metric: ${opp.targetedMetric}\n- Recommended Tech Stack: ${Array.isArray(opp.techStack) ? opp.techStack.join(', ') : opp.techStack}\n- Resume Bullet: ${opp.resumeBullet}\n`
      ).join('\n');

    return res.json({
      success: true,
      data: parsedData,
      plainTextBriefing,
      usage,
      tokenLimit: 25000,
      isUnderBudget: (usage.totalTokenCount || 0) < 25000,
    });
  } catch (error: any) {
    console.error('Error in /api/analyze-paper:', error);
    return res.status(500).json({
      error: error?.message || 'An error occurred during paper analysis.',
    });
  }
});

// Curated landmark papers for 1-click testing
app.get('/api/sample-papers', (req, res) => {
  const samplePapers = [
    {
      id: 'transformer',
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      arxivId: '1706.03762',
      venue: 'NeurIPS 2017',
      category: 'Foundation Architecture',
      description: 'The landmark paper that introduced the Transformer architecture based solely on attention mechanisms.',
    },
    {
      id: 'mamba',
      title: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
      url: 'https://arxiv.org/abs/2312.00752',
      arxivId: '2312.00752',
      venue: 'arXiv 2023',
      category: 'Sequence Models / SSM',
      description: 'Selective state space models that achieve 5x throughput of Transformers with sub-quadratic inference.',
    },
    {
      id: 'flashattention',
      title: 'FlashAttention-2: Faster Attention with Better Parallelism and Work Partitioning',
      url: 'https://arxiv.org/abs/2307.08691',
      arxivId: '2307.08691',
      venue: 'ICLR 2024',
      category: 'Systems & CUDA Optimization',
      description: 'IO-aware exact attention algorithm yielding 2-4x speedup through SRAM tiling and warp-level work partitioning.',
    },
    {
      id: 'lora',
      title: 'LoRA: Low-Rank Adaptation of Large Language Models',
      url: 'https://arxiv.org/abs/2106.09685',
      arxivId: '2106.09685',
      venue: 'ICLR 2022',
      category: 'Efficient Fine-Tuning',
      description: 'Freezes pretrained weights and injects trainable rank decomposition matrices, reducing VRAM by 3x.',
    },
    {
      id: 'deepseek-moe',
      title: 'DeepSeek-V3 Technical Report (Multi-head Latent Attention & DeepSeekMoE)',
      url: 'https://arxiv.org/abs/2412.19437',
      arxivId: '2412.19437',
      venue: 'arXiv 2024',
      category: 'MoE & Latent Attention',
      description: 'Introduces Multi-Head Latent Attention (MLA) for minimal KV cache and auxiliary-loss-free load balancing MoE.',
    },
    {
      id: 'sam',
      title: 'Segment Anything',
      url: 'https://arxiv.org/abs/2304.02643',
      arxivId: '2304.02643',
      venue: 'ICCV 2023',
      category: 'Computer Vision & Foundation Models',
      description: 'Zero-shot promptable image segmentation foundation model with ViT image encoder and lightweight mask decoder.',
    },
  ];
  return res.json({ samplePapers });
});

// Setup Vite middleware for development or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
