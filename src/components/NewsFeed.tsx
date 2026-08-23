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
  UserCheck,
  ArrowUpRight
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
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      case 'high':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      case 'medium':
        return 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
      default:
        return 'bg-[#151515] text-[#777777] border-[#242424]';
    }
  };

  return (
    <div id="news-feed-section" className="space-y-6">
      {/* Top Filter & Header Area */}
      <div className="bg-[#101010] rounded-lg border border-[#242424] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#777777]">INTELLIGENCE STREAM</span>
              {viewMode === 'intelligent' && (
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 uppercase">
                  Personalized
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] tracking-tight mt-0.5">
              Financial News & Intelligence Stream
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Multi-source normalized macro news ranked by importance and market impact
            </p>
          </div>

          {/* View / Ranking Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#050505] rounded border border-[#242424] text-xs font-semibold self-start md:self-auto flex-wrap">
            <button
              id="btn-feed-mode-intelligent"
              onClick={() => {
                setViewMode('intelligent');
                setFeedRankingMode('intelligent');
              }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-medium transition-all ${
                viewMode === 'intelligent' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              <Target className="w-3 h-3 text-[#3B82F6]" />
              <span>Intelligent</span>
            </button>
            <button
              id="btn-feed-mode-important"
              onClick={() => {
                setViewMode('important');
                setFeedRankingMode('global_importance');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'important' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              Global Priority
            </button>
            <button
              id="btn-feed-mode-latest"
              onClick={() => {
                setViewMode('latest');
                setFeedRankingMode('latest');
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === 'latest' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              Latest
            </button>
            <button
              id="btn-feed-mode-saved"
              onClick={() => setViewMode('saved')}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs font-medium ${
                viewMode === 'saved' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span>Saved ({bookmarkedArticles.length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <input
              id="news-search-input"
              type="text"
              placeholder="Search intelligence, entities, central banks, commodities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-1.5 bg-[#050505] border border-[#242424] rounded text-xs text-[#F2F2F2] placeholder-[#777777] focus:outline-none focus:border-[#3B82F6]"
            />
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-2.5 top-2" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  loadNews();
                }}
                className="absolute right-2 top-2 text-[#777777] hover:text-[#F2F2F2]"
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
              className="w-full py-1.5 px-2.5 bg-[#050505] border border-[#242424] rounded text-xs text-[#A0A0A0] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">All Importance Levels</option>
              <option value="critical">Critical Severity</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Standard / Low</option>
            </select>
          </div>

          {/* Market Filter */}
          <div className="sm:col-span-3">
            <select
              id="select-news-market"
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-[#050505] border border-[#242424] rounded text-xs text-[#A0A0A0] focus:outline-none focus:border-[#3B82F6]"
            >
              <option value="all">All Impacted Asset Classes</option>
              <option value="Forex">Forex / FX Pairs</option>
              <option value="Stocks">Equities & Indices</option>
              <option value="Commodities">Commodities & Energy</option>
              <option value="Bonds">Sovereign Bonds & Yields</option>
              <option value="Crypto">Digital Assets</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#242424]">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                id={`cat-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold'
                    : 'bg-[#0A0A0A] text-[#777777] hover:text-[#A0A0A0] hover:bg-[#151515] border border-transparent'
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
        <div className="p-12 text-center text-[#777777] bg-[#101010] rounded-lg border border-[#242424]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3B82F6]" />
          <p className="font-mono text-xs">SYNCHRONIZING & SCORING INTELLIGENCE FEED...</p>
        </div>
      ) : displayedArticles.length === 0 ? (
        <div className="p-12 text-center text-[#777777] bg-[#101010] rounded-lg border border-[#242424] space-y-3">
          <p className="text-sm font-semibold text-[#F2F2F2]">No articles match your current criteria</p>
          <p className="text-xs text-[#777777]">Try modifying keywords or clearing category constraints</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedImportance('all');
              setSelectedMarketFilter('all');
              setSearchTerm('');
              setViewMode('intelligent');
            }}
            className="px-3 py-1.5 rounded bg-[#151515] hover:bg-[#202020] border border-[#242424] text-[#F2F2F2] font-mono text-xs transition-colors"
          >
            RESET ALL FILTERS
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
                className="bg-[#101010] rounded-lg border border-[#242424] p-4 sm:p-5 hover:border-[#3B82F6]/40 hover:bg-[#121212] transition-all cursor-pointer group flex flex-col justify-between space-y-3.5"
              >
                <div className="space-y-2.5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {article.userRelevanceScore !== undefined && viewMode === 'intelligent' && (
                        <span className="font-mono px-1.5 py-0.2 rounded-xs font-bold text-[9px] bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30">
                          {article.userRelevanceScore}% MATCH
                        </span>
                      )}
                      <span className={`font-mono px-1.5 py-0.2 rounded-xs font-bold uppercase text-[9px] border ${getImportanceBadge(article.importance)}`}>
                        {article.importance}
                      </span>
                      <span className="font-mono text-[#777777] uppercase text-[10px]">
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
                        className={`p-1 rounded transition-colors ${
                          isLiked ? 'text-[#3B82F6] bg-[#151515]' : 'text-[#777777] hover:text-[#3B82F6]'
                        }`}
                        title="More like this"
                      >
                        <ThumbsUp className="w-3 h-3" />
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
                        className={`p-1 rounded transition-colors ${
                          isDisliked ? 'text-[#EF4444] bg-[#151515]' : 'text-[#777777] hover:text-[#EF4444]'
                        }`}
                        title="Less like this"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>

                      {article.clusterCount && article.clusterCount > 1 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#A0A0A0] bg-[#151515] px-1.5 py-0.2 rounded-xs border border-[#242424]">
                          <ShieldCheck className="w-3 h-3 text-[#3B82F6]" />
                          {article.clusterCount} Sources
                        </span>
                      )}

                      <button
                        id={`btn-bookmark-card-${article.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          bookmarked ? 'text-[#3B82F6]' : 'text-[#777777] hover:text-[#F2F2F2]'
                        }`}
                        title={bookmarked ? 'Remove Bookmark' : 'Save Article'}
                      >
                        <Bookmark className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* Headline */}
                  <h2 className="font-bold text-sm sm:text-base text-[#F2F2F2] group-hover:text-white transition-colors leading-snug">
                    {article.title}
                  </h2>

                  {/* Relevance Explanation if personalized */}
                  {article.userRelevanceReason && (
                    <div className="text-[11px] text-[#A0A0A0] bg-[#0A0A0A] px-2 py-1 rounded border border-[#242424]">
                      <span className="text-[#3B82F6] font-mono text-[10px] mr-1">WHY MATCHED:</span>
                      {article.userRelevanceReason}
                    </div>
                  )}

                  {/* AI Summary Block */}
                  <div className="p-3 rounded bg-[#0A0A0A] border border-[#242424] text-xs space-y-1">
                    <div className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider text-[#3B82F6]">
                      <Sparkles className="w-3 h-3 text-[#3B82F6]" />
                      <span>INTELLIGENCE SUMMARY</span>
                    </div>
                    <p className="text-xs text-[#A0A0A0] leading-relaxed line-clamp-2">
                      {article.aiSummary}
                    </p>
                  </div>

                  {/* Why it matters teaser */}
                  <div className="text-xs text-[#777777]">
                    <span className="font-mono text-[10px] uppercase text-[#A0A0A0]">MARKET IMPLICATION: </span>
                    <span className="line-clamp-1 text-[#A0A0A0]">{article.aiWhyItMatters}</span>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3 text-[#777777] text-[11px] font-mono">
                    <span className="text-[#A0A0A0] font-medium">{article.source}</span>
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
                    <span className="text-[#3B82F6] font-mono text-[11px] inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <ArrowUpRight className="w-3.5 h-3.5" />
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


