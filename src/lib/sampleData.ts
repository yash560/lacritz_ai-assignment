export const SAMPLE_QUESTIONS = [
  {
    title: "Distributed Systems Concurrency",
    text: "Can you explain how optimistic concurrency control differs from two-phase locking in high-throughput distributed databases?",
    category: "Technical Interview"
  },
  {
    title: "Transformer Attention Architecture",
    text: "How does the multi-head self-attention mechanism compute query, key, and value vectors, and why is scaling by the square root of dimension necessary?",
    category: "AI & ML"
  },
  {
    title: "Parakeet STT vs Whisper Latency",
    text: "What architectural features allow NVIDIA Parakeet FastConformer models to achieve sub-200ms latency for streaming voice transcription?",
    category: "Speech AI"
  },
  {
    title: "Local LLM vs Cloud Deployment",
    text: "What are the primary tradeoffs between running local Ollama inference on edge devices versus hosted cloud LLM endpoints for enterprise privacy?",
    category: "System Design"
  },
  {
    title: "React 19 Server Components",
    text: "How do React 19 Server Actions and async Server Components prevent client bundle bloat and eliminate standard API boilerplate?",
    category: "Full Stack"
  }
];

export const COPILOT_MODES = [
  {
    id: 'interview',
    name: 'Interview Copilot',
    description: 'Crisp, structured answers highlighting architectural patterns, tradeoffs, and key terminology.',
    icon: 'Briefcase'
  },
  {
    id: 'executive',
    name: 'Executive Briefing',
    description: 'High-level synthesis with executive bullets, business impact, and strategic ROI.',
    icon: 'TrendingUp'
  },
  {
    id: 'technical',
    name: 'Deep Technical',
    description: 'Exhaustive code-level explanations, algorithmic complexities, and edge case mitigations.',
    icon: 'Code'
  },
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Empathic, step-by-step guidance formatted for direct clarity and user assurance.',
    icon: 'Headphones'
  }
];
