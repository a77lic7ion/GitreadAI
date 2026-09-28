import React, { useState } from 'react';
import { 
  GitPullRequest, 
  Search, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  Wand2, 
  FolderPlus, 
  Sparkles,
  ExternalLink,
  Loader2,
  FolderGit2
} from 'lucide-react';
import { RepoMetadata } from '../types';

interface HeaderProps {
  currentUrlInput: string;
  setCurrentUrlInput: (url: string) => void;
  onFetchRepo: (url: string) => void;
  isLoading: boolean;
  activeTab: 'original' | 'analysis' | 'rewrite' | 'files';
  setActiveTab: (tab: 'original' | 'analysis' | 'rewrite' | 'files') => void;
  metadata: RepoMetadata | null;
  onOpenSettings: () => void;
  onOpenMyRepos: () => void;
  onRunAnalysis: () => void;
  onRunRewrite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUrlInput,
  setCurrentUrlInput,
  onFetchRepo,
  isLoading,
  activeTab,
  setActiveTab,
  metadata,
  onOpenSettings,
  onOpenMyRepos,
  onRunAnalysis,
  onRunRewrite,
}) => {
  const [inputVal, setInputVal] = useState(currentUrlInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onFetchRepo(inputVal.trim());
    }
  };

  const sampleRepos = [
    { label: 'Facebook React', url: 'facebook/react' },
    { label: 'GitHub Docs', url: 'github/docs' },
    { label: 'Torvalds Linux', url: 'torvalds/linux' },
    { label: 'Tailwind CSS', url: 'tailwindlabs/tailwindcss' },
    { label: 'OpenAI Cookbook', url: 'openai/openai-cookbook' }
  ];

  return (
    <>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between p-4 border-r border-surface-container-highest">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <span className="text-primary-container font-code-md text-code-md font-bold">&gt;</span>
            <div className="flex flex-col">
              <span className="font-code-md text-code-md font-bold text-on-surface leading-tight">gitread::forge</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">v2.0-preview</span>
            </div>
          </div>

          <div className="px-3 py-2 rounded bg-surface-container-lowest flex items-center justify-between text-on-surface-variant border border-surface-container-highest">
            <div className="flex items-center gap-2 font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
              <span>local-agent</span>
            </div>
            <span className="font-code-sm text-code-sm text-tertiary">:8080</span>
          </div>

          <nav className="flex flex-col gap-1 mt-2">
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-body-md text-body-md ${
                activeTab === 'original'
                  ? 'bg-surface-container-high text-on-surface font-headline-sm text-headline-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <FileText className="w-4 h-4 text-primary-container" />
              <span>Forge Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('analysis');
                onRunAnalysis();
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-body-md text-body-md ${
                activeTab === 'analysis'
                  ? 'bg-surface-container-high text-on-surface font-headline-sm text-headline-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-tertiary" />
              <span>Repo Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rewrite')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-body-md text-body-md ${
                activeTab === 'rewrite'
                  ? 'bg-surface-container-high text-on-surface font-headline-sm text-headline-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Wand2 className="w-4 h-4 text-pink-400" />
              <span>Rewrite Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors font-body-md text-body-md ${
                activeTab === 'files'
                  ? 'bg-surface-container-high text-on-surface font-headline-sm text-headline-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Community Files & ZIP</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-surface-container-highest flex flex-col gap-2">
            <button
              type="button"
              onClick={onOpenMyRepos}
              className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold transition-colors border border-surface-container-highest"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>My GitHub Repos</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-2 rounded bg-surface-container text-on-surface hover:bg-surface-container-high text-xs font-semibold transition-colors border border-surface-container-highest"
            >
              <Sliders className="w-4 h-4 text-primary-container" />
              <span>Terminal Settings</span>
            </button>
          </div>
        </div>

        <div className="p-3 rounded bg-surface-container-lowest flex flex-col gap-1.5 font-label-sm text-label-sm text-on-surface-variant border border-surface-container-highest">
          <div className="flex justify-between items-center">
            <span className="text-tertiary-fixed-dim">Claude / OpenRouter</span>
            <span className="text-on-surface">Active</span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded overflow-hidden">
            <div className="bg-primary-container h-1 rounded w-3/4"></div>
          </div>
          <span className="font-code-sm text-code-sm text-on-surface-variant">Client-side secure execution</span>
        </div>
      </aside>

      {/* Top Header */}
      <header className="fixed top-0 left-64 right-0 h-16 bg-surface/90 backdrop-blur-xl border-b border-surface-container-highest z-40 flex items-center justify-between px-6">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 max-w-2xl bg-surface-container-low px-3 py-1.5 rounded-xl border border-surface-container-highest">
          <span className="text-primary-container font-code-md text-code-md font-bold">&gt;</span>
          <span className="font-code-md text-code-md text-tertiary-fixed select-none">gitread analyze</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="owner/repo or GitHub URL..."
            className="bg-transparent font-code-md text-code-md text-on-surface focus:outline-none w-full placeholder-outline select-all"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-container hover:bg-tertiary-container text-on-primary-container px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing</span>
              </>
            ) : (
              <span>Synthesize</span>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3">
          {metadata && (
            <a
              href={`https://github.com/${metadata.owner}/${metadata.repo}`}
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center space-x-1.5 text-xs text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-lg border border-surface-container-highest hover:text-on-surface transition-colors"
            >
              <span>{metadata.owner}/{metadata.repo}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Status:</span>
            <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-code-sm text-code-sm border border-surface-container-highest">synced</span>
          </div>
        </div>
      </header>

      {/* Popular Example Pills subbar */}
      <div className="ml-64 pt-16 bg-surface-container-lowest border-b border-surface-container-highest px-6 py-2.5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-on-surface-variant font-medium mr-1">Popular Examples:</span>
        {sampleRepos.map(sample => (
          <button
            key={sample.url}
            type="button"
            onClick={() => {
              setCurrentUrlInput(sample.url);
              setInputVal(sample.url);
              onFetchRepo(sample.url);
            }}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface-variant hover:text-on-surface rounded-lg transition-colors flex items-center space-x-1"
          >
            <span>{sample.label}</span>
            <span className="text-[10px] text-outline">({sample.url})</span>
          </button>
        ))}
      </div>
    </>
  );
};
