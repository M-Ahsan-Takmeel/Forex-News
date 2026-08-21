import React, { createContext, useContext, useState, useEffect } from 'react';
import { NewsArticle, EconomicEvent, UserPreferences, SummaryDepth, FeedRankingMode } from '../types';

interface AppContextType {
  activeTab: 'dashboard' | 'news' | 'calendar' | 'insights' | 'search';
  setActiveTab: (tab: 'dashboard' | 'news' | 'calendar' | 'insights' | 'search') => void;
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (article: NewsArticle | null) => void;
  selectedEvent: EconomicEvent | null;
  setSelectedEvent: (event: EconomicEvent | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  toggleMarket: (market: string) => void;
  toggleCurrency: (currency: string) => void;
  toggleTopic: (topic: string) => void;
  toggleCountry: (country: string) => void;
  setSummaryDepth: (depth: SummaryDepth) => void;
  setFeedRankingMode: (mode: FeedRankingMode) => void;
  giveFeedback: (params: {
    articleId?: string;
    topic?: string;
    entity?: string;
    action: 'like' | 'dislike' | 'remove';
  }) => void;
  recordInteraction: (type: 'article' | 'event' | 'search', idOrQuery: string) => void;
  resetPreferences: () => void;
  bookmarkedArticles: string[];
  toggleBookmark: (articleId: string) => void;
  isBookmarked: (articleId: string) => boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  selectedMarkets: ['Forex', 'Equities', 'Bonds', 'Commodities', 'Crypto'],
  selectedCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'],
  selectedCountries: ['United States', 'Eurozone', 'United Kingdom', 'Japan', 'China', 'Canada', 'Australia'],
  selectedTopics: ['Central Banks', 'Inflation', 'Interest Rates', 'Employment', 'Economic Growth', 'Geopolitics', 'Energy'],
  selectedCategories: ['Central Banks', 'Economy', 'Forex', 'Commodities', 'Stocks', 'Bonds'],
  summaryDepth: 'standard',
  readingDepth: 'concise',
  showHighImpactOnly: false,
  feedRankingMode: 'intelligent',
  feedback: {
    likedTopics: [],
    dislikedTopics: [],
    likedEntities: [],
    dislikedEntities: [],
    likedArticleIds: [],
    dislikedArticleIds: []
  },
  recentInteractions: {
    articleClicks: [],
    eventClicks: [],
    searchQueries: [],
    lastActive: new Date().toISOString()
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'calendar' | 'insights' | 'search'>('dashboard');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem('econ_intel_prefs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          feedback: { ...DEFAULT_PREFERENCES.feedback, ...(parsed.feedback || {}) },
          recentInteractions: { ...DEFAULT_PREFERENCES.recentInteractions, ...(parsed.recentInteractions || {}) }
        };
      }
      return DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('econ_intel_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('econ_intel_prefs_v2', JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed to save preferences to localStorage', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('econ_intel_bookmarks', JSON.stringify(bookmarkedArticles));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedArticles]);

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...partial }));
  };

  const toggleMarket = (market: string) => {
    setPreferences(prev => {
      const exists = prev.selectedMarkets.includes(market);
      const updated = exists
        ? prev.selectedMarkets.filter(m => m !== market)
        : [...prev.selectedMarkets, market];
      return { ...prev, selectedMarkets: updated };
    });
  };

  const toggleCurrency = (currency: string) => {
    setPreferences(prev => {
      const curr = currency.toUpperCase();
      const exists = prev.selectedCurrencies.includes(curr);
      const updated = exists
        ? prev.selectedCurrencies.filter(c => c !== curr)
        : [...prev.selectedCurrencies, curr];
      return { ...prev, selectedCurrencies: updated };
    });
  };

  const toggleTopic = (topic: string) => {
    setPreferences(prev => {
      const exists = prev.selectedTopics.includes(topic);
      const updated = exists
        ? prev.selectedTopics.filter(t => t !== topic)
        : [...prev.selectedTopics, topic];
      return { ...prev, selectedTopics: updated };
    });
  };

  const toggleCountry = (country: string) => {
    setPreferences(prev => {
      const exists = prev.selectedCountries.includes(country);
      const updated = exists
        ? prev.selectedCountries.filter(c => c !== country)
        : [...prev.selectedCountries, country];
      return { ...prev, selectedCountries: updated };
    });
  };

  const setSummaryDepth = (depth: SummaryDepth) => {
    setPreferences(prev => ({ ...prev, summaryDepth: depth }));
  };

  const setFeedRankingMode = (mode: FeedRankingMode) => {
    setPreferences(prev => ({ ...prev, feedRankingMode: mode }));
  };

  const giveFeedback = ({
    articleId,
    topic,
    entity,
    action
  }: {
    articleId?: string;
    topic?: string;
    entity?: string;
    action: 'like' | 'dislike' | 'remove';
  }) => {
    setPreferences(prev => {
      const fb = { ...prev.feedback };

      if (articleId) {
        fb.likedArticleIds = fb.likedArticleIds.filter(id => id !== articleId);
        fb.dislikedArticleIds = fb.dislikedArticleIds.filter(id => id !== articleId);
        if (action === 'like') fb.likedArticleIds.push(articleId);
        if (action === 'dislike') fb.dislikedArticleIds.push(articleId);
      }

      if (topic) {
        fb.likedTopics = fb.likedTopics.filter(t => t !== topic);
        fb.dislikedTopics = fb.dislikedTopics.filter(t => t !== topic);
        if (action === 'like') fb.likedTopics.push(topic);
        if (action === 'dislike') fb.dislikedTopics.push(topic);
      }

      if (entity) {
        fb.likedEntities = fb.likedEntities.filter(e => e !== entity);
        fb.dislikedEntities = fb.dislikedEntities.filter(e => e !== entity);
        if (action === 'like') fb.likedEntities.push(entity);
        if (action === 'dislike') fb.dislikedEntities.push(entity);
      }

      return { ...prev, feedback: fb };
    });
  };

  const recordInteraction = (type: 'article' | 'event' | 'search', idOrQuery: string) => {
    setPreferences(prev => {
      const recent = { ...prev.recentInteractions } as any;
      if (type === 'article') {
        recent.articleClicks = Array.from(new Set([idOrQuery, ...(recent.articleClicks || [])])).slice(0, 20);
      } else if (type === 'event') {
        recent.eventClicks = Array.from(new Set([idOrQuery, ...(recent.eventClicks || [])])).slice(0, 20);
      } else if (type === 'search') {
        recent.searchQueries = Array.from(new Set([idOrQuery, ...(recent.searchQueries || [])])).slice(0, 20);
      }
      recent.lastActive = new Date().toISOString();
      return { ...prev, recentInteractions: recent };
    });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev =>
      prev.includes(articleId) ? prev.filter(id => id !== articleId) : [...prev, articleId]
    );
  };

  const isBookmarked = (articleId: string) => bookmarkedArticles.includes(articleId);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedArticle,
        setSelectedArticle,
        selectedEvent,
        setSelectedEvent,
        searchQuery,
        setSearchQuery,
        isSettingsOpen,
        setIsSettingsOpen,
        preferences,
        updatePreferences,
        toggleMarket,
        toggleCurrency,
        toggleTopic,
        toggleCountry,
        setSummaryDepth,
        setFeedRankingMode,
        giveFeedback,
        recordInteraction,
        resetPreferences,
        bookmarkedArticles,
        toggleBookmark,
        isBookmarked
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
