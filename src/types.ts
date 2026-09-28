export interface RepoMetadata {
  owner: string;
  repo: string;
  branch: string;
  description: string;
  stars: number;
  forks: number;
  openIssues: number;
  language: string;
  license: string | null;
  topics: string[];
  defaultBranch: string;
  isPrivate: boolean;
  rootFiles: string[];
}

export interface AuditItem {
  id: string;
  title: string;
  category: 'Structure' | 'Content' | 'Quality' | 'Visuals';
  status: 'pass' | 'fail' | 'warning';
  description: string;
  recommendation: string;
}

export interface AuditResult {
  score: number;
  items: AuditItem[];
  wordCount: number;
  headingCount: number;
  codeBlockCount: number;
  imageCount: number;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  gaps: string[];
  priorityFixes: {
    section: string;
    issue: string;
    suggestedFix: string;
  }[];
  toneClarityNotes: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'custom';
  baseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  extraHeaders?: Record<string, string>;
}

export interface AppSettings {
  providers: LLMProvider[];
  activeAnalysisProviderId: string;
  activeRewriteProviderId: string;
  githubToken: string;
  defaultRewriteMode: string;
  theme: 'dark' | 'light';
}

export type RewriteMode = 
  | 'Standard' 
  | 'Minimal' 
  | 'Detailed' 
  | 'Badge-rich' 
  | 'Beginner-friendly' 
  | 'Detailed + Badge-rich' 
  | 'Beginner-friendly + Detailed' 
  | 'Comprehensive + Badge-rich';

export interface CommunityFileDraft {
  path: string;
  name: string;
  description: string;
  content: string;
  existsInRepo: boolean;
}
