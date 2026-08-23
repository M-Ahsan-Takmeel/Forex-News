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
      <div className="bg-[#0A0A0A] rounded-lg border border-[#242424] p-5 space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F2F2F2] tracking-tight">
            Universal Intelligence Search
          </h1>
          <p className="font-mono text-xs text-[#777777] mt-0.5">
            Query across global news wires, macro releases, central banks, currencies, and verified topics
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
            className="w-full pl-10 pr-10 py-3 bg-[#101010] border border-[#242424] rounded text-sm text-[#F2F2F2] placeholder-[#555555] focus:outline-none focus:border-[#3B82F6] font-mono"
          />
          <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-3.5" />
          {term && (
            <button
              onClick={() => {
                setTerm('');
                setSearchQuery('');
              }}
              className="p-1 rounded text-[#777777] hover:text-[#F2F2F2] absolute right-3.5 top-3"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#242424] text-xs font-mono">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded transition-colors uppercase text-[11px] font-bold ${
              activeFilter === 'all' ? 'bg-[#3B82F6] text-white' : 'bg-[#151515] text-[#777777] hover:text-[#F2F2F2] border border-[#242424]'
            }`}
          >
            All Results ({totalCount})
          </button>
          <button
            onClick={() => setActiveFilter('news')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 uppercase text-[11px] font-bold ${
              activeFilter === 'news' ? 'bg-[#3B82F6] text-white' : 'bg-[#151515] text-[#777777] hover:text-[#F2F2F2] border border-[#242424]'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>News ({newsResults.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('events')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 uppercase text-[11px] font-bold ${
              activeFilter === 'events' ? 'bg-[#3B82F6] text-white' : 'bg-[#151515] text-[#777777] hover:text-[#F2F2F2] border border-[#242424]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Economic Events ({eventResults.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('topics')}
            className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 uppercase text-[11px] font-bold ${
              activeFilter === 'topics' ? 'bg-[#3B82F6] text-white' : 'bg-[#151515] text-[#777777] hover:text-[#F2F2F2] border border-[#242424]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Topics ({topicResults.length})</span>
          </button>
        </div>
      </div>

      {/* Results Container */}
      {!term.trim() ? (
        <div className="p-12 text-center text-[#777777] bg-[#0A0A0A] rounded-lg border border-[#242424]">
          <Search className="w-8 h-8 mx-auto mb-2 text-[#444444]" />
          <p className="text-sm font-semibold text-[#A0A0A0]">Type a keyword to begin searching</p>
          <p className="font-mono text-xs text-[#555555] mt-1">
            Search for economic indicators (e.g. CPI, PMI), central banks (e.g. Fed, ECB), or asset classes (e.g. Brent, Gold).
          </p>
        </div>
      ) : totalCount === 0 && !loading ? (
        <div className="p-12 text-center text-[#777777] bg-[#0A0A0A] rounded-lg border border-[#242424]">
          <p className="text-sm font-semibold text-[#A0A0A0]">No results found for "{term}"</p>
          <p className="font-mono text-xs text-[#555555] mt-1">Try broader terms such as "Inflation", "Rates", "USD", or "Oil".</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Topics Row if any */}
          {(activeFilter === 'all' || activeFilter === 'topics') && topicResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777]">
                Matched Topics ({topicResults.length})
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {topicResults.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTerm(t)}
                    className="px-2.5 py-1 rounded bg-[#101010] border border-[#242424] hover:border-[#3B82F6] font-mono text-xs text-[#F2F2F2] transition-colors flex items-center gap-1.5"
                  >
                    <Tag className="w-3 h-3 text-[#3B82F6]" />
                    <span>#{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* News Matches */}
          {(activeFilter === 'all' || activeFilter === 'news') && newsResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>News Intelligence Matches ({newsResults.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {newsResults.map((art) => (
                  <div
                    key={art.id}
                    id={`search-news-${art.id}`}
                    onClick={() => setSelectedArticle(art)}
                    className="p-4 rounded bg-[#0A0A0A] border border-[#242424] hover:border-[#3B82F6]/50 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-[#777777]">
                      <span className="text-[#A0A0A0]">{art.source}</span>
                      <span className="uppercase">{art.category}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-[#F2F2F2] leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-xs text-[#A0A0A0] line-clamp-2">{art.aiSummary}</p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-mono text-[10px] text-[#777777]">
                        {new Date(art.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-[11px] text-[#3B82F6] font-semibold flex items-center gap-0.5">
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
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#777777] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#3B82F6]" />
                <span>Economic Calendar Matches ({eventResults.length})</span>
              </h3>
              <div className="bg-[#0A0A0A] rounded border border-[#242424] divide-y divide-[#242424] overflow-hidden">
                {eventResults.map((evt) => (
                  <div
                    key={evt.id}
                    id={`search-cal-${evt.id}`}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-3.5 hover:bg-[#101010] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-[#3B82F6] bg-[#151515] border border-[#242424] px-1.5 py-0.2 rounded-xs text-[10px]">
                          {evt.currency}
                        </span>
                        <span className="font-bold text-sm text-[#F2F2F2]">{evt.eventName}</span>
                        <span className="font-mono text-[#777777] text-xs">({evt.country})</span>
                      </div>
                      <p className="text-[#A0A0A0] text-[11px] line-clamp-1">{evt.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:justify-end">
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-[#777777] block uppercase">
                          {evt.status === 'released' ? 'Actual' : 'Forecast'}
                        </span>
                        <span className="font-mono font-bold text-[#F2F2F2]">
                          {evt.status === 'released' ? evt.actual : evt.forecast}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(evt);
                        }}
                        className="p-1.5 rounded bg-[#151515] border border-[#242424] text-[#3B82F6] hover:text-white hover:bg-[#202020] text-xs font-semibold"
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

