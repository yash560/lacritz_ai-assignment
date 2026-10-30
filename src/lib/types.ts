export interface HistoryItem {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  model: string;
  tokens: number;
  duration: number;
}

export interface AppSettings {
  ollamaUrl: string;
  selectedModel: string;
  copilotMode: 'interview' | 'executive' | 'technical' | 'support';
  temperature: number;
  useLocalSimulationFallback: boolean;
  autoSuggestOnSpeechEnd: boolean;
}

export type CopilotMode = 'interview' | 'executive' | 'technical' | 'support';
