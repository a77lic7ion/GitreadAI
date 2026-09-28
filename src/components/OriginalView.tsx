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

  const sanitizedHtml = DOMPurify.sanitize(marked.parse(readmeContent) as string);

  return (
    <div className="space-y-6">
      
      {/* Repository Metadata Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
              <BookOpen className="w-4 h-4" />
              <span>Repository Overview</span>
            </div>
            <h1 className="text-2xl font-normal text-on-surface font-headline-lg">
              {metadata.owner}/{metadata.repo}
            </h1>
            <p className="text-on-surface-variant text-sm mt-1 max-w-3xl font-body-md">
              {metadata.description || 'No repository description provided.'}
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface-variant font-label-sm">
              <Star className="w-3.5 h-3.5 text-tertiary" />
              <span className="font-semibold text-on-surface">{metadata.stars.toLocaleString()}</span>
              <span className="text-outline">stars</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface-variant font-label-sm">
              <GitFork className="w-3.5 h-3.5 text-primary-container" />
              <span className="font-semibold text-on-surface">{metadata.forks.toLocaleString()}</span>
              <span className="text-outline">forks</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface-variant font-label-sm">
              <AlertCircle className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-semibold text-on-surface">{metadata.openIssues.toLocaleString()}</span>
              <span className="text-outline">issues</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface-variant font-label-sm">
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-on-surface font-medium">{metadata.language}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs text-on-surface-variant font-label-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-on-surface font-medium">{metadata.license || 'No License'}</span>
            </div>
          </div>
        </div>

        {metadata.topics && metadata.topics.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-container-highest flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-outline font-label-sm mr-2">TOPICS:</span>
            {metadata.topics.map(topic => (
              <span key={topic} className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-xs font-code-sm border border-surface-container-highest">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* README Viewer Container */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="bg-surface-container-high px-4 py-3 flex items-center justify-between border-b border-surface-container-highest">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                viewMode === 'preview'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Eye className="w-4 h-4 text-primary-container" />
              <span>Rendered Preview</span>
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                viewMode === 'raw'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <FileCode className="w-4 h-4 text-tertiary" />
              <span>Raw Markdown</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-outline font-code-sm hidden sm:inline">Path: {readmePath || 'README.md'}</span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 bg-surface-container-lowest overflow-x-auto min-h-[450px]">
          {viewMode === 'preview' ? (
            <div 
              className="prose prose-invert max-w-none font-body-md text-on-surface space-y-4"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="font-code-md text-code-md text-on-surface whitespace-pre-wrap leading-relaxed">
              {readmeContent}
            </pre>
          )}
        </div>

      </div>

    </div>
  );
};
