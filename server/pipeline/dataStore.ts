import { NewsArticle, EconomicEvent, MarketMetric, MacroOverview, MacroSeries, ThematicCluster, IntelligenceAnswer, UserPreferences, FeedRankingMode } from '../../src/types';
import { RawNewsItem, RawCalendarItem } from '../types/providerTypes';
import { fetchRSSNews } from '../providers/news/rssProvider';
import { fetchFinnhubNews } from '../providers/news/finnhubNewsProvider';
import { fetchAlphaVantageNews } from '../providers/news/alphaVantageNewsProvider';
import { fetchNewsApiArticles } from '../providers/news/newsApiProvider';
import { fetchEconomicCalendarData } from '../providers/calendar/economicCalendarProvider';
import { fetchLiveMarketBenchmarks } from '../providers/markets/marketDataProvider';
import { fetchFredSeries } from '../providers/fred/fredProvider';
import { deduplicateAndClusterNews, NormalizedStoryCluster } from './deduplication';
import { categorizeAndScoreCluster } from './categorizer';
import { extractThematicClusters } from './thematicClassifier';
import { enrichEconomicEventIntelligence } from './economicIndicatorIntelligence';
import {
  processArticleAIAnalysis,
  processEconomicEventAIAnalysis,
  generateDynamicMacroPulse,
  askFinancialIntelligence,
  generateDeterministicArticleAnalysis
} from './aiProcessor';
import {
  calculateArticlePersonalRelevance,
  calculateEventPersonalRelevance,
  calculateIntelligentFeedRank,
  generatePersonalizedMacroView
} from './personalization';
import { CONFIG } from '../config';

class DataStore {
  // 1. Raw Data Layer
  private rawNews: RawNewsItem[] = [];
  private rawEvents: RawCalendarItem[] = [];

  // 2. Normalized Data Layer
  private normalizedClusters: NormalizedStoryCluster[] = [];

  // 3. Processed Intelligence Layer
  private articles: NewsArticle[] = [];
  private events: EconomicEvent[] = [];
  private thematicClusters: ThematicCluster[] = [];
  private marketMetrics: MarketMetric[] = [];
  private macroOverview: MacroOverview | null = null;

  private lastSyncTimestamp: number = 0;
  private isSyncing: boolean = false;
  private syncError: string | null = null;
  private providerStats: Record<string, { count: number; lastSuccess?: string }> = {
    rss: { count: 0 },
    finnhub: { count: 0 },
    alphavantage: { count: 0 },
    newsapi: { count: 0 },
    gnews: { count: 0 }
  };

  constructor() {
    // Initial sync
    this.syncAllData().catch(err => {
      console.error('Initial DataStore sync error:', err);
    });

    // Background periodic sync
    setInterval(() => {
      this.syncAllData().catch(err => {
        console.warn('Periodic background sync warning:', err);
      });
    }, CONFIG.BACKGROUND_SYNC_INTERVAL);
  }

  public async syncAllData(force: boolean = false): Promise<void> {
    if (this.isSyncing) return;
    if (!force && Date.now() - this.lastSyncTimestamp < CONFIG.CACHE_TTL.NEWS_FEED && this.articles.length > 0) {
      return;
    }

    this.isSyncing = true;
    this.syncError = null;

    try {
      console.log('Initiating centralized intelligence pipeline execution...');

      // Stage 1: External Data Ingestion
      const [rssItems, finnhubItems, avItems, newsApiItems, calendarItems, marketQuotes] = await Promise.all([
        fetchRSSNews(),
        fetchFinnhubNews(),
        fetchAlphaVantageNews(),
        fetchNewsApiArticles(),
        fetchEconomicCalendarData(),
        fetchLiveMarketBenchmarks()
      ]);

      this.marketMetrics = marketQuotes;

      // Update provider stats
      this.providerStats.rss = { count: rssItems.length, lastSuccess: new Date().toISOString() };
      this.providerStats.finnhub = { count: finnhubItems.length, lastSuccess: new Date().toISOString() };
      this.providerStats.alphavantage = { count: avItems.length, lastSuccess: new Date().toISOString() };
      this.providerStats.newsapi = { count: newsApiItems.length, lastSuccess: new Date().toISOString() };

      this.rawNews = [
        ...rssItems,
        ...finnhubItems,
        ...avItems,
        ...newsApiItems
      ];

      // Stage 2: Deduplication, Story Clustering & Source Diversity Verification
      this.normalizedClusters = deduplicateAndClusterNews(this.rawNews);
      console.log(`Pipeline: Ingested ${this.rawNews.length} raw articles -> Clustered into ${this.normalizedClusters.length} unified story clusters.`);

      // Stage 3: Categorization, Structured Importance Scoring, Entity Extraction & Baseline Intelligence
      const processedArticles: NewsArticle[] = [];
      const nowIso = new Date().toISOString();

      for (let i = 0; i < this.normalizedClusters.length; i++) {
        const cluster = this.normalizedClusters[i];
        const primary = cluster.primary;
        const taxonomy = categorizeAndScoreCluster(cluster);

        const initialArticle: NewsArticle = {
          id: primary.id,
          title: primary.title,
          description: primary.description,
          fullContent: primary.content || primary.description,
          source: primary.source,
          sourceUrl: primary.url,
          publishedAt: primary.publishedAt,
          retrievedAt: primary.publishedAt || nowIso,
          processedAt: nowIso,
          category: taxonomy.category,
          secondaryCategories: taxonomy.secondaryCategories,
          country: taxonomy.country,
          countryCode: taxonomy.countryCode,
          relatedCurrencies: taxonomy.relatedCurrencies,
          relatedMarkets: taxonomy.relatedMarkets,
          relatedSectors: taxonomy.relatedSectors,
          entities: taxonomy.entities,
          importance: taxonomy.importance,
          importanceBreakdown: taxonomy.importanceBreakdown,
          sentiment: 'neutral',
          clusterCount: cluster.duplicates.length + 1,
          independentSourcesCount: cluster.independentSourcesCount,
          isVerified: cluster.isVerified,
          sources: cluster.allSources,
          aiSummary: primary.description || primary.title,
          aiFacts: [primary.title, `Reported via ${primary.source}`],
          aiInterpretations: ['Macroeconomic shifts transmit through sovereign yield curves and FX pricing.'],
          aiWhyItMatters: 'Key development influencing macroeconomic trajectory and sector liquidity.',
          transmissionChain: ['Reported Event', 'Interest Rate / Yield Curve Shift', 'Asset Multiple Discounting'],
          aiMarketImpact: [],
          aiConfidence: cluster.isVerified ? 'high' : 'medium',
          confidenceReasoning: `Verified across ${cluster.independentSourcesCount} independent publisher domain(s).`,
          timeHorizon: 'medium-term',
          tags: taxonomy.tags
        };

        // Populate with deterministic baseline macroeconomic intelligence
        const baseAnalysis = generateDeterministicArticleAnalysis(initialArticle);
        initialArticle.aiSummary = baseAnalysis.aiSummary;
        initialArticle.aiFacts = baseAnalysis.aiFacts;
        initialArticle.aiInterpretations = baseAnalysis.aiInterpretations;
        initialArticle.aiWhyItMatters = baseAnalysis.aiWhyItMatters;
        initialArticle.transmissionChain = baseAnalysis.transmissionChain;
        initialArticle.aiMarketImpact = baseAnalysis.aiMarketImpact;
        initialArticle.aiConfidence = baseAnalysis.aiConfidence;
        initialArticle.confidenceReasoning = baseAnalysis.confidenceReasoning;
        initialArticle.timeHorizon = baseAnalysis.timeHorizon;
        initialArticle.sentiment = baseAnalysis.sentiment;

        processedArticles.push(initialArticle);
      }

      // Sort by importance rank and date
      const importanceOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      processedArticles.sort((a, b) => {
        const impDiff = (importanceOrder[b.importance] || 2) - (importanceOrder[a.importance] || 2);
        if (impDiff !== 0) return impDiff;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      if (processedArticles.length > 0) {
        this.articles = processedArticles;
      }

      // Stage 4: Thematic Clustering (Section 15)
      this.thematicClusters = extractThematicClusters(this.articles);

      // Stage 5: Economic Calendar Intelligence & Forecast Deviation Analysis (Sections 11 & 12)
      this.events = calendarItems.map(item => enrichEconomicEventIntelligence(item));

      // Stage 6: Daily Macro Intelligence Pulse (Section 13 & 14)
      this.macroOverview = await generateDynamicMacroPulse(this.articles, this.events);

      this.lastSyncTimestamp = Date.now();
      console.log(`Pipeline completed: ${this.articles.length} stories, ${this.thematicClusters.length} themes, ${this.events.length} events enriched.`);
    } catch (err) {
      this.syncError = (err as Error).message || 'Failed to complete data sync';
      console.error('DataStore sync failed:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  public async enrichArticleOnDemand(id: string): Promise<NewsArticle | undefined> {
    const article = this.articles.find(a => a.id === id);
    if (!article) return undefined;

    try {
      const aiResult = await processArticleAIAnalysis(article);
      article.aiSummary = aiResult.aiSummary;
      article.aiFacts = aiResult.aiFacts;
      article.aiInterpretations = aiResult.aiInterpretations;
      article.aiWhyItMatters = aiResult.aiWhyItMatters;
      article.transmissionChain = aiResult.transmissionChain;
      article.aiMarketImpact = aiResult.aiMarketImpact;
      article.aiConfidence = aiResult.aiConfidence;
      article.confidenceReasoning = aiResult.confidenceReasoning;
      article.timeHorizon = aiResult.timeHorizon;
      article.sentiment = aiResult.sentiment;
    } catch (err) {
      console.info(`Article AI analysis fallback for ${id}`);
    }
    return article;
  }

  public async enrichEventOnDemand(id: string): Promise<EconomicEvent | undefined> {
    const event = this.events.find(e => e.id === id);
    if (!event) return undefined;

    try {
      const exp = await processEconomicEventAIAnalysis(event);
      event.aiExplanation = exp;
    } catch (err) {
      console.info(`Event AI analysis fallback for ${id}`);
    }
    return event;
  }

  public getArticles(filters?: {
    category?: string;
    importance?: string;
    market?: string;
    currency?: string;
    search?: string;
    limit?: number;
    rankingMode?: FeedRankingMode;
    preferences?: Partial<UserPreferences>;
  }): { articles: NewsArticle[]; total: number; categories: string[] } {
    let filtered = [...this.articles];

    // Compute user relevance on each article
    const prefs = filters?.preferences;
    filtered = filtered.map(a => {
      const pEval = calculateArticlePersonalRelevance(a, prefs);
      return {
        ...a,
        userRelevance: pEval,
        userRelevanceScore: pEval.score
      };
    });

    if (filters?.category && filters.category !== 'All') {
      filtered = filtered.filter(a =>
        a.category.toLowerCase() === filters.category!.toLowerCase() ||
        (a.secondaryCategories && a.secondaryCategories.some(sc => sc.toLowerCase() === filters.category!.toLowerCase()))
      );
    }

    if (filters?.importance && filters.importance !== 'all') {
      if (filters.importance === 'high_impact') {
        // Includes both globally high/critical AND personally high/critical
        filtered = filtered.filter(a =>
          a.importance === 'critical' ||
          a.importance === 'high' ||
          a.userRelevance?.level === 'critical' ||
          a.userRelevance?.level === 'high'
        );
      } else {
        filtered = filtered.filter(a => a.importance.toLowerCase() === filters.importance!.toLowerCase());
      }
    }

    if (filters?.market && filters.market !== 'all') {
      const mktStr = filters.market.toLowerCase();
      filtered = filtered.filter(a =>
        a.relatedMarkets.some(m => m.toLowerCase().includes(mktStr)) ||
        a.aiMarketImpact.some(i => i.category.toLowerCase().includes(mktStr) || i.market.toLowerCase().includes(mktStr))
      );
    }

    if (filters?.currency && filters.currency !== 'all') {
      const currStr = filters.currency.toUpperCase();
      filtered = filtered.filter(a => a.relatedCurrencies.includes(currStr));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.aiSummary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q)) ||
        a.relatedMarkets.some(m => m.toLowerCase().includes(q)) ||
        (a.entities && (
          a.entities.countries.some(c => c.toLowerCase().includes(q)) ||
          a.entities.institutions.some(i => i.toLowerCase().includes(q)) ||
          a.entities.companies.some(comp => comp.toLowerCase().includes(q)) ||
          a.entities.assets.some(ast => ast.toLowerCase().includes(q))
        ))
      );
    }

    // Ranking Modes
    const rankingMode = filters?.rankingMode || 'intelligent';
    if (rankingMode === 'intelligent') {
      filtered.sort((a, b) => calculateIntelligentFeedRank(b, prefs) - calculateIntelligentFeedRank(a, prefs));
    } else if (rankingMode === 'global_importance') {
      filtered.sort((a, b) => (b.importanceBreakdown?.score || (b.importance === 'critical' ? 95 : b.importance === 'high' ? 75 : 50)) -
        (a.importanceBreakdown?.score || (a.importance === 'critical' ? 95 : a.importance === 'high' ? 75 : 50)));
    } else if (rankingMode === 'latest') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    const total = filtered.length;
    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return {
      articles: filtered,
      total,
      categories: ['All', 'Central Banks', 'Economy', 'Forex', 'Commodities', 'Stocks', 'Bonds', 'Crypto', 'Geopolitics', 'Business']
    };
  }

  public getArticleById(id: string, preferences?: Partial<UserPreferences>): NewsArticle | undefined {
    const article = this.articles.find(a => a.id === id);
    if (!article) return undefined;
    const pEval = calculateArticlePersonalRelevance(article, preferences);
    return {
      ...article,
      userRelevance: pEval,
      userRelevanceScore: pEval.score
    };
  }

  public getThematicClusters(): ThematicCluster[] {
    return this.thematicClusters;
  }

  public getEvents(filters?: {
    status?: string;
    importance?: string;
    currency?: string;
    country?: string;
    date?: string;
    sort?: 'chronological' | 'relevance' | 'importance';
    preferences?: Partial<UserPreferences>;
  }): { events: EconomicEvent[]; total: number } {
    let filtered = [...this.events];

    const prefs = filters?.preferences;
    filtered = filtered.map(e => {
      const pEval = calculateEventPersonalRelevance(e, prefs);
      return {
        ...e,
        userRelevance: pEval,
        userRelevanceScore: pEval.score
      };
    });

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter(e => e.status === filters.status);
    }

    if (filters?.importance && filters.importance !== 'all') {
      if (filters.importance === 'high_impact') {
        filtered = filtered.filter(e => e.importance === 'critical' || e.importance === 'high' || e.userRelevance?.level === 'critical' || e.userRelevance?.level === 'high');
      } else {
        filtered = filtered.filter(e => e.importance === filters.importance);
      }
    }

    if (filters?.currency && filters.currency !== 'all') {
      filtered = filtered.filter(e => e.currency === filters.currency!.toUpperCase());
    }

    if (filters?.country && filters.country !== 'all') {
      filtered = filtered.filter(e => e.country.toLowerCase() === filters.country!.toLowerCase() || e.countryCode === filters.country!.toUpperCase());
    }

    if (filters?.date && filters.date !== 'all') {
      filtered = filtered.filter(e => e.date === filters.date);
    }

    const sort = filters?.sort || 'chronological';
    if (sort === 'relevance') {
      filtered.sort((a, b) => (b.userRelevanceScore || 0) - (a.userRelevanceScore || 0));
    } else if (sort === 'importance') {
      const scoreMap: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      filtered.sort((a, b) => scoreMap[b.importance] - scoreMap[a.importance]);
    } else {
      filtered.sort((a, b) => a.timestamp - b.timestamp);
    }

    return {
      events: filtered,
      total: filtered.length
    };
  }

  public getEventById(id: string, preferences?: Partial<UserPreferences>): EconomicEvent | undefined {
    const event = this.events.find(e => e.id === id);
    if (!event) return undefined;
    const pEval = calculateEventPersonalRelevance(event, preferences);
    return {
      ...event,
      userRelevance: pEval,
      userRelevanceScore: pEval.score
    };
  }

  public getMarketMetrics(): MarketMetric[] {
    return this.marketMetrics;
  }

  public getMacroPulse(preferences?: Partial<UserPreferences>): MacroOverview {
    const basePulse = this.macroOverview || {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      headline: 'Global Macroeconomic Baseline Overview',
      macroSummary: 'Markets are digesting live central bank guidance and economic releases.',
      keyDrivers: ['Interest rate paths', 'Disinflation trajectory', 'Labor stability'],
      keyRisks: ['Trade policy changes', 'Regional growth differentials', 'Fiscal borrowing pressure'],
      centralBankPosture: 'Data-dependent monetary calibration',
      marketSentiments: [
        { asset: 'Equities', stance: 'bullish', note: 'Supported by earnings resiliency and rate trajectory.' },
        { asset: 'Bonds', stance: 'neutral', note: 'Yields consolidating near baseline targets.' },
        { asset: 'Commodities', stance: 'neutral', note: 'Balancing supply management against mixed demand.' }
      ],
      lastUpdated: new Date().toISOString()
    };

    const personalized = generatePersonalizedMacroView(basePulse, this.articles, this.events, preferences);
    return {
      ...basePulse,
      personalizedView: personalized
    };
  }

  public async askQuery(query: string, preferences?: Partial<UserPreferences>): Promise<IntelligenceAnswer> {
    return askFinancialIntelligence(query, this.articles, this.events, this.marketMetrics, preferences);
  }

  public searchAll(q: string) {
    const query = q.toLowerCase().trim();
    if (!query) return { news: [], events: [], topics: [] };

    const matchedNews = this.articles.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query)) ||
      a.relatedCurrencies.some(c => c.toLowerCase().includes(query)) ||
      a.relatedMarkets.some(m => m.toLowerCase().includes(query))
    );

    const matchedEvents = this.events.filter(e =>
      e.eventName.toLowerCase().includes(query) ||
      e.country.toLowerCase().includes(query) ||
      e.currency.toLowerCase().includes(query) ||
      e.description.toLowerCase().includes(query)
    );

    const topicsSet = new Set<string>();
    this.articles.forEach(a => {
      a.tags.forEach(t => {
        if (t.toLowerCase().includes(query)) topicsSet.add(t);
      });
    });

    return {
      query: q,
      news: matchedNews,
      events: matchedEvents,
      topics: Array.from(topicsSet)
    };
  }

  public async getMacroSeries(seriesId: string): Promise<MacroSeries | null> {
    return await fetchFredSeries(seriesId);
  }

  public getStatus() {
    return {
      status: 'ok',
      hasGeminiApiKey: Boolean(CONFIG.GEMINI_API_KEY),
      hasFinnhubKey: Boolean(CONFIG.FINNHUB_API_KEY),
      hasAlphaVantageKey: Boolean(CONFIG.ALPHA_VANTAGE_API_KEY),
      hasNewsApiKey: Boolean(CONFIG.NEWS_API_KEY),
      hasGNewsKey: Boolean(CONFIG.GNEWS_API_KEY),
      hasFredKey: Boolean(CONFIG.FRED_API_KEY),
      articlesCount: this.articles.length,
      thematicCount: this.thematicClusters.length,
      eventsCount: this.events.length,
      lastSync: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp).toISOString() : null,
      isSyncing: this.isSyncing,
      syncError: this.syncError,
      providerStats: this.providerStats
    };
  }
}

export const dataStore = new DataStore();
