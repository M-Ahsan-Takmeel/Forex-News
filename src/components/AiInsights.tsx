import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { askIntelligenceQuery } from '../services/api';
import { IntelligenceAnswer } from '../types';
import {
  Sparkles,
  Search,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  ShieldCheck,
  Clock,
  Layers,
  BookOpen,
  Info,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
  Target
} from 'lucide-react';

const BASE_PRESET_QUERIES = [
  {
    title: 'US Core CPI Impact',
    query: 'How does US Core CPI beating or missing forecast affect the US Dollar, S&P 500, and Gold?'
  },
  {
    title: 'Bank of Japan & Carry Trades',
    query: 'Why is Bank of Japan interest rate policy causing volatility in global carry trades and USD/JPY?'
  },
  {
    title: 'Tech Hyperscaler AI Capex',
    query: 'What does record $210B cloud hyperscaler capex mean for semiconductor suppliers and electrical utilities?'
  },
  {
    title: 'OPEC+ Output Strategy',
    query: 'How do OPEC+ voluntary production cuts influence headline inflation and petrocurrencies like CAD and NOK?'
  }
];

export const AiInsights: React.FC = () => {
  const { preferences, recordInteraction } = useApp();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<IntelligenceAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generate personalized suggested queries based on user's tracked currencies/topics
  const tailoredPresets = React.useMemo(() => {
    const custom: { title: string; query: string }[] = [];

    if (preferences.selectedCurrencies.includes('EUR') || preferences.selectedTopics.includes('Central Banks')) {
      custom.push({
        title: 'ECB Rate Cuts & EUR/USD',
        query: 'What is the macroeconomic outlook for ECB interest rate reductions and EUR/USD parity?'
      });
    }

    if (preferences.selectedTopics.includes('Inflation') || preferences.selectedCurrencies.includes('GBP')) {
      custom.push({
        title: 'UK Services Inflation & Gilts',
        query: 'How is sticky UK services inflation impacting Bank of England policy and 10-year Gilt yields?'
      });
    }

    if (preferences.selectedMarkets.includes('Commodities') || preferences.selectedTopics.includes('Energy')) {
      custom.push({
        title: 'Crude Oil & Transportation',
        query: 'How do crude oil price swings transmit through transportation equities and core producer prices?'
      });
    }

    return custom.length > 0 ? [...custom, ...BASE_PRESET_QUERIES.slice(0, 2)] : BASE_PRESET_QUERIES;
  }, [preferences]);

  const handleAskQuery = async (questionText: string) => {
    if (!questionText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setQuery(questionText);
      const res = await askIntelligenceQuery(questionText, preferences);
      setAnswer(res.answer);
    } catch (err: any) {
      console.error('Failed to run AI intelligence query', err);
      setError('Failed to generate intelligence response. Please check server connection.');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Bullish Bias'
        };
      case 'bearish':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          label: 'Bearish Bias'
        };
      case 'neutral':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Minus className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Neutral / Balanced'
        };
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <HelpCircle className="w-3.5 h-3.5 text-amber-500" />,
          label: 'Unclear'
        };
    }
  };

  return (
    <div id="ai-insights-section" className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Macro Intelligence & Reasoning Engine
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                AI Financial Intelligence & Synthesized Insights
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile Lens: {preferences.selectedCurrencies.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
          Ask complex macroeconomic questions to understand global capital flows, central bank transmission mechanisms, policy ripple effects, and cross-asset sensitivities.
        </p>

        {/* Search / Ask Question Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuery(query);
          }}
          className="pt-2"
        >
          <div className="relative flex items-center">
            <input
              id="input-ai-intelligence-query"
              type="text"
              placeholder="e.g. How does persistent UK services inflation affect the Bank of England and Gilt yields?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <button
              id="btn-submit-ai-query"
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2 py-1.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Prompt Buttons */}
        <div className="pt-2 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Suggested Inquiries:</span>
          </span>
          {tailoredPresets.map((preset, idx) => (
            <button
              key={idx}
              id={`btn-preset-query-${idx}`}
              onClick={() => handleAskQuery(preset.query)}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Card */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">Synthesizing Macroeconomic Intelligence...</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cross-referencing verified news developments, central bank statements, and asset sensitivity models.
          </p>
        </div>
      )}

      {answer && !loading && (
        <div id="ai-answer-card" className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Intelligence Synthesis
              </span>
              <h2 className="font-bold text-base text-slate-900">{answer.query}</h2>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Horizon:</span>
                <span className="font-bold capitalize bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                  {answer.timeHorizon}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <span className="text-slate-400">Confidence:</span>
                <span className={`font-bold capitalize px-2 py-0.5 rounded border ${
                  answer.confidence === 'high' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {answer.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Answer */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Core Macroeconomic Finding (What Happened / What It Is)</span>
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed font-normal">
              {answer.directAnswer}
            </div>
          </div>

          {/* Why It Matters */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Why It Matters (Transmission Mechanism & Market Significance)</span>
            </h3>
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 text-sm text-slate-800 leading-relaxed">
              {answer.whyItMatters}
            </div>
          </div>

          {/* Affected Assets Grid */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>Potential Market & Asset Class Impacts</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {answer.affectedAssets?.map((asset, i) => {
                const badge = getDirectionBadge(asset.direction);
                return (
                  <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{asset.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {asset.category}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badge.bg}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{asset.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources Cited */}
          {answer.sourcesCited && answer.sourcesCited.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">Source Pillars:</span>
              {answer.sourcesCited.map((src, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {src}
                </span>
              ))}
            </div>
          )}

          {/* Educational Note */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              AI interpretations are structured educational summaries designed to clarify economic relationships. They do not constitute investment advice or trading signals.
            </p>
          </div>
        </div>
      )}

      {/* Thematic Deep-Dive Reports */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-slate-700" />
          <span>Thematic Macro Intelligence Briefings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            id="thematic-card-1"
            onClick={() => handleAskQuery('Explain the divergence in monetary policy between the Federal Reserve, ECB, and Bank of Japan.')}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Monetary Policy
            </span>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-950">
              Central Bank Easing Divergence & Yield Curves
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              How differing growth speeds in the US, Europe, and Japan are shifting foreign exchange rates and sovereign debt spreads.
            </p>
            <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            id="thematic-card-2"
            onClick={() => handleAskQuery('Analyze the macroeconomic impact of OPEC+ production caps on energy inflation and transportation sectors.')}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
              Energy & Commodities
            </span>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-950">
              OPEC+ Supply Discipline vs Demand Fatigue
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluating how 2.2M bpd voluntary crude curbs create price floors and affect central bank disinflation timelines.
            </p>
            <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            id="thematic-card-3"
            onClick={() => handleAskQuery('What are the cross-sector effects of record AI compute infrastructure capex on semiconductor supply chains and utilities?')}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
              Tech & Infrastructure
            </span>
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-950">
              Hyperscaler AI Capex & Power Grid Demands
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examining the tangible macroeconomic ripple effects of $210B+ infrastructure buildouts on energy utilities and silicon foundries.
            </p>
            <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

