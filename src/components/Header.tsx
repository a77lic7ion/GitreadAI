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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                README Forge
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                v2.0
              </span>
            </div>
          </div>

          {/* Repo Input Form */}
          <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-4 hidden md:flex items-center">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Paste GitHub URL or owner/repo (e.g. facebook/react)"
                className="w-full pl-10 pr-24 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Fetching</span>
                  </>
                ) : (
                  <span>Load Repo</span>
                )}
              </button>
            </div>
          </form>

          {/* Settings & My Repos Buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onOpenMyRepos}
              className="px-3 py-2 text-indigo-300 hover:text-white bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl border border-indigo-500/20 transition-all flex items-center space-x-1.5"
              title="Connect to Your GitHub Repositories"
            >
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline text-xs font-semibold">My Repos</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-3 py-2 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow"
              title="LLM Settings & Providers"
            >
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline text-xs font-semibold">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile Repo Input */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="owner/repo or URL"
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium disabled:opacity-55"
            >
              {isLoading ? 'Loading...' : 'Load'}
            </button>
          </form>
        </div>

        {/* Quick Example URL Pills / Popular Repos */}
        <div className="py-2.5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium mr-1">Popular Examples:</span>
          {sampleRepos.map(sample => (
            <button
              key={sample.url}
              type="button"
              onClick={() => {
                setCurrentUrlInput(sample.url);
                setInputVal(sample.url);
                onFetchRepo(sample.url);
              }}
              className="px-2.5 py-1 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center space-x-1"
            >
              <span>{sample.label}</span>
              <span className="text-[10px] text-slate-500">({sample.url})</span>
            </button>
          ))}
        </div>

        {/* Navigation Tabs */}
        {metadata && (
          <div className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'original'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Original README</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('analysis');
                onRunAnalysis();
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Audit & AI Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rewrite')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'rewrite'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wand2 className="w-4 h-4 text-pink-300" />
              <span>AI Rewrite Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'files'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FolderPlus className="w-4 h-4 text-emerald-300" />
              <span>Community Files & ZIP</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
