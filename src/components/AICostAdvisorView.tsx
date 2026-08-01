import React, { useState } from 'react';
import { AICostAdvice, InventoryItem, CostSummaryMetrics } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Layers
} from 'lucide-react';

interface AICostAdvisorViewProps {
  advices: AICostAdvice[];
  inventory: InventoryItem[];
  metrics: CostSummaryMetrics;
  selectedStoreId: string;
  onApplyAdvice: (advice: AICostAdvice) => void;
  onSetAdvices: (advices: AICostAdvice[]) => void;
}

export const AICostAdvisorView: React.FC<AICostAdvisorViewProps> = ({
  advices,
  inventory,
  metrics,
  selectedStoreId,
  onApplyAdvice,
  onSetAdvices,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedAdviceIds, setAppliedAdviceIds] = useState<Set<string>>(new Set());

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/analyze-costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory,
          metrics,
          selectedStore: selectedStoreId === 'ALL' ? 'Global Apple Stores' : selectedStoreId,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        const mapped: AICostAdvice[] = data.recommendations.map((item: any, idx: number) => ({
          id: `gemini-adv-${Date.now()}-${idx}`,
          title: item.title,
          category: item.category || 'Holding Cost',
          impactAmount: item.impactAmount || 1500,
          impactType: item.impactType || 'savings',
          urgency: item.urgency || 'high',
          description: item.description,
          actionItem: item.actionItem,
          relatedSku: item.relatedSku,
          suggestedAction: item.relatedSku ? {
            type: item.category === 'Stockout Risk' ? 'reorder' : 'transfer',
            sku: item.relatedSku,
            qty: 20,
          } : undefined,
        }));

        onSetAdvices(mapped);
      }
    } catch (err: any) {
      console.error('Gemini AI Cost Analysis error:', err);
      setError('Unable to fetch live AI recommendations. Please check server Gemini API key.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = (adv: AICostAdvice) => {
    onApplyAdvice(adv);
    setAppliedAdviceIds((prev) => new Set(prev).add(adv.id));
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            CRITICAL COST IMPACT
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            OPTIMIZATION OPPORTUNITY
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/60 to-blue-950/80 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                POWERED BY GEMINI 3.6 FLASH
              </span>
              <span className="text-xs text-slate-400">Apple Retail Supply Intelligence</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
              AI Inventory & Carrying Cost Optimizer
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Analyzes device stock velocities, holding fee rates, and vault dwell times to provide automated financial saving recommendations.
            </p>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Analyzing Inventory...' : 'Re-Run Gemini AI Audit'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-4 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">Dismiss</button>
        </div>
      )}

      {/* AI Recommendations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Actionable Savings & Optimization Directives ({advices.length})</span>
          </h3>
        </div>

        {advices.map((adv) => {
          const isApplied = appliedAdviceIds.has(adv.id);

          return (
            <div
              key={adv.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 shadow-xl transition space-y-3 ${
                isApplied ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  {getUrgencyBadge(adv.urgency)}
                  <span className="text-xs font-mono text-slate-400">[{adv.category}]</span>
                </div>

                <div className="font-mono text-sm font-extrabold text-right">
                  {adv.impactType === 'savings' && (
                    <span className="text-emerald-400">+{formatCurrency(adv.impactAmount)} Savings</span>
                  )}
                  {adv.impactType === 'revenue_risk' && (
                    <span className="text-rose-400">{formatCurrency(adv.impactAmount)} At Risk</span>
                  )}
                  {adv.impactType === 'margin_boost' && (
                    <span className="text-cyan-400">+{formatCurrency(adv.impactAmount)} Margin Boost</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-white">{adv.title}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{adv.description}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
                    Recommended Action
                  </span>
                  <p className="text-slate-200 font-medium mt-0.5">{adv.actionItem}</p>
                </div>

                {adv.suggestedAction && (
                  <button
                    onClick={() => handleExecute(adv)}
                    disabled={isApplied}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shrink-0 ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 active:scale-95'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span>Directive Applied</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>Execute Directive</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
