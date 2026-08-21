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
  Filter,
  Bookmark,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Target,
  Sliders
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

  useEffect(() => {
    async function loadDashboardData() {
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
          .slice(0, 4);

        setPersonalizedNews(personalized.length > 0 ? personalized : articles.slice(0, 4));

        // Split calendar events
        const upcoming = calendarData.events.filter(e => e.status === 'upcoming').slice(0, 3);
        const released = calendarData.events.filter(e => e.status === 'released').slice(0, 3);
        setUpcomingEvents(upcoming);
        setReleasedEvents(released);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [preferences]);

  return (
    <div id="dashboard-view" className="space-y-8 pb-12">
      {/* 1. Executive Daily AI Macro Intelligence Pulse with Dual Lenses */}
      {macroPulse && (
        <section id="macro-pulse-section" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Daily AI Macro Intelligence Pulse
              </span>
              <span className="text-xs text-slate-400 font-medium">{macroPulse.date}</span>
            </div>

            {/* Lens Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
              <button
                id="btn-pulse-view-personalized"
                onClick={() => setPulseViewMode('personalized')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pulseViewMode === 'personalized'
                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your View ({preferences.selectedCurrencies.slice(0, 3).join('/')})</span>
              </button>
              <button
                id="btn-pulse-view-global"
                onClick={() => setPulseViewMode('global')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  pulseViewMode === 'global'
                    ? 'bg-white shadow-xs text-slate-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span>Global Picture</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {macroPulse.headline}
                </h1>
              </div>

              {pulseViewMode === 'personalized' && macroPulse.personalizedView ? (
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-700" />
                      Personalized Intelligence Synthesis
                    </span>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Tune Profile</span>
                    </button>
                  </div>
                  <p className="text-sm text-emerald-950 leading-relaxed font-medium">
                    {macroPulse.personalizedView.yourSummary}
                  </p>
                  <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-emerald-800 font-semibold text-[11px]">Priority Focus:</span>
                    {macroPulse.personalizedView.priorityFocus?.map((f, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-white text-emerald-900 border border-emerald-300 text-[11px] font-medium"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed max-w-4xl">
                  {macroPulse.macroSummary}
                </p>
              )}
            </div>

            <div className="lg:w-72 shrink-0 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-slate-500">
                Central Bank Posture
              </span>
              <p className="text-slate-800 font-medium leading-normal">
                {macroPulse.centralBankPosture}
              </p>
              <button
                id="btn-goto-ai-hub"
                onClick={() => setActiveTab('insights')}
                className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors"
              >
                <span>Open Intelligence Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key Drivers & Risk Watchlist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Core Macroeconomic Drivers</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {macroPulse.keyDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Key Macro Risk Watchlist</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {macroPulse.keyRisks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* 2. Main Two-Column Layout: Intelligent & Global News on Left, Calendar & Sentiment on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Personalized & Critical News (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Highly Relevant For You */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-700" />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    For You: High-Relevance Intelligence
                  </h2>
                  <p className="text-xs text-slate-500">
                    Personalized to {preferences.selectedCurrencies.slice(0, 3).join(', ')} & {preferences.selectedTopics.slice(0, 2).join(', ')}
                  </p>
                </div>
              </div>
              <button
                id="btn-view-all-news"
                onClick={() => setActiveTab('news')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Full Feed</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
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
                    className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        {article.userRelevanceScore !== undefined && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {article.userRelevanceScore}% Match
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          article.importance === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {article.importance}
                        </span>
                        <span className="text-slate-500 font-medium">{article.category}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Feedback Buttons */}
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
                          className={`p-1 rounded text-slate-400 hover:text-emerald-700 transition-colors ${
                            isLiked ? 'text-emerald-700 bg-emerald-50' : ''
                          }`}
                          title="More stories like this"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
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
                          className={`p-1 rounded text-slate-400 hover:text-rose-700 transition-colors ${
                            isDisliked ? 'text-rose-700 bg-rose-50' : ''
                          }`}
                          title="Less stories like this"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`btn-dash-bookmark-${article.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(article.id);
                          }}
                          className={`p-1 rounded text-slate-400 hover:text-amber-600 transition-colors ${
                            bookmarked ? 'text-amber-600' : ''
                          }`}
                          title="Bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    {/* Personal relevance reason pill if available */}
                    {article.userRelevanceReason && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 font-medium">
                        💡 {article.userRelevanceReason}
                      </div>
                    )}

                    {/* AI Summary snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {article.aiSummary}
                    </p>

                    {/* Market impact pills */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400">Impact:</span>
                        {article.aiMarketImpact.slice(0, 3).map((imp, idx) => (
                          <span
                            key={idx}
                            className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                              imp.direction === 'bullish'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : imp.direction === 'bearish'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {imp.market} ({imp.direction})
                          </span>
                        ))}
                      </div>

                      <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-0.5 group-hover:underline">
                        <span>Analysis</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Global Macro Watchlist (Preserving global awareness) */}
          <div className="pt-4 space-y-3 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Global Critical Watchlist (All Markets)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Preserved Global Lens</span>
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
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-rose-700 uppercase">{art.importance}</span>
                    <span>{art.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{art.aiSummary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Economic Calendar & Asset Stance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Upcoming & Released Calendar Snapshot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Economic Events Today</h3>
              </div>
              <button
                id="btn-goto-calendar"
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Full Calendar</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Upcoming Releases (Prioritized for You)
              </span>
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  id={`dash-cal-upcoming-${evt.id}`}
                  onClick={() => {
                    recordInteraction('event', evt.id);
                    setSelectedEvent(evt);
                  }}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-1 rounded text-[10px]">
                        {evt.currency}
                      </span>
                      <span className="font-bold text-slate-800">{evt.eventName}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Forecast: {evt.forecast} | Prev: {evt.previous}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3" />
                      {evt.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Released Events with Deviation */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Recently Released
              </span>
              {releasedEvents.map((evt) => (
                <div
                  key={evt.id}
                  id={`dash-cal-released-${evt.id}`}
                  onClick={() => {
                    recordInteraction('event', evt.id);
                    setSelectedEvent(evt);
                  }}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-700 bg-slate-200 px-1 rounded text-[10px]">
                        {evt.currency}
                      </span>
                      <span className="font-bold text-slate-800">{evt.eventName}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Actual: <span className="font-bold font-mono text-slate-900">{evt.actual}</span> (Forecast: {evt.forecast})
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        evt.deviation === 'better_than_expected'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : evt.deviation === 'worse_than_expected'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {evt.deviation === 'better_than_expected'
                        ? 'Beat'
                        : evt.deviation === 'worse_than_expected'
                        ? 'Miss'
                        : 'In Line'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cross-Asset Sentiment Overview */}
          {macroPulse && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-600" />
                <span>Cross-Asset Macro Stance</span>
              </h3>
              <div className="space-y-2">
                {macroPulse.marketSentiments.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{s.asset}</span>
                      <span
                        className={`font-semibold capitalize text-[10px] px-2 py-0.5 rounded ${
                          s.stance === 'bullish'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.stance === 'bearish'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {s.stance}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{s.note}</p>
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

