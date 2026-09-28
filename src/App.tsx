import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { MyReposModal } from './components/MyReposModal';
import { OriginalView } from './components/OriginalView';
import { AnalysisView } from './components/AnalysisView';
import { RewriteView } from './components/RewriteView';
import { FilesView } from './components/FilesView';
import { RepoMetadata, AuditResult, AIAnalysisResult, AppSettings, RewriteMode, CommunityFileDraft } from './types';
import { fetchGitHubRepoData } from './utils/github';
import { auditReadme } from './utils/audit';
import { analyzeReadmeWithLLM, rewriteReadmeWithLLM, fixReadmeGapsWithLLM } from './utils/llm';
import { generateCommunityFileDrafts } from './utils/templates';
import { enhanceReadmeDeterministically, fixGapsDeterministically } from './utils/enhancer';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';

const DEFAULT_SETTINGS: AppSettings = {
  providers: [
    {
      id: 'prov_default_openrouter',
      name: 'OpenRouter (Free)',
      type: 'openrouter',
      baseUrl: 'https://openrouter.ai/api/v1',
      apiKey: '',
      model: 'google/gemini-2.5-flash:free',
      temperature: 0.3,
      maxTokens: 4096,
    },
    {
      id: 'prov_default_gemini',
      name: 'Google Gemini (OpenAI Proxy)',
      type: 'openai',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      apiKey: '',
      model: 'gemini-2.5-flash',
      temperature: 0.3,
      maxTokens: 4096,
    }
  ],
  activeAnalysisProviderId: 'prov_default_openrouter',
  activeRewriteProviderId: 'prov_default_openrouter',
  githubToken: '',
  defaultRewriteMode: 'Standard',
  theme: 'dark',
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('readme_forge_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [currentUrlInput, setCurrentUrlInput] = useState('facebook/react');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<RepoMetadata | null>(null);
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [readmePath, setReadmePath] = useState<string>('README.md');

  const [activeTab, setActiveTab] = useState<'original' | 'analysis' | 'rewrite' | 'files'>('original');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMyReposOpen, setIsMyReposOpen] = useState(false);

  // Analysis state
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Rewrite state
  const [rewriteMode, setRewriteMode] = useState<RewriteMode>('Standard');
  const [rewrittenContent, setRewrittenContent] = useState<string>('');
  const [isRewriting, setIsRewriting] = useState(false);

  // Community files state
  const [fileDrafts, setFileDrafts] = useState<CommunityFileDraft[]>([]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('readme_forge_settings', JSON.stringify(settings));
  }, [settings]);

  // Load initial repo on mount (facebook/react)
  useEffect(() => {
    handleFetchRepo('facebook/react');
  }, []);

  const handleFetchRepo = async (urlInput: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { metadata: meta, readmeContent: content, readmePath: path } = await fetchGitHubRepoData(
        urlInput,
        settings.githubToken
      );
      setMetadata(meta);
      setReadmeContent(content);
      setReadmePath(path);

      // Run deterministic audit instantly
      const audit = auditReadme(content);
      setAuditResult(audit);

      // Generate community file drafts
      const drafts = generateCommunityFileDrafts(meta);
      setFileDrafts(drafts);

      // Reset AI states and initialize rewritten content with original
      setAiAnalysis(null);
      setRewrittenContent(content);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch repository.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!metadata || !readmeContent || !auditResult) return;
    const provider = settings.providers.find(p => p.id === settings.activeAnalysisProviderId) || settings.providers[0];
    if (!provider) {
      alert('Please configure an LLM provider in Settings first.');
      setIsSettingsOpen(true);
      return;
    }

    setIsAnalyzing(true);
    try {
      const summaryStr = `Score: ${auditResult.score}/100, WordCount: ${auditResult.wordCount}, Headings: ${auditResult.headingCount}, CodeBlocks: ${auditResult.codeBlockCount}`;
      const result = await analyzeReadmeWithLLM(provider, metadata, readmeContent, summaryStr);
      setAiAnalysis(result);
    } catch (err: any) {
      alert(`AI Analysis failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunRewrite = async () => {
    if (!metadata || !readmeContent) return;
    const provider = settings.providers.find(p => p.id === settings.activeRewriteProviderId) || settings.providers[0];
    if (!provider) {
      alert('Please configure an LLM provider in Settings first.');
      setIsSettingsOpen(true);
      return;
    }

    setIsRewriting(true);
    try {
      const result = await rewriteReadmeWithLLM(provider, metadata, readmeContent, rewriteMode);
      setRewrittenContent(result);
    } catch (err: any) {
      alert(`AI Rewrite failed: ${err.message}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const [isFixingGaps, setIsFixingGaps] = useState(false);

  const handleRunDeterministicEnhance = () => {
    if (!metadata || !readmeContent) return;
    const enhanced = enhanceReadmeDeterministically(readmeContent, metadata, rewriteMode);
    setRewrittenContent(enhanced);
  };

  const handleRunFixGapsDeterministic = () => {
    if (!metadata || !readmeContent) return;
    const result = fixGapsDeterministically(rewrittenContent || readmeContent, metadata, auditResult, aiAnalysis);
    setRewrittenContent(result);
    alert('Applied deterministic gap fixes for low marks!');
  };

  const handleRunFixGapsAI = async () => {
    if (!metadata || !readmeContent) return;
    const provider = settings.providers.find(p => p.id === settings.activeRewriteProviderId) || settings.providers[0];
    if (!provider) {
      alert('Please configure an LLM provider in Settings first.');
      setIsSettingsOpen(true);
      return;
    }

    setIsFixingGaps(true);
    try {
      const gapsSummary = aiAnalysis 
        ? `Summary: ${aiAnalysis.summary}\nGaps: ${aiAnalysis.gaps.join(', ')}\nPriority Fixes: ${JSON.stringify(aiAnalysis.priorityFixes)}`
        : `Deterministic Score: ${auditResult?.score}/100. Address missing best-practice sections.`;

      const result = await fixReadmeGapsWithLLM(provider, metadata, rewrittenContent || readmeContent, gapsSummary);
      setRewrittenContent(result);
    } catch (err: any) {
      alert(`AI gap fixing failed: ${err.message}`);
    } finally {
      setIsFixingGaps(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body-md pl-64 pt-20">
      
      {/* Header & Sidebar */}
      <Header
        currentUrlInput={currentUrlInput}
        setCurrentUrlInput={setCurrentUrlInput}
        onFetchRepo={handleFetchRepo}
        isLoading={isLoading}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metadata={metadata}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMyRepos={() => setIsMyReposOpen(true)}
        onRunAnalysis={handleRunAIAnalysis}
        onRunRewrite={handleRunRewrite}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center space-x-3 text-red-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
        )}

        {isLoading && !metadata && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Fetching repository metadata and README...</p>
          </div>
        )}

        {!isLoading && metadata && auditResult && (
          <>
            {activeTab === 'original' && (
              <OriginalView
                metadata={metadata}
                readmeContent={readmeContent}
                readmePath={readmePath}
              />
            )}

            {activeTab === 'analysis' && (
              <AnalysisView
                auditResult={auditResult}
                aiAnalysis={aiAnalysis}
                isAnalyzing={isAnalyzing}
                onRunAIAnalysis={handleRunAIAnalysis}
              />
            )}

            {activeTab === 'rewrite' && (
              <RewriteView
                metadata={metadata}
                originalContent={readmeContent}
                rewrittenContent={rewrittenContent}
                setRewrittenContent={setRewrittenContent}
                rewriteMode={rewriteMode}
                setRewriteMode={setRewriteMode}
                isRewriting={isRewriting}
                onRunRewrite={handleRunRewrite}
                onRunDeterministicEnhance={handleRunDeterministicEnhance}
                onRunFixGapsDeterministic={handleRunFixGapsDeterministic}
                onRunFixGapsAI={handleRunFixGapsAI}
                isFixingGaps={isFixingGaps}
                auditResult={auditResult}
                aiAnalysis={aiAnalysis}
                readmePath={readmePath}
              />
            )}

            {activeTab === 'files' && (
              <FilesView
                metadata={metadata}
                fileDrafts={fileDrafts}
                setFileDrafts={setFileDrafts}
              />
            )}
          </>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
      />

      {/* My Repositories Modal */}
      <MyReposModal
        isOpen={isMyReposOpen}
        onClose={() => setIsMyReposOpen(false)}
        githubToken={settings.githubToken}
        onSelectRepo={(fullName) => {
          setCurrentUrlInput(fullName);
          handleFetchRepo(fullName);
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>README Forge — AI-Powered Documentation & Repository Auditor</span>
          </div>
          <div>Client-side execution with secure local storage provider management.</div>
        </div>
      </footer>

    </div>
  );
}
