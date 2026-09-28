import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Layers, 
  Zap, 
  RefreshCw 
} from 'lucide-react';
import { AuditResult, AIAnalysisResult } from '../types';

interface AnalysisViewProps {
  auditResult: AuditResult;
  aiAnalysis: AIAnalysisResult | null;
  isAnalyzing: boolean;
  onRunAIAnalysis: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  auditResult,
  aiAnalysis,
  isAnalyzing,
  onRunAIAnalysis,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Summary Card: Deterministic Score & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xl">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">Deterministic Score</span>
          <div className={`w-24 h-24 rounded-2xl border-2 flex items-center justify-center text-3xl font-extrabold ${getScoreColor(auditResult.score)} shadow-inner`}>
            {auditResult.score}/100
          </div>
          <span className="text-xs text-slate-500 mt-3">Evaluated against 10 best-practice criteria</span>
        </div>

        {/* Stats breakdown */}
        <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              <span>Document Metrics</span>
            </div>
            <h3 className="text-lg font-bold text-white">README Structure Analysis</h3>
            <p className="text-slate-400 text-xs mt-1">
              Instant static checks on headings, code examples, badges, and structural readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-800">
            <div>
              <span className="block text-[11px] text-slate-400">Word Count</span>
              <span className="text-lg font-bold text-white">{auditResult.wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Headings</span>
              <span className="text-lg font-bold text-white">{auditResult.headingCount}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Code Blocks</span>
              <span className="text-lg font-bold text-white">{auditResult.codeBlockCount}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Images/GIFs</span>
              <span className="text-lg font-bold text-white">{auditResult.imageCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Analysis Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Deep AI Analysis</span>
            </div>
            <h2 className="text-lg font-bold text-white">AI Documentation Insights & Recommendations</h2>
          </div>

          <button
            onClick={onRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing with AI...' : 'Refresh AI Analysis'}</span>
          </button>
        </div>

        {aiAnalysis ? (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Executive Summary</span>
              <p className="text-slate-200 text-sm leading-relaxed">{aiAnalysis.summary}</p>
            </div>

            {/* Strengths & Gaps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Strengths */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Strengths</span>
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 space-y-3">
                <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Gaps</span>
                </h3>
                <ul className="space-y-2">
                  {aiAnalysis.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Priority Fixes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Priority Fixes & Actionable Steps</h3>
              <div className="grid grid-cols-1 gap-3">
                {aiAnalysis.priorityFixes.map((fix, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-300 rounded-full text-[11px] font-semibold">
                        {fix.section}
                      </span>
                      <p className="text-xs font-bold text-white mt-1">{fix.issue}</p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 max-w-md">
                      <span className="text-indigo-400 font-semibold block mb-0.5">Suggested Fix:</span>
                      {fix.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tone & Clarity Notes */}
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Tone & Clarity Notes</span>
              <p className="text-slate-300 text-xs">{aiAnalysis.toneClarityNotes}</p>
            </div>

          </div>
        ) : (
          <div className="text-center py-10">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-slate-300 font-medium">Click "Refresh AI Analysis" to generate deep insights using your configured LLM provider.</p>
          </div>
        )}
      </div>

      {/* Deterministic Checklist Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-white">Deterministic Best-Practice Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditResult.items.map(item => {
            const isPass = item.status === 'pass';
            const isWarning = item.status === 'warning';
            return (
              <div 
                key={item.id}
                className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  isPass
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : isWarning
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                {isPass ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : isWarning ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-full">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{item.description}</p>
                  <p className="text-[11px] text-indigo-300 font-medium pt-1">💡 {item.recommendation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
