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

  // Keep editableContent in sync if rewrittenContent changes
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

  // Compute diff
  const diffParts = Diff.diffLines(originalContent, rewrittenContent || '');

  return (
    <div className="space-y-6">
      
      {/* Target Low Marks & Analysis Gaps Panel */}
      {(auditResult || aiAnalysis) && (
        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Targeted Analysis Assist</span>
              </div>
              <h3 className="text-lg font-bold text-white">Fix Low Marks, Warnings & Gaps from Audit</h3>
              <p className="text-slate-300 text-xs mt-1">
                {auditResult ? `Deterministic Score: ${auditResult.score}/100. ` : ''}Automatically inject missing badges, TOCs, and address AI-identified priority fixes into your rewritten README.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                type="button"
                onClick={onRunFixGapsDeterministic}
                className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                title="Instant algorithmic fix for low marks (0 cost)"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fix Low Marks (0 Cost)</span>
              </button>

              <button
                type="button"
                onClick={onRunFixGapsAI}
                disabled={isFixingGaps}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isFixingGaps ? 'animate-spin' : ''}`} />
                <span>{isFixingGaps ? 'Fixing with AI...' : 'Fix Gaps with AI'}</span>
              </button>
            </div>
          </div>

          {aiAnalysis && aiAnalysis.priorityFixes && aiAnalysis.priorityFixes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-indigo-500/20">
              {aiAnalysis.priorityFixes.slice(0, 4).map((fix, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-semibold text-indigo-300 block truncate">{fix.section}: {fix.issue}</span>
                  <p className="text-slate-400 text-[11px] line-clamp-2">💡 {fix.suggestedFix}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rewrite Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-pink-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wand2 className="w-4 h-4" />
              <span>AI Rewrite Studio</span>
            </div>
            <h2 className="text-xl font-bold text-white">Transform & Optimize Repository README</h2>
            <p className="text-slate-400 text-xs mt-1">
              Select a professional style mode, preserve your commands and links, and generate world-class documentation instantly.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onRunDeterministicEnhance}
              className="px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0"
              title="Instant algorithmic enhancement with zero LLM cost"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>⚡ Instant Enhance (0 Cost)</span>
            </button>

            <button
              type="button"
              onClick={onRunRewrite}
              disabled={isRewriting}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-4 h-4 ${isRewriting ? 'animate-spin' : ''}`} />
              <span>{isRewriting ? 'Generating Rewrite...' : 'Generate AI Rewrite'}</span>
            </button>
          </div>
        </div>

        {/* Style Mode Selector */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-2">Rewrite Style:</span>
          {modes.map(mode => (
            <button
              key={mode}
              onClick={() => setRewriteMode(mode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                rewriteMode === mode
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Rewritten Output Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-3.5 bg-slate-950/60 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-2 text-sm font-semibold text-slate-200">
            <Wand2 className="w-4 h-4 text-pink-400" />
            <span>Rewritten README ({rewriteMode} Style)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>

              <button
                onClick={() => setActiveTab('raw')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'raw' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Raw</span>
              </button>

              <button
                onClick={() => setActiveTab('diff')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'diff' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCommit className="w-3.5 h-3.5" />
                <span>Diff</span>
              </button>

              <button
                onClick={() => {
                  setEditableContent(rewrittenContent);
                  setActiveTab('edit');
                }}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'edit' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .md</span>
            </button>
          </div>
        </div>

        {/* Content Pane */}
        <div className="p-6 md:p-10">
          {activeTab === 'preview' && (
            <article 
              className="prose prose-invert max-w-none prose-indigo prose-headings:border-b prose-headings:border-slate-800 prose-headings:pb-2 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          )}

          {activeTab === 'raw' && (
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
              {rewrittenContent}
            </pre>
          )}

          {activeTab === 'diff' && (
            <div className="space-y-1 font-mono text-xs overflow-x-auto bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
                Green = Added lines in rewrite | Red = Removed lines from original
              </div>
              {diffParts.map((part, idx) => {
                const color = part.added 
                  ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500' 
                  : part.removed 
                  ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500' 
                  : 'text-slate-400';
                return (
                  <div key={idx} className={`p-1 whitespace-pre-wrap ${color}`}>
                    {part.value}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              <textarea
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                rows={20}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-indigo-600/25"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Edits</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
