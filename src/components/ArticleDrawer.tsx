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
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      case 'high':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      case 'medium':
        return 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
      default:
        return 'bg-[#151515] text-[#777777] border-[#242424]';
    }
  };

  const getDirectionBadge = (direction: string) => {
    switch (direction) {
      case 'bullish':
        return {
          bg: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
          icon: <TrendingUp className="w-3.5 h-3.5 text-[#3B82F6]" />,
          label: 'Bullish'
        };
      case 'bearish':
        return {
          bg: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
          icon: <TrendingDown className="w-3.5 h-3.5 text-[#EF4444]" />,
          label: 'Bearish'
        };
      case 'neutral':
        return {
          bg: 'bg-[#151515] text-[#A0A0A0] border-[#242424]',
          icon: <Minus className="w-3.5 h-3.5 text-[#777777]" />,
          label: 'Neutral'
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
    <div
      id="article-intelligence-drawer-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        id="article-drawer-panel"
        className="w-full max-w-2xl bg-[#0A0A0A] border-l border-[#242424] h-full shadow-2xl flex flex-col overflow-hidden text-[#A0A0A0] animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#242424] bg-[#101010] flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs border uppercase tracking-wider ${getImportanceBadge(article.importance)}`}>
              {article.importance}
            </span>
            <span className="font-mono text-[10px] uppercase font-medium px-2 py-0.5 rounded-xs bg-[#151515] text-[#A0A0A0] border border-[#242424]">
              {article.category}
            </span>
            {article.country && (
              <span className="font-mono text-[10px] text-[#777777] flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#555555]" />
                {article.country}
              </span>
            )}
            {article.isVerified && (
              <span className="font-mono text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 px-2 py-0.5 rounded-xs flex items-center gap-1 font-bold uppercase">
                <ShieldCheck className="w-3 h-3 text-[#3B82F6]" />
                Verified ({article.independentSourcesCount || article.sources?.length || 1} sources)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-drawer-bookmark"
              onClick={() => toggleBookmark(article.id)}
              className={`p-1.5 rounded border transition-colors ${
                bookmarked ? 'bg-[#3B82F6]/20 border-[#3B82F6]/50 text-[#3B82F6]' : 'border-[#242424] text-[#777777] hover:text-[#F2F2F2] hover:bg-[#151515]'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Save for Later'}
            >
              {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
            <button
              id="btn-drawer-close"
              onClick={onClose}
              className="p-1.5 rounded border border-[#242424] text-[#777777] hover:text-[#F2F2F2] hover:bg-[#151515] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Article Title & Source info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F2F2] leading-tight mb-2 tracking-tight">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 text-xs font-mono text-[#777777] flex-wrap">
              <span className="text-[#A0A0A0]">Source: <span className="text-[#F2F2F2] font-semibold">{article.source}</span></span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#555555]" />
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
                className="inline-flex items-center gap-1 text-[#3B82F6] hover:underline"
              >
                <span>Original Report</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* AI Intelligence Core Card */}
          <div className="rounded-lg border border-[#242424] bg-[#101010] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-[#151515] border border-[#242424] text-[#3B82F6]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#F2F2F2]">AI Intelligence Breakdown</h3>
                  <p className="font-mono text-[10px] text-[#777777]">Fact Extraction, Macro Interpretation & Transmission Chain</p>
                </div>
              </div>

              <button
                id="btn-reanalyze-article"
                onClick={handleLiveReanalyze}
                disabled={analyzing}
                className="flex items-center gap-1 font-mono text-[10px] font-medium text-[#F2F2F2] hover:text-white bg-[#151515] hover:bg-[#202020] border border-[#242424] px-2.5 py-1.5 rounded transition-colors"
                title="Regenerate analysis with Gemini AI"
              >
                <RefreshCw className={`w-3 h-3 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Analyzing...' : 'Refresh AI'}</span>
              </button>
            </div>

            {/* Factual Information (FACT) */}
            <div>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Verified Facts</span>
              </h4>
              {facts && facts.length > 0 ? (
                <div className="space-y-1.5 bg-[#050505] p-3 rounded border border-[#242424] text-xs text-[#A0A0A0]">
                  {facts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-[#3B82F6] font-bold">•</span>
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A0A0A0] bg-[#050505] p-3 rounded border border-[#242424]">
                  {summary}
                </p>
              )}
            </div>

            {/* Why It Matters (INTERPRETATION) */}
            <div>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Macroeconomic Interpretation</span>
              </h4>
              <div className="bg-[#050505] p-3 rounded border border-[#242424] space-y-2">
                <p className="text-xs sm:text-sm text-[#F2F2F2] leading-relaxed font-editorial text-[15px]">
                  {whyItMatters}
                </p>
                {interpretations && interpretations.length > 0 && (
                  <div className="pt-2 border-t border-[#242424] space-y-1 text-xs text-[#A0A0A0]">
                    {interpretations.map((interp, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-[#555555] font-medium">→</span>
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
                <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5 flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Economic Transmission Mechanism</span>
                </h4>
                <div className="bg-[#050505] p-3 rounded border border-[#242424]">
                  <div className="flex flex-col gap-1.5 text-xs">
                    {transmissionChain.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-xs bg-[#151515] border border-[#242424] text-[#3B82F6] font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-[#A0A0A0] font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Meta badges: Time Horizon & Confidence */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#242424] text-xs">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-[#A0A0A0]">
                  <span className="font-mono text-[10px] text-[#777777] uppercase">Horizon:</span>
                  <span className="font-mono text-xs capitalize px-2 py-0.2 rounded bg-[#151515] border border-[#242424] text-[#F2F2F2]">
                    {timeHorizon}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#A0A0A0]">
                  <span className="font-mono text-[10px] text-[#777777] uppercase">AI Confidence:</span>
                  <span className={`font-mono text-xs capitalize px-2 py-0.2 rounded border ${
                    confidence === 'high' ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]' : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
                  }`}>
                    {confidence}
                  </span>
                </div>
              </div>
              {confidenceReasoning && (
                <span className="text-[10px] text-[#777777] italic">
                  {confidenceReasoning}
                </span>
              )}
            </div>
          </div>

          {/* Potential Market Impact Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#777777]" />
                <span>Affected Markets & Asset Impact</span>
              </h3>
              <span className="font-mono text-[10px] text-[#777777]">Directional bias guide</span>
            </div>

            {marketImpact && marketImpact.length > 0 ? (
              <div className="space-y-2">
                {marketImpact.map((item, idx) => {
                  const badge = getDirectionBadge(item.direction);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded bg-[#101010] border border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-[#F2F2F2]">{item.market}</span>
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded-xs bg-[#151515] text-[#777777] border border-[#242424]">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#A0A0A0] leading-normal">{item.rationale}</p>
                      </div>

                      <div className="shrink-0 flex sm:justify-end">
                        <span className={`font-mono inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-semibold border ${badge.bg}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#777777] italic p-3 bg-[#101010] rounded border border-[#242424]">
                No immediate primary asset sensitivity identified.
              </p>
            )}
          </div>

          {/* Extracted Entities */}
          {article.entities && (
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] mb-2 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#777777]" />
                <span>Extracted Entities</span>
              </h3>
              <div className="p-3 bg-[#101010] rounded border border-[#242424] space-y-2 text-xs">
                {article.entities.institutions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#777777] uppercase">Institutions:</span>
                    {article.entities.institutions.map(inst => (
                      <span key={inst} className="font-mono text-[10px] px-1.5 py-0.2 bg-[#151515] border border-[#242424] rounded-xs text-[#F2F2F2]">
                        {inst}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.companies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#777777] uppercase">Companies:</span>
                    {article.entities.companies.map(comp => (
                      <span key={comp} className="font-mono text-[10px] px-1.5 py-0.2 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-xs text-[#3B82F6]">
                        {comp}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.assets.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#777777] uppercase">Assets:</span>
                    {article.entities.assets.map(ast => (
                      <span key={ast} className="font-mono text-[10px] px-1.5 py-0.2 bg-[#151515] border border-[#242424] rounded-xs text-[#A0A0A0]">
                        {ast}
                      </span>
                    ))}
                  </div>
                )}
                {article.entities.currencies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#777777] uppercase">Currencies:</span>
                    {article.entities.currencies.map(c => (
                      <span key={c} className="font-mono text-[10px] px-1.5 py-0.2 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-xs text-[#F59E0B] font-bold">
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
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] mb-2 flex items-center gap-2">
                <Coins className="w-3.5 h-3.5 text-[#777777]" />
                <span>Importance Score Breakdown ({article.importanceBreakdown.totalScore}/100)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 bg-[#101010] rounded border border-[#242424] text-center">
                  <div className="font-mono text-[#777777] text-[9px] uppercase">Central Bank</div>
                  <div className="font-mono font-bold text-[#F2F2F2] text-xs">{article.importanceBreakdown.centralBankScore}/35</div>
                </div>
                <div className="p-2 bg-[#101010] rounded border border-[#242424] text-center">
                  <div className="font-mono text-[#777777] text-[9px] uppercase">Macro Impact</div>
                  <div className="font-mono font-bold text-[#F2F2F2] text-xs">{article.importanceBreakdown.economicSignificance}/25</div>
                </div>
                <div className="p-2 bg-[#101010] rounded border border-[#242424] text-center">
                  <div className="font-mono text-[#777777] text-[9px] uppercase">Source Diversity</div>
                  <div className="font-mono font-bold text-[#F2F2F2] text-xs">{article.importanceBreakdown.sourceDiversity}/20</div>
                </div>
                <div className="p-2 bg-[#101010] rounded border border-[#242424] text-center">
                  <div className="font-mono text-[#777777] text-[9px] uppercase">Market Beta</div>
                  <div className="font-mono font-bold text-[#F2F2F2] text-xs">{article.importanceBreakdown.marketSensitivity}/20</div>
                </div>
              </div>
              <p className="text-[10px] text-[#777777] mt-1 italic">
                Reasoning: {article.importanceBreakdown.reasoning}
              </p>
            </div>
          )}

          {/* Multi-Source Deduplication & Verification */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Multi-Source Cluster & Verification ({article.sources?.length || 1})</span>
              </h3>
              <span className="font-mono text-[9px] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-1.5 py-0.2 rounded-xs font-bold uppercase">
                {article.isVerified ? 'Multi-Source Corroborated' : 'Single Publisher Wire'}
              </span>
            </div>

            <div className="space-y-2 bg-[#101010] p-3 rounded border border-[#242424]">
              {article.sources && article.sources.length > 0 ? (
                article.sources.map((src, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 text-xs pb-2 last:pb-0 border-b last:border-0 border-[#242424]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F2F2F2]">{src.name}</span>
                        <span className="font-mono text-[10px] text-[#777777]">{src.timeAgo}</span>
                        {src.credibilityScore && (
                          <span className="font-mono text-[10px] text-[#777777]">
                            Credibility: {src.credibilityScore}%
                          </span>
                        )}
                      </div>
                      {src.snippet && <p className="text-[#A0A0A0] text-[11px] mt-0.5">{src.snippet}</p>}
                    </div>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-[#777777] hover:text-[#F2F2F2] p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#777777]">
                  <span>Reported by {article.source}</span>
                </div>
              )}
            </div>

            {/* Source Provenance Chain (Data Quality & Verification) */}
            {article.provenance && (
              <div className="mt-2.5 p-3 rounded bg-[#0A0A0A] border border-[#242424] text-xs">
                <div className="flex items-center justify-between font-bold text-[#F2F2F2] text-[10px] mb-1.5">
                  <span className="font-mono flex items-center gap-1.5 uppercase tracking-wider text-[#A0A0A0]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Source Provenance & Audit Trail
                  </span>
                  <span className="font-mono text-[9px] text-[#3B82F6] uppercase">
                    {article.provenance.verificationStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-[10px] text-[#777777] space-y-1 font-mono">
                  <div>
                    <span className="text-[#A0A0A0]">Retrieved: </span>
                    <span>{new Date(article.provenance.retrievalTimestamp).toUTCString()}</span>
                  </div>
                  {article.provenance.evidenceChain && article.provenance.evidenceChain.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[#777777] pt-1">
                      {article.provenance.evidenceChain.map((ev, idx) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Full context / original content */}
          {article.fullContent && (
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#A0A0A0] mb-2">
                Full Background Context
              </h3>
              <div className="text-xs text-[#A0A0A0] leading-relaxed bg-[#101010] p-4 rounded border border-[#242424]">
                {article.fullContent}
              </div>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="font-mono text-[10px] text-[#777777] uppercase">Topics:</span>
              {article.tags.map((tag) => (
                <span key={tag} className="font-mono text-[10px] px-1.5 py-0.2 rounded-xs bg-[#151515] text-[#A0A0A0] border border-[#242424]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Educational Disclaimer */}
          <div className="p-2.5 rounded bg-[#050505] border border-[#242424] text-[10px] text-[#777777] flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[#555555] shrink-0 mt-0.5" />
            <p>
              AI interpretations are synthesized for macroeconomic context and educational intelligence. They do not constitute financial advice, guaranteed predictions, or trading signals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

