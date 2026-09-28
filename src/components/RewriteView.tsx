import React, { useState } from 'react';
import { 
  Wand2, 
  Eye, 
  Code, 
  GitCommit, 
  Copy, 
  Check, 
  Download, 
  RefreshCw, 
  Edit3, 
  Save, 
  Sparkles,
  Zap
} from 'lucide-react';
import { RewriteMode, RepoMetadata, AuditResult, AIAnalysisResult } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import * as Diff from 'diff';

interface RewriteViewProps {
  metadata: RepoMetadata;
  originalContent: string;
  rewrittenContent: string;
  setRewrittenContent: (content: string) => void;
  rewriteMode: RewriteMode;
  setRewriteMode: (mode: RewriteMode) => void;
  isRewriting: boolean;
  onRunRewrite: () => void;
  onRunDeterministicEnhance: () => void;
  onRunFixGapsDeterministic: () => void;
  onRunFixGapsAI: () => void;
  isFixingGaps: boolean;
  auditResult: AuditResult | null;
  aiAnalysis: AIAnalysisResult | null;
  readmePath: string;
}

export const RewriteView: React.FC<RewriteViewProps> = ({
  metadata,
  originalContent,
  rewrittenContent,
  setRewrittenContent,
  rewriteMode,
  setRewriteMode,
  isRewriting,
  onRunRewrite,
  onRunDeterministicEnhance,
  onRunFixGapsDeterministic,
  onRunFixGapsAI,
  isFixingGaps,
  auditResult,
  aiAnalysis,
  readmePath,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw' | 'diff' | 'edit'>('preview');
  const [copied, setCopied] = useState(false);
  const [editableContent, setEditableContent] = useState(rewrittenContent);

  React.useEffect(() => {
    setEditableContent(rewrittenContent);
  }, [rewrittenContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rewrittenContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = readmePath || 'README.md';
    a.click();
  };

  const handleSaveEdit = () => {
    setRewrittenContent(editableContent);
    alert('Changes saved to rewritten README.');
    setActiveTab('preview');
  };

  const modes: RewriteMode[] = [
    'Standard', 
    'Minimal', 
    'Detailed', 
    'Badge-rich', 
    'Beginner-friendly', 
    'Detailed + Badge-rich', 
    'Beginner-friendly + Detailed', 
    'Comprehensive + Badge-rich'
  ];

  const sanitizedHtml = DOMPurify.sanitize(marked.parse(rewrittenContent || '# No rewritten content yet.') as string);

  const diffParts = Diff.diffLines(originalContent, rewrittenContent || '');

  return (
    <div className="space-y-6">
      
      {/* Target Low Marks & Analysis Gaps Panel */}
      {(auditResult || aiAnalysis) && (
        <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
                <Sparkles className="w-4 h-4" />
                <span>Targeted Analysis Assist</span>
              </div>
              <h3 className="text-lg font-normal text-on-surface font-headline-lg">Fix Low Marks, Warnings & Gaps from Audit</h3>
              <p className="text-on-surface-variant text-xs mt-1 font-body-md">
                {auditResult ? `Deterministic Score: ${auditResult.score}/100. ` : ''}Automatically inject missing badges, TOCs, and address AI-identified priority fixes into your rewritten README.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={onRunFixGapsDeterministic}
                className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold transition-all flex items-center space-x-1.5"
                title="Instant algorithmic fix for low marks (0 cost)"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fix Low Marks (0 Cost)</span>
              </button>

              <button
                type="button"
                onClick={onRunFixGapsAI}
                disabled={isFixingGaps}
                className="px-4 py-2 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isFixingGaps ? 'animate-spin' : ''}`} />
                <span>{isFixingGaps ? 'Fixing with AI...' : 'Fix Gaps with AI'}</span>
              </button>
            </div>
          </div>

          {aiAnalysis && aiAnalysis.priorityFixes && aiAnalysis.priorityFixes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-surface-container-highest">
              {aiAnalysis.priorityFixes.slice(0, 4).map((fix, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-surface-container-highest rounded p-3 text-xs space-y-1">
                  <span className="font-semibold text-tertiary block truncate font-code-sm">{fix.section}: {fix.issue}</span>
                  <p className="text-on-surface-variant text-[11px] line-clamp-2">💡 {fix.suggestedFix}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewrite Controls Banner */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
              <Wand2 className="w-4 h-4" />
              <span>AI Rewrite Studio</span>
            </div>
            <h2 className="text-xl font-normal text-on-surface font-headline-lg">Transform & Optimize Repository README</h2>
            <p className="text-on-surface-variant text-xs mt-1 font-body-md">
              Select a professional style mode, preserve your commands and links, and generate world-class documentation instantly.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onRunDeterministicEnhance}
              className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-xs font-bold transition-all flex items-center space-x-2 shrink-0"
              title="Instant algorithmic enhancement with zero LLM cost"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>⚡ Instant Enhance (0 Cost)</span>
            </button>

            <button
              type="button"
              onClick={onRunRewrite}
              disabled={isRewriting}
              className="px-5 py-2.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-4 h-4 ${isRewriting ? 'animate-spin' : ''}`} />
              <span>{isRewriting ? 'Generating Rewrite...' : 'Generate AI Rewrite'}</span>
            </button>
          </div>
        </div>

        {/* Style Mode Selector */}
        <div className="pt-4 border-t border-surface-container-highest flex flex-wrap items-center gap-2">
          <span className="text-xs text-outline font-label-sm mr-2">Rewrite Style:</span>
          {modes.map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setRewriteMode(mode)}
              className={`px-3.5 py-1.5 rounded text-xs font-medium transition-all font-label-md ${
                rewriteMode === mode
                  ? 'bg-primary-container text-on-primary-container shadow-sm font-bold'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-surface-container-highest hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Workspace Tabs & Viewer Container */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg shadow-sm overflow-hidden flex flex-col">
        
        {/* Toolbar */}
        <div className="bg-surface-container-high px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-highest">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                activeTab === 'preview'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Eye className="w-4 h-4 text-primary-container" />
              <span>Rendered Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                activeTab === 'raw'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Code className="w-4 h-4 text-tertiary" />
              <span>Raw Markdown</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                activeTab === 'diff'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <span>Diff Comparison</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition-all font-label-md ${
                activeTab === 'edit'
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm border border-surface-container-highest'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Live Editor</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {activeTab === 'edit' ? (
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3.5 py-1.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center space-x-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-outline" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3 py-1.5 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export .md</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 bg-surface-container-lowest overflow-x-auto min-h-[500px]">
          {activeTab === 'preview' && (
            <div 
              className="prose prose-invert max-w-none font-body-md text-on-surface space-y-4"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          )}

          {activeTab === 'raw' && (
            <pre className="font-code-md text-code-md text-on-surface whitespace-pre-wrap leading-relaxed">
              {rewrittenContent}
            </pre>
          )}

          {activeTab === 'diff' && (
            <div className="font-code-md text-code-md space-y-1">
              <div className="text-xs text-outline pb-2 mb-2 border-b border-surface-container-highest flex items-center space-x-4">
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/40 inline-block rounded"></span><span className="text-emerald-400">Additions</span></span>
                <span className="flex items-center space-x-1"><span className="w-3 h-3 bg-red-500/20 border border-red-500/40 inline-block rounded"></span><span className="text-red-400">Deletions</span></span>
              </div>
              {diffParts.map((part, index) => {
                const color = part.added
                  ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500 pl-2'
                  : part.removed
                  ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500 pl-2 opacity-80 line-through'
                  : 'text-on-surface-variant pl-2';
                return (
                  <div key={index} className={`${color} whitespace-pre-wrap font-code-sm`}>
                    {part.value}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'edit' && (
            <textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="w-full h-[550px] bg-surface-container-low border border-surface-container-highest rounded p-4 font-code-md text-code-md text-on-surface focus:outline-none focus:border-primary-container leading-relaxed"
            />
          )}
        </div>

      </div>

    </div>
  );
};
