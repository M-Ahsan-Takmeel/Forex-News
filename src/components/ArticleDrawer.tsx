import React, { useState } from 'react';
import { NewsArticle } from '../types';
import { analyzeNewsWithAI } from '../services/api';
import {
  X,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock,
  Globe,
  Layers,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  HelpCircle,
  RefreshCw,
  Info,
  CheckCircle2,
  GitCommit,
  Building2,
  Coins,
  Scale
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ArticleDrawerProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const ArticleDrawer: React.FC<ArticleDrawerProps> = ({ article, onClose }) => {
  const { isBookmarked, toggleBookmark } = useApp();
  const [analyzing, setAnalyzing] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState<{
    aiSummary: string;
    aiFacts?: string[];
    aiInterpretations?: string[];
    aiWhyItMatters: string;
    transmissionChain?: string[];
    aiMarketImpact: any[];
    aiConfidence: string;
    confidenceReasoning?: string;
    timeHorizon: string;
  } | null>(null);

  if (!article) return null;

  const bookmarked = isBookmarked(article.id);

  const handleLiveReanalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await analyzeNewsWithAI(article);
      setLiveAnalysis(res.analysis);
    } catch (e) {
      console.error('Failed to trigger live AI re-analysis', e);
    } finally {
      setAnalyzing(false);
    }
  };

  const summary = liveAnalysis?.aiSummary || article.aiSummary;
  const facts = liveAnalysis?.aiFacts || article.aiFacts || [article.title];
  const interpretations = liveAnalysis?.aiInterpretations || article.aiInterpretations || [];
  const whyItMatters = liveAnalysis?.aiWhyItMatters || article.aiWhyItMatters;
  const transmissionChain = liveAnalysis?.transmissionChain || article.transmissionChain || [];
  const marketImpact = liveAnalysis?.aiMarketImpact || article.aiMarketImpact;
  const confidence = liveAnalysis?.aiConfidence || article.aiConfidence;
  const confidenceReasoning = liveAnalysis?.confidenceReasoning || article.confidenceReasoning;
  const timeHorizon = liveAnalysis?.timeHorizon || article.timeHorizon;

  const getImportanceBadge = (lvl: string) => {
    switch (lvl) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Bullish'
        };
      case 'bearish':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <TrendingDown className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Bearish'
        };
      case 'neutral':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Minus className="w-3.5 h-3.5 text-slate-500" />,
          label: 'Neutral'
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
    <div
      id="article-intelligence-drawer-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="article-drawer-panel"
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded border uppercase tracking-wider ${getImportanceBadge(article.importance)}`}>
              {article.importance} Importance
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
              {article.category}
            </span>
            {article.country && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {article.country}
              </span>
            )}
            {article.isVerified && (
              <span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Verified ({article.independentSourcesCount || article.sources?.length || 1} sources)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-drawer-bookmark"
              onClick={() => toggleBookmark(article.id)}
              className={`p-2 rounded-lg border transition-colors ${
                bookmarked ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Save for Later'}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              id="btn-drawer-close"
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Article Title & Source info */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="font-semibold text-slate-700">Source: {article.source}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
              >
                <span>Original Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* AI Intelligence Core Card */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">AI Intelligence Breakdown</h3>
                  <p className="text-[11px] text-slate-500">Structured Fact, Macro Interpretation & Transmission Chain</p>
                </div>
              </div>

              <button
                id="btn-reanalyze-article"
                onClick={handleLiveReanalyze}
                disabled={analyzing}
                className="flex items-center gap-1 text-xs font-medium text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200 px-2.5 py-1.5 rounded-md transition-colors"
                title="Regenerate analysis with Gemini AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Analyzing...' : 'Refresh AI'}</span>
              </button>
            </div>

            {/* Factual Information (FACT) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Facts</span>
              </h4>
              {facts && facts.length > 0 ? (
                <div className="space-y-1 bg-white/80 p-3 rounded-lg border border-emerald-100 text-xs text-slate-700">
                  {facts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-700 bg-white/80 p-3 rounded-lg border border-emerald-100">
                  {summary}
                </p>
              )}
            </div>

            {/* Why It Matters (INTERPRETATION) */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span>Macroeconomic Interpretation</span>
              </h4>
              <div className="bg-white/80 p-3 rounded-lg border border-emerald-100 space-y-2">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {whyItMatters}
                </p>
                {interpretations && interpretations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                    {interpretations.map((interp, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400 font-medium">→</span>
                        <span>{interp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transmission Chain */}
            {transmissionChain && transmissionChain.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Economic Transmission Mechanism</span>
                </h4>
                <div className="bg-white/80 p-3 rounded-lg border border-emerald-100">
                  <div className="flex flex-col gap-1.5 text-xs">
                    {transmissionChain.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Meta badges: Time Horizon & Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-slate-500">Time Horizon:</span>
                  <span className="font-semibold capitalize px-2 py-0.5 rounded bg-white border border-emerald-200 text-emerald-900">
                    {timeHorizon}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="text-slate-500">AI Confidence:</span>
                  <span className={`font-semibold capitalize px-2 py-0.5 rounded border ${
                    confidence === 'high' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}>
                    {confidence}
                  </span>
                </div>
              </div>
              {confidenceReasoning && (
                <span className="text-[11px] text-slate-500 italic">
                  {confidenceReasoning}
                </span>
              )}
            </div>
          </div>

          {/* Potential Market Impact Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Affected Markets & Asset Impact</span>
              </h3>
              <span className="text-[11px] text-slate-400">Directional bias guide</span>
            </div>

            {marketImpact && marketImpact.length > 0 ? (
              <div className="space-y-2">
                {marketImpact.map((item, idx) => {
                  const badge = getDirectionBadge(item.direction);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-800">{item.market}</span>
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-normal">{item.rationale}</p>
                      </div>

                      <div className="shrink-0 flex sm:justify-end">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded border border-slate-200">
                No immediate primary asset sensitivity identified.
              </p>
            )}
          </div>

          {/* Extracted Entities */}
          {article.entities && (
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Extracted Entities</span>
              </h3>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                {article.entities.institutions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold">Institutions:</span>
                    {article.entities.institutions.map(inst => (
                      <span key={inst} className="px-2 py-0.5 bg-slate-200/80 rounded text-slate-800 font-medium">
                        {inst}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.companies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold">Companies:</span>
                    {article.entities.companies.map(comp => (
                      <span key={comp} className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-blue-800 font-medium">
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.assets.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold">Assets:</span>
                    {article.entities.assets.map(ast => (
                      <span key={ast} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-medium">
                        {ast}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.currencies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 font-semibold">Currencies:</span>
                    {article.entities.currencies.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-amber-50 border border-amber-200 rounded text-amber-800 font-bold">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Importance Breakdown */}
          {article.importanceBreakdown && (
            <div>
              <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-slate-600" />
                <span>Importance Score Matrix ({article.importanceBreakdown.totalScore}/100)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Central Bank</div>
                  <div className="font-bold text-slate-800 text-sm">{article.importanceBreakdown.centralBankScore}/35</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Macro Impact</div>
                  <div className="font-bold text-slate-800 text-sm">{article.importanceBreakdown.economicSignificance}/25</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Source Diversity</div>
                  <div className="font-bold text-slate-800 text-sm">{article.importanceBreakdown.sourceDiversity}/20</div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Market Beta</div>
                  <div className="font-bold text-slate-800 text-sm">{article.importanceBreakdown.marketSensitivity}/20</div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 italic">
                Reasoning: {article.importanceBreakdown.reasoning}
              </p>
            </div>
          )}

          {/* Multi-Source Deduplication & Verification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Multi-Source Cluster & Verification ({article.sources?.length || 1})</span>
              </h3>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Deduplicated Feed
              </span>
            </div>

            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {article.sources && article.sources.length > 0 ? (
                article.sources.map((src, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-xs pb-2 last:pb-0 border-b last:border-0 border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{src.name}</span>
                        <span className="text-[10px] text-slate-400">{src.timeAgo}</span>
                      </div>
                      {src.snippet && <p className="text-slate-600 text-[11px] mt-0.5">{src.snippet}</p>}
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-slate-400 hover:text-slate-700 p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-600">
                  <span>Reported by {article.source}</span>
                </div>
              )}
            </div>
          </div>

          {/* Full context / original content */}
          {article.fullContent && (
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-2">
                Full Background Context
              </h3>
              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                {article.fullContent}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-xs text-slate-400">Topics:</span>
              {article.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              AI interpretations are synthesized for macroeconomic context and educational intelligence. They do not constitute financial advice, guaranteed predictions, or trading signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
