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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-highest bg-surface-container-lowest">
          <div className="flex items-center space-x-2">
            <FolderGit2 className="w-5 h-5 text-primary-container" />
            <h2 className="text-base font-normal text-on-surface font-headline-lg">
              {githubToken ? 'Your GitHub Repositories' : 'GitHub Sample Repositories (Add Token in Settings for Yours)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1.5 rounded hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter input */}
        <div className="p-4 border-b border-surface-container-highest bg-surface-container-lowest/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-outline" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter repositories..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface placeholder-outline focus:outline-none focus:border-primary-container font-code-md"
            />
          </div>
        </div>

        {/* Repo List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-surface-container-lowest">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 text-primary-container animate-spin" />
              <span className="text-xs text-outline font-label-sm">Fetching repositories from GitHub...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded p-4 text-red-300 text-xs text-center">
              {error}
            </div>
          )}

          {!isLoading && !error && filteredRepos.length === 0 && (
            <div className="text-center py-16 text-outline text-xs">
              No repositories found.
            </div>
          )}

          {!isLoading && !error && filteredRepos.map(repo => (
            <div
              key={repo.id}
              onClick={() => {
                onSelectRepo(repo.full_name);
                onClose();
              }}
              className="bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded p-4 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="space-y-1 pr-4">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-on-surface text-sm font-code-md group-hover:text-primary-container transition-colors">
                    {repo.full_name}
                  </span>
                  {repo.private ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-outline" />
                  )}
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 font-body-md">
                  {repo.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0 text-xs text-outline font-code-sm">
                {repo.language && (
                  <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant">
                    {repo.language}
                  </span>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-tertiary" />
                  <span>{repo.stargazers_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
