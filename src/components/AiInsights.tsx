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
  Target,
  Compass,
  Cpu
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
          bg: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />,
          label: 'Bullish Bias'
        };
      case 'bearish':
        return {
          bg: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
          icon: <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />,
          label: 'Bearish Bias'
        };
      case 'neutral':
        return {
          bg: 'bg-[#151515] text-[#A0A0A0] border-[#242424]',
          icon: <Minus className="w-3.5 h-3.5 text-[#777777]" />,
          label: 'Neutral / Balanced'
        };
      default:
        return {
          bg: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30',
          icon: <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />,
          label: 'Unclear'
        };
    }
  };

  return (
    <div id="ai-insights-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#101010] rounded-lg border border-[#242424] p-5 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded-xs border border-[#3B82F6]/20 font-semibold">
                REASONING ENGINE
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] tracking-tight mt-1">
              AI Financial Intelligence & Synthesized Insights
            </h1>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-[#A0A0A0] bg-[#050505] px-2.5 py-1 rounded border border-[#242424]">
            <Target className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Profile Lens: {preferences.selectedCurrencies.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed max-w-3xl">
          Ask complex macroeconomic questions to understand global capital flows, central bank transmission mechanisms, policy ripple effects, and cross-asset sensitivities.
        </p>

        {/* Search / Ask Question Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuery(query);
          }}
          className="pt-1"
        >
          <div className="relative flex items-center">
            <input
              id="input-ai-intelligence-query"
              type="text"
              placeholder="e.g. How does persistent UK services inflation affect the Bank of England and Gilt yields?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-28 py-2.5 bg-[#050505] border border-[#242424] rounded-md text-xs sm:text-sm text-[#F2F2F2] placeholder-[#555555] focus:outline-none focus:border-[#3B82F6]"
            />
            <Search className="w-4 h-4 text-[#777777] absolute left-3" />
            <button
              id="btn-submit-ai-query"
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-1.5 py-1.5 px-3 rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="font-mono text-[11px]">Reasoning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span className="font-mono text-[11px]">Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset Prompt Buttons */}
        <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-mono text-[10px] uppercase text-[#777777] flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-[#F59E0B]" />
            <span>Suggested Inquiries:</span>
          </span>
          {tailoredPresets.map((preset, idx) => (
            <button
              key={idx}
              id={`btn-preset-query-${idx}`}
              onClick={() => handleAskQuery(preset.query)}
              className="px-2 py-0.5 rounded bg-[#151515] hover:bg-[#202020] text-[#A0A0A0] hover:text-[#F2F2F2] border border-[#242424] text-xs transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Query Result Card */}
      {error && (
        <div className="p-4 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium">
          {error}
        </div>
      )}

      {loading && (
        <div className="p-12 text-center text-[#777777] bg-[#101010] rounded-lg border border-[#242424] space-y-3">
          <div className="w-9 h-9 rounded-full bg-[#151515] border border-[#242424] text-[#3B82F6] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-[#F2F2F2] text-sm">Synthesizing Macroeconomic Intelligence...</h3>
          <p className="font-mono text-xs text-[#777777] max-w-md mx-auto">
            Cross-referencing verified news developments, central bank statements, and asset sensitivity models.
          </p>
        </div>
      )}

      {answer && !loading && (
        <div id="ai-answer-card" className="bg-[#101010] rounded-lg border border-[#242424] p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242424]">
            <div className="space-y-1">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.2 rounded-xs border border-[#3B82F6]/20">
                SYNTHESIS OUTPUT
              </span>
              <h2 className="font-bold text-base text-[#F2F2F2]">{answer.query}</h2>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-[#A0A0A0]">
                <span className="font-mono text-[10px] text-[#777777] uppercase">Horizon:</span>
                <span className="font-mono text-xs capitalize bg-[#151515] px-2 py-0.5 rounded text-[#F2F2F2] border border-[#242424]">
                  {answer.timeHorizon}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[#A0A0A0]">
                <span className="font-mono text-[10px] text-[#777777] uppercase">Confidence:</span>
                <span className={`font-mono text-xs capitalize px-2 py-0.5 rounded border ${
                  answer.confidence === 'high' ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                }`}>
                  {answer.confidence}
                </span>
              </div>
            </div>
          </div>

          {/* Direct Answer */}
          <div className="space-y-1.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Core Finding</span>
            </h3>
            <div className="p-4 rounded bg-[#0A0A0A] border border-[#242424] text-xs sm:text-sm text-[#F2F2F2] leading-relaxed font-editorial text-[15px]">
              {answer.directAnswer}
            </div>
          </div>

          {/* Why It Matters */}
          <div className="space-y-1.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>Transmission Mechanism & Significance</span>
            </h3>
            <div className="p-4 rounded bg-[#0A0A0A] border border-[#242424] text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
              {answer.whyItMatters}
            </div>
          </div>

          {/* Affected Assets Grid */}
          <div className="space-y-2.5">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#777777]" />
              <span>Asset Class Sensitivity Matrix</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {answer.affectedAssets?.map((asset, i) => {
                const badge = getDirectionBadge(asset.direction);
                return (
                  <div key={i} className="p-3.5 rounded bg-[#0A0A0A] border border-[#242424] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#F2F2F2]">{asset.name}</span>
                        <span className="font-mono text-[9px] px-1 py-0.2 rounded-xs bg-[#151515] text-[#777777] border border-[#242424]">
                          {asset.category}
                        </span>
                      </div>
                      <span className={`font-mono inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs text-[10px] font-semibold border ${badge.bg}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed">{asset.reason}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sources Cited */}
          {answer.sourcesCited && answer.sourcesCited.length > 0 && (
            <div className="pt-2 border-t border-[#242424] flex items-center gap-2 flex-wrap text-xs text-[#777777]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#777777]" />
              <span className="font-mono text-[10px] uppercase text-[#A0A0A0]">Source Pillars:</span>
              {answer.sourcesCited.map((src, i) => (
                <span key={i} className="font-mono text-[10px] px-1.5 py-0.2 rounded-xs bg-[#151515] text-[#A0A0A0] border border-[#242424]">
                  {src}
                </span>
              ))}
            </div>
          )}

          {/* Educational Note */}
          <div className="p-2.5 rounded bg-[#050505] border border-[#242424] text-[10px] text-[#777777] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#555555] shrink-0 mt-0.5" />
            <p>
              AI interpretations are structured educational summaries designed to clarify economic relationships. They do not constitute investment advice or trading signals.
            </p>
          </div>
        </div>
      )}

      {/* Thematic Deep-Dive Reports */}
      <div className="space-y-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-[#777777]" />
          <span>Thematic Macro Intelligence Briefings</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            id="thematic-card-1"
            onClick={() => handleAskQuery('Explain the divergence in monetary policy between the Federal Reserve, ECB, and Bank of Japan.')}
            className="p-4 rounded-lg border border-[#242424] bg-[#101010] hover:border-[#3B82F6]/50 transition-all cursor-pointer space-y-2 group"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.2 rounded-xs border border-[#3B82F6]/20">
              Monetary Policy
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-[#F2F2F2] group-hover:text-white transition-colors">
              Central Bank Easing Divergence & Yield Curves
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              How differing growth speeds in the US, Europe, and Japan are shifting foreign exchange rates and sovereign debt spreads.
            </p>
            <span className="text-[#3B82F6] font-mono text-[10px] font-semibold inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            id="thematic-card-2"
            onClick={() => handleAskQuery('Analyze the macroeconomic impact of OPEC+ production caps on energy inflation and transportation sectors.')}
            className="p-4 rounded-lg border border-[#242424] bg-[#101010] hover:border-[#3B82F6]/50 transition-all cursor-pointer space-y-2 group"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.2 rounded-xs border border-[#F59E0B]/20">
              Energy & Commodities
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-[#F2F2F2] group-hover:text-white transition-colors">
              OPEC+ Supply Discipline vs Demand Fatigue
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Evaluating how 2.2M bpd voluntary crude curbs create price floors and affect central bank disinflation timelines.
            </p>
            <span className="text-[#3B82F6] font-mono text-[10px] font-semibold inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

          <div
            id="thematic-card-3"
            onClick={() => handleAskQuery('What are the cross-sector effects of record AI compute infrastructure capex on semiconductor supply chains and utilities?')}
            className="p-4 rounded-lg border border-[#242424] bg-[#101010] hover:border-[#3B82F6]/50 transition-all cursor-pointer space-y-2 group"
          >
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#3B82F6] bg-[#3B82F6]/10 px-1.5 py-0.2 rounded-xs border border-[#3B82F6]/20">
              Tech & Infrastructure
            </span>
            <h3 className="font-bold text-xs sm:text-sm text-[#F2F2F2] group-hover:text-white transition-colors">
              Hyperscaler AI Capex & Power Grid Demands
            </h3>
            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              Examining the tangible macroeconomic ripple effects of $210B+ infrastructure buildouts on energy utilities and silicon foundries.
            </p>
            <span className="text-[#3B82F6] font-mono text-[10px] font-semibold inline-flex items-center gap-1 pt-1">
              <span>Read Intelligence Briefing</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


