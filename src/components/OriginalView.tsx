import React, { useState } from 'react';
import { 
  Star, 
  GitFork, 
  AlertCircle, 
  Code, 
  ShieldCheck, 
  BookOpen, 
  Copy, 
  Check, 
  Download, 
  FileCode,
  Eye
} from 'lucide-react';
import { RepoMetadata } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface OriginalViewProps {
  metadata: RepoMetadata;
  readmeContent: string;
  readmePath: string;
}

export const OriginalView: React.FC<OriginalViewProps> = ({
  metadata,
  readmeContent,
  readmePath,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([readmeContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = readmePath || 'README.md';
    a.click();
  };

  // Render marked HTML securely
  const sanitizedHtml = DOMPurify.sanitize(marked.parse(readmeContent) as string);

  return (
    <div className="space-y-6">
      
      {/* Repository Metadata Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Repository Overview</span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {metadata.owner}/{metadata.repo}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-3xl">
              {metadata.description || 'No repository description provided.'}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white">{metadata.stars.toLocaleString()}</span>
              <span className="text-slate-500">stars</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <GitFork className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">{metadata.forks.toLocaleString()}</span>
              <span className="text-slate-500">forks</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <AlertCircle className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-semibold text-white">{metadata.openIssues.toLocaleString()}</span>
              <span className="text-slate-500">issues</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white font-medium">{metadata.language}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-white font-medium">{metadata.license || 'No License'}</span>
            </div>
          </div>

        </div>

        {/* Topics / Tags */}
        {metadata.topics && metadata.topics.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-xs text-slate-500 font-medium mr-2">Topics:</span>
            {metadata.topics.map(topic => (
              <span key={topic} className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-full text-xs">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* README Document Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Document Toolbar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <FileCode className="w-4 h-4 text-indigo-400" />
            <span>{readmePath}</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Toggle Preview / Raw */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center space-x-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Rendered</span>
              </button>

              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === 'raw'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw Markdown</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Document Content */}
        <div className="p-6 md:p-10">
          {viewMode === 'preview' ? (
            <article 
              className="prose prose-invert max-w-none prose-indigo prose-headings:border-b prose-headings:border-slate-800 prose-headings:pb-2 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {readmeContent}
            </pre>
          )}
        </div>

      </div>

    </div>
  );
};
