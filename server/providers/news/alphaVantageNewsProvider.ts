import { CONFIG } from '../../config';
import { RawNewsItem } from '../../types/providerTypes';

export async function fetchAlphaVantageNews(): Promise<RawNewsItem[]> {
  if (!CONFIG.ALPHA_VANTAGE_API_KEY) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,financial_markets,monetary_policy&limit=25&apikey=${encodeURIComponent(CONFIG.ALPHA_VANTAGE_API_KEY)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Alpha Vantage News API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    const feed = data?.feed;
    if (!Array.isArray(feed)) return [];

    return feed.slice(0, 20).map((item: any) => {
      // Time published is in format YYYYMMDDTHHMMSS
      let publishedAt = new Date().toISOString();
      if (item.time_published && typeof item.time_published === 'string' && item.time_published.length >= 15) {
        const year = item.time_published.substring(0, 4);
        const month = item.time_published.substring(4, 6);
        const day = item.time_published.substring(6, 8);
        const hour = item.time_published.substring(9, 11);
        const min = item.time_published.substring(11, 13);
        const sec = item.time_published.substring(13, 15);
        try {
          publishedAt = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`).toISOString();
        } catch {
          publishedAt = new Date().toISOString();
        }
      }

      return {
        id: `av-${item.title.replace(/\W+/g, '-').slice(0, 40)}`,
        title: item.title || '',
        description: item.summary || item.title || '',
        content: item.summary || '',
        url: item.url || '',
        source: item.source || 'Alpha Vantage',
        publishedAt,
        provider: 'alphavantage' as const,
        credibilityScore: 90
      };
    }).filter(a => a.title && a.title.length > 10);
  } catch (err) {
    console.warn('Alpha Vantage News fetch failed:', (err as Error).message);
    return [];
  }
}

export async function testAlphaVantageConnection(): Promise<{
  status: 'CONNECTED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'NO_DATA' | 'NOT_CONFIGURED';
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
}> {
  if (!CONFIG.ALPHA_VANTAGE_API_KEY) {
    return {
      status: 'NOT_CONFIGURED',
      details: 'ALPHA_VANTAGE_API_KEY is not set in environment.'
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro&limit=2&apikey=${encodeURIComponent(CONFIG.ALPHA_VANTAGE_API_KEY)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        details: `Alpha Vantage returned HTTP ${res.status}.`
      };
    }

    const data = await res.json();
    if (data?.Note && typeof data.Note === 'string' && data.Note.includes('standard API rate limit')) {
      return {
        status: 'RATE_LIMITED',
        latencyMs,
        details: 'Alpha Vantage standard API rate limit reached (5 calls/min).'
      };
    }

    if (data?.['Error Message'] || data?.Information?.includes('Invalid API key')) {
      return {
        status: 'INVALID_KEY',
        latencyMs,
        details: 'Alpha Vantage rejected API key.'
      };
    }

    const count = Array.isArray(data?.feed) ? data.feed.length : 0;
    return {
      status: count > 0 ? 'CONNECTED' : 'NO_DATA',
      latencyMs,
      itemsRetrieved: count,
      details: `Successfully fetched ${count} news sentiment items from Alpha Vantage.`
    };
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      latencyMs: Date.now() - startTime,
      details: `Alpha Vantage request failed: ${err.message}`
    };
  }
}

