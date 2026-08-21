import { CONFIG } from '../../config';
import { RawNewsItem } from '../../types/providerTypes';

export async function fetchFinnhubNews(): Promise<RawNewsItem[]> {
  if (!CONFIG.FINNHUB_API_KEY) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(CONFIG.FINNHUB_API_KEY)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Finnhub News API returned ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.slice(0, 20).map((item: any) => ({
      id: `finnhub-${item.id || item.headline}`,
      title: item.headline || '',
      description: item.summary || item.headline || '',
      content: item.summary || '',
      url: item.url || '',
      source: item.source || 'Finnhub News',
      publishedAt: item.datetime ? new Date(item.datetime * 1000).toISOString() : new Date().toISOString(),
      provider: 'finnhub' as const,
      credibilityScore: 88
    })).filter(a => a.title && a.title.length > 10);
  } catch (err) {
    console.warn('Finnhub News fetch failed:', (err as Error).message);
    return [];
  }
}

export async function testFinnhubConnection(): Promise<{
  status: 'CONNECTED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'NO_DATA' | 'NOT_CONFIGURED';
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
}> {
  if (!CONFIG.FINNHUB_API_KEY) {
    return {
      status: 'NOT_CONFIGURED',
      details: 'FINNHUB_API_KEY is not set in environment.'
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://finnhub.io/api/v1/news?category=general&token=${encodeURIComponent(CONFIG.FINNHUB_API_KEY)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'INVALID_KEY',
        latencyMs,
        details: 'Finnhub returned 401/403 Invalid API Token.'
      };
    }

    if (res.status === 429) {
      return {
        status: 'RATE_LIMITED',
        latencyMs,
        details: 'Finnhub 429 rate limit exceeded (60 calls/min limit).'
      };
    }

    if (!res.ok) {
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        details: `Finnhub returned HTTP ${res.status}.`
      };
    }

    const data = await res.json();
    const count = Array.isArray(data) ? data.length : 0;

    return {
      status: count > 0 ? 'CONNECTED' : 'NO_DATA',
      latencyMs,
      itemsRetrieved: count,
      details: `Successfully fetched ${count} real-time market stories from Finnhub.`
    };
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      latencyMs: Date.now() - startTime,
      details: `Finnhub request failed: ${err.message}`
    };
  }
}

