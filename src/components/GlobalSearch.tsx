import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { executeGlobalSearch } from '../services/api';
import { NewsArticle, EconomicEvent } from '../types';
import {
  Search,
  X,
  Newspaper,
  Calendar,
  Globe,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const GlobalSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, setSelectedArticle, setSelectedEvent } = useApp();
  const [term, setTerm] = useState(searchQuery || '');
  const [newsResults, setNewsResults] = useState<NewsArticle[]>([]);
  const [eventResults, setEventResults] = useState<EconomicEvent[]>([]);
  const [topicResults, setTopicResults] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'news' | 'events' | 'topics'>('all');
  const [loading, setLoading] = useState(false);

  const runSearch = async (q: string) => {
    if (!q.trim()) {
      setNewsResults([]);
      setEventResults([]);
      setTopicResults([]);
      return;
    }

    try {
      setLoading(true);
      const res = await executeGlobalSearch(q);
      setNewsResults(res.news);
      setEventResults(res.events);
      setTopicResults(res.topics);
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(term);
    }, 250);
    return () => clearTimeout(timer);
  }, [term]);

  const totalCount = newsResults.length + eventResults.length + topicResults.length;

  return (
    <div id="global-search-section" className="space-y-6 pb-12">
      {/* Search Input Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Universal Financial & Macro Search
          </h1>
          <p className="text-xs text-slate-500">
            Search across global news, economic indicator schedules, countries, currencies, and topics
          </p>
        </div>

        <div className="relative">
          <input
            id="main-global-search-input"
            type="text"
            placeholder="Search e.g. Federal Reserve, CPI, Crude Oil, JPY, Germany, Semiconductors..."
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              setSearchQuery(e.target.value);
            }}
            autoFocus
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {term && (
            <button
              onClick={() => {
                setTerm('');
                setSearchQuery('');
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-600 absolute right-3.5 top-3"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter('news')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeFilter === 'news' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News ({newsResults.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('events')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeFilter === 'events' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Economic Events ({eventResults.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('topics')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeFilter === 'topics' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Topics ({topicResults.length})</span>
          </button>
        </div>
      </div>

      {/* Results Container */}
      {!term.trim() ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Type a keyword to begin searching</p>
          <p className="text-xs text-slate-400 mt-1">
            Search for economic indicators (e.g. CPI, PMI), central banks (e.g. Fed, ECB), or asset classes (e.g. Brent, Gold).
          </p>
        </div>
      ) : totalCount === 0 && !loading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">No results found for "{term}"</p>
          <p className="text-xs text-slate-400 mt-1">Try broader terms such as "Inflation", "Rates", "USD", or "Oil".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Topics Row if any */}
          {(activeFilter === 'all' || activeFilter === 'topics') && topicResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Matched Topics ({topicResults.length})
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {topicResults.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-xs font-medium text-slate-800 shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-emerald-600" />
                    <span>#{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* News Matches */}
          {(activeFilter === 'all' || activeFilter === 'news') && newsResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5" />
                <span>News Intelligence Matches ({newsResults.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newsResults.map((art) => (
                  <div
                    key={art.id}
                    id={`search-news-${art.id}`}
                    onClick={() => setSelectedArticle(art)}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">{art.source}</span>
                      <span>{art.category}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{art.aiSummary}</p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(art.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                        <span>View Breakdown</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Economic Calendar Matches */}
          {(activeFilter === 'all' || activeFilter === 'events') && eventResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Economic Calendar Matches ({eventResults.length})</span>
              </h3>
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {eventResults.map((evt) => (
                  <div
                    key={evt.id}
                    id={`search-cal-${evt.id}`}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {evt.currency}
                        </span>
                        <span className="font-bold text-sm text-slate-800">{evt.eventName}</span>
                        <span className="text-slate-400">({evt.country})</span>
                      </div>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{evt.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {evt.status === 'released' ? 'Actual' : 'Forecast'}
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {evt.status === 'released' ? evt.actual : evt.forecast}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="p-1.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
