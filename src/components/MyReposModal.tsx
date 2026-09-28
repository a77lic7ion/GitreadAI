import React, { useState, useEffect } from 'react';
import { X, FolderGit2, Star, Lock, Globe, Search, Loader2 } from 'lucide-react';
import { RepoMetadata } from '../types';

interface MyReposModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubToken: string;
  onSelectRepo: (fullName: string) => void;
}

export const MyReposModal: React.FC<MyReposModalProps> = ({
  isOpen,
  onClose,
  githubToken,
  onSelectRepo,
}) => {
  const [repos, setRepos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchMyRepos();
    }
  }, [isOpen, githubToken]);

  const fetchMyRepos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
      };
      if (githubToken && githubToken.trim() !== '') {
        headers['Authorization'] = `token ${githubToken.trim()}`;
      }

      const endpoint = githubToken 
        ? 'https://api.github.com/user/repos?sort=updated&per_page=100'
        : 'https://api.github.com/orgs/github/repos?sort=updated&per_page=30';

      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Invalid GitHub token. Please check your token in Settings.');
        }
        throw new Error(`Failed to fetch repositories: ${res.statusText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setRepos(data);
      } else {
        setRepos([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load repositories');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredRepos = repos.filter(r => 
    r.full_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              {githubToken ? 'Your GitHub Repositories' : 'GitHub Sample Repositories (Add Token in Settings for Yours)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter input */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/30">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Body list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400">Loading repositories from GitHub...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredRepos.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-xs">
              No repositories found matching your query.
            </div>
          )}

          {!isLoading && filteredRepos.map(repo => (
            <div
              key={repo.id}
              onClick={() => {
                onSelectRepo(repo.full_name);
                onClose();
              }}
              className="p-3.5 bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800/80 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1 pr-4 truncate">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                    {repo.full_name}
                  </span>
                  {repo.private ? (
                    <span className="flex items-center space-x-1 text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="w-3 h-3" />
                      <span>Private</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Globe className="w-3 h-3" />
                      <span>Public</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {repo.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400 shrink-0">
                {repo.language && (
                  <span className="hidden sm:inline px-2 py-0.5 bg-slate-900 rounded text-[10px] text-indigo-300">
                    {repo.language}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{repo.stargazers_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs text-slate-400">
          <span>{!githubToken ? 'Tip: Add a GitHub Token in Settings to load all your private and public repos.' : `Loaded ${repos.length} repositories`}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
