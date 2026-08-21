export type ImportanceLevel = 'low' | 'medium' | 'high' | 'critical';
export type ImpactDirection = 'bullish' | 'bearish' | 'neutral' | 'unclear';
export type EventStatus = 'upcoming' | 'released' | 'revised';
export type DeviationImpact = 'better_than_expected' | 'worse_than_expected' | 'in_line' | 'pending';
export type NewsCategory =
  | 'All'
  | 'Central Banks'
  | 'Economy'
  | 'Forex'
  | 'Commodities'
  | 'Stocks'
  | 'Bonds'
  | 'Crypto'
  | 'Geopolitics'
  | 'Business';

export interface SourceReference {
  name: string;
  url: string;
  timeAgo: string;
  snippet?: string;
  credibilityScore?: number;
}

export interface MarketImpactItem {
  market: string;
  category: 'Forex' | 'Commodities' | 'Stocks' | 'Bonds' | 'Crypto' | 'Sector';
  direction: ImpactDirection;
  rationale: string;
}

export interface EntitiesExtracted {
  countries: string[];
  currencies: string[];
  assets: string[];
  institutions: string[];
  companies: string[];
}

export interface ImportanceBreakdown {
  score: number; // 0 - 100
  level: ImportanceLevel;
  factors: {
    centralBankRelevance: number;
    economicSignificance: number;
    sourceDiversity: number;
    marketSensitivity: number;
    breakingUrgency: number;
  };
  reasoning: string;
}

export interface ThematicCluster {
  id: string;
  theme: string;
  headline: string;
  description: string;
  category: NewsCategory;
  storyIds: string[];
  storyCount: number;
  bias: ImpactDirection;
  keyDrivers: string[];
}

export type FreshnessStatus = 'fresh' | 'recently_cached' | 'stale' | 'unavailable';

export interface SourceProvenanceChain {
  insightId: string;
  clusterId?: string;
  articleIds: string[];
  providers: string[];
  originalSources: {
    name: string;
    url?: string;
    publishedAt?: string;
    credibilityScore?: number;
  }[];
  retrievalTimestamp: string;
  processedTimestamp: string;
  verificationStatus: 'multi_source_verified' | 'single_source_provisional' | 'official_agency_grounded';
  evidenceChain: string[];
}

export interface NormalizedFinancialNumber {
  raw: string;
  numeric: number | null;
  unit: string;
  isPercentage: boolean;
  isBasisPoints: boolean;
  isCurrency: boolean;
  display: string;
  status: 'valid' | 'unavailable' | 'non_numeric' | 'cancelled' | 'postponed';
}

export interface QuarantinedItem {
  id: string;
  provider: string;
  itemType: 'news' | 'calendar' | 'macro';
  title?: string;
  reason: string;
  rawPayloadSnippet: string;
  timestamp: string;
}

export interface DataHealthStatus {
  freshness: FreshnessStatus;
  schemaValidationRate: number; // 0 - 100%
  quarantinedCount: number;
  quarantinedBreakdown: Record<string, number>;
  totalProcessed: number;
  lastValidationCheck: string;
}

export interface IntelligenceHealthStatus {
  clusteringEfficacy: number; // 0 - 100%
  entityExtractionCoverage: number; // 0 - 100%
  thematicCohesionScore: number; // 0 - 100%
  totalStoryClusters: number;
}

export interface AiGroundingHealthStatus {
  groundingVerificationRate: number; // 0 - 100%
  unsupportedClaimsPrevented: number;
  insufficientEvidenceCount: number;
  fallbackAnalysisRate: number;
  rateLimitCooldownActive: boolean;
  modelInUse: string;
}

export interface MultiTierDiagnostics {
  timestamp: string;
  infrastructure: ProviderDiagnostic[];
  dataHealth: DataHealthStatus;
  intelligenceHealth: IntelligenceHealthStatus;
  aiHealth: AiGroundingHealthStatus;
  testsPassing: boolean;
  connectedCount: number;
  totalConfigured: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  fullContent?: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  retrievedAt?: string;
  processedAt?: string;
  expiresAt?: string;
  freshness?: FreshnessStatus;
  category: NewsCategory;
  secondaryCategories?: NewsCategory[];
  country?: string;
  countryCode?: string;
  relatedCurrencies: string[];
  relatedMarkets: string[];
  relatedSectors?: string[];
  entities?: EntitiesExtracted;
  importance: ImportanceLevel;
  importanceBreakdown?: ImportanceBreakdown;
  sentiment: 'bullish' | 'bearish' | 'neutral' | 'mixed';
  clusterCount?: number;
  independentSourcesCount?: number;
  isVerified?: boolean;
  sources: SourceReference[];
  provenance?: SourceProvenanceChain;
  aiSummary: string;
  aiFacts?: string[];
  aiInterpretations?: string[];
  aiWhyItMatters: string;
  transmissionChain?: string[];
  aiMarketImpact: MarketImpactItem[];
  aiConfidence: 'low' | 'medium' | 'high';
  confidenceReasoning?: string;
  groundingScore?: number;
  timeHorizon: 'short-term' | 'medium-term' | 'long-term';
  tags: string[];
  userRelevance?: UserRelevanceEvaluation;
  userRelevanceScore?: number;
}

export interface EconomicEvent {
  id: string;
  eventName: string;
  country: string;
  countryCode: string;
  currency: string;
  date: string;
  time: string;
  timestamp: number;
  retrievedAt?: string;
  processedAt?: string;
  expiresAt?: string;
  freshness?: FreshnessStatus;
  importance: ImportanceLevel;
  previous: string;
  forecast: string;
  actual?: string;
  unit: string;
  status: EventStatus;
  normalizedPrevious?: NormalizedFinancialNumber;
  normalizedForecast?: NormalizedFinancialNumber;
  normalizedActual?: NormalizedFinancialNumber;
  deviation?: DeviationImpact;
  deviationNote?: string;
  description: string;
  provenance?: SourceProvenanceChain;
  aiExplanation?: {
    whatItMeasures: string;
    whyItMatters: string;
    higherThanExpectedImpact: string;
    lowerThanExpectedImpact: string;
    sensitiveMarkets: string[];
  };
  userRelevance?: UserRelevanceEvaluation;
  userRelevanceScore?: number;
}

export interface MacroDataPoint {
  date: string;
  value: number;
}

export interface MacroSeries {
  id: string;
  title: string;
  units: string;
  frequency: string;
  lastUpdated: string;
  observations: MacroDataPoint[];
}

export type ApiProviderStatus =
  | 'CONNECTED'
  | 'INVALID_KEY'
  | 'RATE_LIMITED'
  | 'UNAVAILABLE'
  | 'NO_DATA'
  | 'NOT_CONFIGURED';

export interface ProviderDiagnostic {
  provider: string;
  service: string;
  status: ApiProviderStatus;
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
  lastChecked: string;
}

export interface MarketMetric {
  symbol: string;
  name: string;
  category: 'index' | 'fx' | 'commodity' | 'rate' | 'crypto';
  price: string;
  change: string;
  changePercent: number;
  isPositive: boolean;
  unit?: string;
}

export type SummaryDepth = 'brief' | 'standard' | 'detailed';
export type FeedRankingMode = 'intelligent' | 'global_importance' | 'latest';

export interface UserFeedbackState {
  likedTopics: string[];
  dislikedTopics: string[];
  likedEntities: string[];
  dislikedEntities: string[];
  likedArticleIds: string[];
  dislikedArticleIds: string[];
}

export interface UserPreferences {
  selectedMarkets: string[];
  selectedCurrencies: string[];
  selectedCountries: string[];
  selectedTopics: string[];
  selectedCategories: string[];
  summaryDepth: SummaryDepth;
  readingDepth?: 'concise' | 'detailed'; // backwards compatibility
  showHighImpactOnly: boolean;
  feedRankingMode: FeedRankingMode;
  feedback: UserFeedbackState;
  recentInteractions?: {
    articleClicks: string[];
    eventClicks: string[];
    searchQueries: string[];
    lastActive: string;
  };
}

export interface UserRelevanceEvaluation {
  score: number; // 0 - 100
  level: ImportanceLevel;
  matchedFactors: string[];
  whyItMattersToYou: string;
}

export interface IntelligenceAnswer {
  query: string;
  directAnswer: string;
  facts: string[];
  interpretations: string[];
  potentialImpacts: string[];
  transmissionMechanism?: string;
  whyItMatters: string;
  affectedAssets: {
    name: string;
    category: string;
    direction: ImpactDirection;
    reason: string;
  }[];
  timeHorizon: 'short-term' | 'medium-term' | 'long-term';
  confidence: 'low' | 'medium' | 'high';
  confidenceReasoning?: string;
  sourcesCited: string[];
  personalizedContextNote?: string;
}

export interface MacroOverview {
  date: string;
  headline: string;
  macroSummary: string;
  keyDrivers: string[];
  keyRisks: string[];
  centralBankPosture: string;
  marketSentiments: {
    asset: string;
    stance: 'bullish' | 'bearish' | 'neutral';
    note: string;
  }[];
  personalizedView?: {
    headline: string;
    macroSummary: string;
    keyDrivers: string[];
    matchedInterests: string[];
  };
  lastUpdated: string;
}
