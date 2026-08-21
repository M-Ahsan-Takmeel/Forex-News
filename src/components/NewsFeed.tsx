import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchNewsArticles } from '../services/api';
import { NewsArticle, NewsCategory, FeedRankingMode } from '../types';
import {
  Search,
  Filter,
  ShieldCheck,
  Globe,
  Clock,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ChevronRight,
  SlidersHorizontal,
  X,
  ThumbsUp,
  ThumbsDown,
  Target,
  UserCheck
} from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const {
    setSelectedArticle,
    bookmarkedArticles,
    toggleBookmark,
    isBookmarked,
    preferences,
    giveFeedback,
    recordInteraction,
    setFeedRankingMode
  } = useApp();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('All');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'intelligent' | 'important' | 'latest' | 'saved'>(
    preferences.feedRankingMode === 'global_importance' ? 'important' : 'intelligent'
  );

  const categories: NewsCategory[] = [
    'All',
    'Central Banks',
    'Economy',
    'Forex',
    'Commodities',
    'Stocks',
    'Bonds',
    'Crypto',
    'Geopolitics',
    'Business'
  ];

  const loadNews = async () => {
    try {
      setLoading(true);
      const rankingMode: FeedRankingMode =
        viewMode === 'latest'
          ? 'latest'
          : viewMode === 'important'
          ? 'global_importance'
          : 'intelligent';

      const data = await fetchNewsArticles({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        importance: selectedImportance !== 'all' ? selectedImportance : undefined,
        market: selectedMarketFilter !== 'all' ? selectedMarketFilter : undefined,
        search: searchTerm.trim() || undefined,
        rankingMode,
        preferences
      });
      setArticles(data.articles);
    } catch (err) {
      console.error('Failed to load news articles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [selectedCategory, selectedImportance, selectedMarketFilter, viewMode, preferences]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews();
  };

  // Filter based on view mode (important vs saved)
  let displayedArticles = articles;
  if (viewMode === 'saved') {
    displayedArticles = articles.filter(a => bookmarkedArticles.includes(a.id));
  }

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

  return (
    <div id="news-feed-section" className="space-y-6 pb-12">
      {/* Top Filter & Header Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Financial Intelligence Stream</span>
              {viewMode === 'intelligent' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Personalized Feed
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-500">
              Balanced global intelligence ranked by macro importance & your interest profile
            </p>
          </div>

          {/* View / Ranking Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start md:self-auto flex-wrap">
            <button
              id="btn-feed-mode-intelligent"
              onClick={() => {
                setViewMode('intelligent');
                setFeedRankingMode('intelligent');
              }}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === 'intelligent' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Intelligent</span>
            </button>
            <button
              id="btn-feed-mode-important"
              onClick={() => {
                setViewMode('important');
                setFeedRankingMode('global_importance');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'important' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Global Importance
            </button>
            <button
              id="btn-feed-mode-latest"
              onClick={() => {
                setViewMode('latest');
                setFeedRankingMode('latest');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'latest' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Latest
            </button>
            <button
              id="btn-feed-mode-saved"
              onClick={() => setViewMode('saved')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'saved' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Saved ({bookmarkedArticles.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <input
              id="news-search-input"
              type="text"
              placeholder="Search news, central banks, commodities, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  loadNews();
                }}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Importance Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-news-importance"
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Importance Levels</option>
              <option value="critical">Critical Importance</option>
              <option value="high">High Importance</option>
              <option value="medium">Medium Importance</option>
              <option value="low">Low Importance</option>
            </select>
          </div>

          {/* Market Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-news-market"
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Affected Markets</option>
              <option value="Forex">Forex / Currencies</option>
              <option value="Stocks">Stocks / Indices</option>
              <option value="Commodities">Commodities / Energy / Metals</option>
              <option value="Bonds">Bonds / Yields</option>
              <option value="Crypto">Digital Assets</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* News Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Ranking & personalizing news intelligence stream...</p>
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-1">No articles match your current filters</p>
          <p className="text-xs text-slate-400 mb-4">Try clearing your search term or adjusting categories</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedImportance('all');
              setSelectedMarketFilter('all');
              setSearchTerm('');
              setViewMode('intelligent');
            }}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedArticles.map((article) => {
            const bookmarked = isBookmarked(article.id);
            const isLiked = preferences.feedback?.likedArticleIds?.includes(article.id);
            const isDisliked = preferences.feedback?.dislikedArticleIds?.includes(article.id);

            return (
              <article
                key={article.id}
                id={`news-card-${article.id}`}
                onClick={() => {
                  recordInteraction('article', article.id);
                  setSelectedArticle(article);
                }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.userRelevanceScore !== undefined && viewMode === 'intelligent' && (
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {article.userRelevanceScore}% Match
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${getImportanceBadge(article.importance)}`}>
                        {article.importance}
                      </span>
                      <span className="text-slate-600 font-medium px-2 py-0.5 rounded bg-slate-100">
                        {article.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Interactive Personalization Feedback */}
                      <button
                        id={`btn-feed-like-card-${article.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          giveFeedback({
                            articleId: article.id,
                            topic: article.topics?.[0],
                            action: isLiked ? 'remove' : 'like'
                          });
                        }}
                        className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                          isLiked ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 hover:text-emerald-700'
                        }`}
                        title="More like this"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`btn-feed-dislike-card-${article.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          giveFeedback({
                            articleId: article.id,
                            topic: article.topics?.[0],
                            action: isDisliked ? 'remove' : 'dislike'
                          });
                        }}
                        className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                          isDisliked ? 'text-rose-700 bg-rose-50' : 'text-slate-400 hover:text-rose-700'
                        }`}
                        title="Less like this"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>

                      {article.clusterCount && article.clusterCount > 1 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          {article.clusterCount} Sources
                        </span>
                      )}

                      <button
                        id={`btn-bookmark-card-${article.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className={`p-1.5 rounded-md hover:bg-slate-100 transition-colors ${
                          bookmarked ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={bookmarked ? 'Remove Bookmark' : 'Save Article'}
                      >
                        {bookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-50" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Headline */}
                  <h2 className="font-bold text-base text-slate-900 group-hover:text-emerald-950 transition-colors leading-snug">
                    {article.title}
                  </h2>

                  {/* Relevance Explanation if personalized */}
                  {article.userRelevanceReason && (
                    <div className="text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 font-medium">
                      💡 {article.userRelevanceReason}
                    </div>
                  )}

                  {/* AI Summary Block */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>AI Summary</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed line-clamp-2">
                      {article.aiSummary}
                    </p>
                  </div>

                  {/* Why it matters teaser */}
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Why it matters: </span>
                    <span className="line-clamp-1">{article.aiWhyItMatters}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    <span className="font-medium text-slate-600">{article.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(article.publishedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {article.aiMarketImpact.slice(0, 2).map((imp, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                          imp.direction === 'bullish'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : imp.direction === 'bearish'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {imp.market}
                      </span>
                    ))}
                    <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

