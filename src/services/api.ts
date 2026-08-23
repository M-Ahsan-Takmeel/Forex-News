import { NewsArticle, EconomicEvent, MarketMetric, MacroOverview, IntelligenceAnswer, ProviderDiagnostic, MacroSeries, ThematicCluster, UserPreferences, FeedRankingMode, MultiTierDiagnostics, QuarantinedItem } from '../types';

export async function fetchMarketMetrics(): Promise<{ metrics: MarketMetric[]; lastUpdated: string }> {
  const res = await fetch('/api/markets/summary');
  if (!res.ok) throw new Error('Failed to fetch market benchmarks');
  return res.json();
}

export async function fetchNewsArticles(params?: {
  category?: string;
  importance?: string;
  market?: string;
  currency?: string;
  search?: string;
  limit?: number;
  rankingMode?: FeedRankingMode;
  preferences?: Partial<UserPreferences>;
}): Promise<{ articles: NewsArticle[]; total: number; categories: string[] }> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.importance) query.set('importance', params.importance);
  if (params?.market) query.set('market', params.market);
  if (params?.currency) query.set('currency', params.currency);
  if (params?.search) query.set('search', params.search);
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.rankingMode) query.set('rankingMode', params.rankingMode);
  if (params?.preferences) query.set('preferences', JSON.stringify(params.preferences));

  const res = await fetch(`/api/news?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch news articles');
  return res.json();
}

export async function fetchNewsArticleById(id: string, preferences?: Partial<UserPreferences>): Promise<{ article: NewsArticle }> {
  const query = preferences ? `?preferences=${encodeURIComponent(JSON.stringify(preferences))}` : '';
  const res = await fetch(`/api/news/${encodeURIComponent(id)}${query}`);
  if (!res.ok) throw new Error('Failed to fetch article details');
  return res.json();
}

export async function analyzeNewsWithAI(articleData: Partial<NewsArticle>, preferences?: Partial<UserPreferences>): Promise<{ analysis: any }> {
  const res = await fetch('/api/ai/analyze-news', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ articleData, preferences })
  });
  if (!res.ok) throw new Error('Failed to generate AI news analysis');
  return res.json();
}

export async function fetchEconomicEvents(params?: {
  status?: string;
  importance?: string;
  currency?: string;
  country?: string;
  date?: string;
  sort?: 'chronological' | 'relevance' | 'importance';
  preferences?: Partial<UserPreferences>;
}): Promise<{ events: EconomicEvent[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.importance) query.set('importance', params.importance);
  if (params?.currency) query.set('currency', params.currency);
  if (params?.country) query.set('country', params.country);
  if (params?.date) query.set('date', params.date);
  if (params?.sort) query.set('sort', params.sort);
  if (params?.preferences) query.set('preferences', JSON.stringify(params.preferences));

  const res = await fetch(`/api/calendar?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch economic calendar');
  return res.json();
}

export async function fetchEventAnalysis(id: string, preferences?: Partial<UserPreferences>): Promise<{
  explanation: {
    whatItMeasures: string;
    whyItMatters: string;
    higherThanExpectedImpact: string;
    lowerThanExpectedImpact: string;
    sensitiveMarkets: string[];
  };
  event: EconomicEvent;
}> {
  const query = preferences ? `?preferences=${encodeURIComponent(JSON.stringify(preferences))}` : '';
  const res = await fetch(`/api/calendar/${encodeURIComponent(id)}/analysis${query}`);
  if (!res.ok) throw new Error('Failed to fetch event analysis');
  return res.json();
}

export async function fetchMacroPulse(preferences?: Partial<UserPreferences>): Promise<{ overview: MacroOverview }> {
  const query = preferences ? `?preferences=${encodeURIComponent(JSON.stringify(preferences))}` : '';
  const res = await fetch(`/api/insights/macro-pulse${query}`);
  if (!res.ok) throw new Error('Failed to fetch macro intelligence pulse');
  return res.json();
}

export async function askIntelligenceQuery(query: string, preferences?: Partial<UserPreferences>): Promise<{ answer: IntelligenceAnswer }> {
  const res = await fetch('/api/insights/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, preferences })
  });
  if (!res.ok) throw new Error('Failed to process intelligence query');
  return res.json();
}

export async function executeGlobalSearch(q: string): Promise<{
  query: string;
  news: NewsArticle[];
  events: EconomicEvent[];
  topics: string[];
}> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Failed to execute search');
  return res.json();
}

export async function triggerDataSync(): Promise<{ success: boolean; message: string; status: any }> {
  const res = await fetch('/api/sync/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to refresh data pipeline');
  return res.json();
}

export async function fetchHealthStatus(): Promise<any> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Failed to check health status');
  return res.json();
}

export async function fetchDiagnostics(): Promise<{
  timestamp: string;
  diagnostics: ProviderDiagnostic[];
  connectedCount: number;
  totalConfigured: number;
}> {
  const res = await fetch('/api/diagnostics');
  if (!res.ok) throw new Error('Failed to fetch provider diagnostics');
  return res.json();
}

export async function fetchMacroSeries(seriesId: string): Promise<{ series: MacroSeries }> {
  const res = await fetch(`/api/macro/series/${encodeURIComponent(seriesId)}`);
  if (!res.ok) throw new Error(`Failed to fetch macroeconomic series "${seriesId}"`);
  return res.json();
}

export async function fetchThematicClusters(): Promise<{ clusters: ThematicCluster[] }> {
  const res = await fetch('/api/thematic-clusters');
  if (!res.ok) throw new Error('Failed to fetch thematic clusters');
  return res.json();
}

export async function fetchMultiTierDiagnostics(): Promise<MultiTierDiagnostics> {
  const res = await fetch('/api/diagnostics/multi-tier');
  if (!res.ok) throw new Error('Failed to fetch multi-tier diagnostics');
  return res.json();
}

export async function fetchQuarantinedItems(): Promise<{ total: number; items: QuarantinedItem[] }> {
  const res = await fetch('/api/diagnostics/quarantined');
  if (!res.ok) throw new Error('Failed to fetch quarantined records');
  return res.json();
}

export async function fetchReliabilityTests(): Promise<any> {
  const res = await fetch('/api/diagnostics/reliability-tests');
  if (!res.ok) throw new Error('Failed to run reliability test suite');
  return res.json();
}


