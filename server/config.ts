import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PORT: 3000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY || '',
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  NEWS_API_KEY: process.env.NEWS_API_KEY || '',
  GNEWS_API_KEY: process.env.GNEWS_API_KEY || '',
  FRED_API_KEY: process.env.FRED_API_KEY || '',

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
