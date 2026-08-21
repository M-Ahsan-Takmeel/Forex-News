import React, { useState } from 'react';
import { EconomicEvent } from '../types';
import { fetchEventAnalysis } from '../services/api';
import {
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  DollarSign,
  Layers,
  RefreshCw,
  Info,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface EventAnalysisModalProps {
  event: EconomicEvent | null;
  onClose: () => void;
}

export const EventAnalysisModal: React.FC<EventAnalysisModalProps> = ({ event, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [liveExplanation, setLiveExplanation] = useState<{
    whatItMeasures: string;
    whyItMatters: string;
    higherThanExpectedImpact: string;
    lowerThanExpectedImpact: string;
    sensitiveMarkets: string[];
  } | null>(null);

  if (!event) return null;

  const handleRefreshAnalysis = async () => {
    try {
      setLoading(true);
      const res = await fetchEventAnalysis(event.id);
      setLiveExplanation(res.explanation);
    } catch (e) {
      console.error('Failed to analyze event with AI', e);
    } finally {
      setLoading(false);
    }
  };

  const exp = liveExplanation || event.aiExplanation || {
    whatItMeasures: event.description || 'Major economic indicator.',
    whyItMatters: 'Essential metric for interest rate guidance and macroeconomic forecasting.',
    higherThanExpectedImpact: 'Typically bullish for local currency and benchmark yields.',
    lowerThanExpectedImpact: 'Typically leads to dovish central bank repricing and softer yields.',
    sensitiveMarkets: [event.currency, 'Sovereign Yields', 'National Equity Index']
  };

  return (
    <div
      id="event-analysis-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="event-analysis-modal-panel"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-600 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                Economic Indicator Intelligence
              </span>
              <h2 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                {event.eventName}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-event-modal"
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Country & Currency</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>{event.country}</span>
                <span className="font-mono text-emerald-700 font-bold">({event.currency})</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Timing & Status</span>
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                {event.status === 'released' ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Released
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {event.time}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Consensus Forecast</span>
              <span className="font-mono font-bold text-slate-800">{event.forecast || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">
                {event.status === 'released' ? 'Actual Value' : 'Previous Value'}
              </span>
              <span className="font-mono font-bold text-slate-900">
                {event.status === 'released' ? event.actual : event.previous}
              </span>
            </div>
          </div>

          {/* Deviation note if released */}
          {event.deviationNote && (
            <div className={`p-3 rounded-lg text-xs font-medium border ${
              event.deviation === 'better_than_expected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : event.deviation === 'worse_than_expected'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <span className="font-bold">Release Result: </span>
              {event.deviationNote}
            </div>
          )}

          {/* Section 1: What it measures */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. What This Indicator Measures
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {exp.whatItMeasures}
            </div>
          </div>

          {/* Section 2: Why it matters */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Why It Matters To Financial Markets
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {exp.whyItMatters}
            </div>
          </div>

          {/* Section 3: Scenarios: Higher vs Lower Than Expected */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Market Reaction Scenarios (Educational Guide)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Higher than expected */}
              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Higher Than Expected Result</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {exp.higherThanExpectedImpact}
                </p>
              </div>

              {/* Lower than expected */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Lower Than Expected Result</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {exp.lowerThanExpectedImpact}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Sensitive Markets */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Commonly Sensitive Markets & Currencies</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {exp.sensitiveMarkets?.map((m, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Footer controls & disclaimer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              id="btn-reanalyze-event"
              onClick={handleRefreshAnalysis}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing with AI...' : 'Regenerate Analysis'}</span>
            </button>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>Economic Educational Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
