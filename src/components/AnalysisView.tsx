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
    if (score >= 50) return 'text-tertiary border-tertiary/30 bg-tertiary/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Summary Card: Deterministic Score & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Score Card */}
        <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <span className="text-xs uppercase font-semibold tracking-wider text-outline mb-2 font-label-sm">Deterministic Score</span>
          <div className={`w-24 h-24 rounded-lg border flex items-center justify-center text-3xl font-extrabold font-code-md ${getScoreColor(auditResult.score)} shadow-inner`}>
            {auditResult.score}/100
          </div>
          <span className="text-xs text-outline mt-3 font-body-sm">Evaluated against 10 best-practice criteria</span>
        </div>

        {/* Stats breakdown */}
        <div className="md:col-span-3 bg-surface-container-low border border-surface-container-highest rounded-lg p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-2 font-label-sm">
              <Layers className="w-4 h-4" />
              <span>Document Metrics</span>
            </div>
            <h3 className="text-lg font-normal text-on-surface font-headline-lg">README Structure Analysis</h3>
            <p className="text-on-surface-variant text-xs mt-1 font-body-md">
              Instant static checks on headings, code examples, badges, and structural readiness.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface-container-highest">
            <div>
              <span className="block text-[11px] text-outline font-label-sm">Word Count</span>
              <span className="text-lg font-bold text-on-surface font-code-md">{auditResult.wordCount.toLocaleString()}</span>
            </div>
            <div>
              <span className="block text-[11px] text-outline font-label-sm">Headings</span>
              <span className="text-lg font-bold text-on-surface font-code-md">{auditResult.headingCount}</span>
            </div>
            <div>
              <span className="block text-[11px] text-outline font-label-sm">Code Blocks</span>
              <span className="text-lg font-bold text-on-surface font-code-md">{auditResult.codeBlockCount}</span>
            </div>
            <div>
              <span className="block text-[11px] text-outline font-label-sm">Images/GIFs</span>
              <span className="text-lg font-bold text-on-surface font-code-md">{auditResult.imageCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* AI Analysis Section */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-container-highest">
          <div>
            <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
              <Sparkles className="w-4 h-4" />
              <span>Deep AI Analysis</span>
            </div>
            <h2 className="text-lg font-normal text-on-surface font-headline-lg">AI Documentation Insights & Recommendations</h2>
          </div>

          <button
            type="button"
            onClick={onRunAIAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-primary-container hover:bg-tertiary-container text-on-primary-container rounded text-xs font-bold shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing with AI...' : 'Run Deep AI Analysis'}</span>
          </button>
        </div>

        {aiAnalysis ? (
          <div className="space-y-6">
            
            {/* Summary */}
            <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-4">
              <span className="text-xs uppercase font-semibold text-tertiary tracking-wider font-label-sm">Executive Summary</span>
              <p className="text-on-surface text-sm mt-1.5 leading-relaxed font-body-md">{aiAnalysis.summary}</p>
            </div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5 font-label-sm">
                  <Award className="w-4 h-4" />
                  <span>Key Strengths</span>
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded border border-surface-container-highest">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wider flex items-center space-x-1.5 font-label-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Gaps & Weaknesses</span>
                </h4>
                <ul className="space-y-2">
                  {aiAnalysis.gaps.map((gap, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded border border-surface-container-highest">
                      <XCircle className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Priority Fixes */}
            <div className="space-y-3 pt-4 border-t border-surface-container-highest">
              <h4 className="text-xs font-semibold text-primary-container uppercase tracking-wider flex items-center space-x-1.5 font-label-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Actionable Priority Fixes</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiAnalysis.priorityFixes.map((fix, idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-surface-container-highest rounded p-4 space-y-2">
                    <span className="inline-block px-2 py-0.5 bg-surface-container text-primary-container text-[10px] font-bold rounded font-code-sm">
                      {fix.section}
                    </span>
                    <p className="text-xs font-semibold text-on-surface">{fix.issue}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">💡 {fix.suggestedFix}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-primary-container mx-auto opacity-60" />
            <h4 className="text-sm font-semibold text-on-surface">No AI Analysis Run Yet</h4>
            <p className="text-xs text-outline max-w-md mx-auto">
              Click &quot;Run Deep AI Analysis&quot; above to have your configured LLM inspect documentation clarity, tone, gaps, and priority recommendations.
            </p>
          </div>
        )}

      </div>

      {/* Deterministic Checklist */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center space-x-2 text-primary-container text-xs font-semibold uppercase tracking-wider mb-1 font-label-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Best-Practice Audit Checklist</span>
          </div>
          <h3 className="text-lg font-normal text-on-surface font-headline-lg">Standard Repository Criteria</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {auditResult.items.map(item => (
            <div 
              key={item.id} 
              className={`p-3.5 rounded border flex items-start space-x-3 ${
                item.status === 'pass' 
                  ? 'bg-surface-container-lowest border-surface-container-highest text-on-surface' 
                  : 'bg-surface-container-lowest border-tertiary/30 text-on-surface'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-tertiary" />
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface">{item.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-code-sm ${
                    item.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-tertiary/10 text-tertiary'
                  }`}>
                    {item.status === 'pass' ? 'PASS' : 'WARNING'}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
