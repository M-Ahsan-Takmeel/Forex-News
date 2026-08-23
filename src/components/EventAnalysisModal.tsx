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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="event-analysis-modal-panel"
        className="w-full max-w-2xl bg-[#0A0A0A] rounded-lg shadow-2xl overflow-hidden border border-[#242424] text-[#A0A0A0] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242424] bg-[#101010] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-[#151515] border border-[#242424] text-[#3B82F6]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-1.5 py-0.2 rounded-xs">
                Economic Indicator Intelligence
              </span>
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#F2F2F2] leading-tight mt-0.5">
                {event.eventName}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-event-modal"
            onClick={onClose}
            className="p-1.5 rounded border border-[#242424] text-[#777777] hover:text-[#F2F2F2] hover:bg-[#151515] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#101010] p-3.5 rounded border border-[#242424]">
            <div>
              <span className="font-mono text-[#777777] text-[10px] uppercase block mb-0.5">Country & Currency</span>
              <div className="flex items-center gap-1.5 font-semibold text-[#F2F2F2]">
                <Globe className="w-3.5 h-3.5 text-[#777777]" />
                <span>{event.country}</span>
                <span className="font-mono text-[#3B82F6] font-bold">({event.currency})</span>
              </div>
            </div>

            <div>
              <span className="font-mono text-[#777777] text-[10px] uppercase block mb-0.5">Timing & Status</span>
              <div className="flex items-center gap-1.5 font-semibold">
                {event.status === 'released' ? (
                  <span className="text-[#3B82F6] font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Released
                  </span>
                ) : (
                  <span className="text-[#F59E0B] font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {event.time}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="font-mono text-[#777777] text-[10px] uppercase block mb-0.5">Consensus Forecast</span>
              <span className="font-mono font-bold text-[#F2F2F2]">{event.forecast || 'N/A'}</span>
            </div>

            <div>
              <span className="font-mono text-[#777777] text-[10px] uppercase block mb-0.5">
                {event.status === 'released' ? 'Actual Value' : 'Previous Value'}
              </span>
              <span className="font-mono font-bold text-[#F2F2F2]">
                {event.status === 'released' ? event.actual : event.previous}
              </span>
            </div>
          </div>

          {/* Deviation note if released */}
          {event.deviationNote && (
            <div className={`p-2.5 rounded text-xs font-mono font-medium border ${
              event.deviation === 'better_than_expected'
                ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                : event.deviation === 'worse_than_expected'
                ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                : 'bg-[#101010] text-[#A0A0A0] border-[#242424]'
            }`}>
              <span className="font-bold uppercase">Release Result: </span>
              {event.deviationNote}
            </div>
          )}

          {/* Section 1: What it measures */}
          <div className="space-y-1.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              1. What This Indicator Measures
            </h3>
            <div className="p-3.5 rounded bg-[#101010] border border-[#242424] text-xs sm:text-sm text-[#F2F2F2] leading-relaxed">
              {exp.whatItMeasures}
            </div>
          </div>

          {/* Section 2: Why it matters */}
          <div className="space-y-1.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              2. Why It Matters To Financial Markets
            </h3>
            <div className="p-3.5 rounded bg-[#101010] border border-[#242424] text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
              {exp.whyItMatters}
            </div>
          </div>

          {/* Section 3: Scenarios: Higher vs Lower Than Expected */}
          <div className="space-y-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777]">
              3. Market Reaction Scenarios (Educational Guide)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Higher than expected */}
              <div className="p-3 rounded bg-[#101010] border border-[#242424] space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#3B82F6]">
                  <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Higher Than Expected Result</span>
                </div>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  {exp.higherThanExpectedImpact}
                </p>
              </div>

              {/* Lower than expected */}
              <div className="p-3 rounded bg-[#101010] border border-[#242424] space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#EF4444]">
                  <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Lower Than Expected Result</span>
                </div>
                <p className="text-xs text-[#A0A0A0] leading-relaxed">
                  {exp.lowerThanExpectedImpact}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Sensitive Markets */}
          <div className="space-y-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Commonly Sensitive Markets & Currencies</span>
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {exp.sensitiveMarkets?.map((m, idx) => (
                <span
                  key={idx}
                  className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-xs bg-[#151515] text-[#F2F2F2] border border-[#242424]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Footer controls & disclaimer */}
          <div className="pt-3 border-t border-[#242424] flex items-center justify-between">
            <button
              id="btn-reanalyze-event"
              onClick={handleRefreshAnalysis}
              disabled={loading}
              className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#F2F2F2] hover:text-white bg-[#151515] hover:bg-[#202020] border border-[#242424] px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing with AI...' : 'Regenerate Analysis'}</span>
            </button>

            <div className="flex items-center gap-1 font-mono text-[10px] text-[#777777]">
              <Info className="w-3.5 h-3.5 text-[#555555]" />
              <span>Economic Educational Intelligence</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

