import { NewsCategory, ImportanceLevel, SourceReference } from '../../src/types';

export interface RawNewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  source: string;
  publishedAt: string; // ISO date string or RFC 2822
  author?: string;
  categoryHint?: NewsCategory;
  provider: 'rss' | 'finnhub' | 'alphavantage' | 'newsapi' | 'gnews';
  credibilityScore: number; // 0 - 100
}

export interface RawCalendarItem {
  id: string;
  eventName: string;
  country: string;
  countryCode: string;
  currency: string;
  date: string;
  time: string;
  timestamp: number;
  importance: ImportanceLevel;
  previous: string;
  forecast: string;
  actual?: string;
  unit: string;
  status: 'upcoming' | 'released' | 'revised';
  description?: string;
  provider: string;
}

export interface NewsCluster {
  primary: RawNewsItem;
  duplicates: RawNewsItem[];
  allSources: SourceReference[];
}
