import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchNewsArticles, fetchEconomicEvents, fetchMacroPulse } from '../services/api';
import { NewsArticle, EconomicEvent, MacroOverview } from '../types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Globe,
  Layers,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Newspaper,
  ShieldCheck,
  Zap,
  Bookmark,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Target,
  Sliders,
  RefreshCw,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    setSelectedArticle,
    setSelectedEvent,
    setActiveTab,
    preferences,
    toggleBookmark,
    isBookmarked,
    giveFeedback,
    recordInteraction,
    setIsSettingsOpen
  } = useApp();

  const [macroPulse, setMacroPulse] = useState<MacroOverview | null>(null);
  const [pulseViewMode, setPulseViewMode] = useState<'personalized' | 'global'>('personalized');
  const [criticalNews, setCriticalNews] = useState<NewsArticle[]>([]);
  const [personalizedNews, setPersonalizedNews] = useState<NewsArticle[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EconomicEvent[]>([]);
  const [releasedEvents, setReleasedEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pulseData, newsData, calendarData] = await Promise.all([
        fetchMacroPulse(preferences),
        fetchNewsArticles({
          rankingMode: preferences.feedRankingMode || 'intelligent',
          preferences
        }),
        fetchEconomicEvents({
          preferences,
          sort: 'relevance'
        })
      ]);

      setMacroPulse(pulseData.overview);

      // Sort news by importance
      const articles = newsData.articles;
      const critical = articles.filter(a => a.importance === 'critical' || a.importance === 'high');
      setCriticalNews(critical.slice(0, 4));

      // High personal relevance stories
      const personalized = articles
        .filter(a => (a.userRelevanceScore || 0) >= 60 || a.userRelevance?.level === 'high' || a.userRelevance?.level === 'critical')
        .slice(0, 5);

      setPersonalizedNews(personalized.length > 0 ? personalized : articles.slice(0, 5));

      // Split calendar events
      const upcoming = calendarData.events.filter(e => e.status === 'upcoming').slice(0, 4);
      const released = calendarData.events.filter(e => e.status === 'released').slice(0, 4);
      setUpcomingEvents(upcoming);
      setReleasedEvents(released);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [preferences]);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242424]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#777777]">INTELLIGENCE OVERVIEW</span>
            <span className="text-[#333333]">•</span>
            <span className="font-mono text-[10px] text-[#A0A0A0]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F2F2] mt-0.5 font-sans">
            FINETELI Intelligence Command Center
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[11px] text-[#777777]">UPDATED {lastRefreshed || 'LIVE'}</span>
          <button
            id="btn-refresh-dashboard"
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#101010] hover:bg-[#151515] border border-[#242424] text-[#F2F2F2] px-2.5 py-1.5 rounded text-xs transition-colors font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* 1. Daily Macro Intelligence Pulse (Editorial Feature) */}
      {macroPulse && (
        <section id="macro-pulse-section" className="rounded-lg border border-[#242424] bg-[#101010] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#242424]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs bg-[#151515] border border-[#242424] text-[#F2F2F2] text-[10px] font-mono tracking-widest uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
                DAILY MACRO INTELLIGENCE PULSE
              </span>
              <span className="font-mono text-[10px] text-[#777777]">{macroPulse.date}</span>
            </div>

            {/* Lens Switcher */}
            <div className="flex items-center gap-1 bg-[#050505] p-1 rounded border border-[#242424] text-xs font-semibold self-start sm:self-auto">
              <button
                id="btn-pulse-view-personalized"
                onClick={() => setPulseViewMode('personalized')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  pulseViewMode === 'personalized'
                    ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold'
                    : 'text-[#777777] hover:text-[#A0A0A0]'
                }`}
              >
                <UserCheck className="w-3 h-3 text-[#3B82F6]" />
                <span>Tailored View ({preferences.selectedCurrencies.slice(0, 3).join('/')})</span>
              </button>
              <button
                id="btn-pulse-view-global"
                onClick={() => setPulseViewMode('global')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  pulseViewMode === 'global'
                    ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold'
                    : 'text-[#777777] hover:text-[#A0A0A0]'
                }`}
              >
                <Globe className="w-3 h-3 text-[#777777]" />
                <span>Global Macro</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <h2 className="text-lg sm:text-xl font-bold text-[#F2F2F2] tracking-tight leading-snug">
                {macroPulse.headline}
              </h2>

              {pulseViewMode === 'personalized' && macroPulse.personalizedView ? (
                <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#242424] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[#3B82F6] uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3 text-[#3B82F6]" />
                      PERSONALIZED SYNTHESIS
                    </span>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-[10px] font-mono text-[#777777] hover:text-[#F2F2F2] flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>ADJUST FOCUS</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                    {macroPulse.personalizedView.yourSummary}
                  </p>
                  <div className="pt-2 border-t border-[#242424] flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="font-mono text-[10px] text-[#777777]">FOCUS BENCHMARKS:</span>
                    {macroPulse.personalizedView.priorityFocus?.map((f, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.2 rounded-xs bg-[#151515] text-[#F2F2F2] border border-[#242424] font-mono text-[10px]"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
                  {macroPulse.macroSummary}
                </p>
              )}
            </div>

            <div className="lg:w-72 shrink-0 bg-[#0A0A0A] p-3.5 rounded border border-[#242424] text-xs space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#777777] block">
                CENTRAL BANK POSTURE
              </span>
              <p className="text-xs text-[#F2F2F2] leading-normal font-medium">
                {macroPulse.centralBankPosture}
              </p>
              <button
                id="btn-goto-ai-hub"
                onClick={() => setActiveTab('insights')}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#F2F2F2] font-mono text-[11px] font-medium transition-colors"
              >
                <span>QUERY RESEARCH ENGINE</span>
                <ArrowRight className="w-3 h-3 text-[#3B82F6]" />
              </button>
            </div>
          </div>

          {/* Key Drivers & Risk Watchlist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#242424] space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>CORE MACROECONOMIC DRIVERS</span>
              </h3>
              <div className="space-y-1.5 text-xs text-[#A0A0A0]">
                {macroPulse.keyDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[#3B82F6] font-bold text-[10px] mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded bg-[#0A0A0A] border border-[#242424] space-y-2">
              <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>ASYMMETRIC MACRO RISKS</span>
              </h3>
              <div className="space-y-1.5 text-xs text-[#A0A0A0]">
                {macroPulse.keyRisks.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-[#EF4444] font-bold text-[10px] mt-0.5">!</span>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Main Two-Column Layout: Intelligent & Global News on Left, Calendar & Sentiment on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personalized & Critical News (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section A: High-Relevance Intelligence Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2]">
                  HIGH-RELEVANCE INTELLIGENCE STREAM
                </h2>
              </div>
              <button
                id="btn-view-all-news"
                onClick={() => setActiveTab('news')}
                className="font-mono text-[11px] text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-1 transition-colors"
              >
                <span>FULL FEED</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              {personalizedNews.map((article) => {
                const bookmarked = isBookmarked(article.id);
                const isLiked = preferences.feedback?.likedArticleIds?.includes(article.id);
                const isDisliked = preferences.feedback?.dislikedArticleIds?.includes(article.id);

                return (
                  <div
                    key={article.id}
                    id={`dash-for-you-${article.id}`}
                    onClick={() => {
                      recordInteraction('article', article.id);
                      setSelectedArticle(article);
                    }}
                    className="p-4 rounded-lg bg-[#101010] hover:bg-[#151515] border border-[#242424] hover:border-[#3B82F6]/40 transition-all cursor-pointer group space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        {article.userRelevanceScore !== undefined && (
                          <span className="font-mono px-1.5 py-0.2 rounded-xs font-bold text-[9px] bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
                            {article.userRelevanceScore}% MATCH
                          </span>
                        )}
                        <span className={`font-mono px-1.5 py-0.2 rounded-xs font-bold uppercase text-[9px] ${
                          article.importance === 'critical'
                            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                            : 'bg-[#151515] text-[#A0A0A0] border border-[#242424]'
                        }`}>
                          {article.importance}
                        </span>
                        <span className="font-mono text-[#777777] uppercase text-[10px]">{article.category}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          id={`btn-feed-like-${article.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            giveFeedback({
                              articleId: article.id,
                              topic: article.topics?.[0],
                              action: isLiked ? 'remove' : 'like'
                            });
                          }}
                          className={`p-1 rounded text-[#777777] hover:text-[#3B82F6] transition-colors ${
                            isLiked ? 'text-[#3B82F6] bg-[#151515]' : ''
                          }`}
                          title="More stories like this"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          id={`btn-feed-dislike-${article.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            giveFeedback({
                              articleId: article.id,
                              topic: article.topics?.[0],
                              action: isDisliked ? 'remove' : 'dislike'
                            });
                          }}
                          className={`p-1 rounded text-[#777777] hover:text-[#EF4444] transition-colors ${
                            isDisliked ? 'text-[#EF4444] bg-[#151515]' : ''
                          }`}
                          title="Less stories like this"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>

                        <button
                          id={`btn-dash-bookmark-${article.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                          className={`p-1 rounded text-[#777777] hover:text-[#F2F2F2] transition-colors ${
                            bookmarked ? 'text-[#3B82F6]' : ''
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-[#F2F2F2] group-hover:text-white leading-snug">
                      {article.title}
                    </h3>

                    {/* Personal relevance reason pill */}
                    {article.userRelevanceReason && (
                      <div className="text-[11px] text-[#A0A0A0] bg-[#0A0A0A] px-2 py-1 rounded border border-[#242424]">
                        <span className="text-[#3B82F6] font-mono text-[10px] mr-1">WHY MATCHED:</span>
                        {article.userRelevanceReason}
                      </div>
                    )}

                    <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-2">
                      {article.aiSummary}
                    </p>

                    {/* Market impact tags */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#242424] text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {article.aiMarketImpact.slice(0, 3).map((imp, idx) => (
                          <span
                            key={idx}
                            className={`font-mono text-[9px] px-1.5 py-0.2 rounded-xs border ${
                              imp.direction === 'bullish'
                                ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                                : imp.direction === 'bearish'
                                ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                : 'bg-[#151515] text-[#777777] border-[#242424]'
                            }`}
                          >
                            {imp.market} · {imp.direction.toUpperCase()}
                          </span>
                        ))}
                      </div>

                      <span className="font-mono text-[#3B82F6] text-[11px] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>RESEARCH BRIEF</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Global Critical Watchlist */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                <h3 className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2]">
                  GLOBAL CRITICAL WATCHLIST
                </h3>
              </div>
              <span className="font-mono text-[9px] text-[#777777]">UNFILTERED GLOBAL RISK</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {criticalNews.map((art) => (
                <div
                  key={art.id}
                  id={`dash-crit-${art.id}`}
                  onClick={() => {
                    recordInteraction('article', art.id);
                    setSelectedArticle(art);
                  }}
                  className="p-3 rounded-lg bg-[#101010] hover:bg-[#151515] border border-[#242424] hover:border-[#EF4444]/40 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-[#777777]">
                    <span className="font-mono font-bold text-[#EF4444] uppercase">{art.importance}</span>
                    <span className="font-mono uppercase">{art.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-[#F2F2F2] group-hover:text-white leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-[#A0A0A0] line-clamp-2">{art.aiSummary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Economic Calendar & Asset Stance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming & Released Calendar Snapshot */}
          <div className="rounded-lg border border-[#242424] bg-[#101010] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2]">
                  ECONOMIC CALENDAR INTELLIGENCE
                </span>
              </div>
              <button
                id="btn-goto-calendar"
                onClick={() => setActiveTab('calendar')}
                className="font-mono text-[11px] text-[#3B82F6] hover:text-[#60A5FA] flex items-center gap-0.5"
              >
                <span>FULL SCHEDULE</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#777777] block">
                UPCOMING RELEASES
              </span>
              <div className="divide-y divide-[#242424]">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    id={`dash-cal-upcoming-${evt.id}`}
                    onClick={() => {
                      recordInteraction('event', evt.id);
                      setSelectedEvent(evt);
                    }}
                    className="py-2 flex items-center justify-between gap-3 hover:bg-[#151515] px-1.5 rounded transition-colors cursor-pointer text-xs group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[9px] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-1 py-0.2 rounded-xs">
                          {evt.currency}
                        </span>
                        <span className="font-medium text-[#F2F2F2] group-hover:text-white truncate text-xs">{evt.eventName}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#777777] mt-0.5 block">
                        EXP: {evt.forecast || 'N/A'} · PREV: {evt.previous || 'N/A'}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[10px] text-[#A0A0A0] bg-[#151515] px-1.5 py-0.5 rounded-xs border border-[#242424]">
                        {evt.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Released Events with Deviation */}
            <div className="space-y-1.5 pt-2 border-t border-[#242424]">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#777777] block">
                RECENT RELEASES & DEVIATIONS
              </span>
              <div className="divide-y divide-[#242424]">
                {releasedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    id={`dash-cal-released-${evt.id}`}
                    onClick={() => {
                      recordInteraction('event', evt.id);
                      setSelectedEvent(evt);
                    }}
                    className="py-2 flex items-center justify-between gap-3 hover:bg-[#151515] px-1.5 rounded transition-colors cursor-pointer text-xs group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[9px] text-[#A0A0A0] bg-[#151515] border border-[#242424] px-1 py-0.2 rounded-xs">
                          {evt.currency}
                        </span>
                        <span className="font-medium text-[#F2F2F2] group-hover:text-white truncate text-xs">{evt.eventName}</span>
                      </div>
                      <div className="font-mono text-[10px] text-[#777777] mt-0.5">
                        ACTUAL: <span className="font-bold text-[#F2F2F2]">{evt.actual}</span> (EXP: {evt.forecast})
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-xs border ${
                          evt.deviation === 'better_than_expected'
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30'
                            : evt.deviation === 'worse_than_expected'
                            ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                            : 'bg-[#151515] text-[#777777] border-[#242424]'
                        }`}
                      >
                        {evt.deviation === 'better_than_expected'
                          ? 'BEAT'
                          : evt.deviation === 'worse_than_expected'
                          ? 'MISS'
                          : 'IN LINE'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cross-Asset Macro Stance */}
          {macroPulse && (
            <div className="rounded-lg border border-[#242424] bg-[#101010] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#242424]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#F2F2F2]">
                    CROSS-ASSET MACRO STANCE
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#777777]">SYNTHESIS</span>
              </div>
              <div className="space-y-2">
                {macroPulse.marketSentiments.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-[#0A0A0A] border border-[#242424] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-[#F2F2F2]">{s.asset}</span>
                      <span
                        className={`font-mono font-bold uppercase text-[9px] px-1.5 py-0.2 rounded-xs ${
                          s.stance === 'bullish'
                            ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                            : s.stance === 'bearish'
                            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                            : 'bg-[#151515] text-[#A0A0A0] border border-[#242424]'
                        }`}
                      >
                        {s.stance}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777777] leading-snug">{s.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


