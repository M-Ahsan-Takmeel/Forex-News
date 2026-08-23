import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  get PORT(): number {
    return Number(process.env.PORT) || 3000;
  },
  get APP_URL(): string {
    return process.env.APP_URL || '';
  },
  get GEMINI_API_KEY(): string {
    return process.env.GEMINI_API_KEY || '';
  },
  get ALPHA_VANTAGE_API_KEY(): string {
    return process.env.ALPHA_VANTAGE_API_KEY || '';
  },
  get FINNHUB_API_KEY(): string {
    return process.env.FINNHUB_API_KEY || '';
  },
  get NEWS_API_KEY(): string {
    return process.env.NEWS_API_KEY || '';
  },
  get GNEWS_API_KEY(): string {
    return process.env.GNEWS_API_KEY || '';
  },
  get FRED_API_KEY(): string {
    return process.env.FRED_API_KEY || '';
  },

  // Cache TTLs in milliseconds
  CACHE_TTL: {
    NEWS_FEED: 1000 * 60 * 5, // 5 minutes
    CALENDAR: 1000 * 60 * 15, // 15 minutes
    FRED_SERIES: 1000 * 60 * 60 * 6, // 6 hours
    MARKET_PRICES: 1000 * 60 * 2, // 2 minutes
    MACRO_PULSE: 1000 * 60 * 30, // 30 minutes
    AI_ARTICLE_ANALYSIS: 1000 * 60 * 60 * 24, // 24 hours
    AI_EVENT_ANALYSIS: 1000 * 60 * 60 * 24, // 24 hours
    AI_QUERY: 1000 * 60 * 30 // 30 minutes
  },

  // Deduplication similarity threshold (0.0 to 1.0)
  DEDUPLICATION_SIMILARITY_THRESHOLD: 0.42,

  // Max items to process through Gemini batch to respect rate limits
  MAX_AI_BATCH_NEWS: 12,

  // Feed update interval in ms
  BACKGROUND_SYNC_INTERVAL: 1000 * 60 * 10 // 10 minutes
};
