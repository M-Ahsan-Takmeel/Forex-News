import { CONFIG } from '../../config';
import { RawNewsItem } from '../../types/providerTypes';

export async function fetchNewsApiArticles(): Promise<RawNewsItem[]> {
  const results: RawNewsItem[] = [];

  // NewsAPI
  if (CONFIG.NEWS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=20&apiKey=${encodeURIComponent(CONFIG.NEWS_API_KEY)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.articles)) {
          data.articles.forEach((a: any) => {
            if (a.title && a.title !== '[Removed]') {
              results.push({
                id: `newsapi-${a.title.replace(/\W+/g, '-').slice(0, 40)}`,
                title: a.title,
                description: a.description || a.title,
                content: a.content || a.description || '',
                url: a.url || '',
                source: a.source?.name || 'NewsAPI Business',
                publishedAt: a.publishedAt || new Date().toISOString(),
                author: a.author,
                provider: 'newsapi',
                credibilityScore: 86
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('NewsAPI fetch warning:', (err as Error).message);
    }
  }

  // GNews
  if (CONFIG.GNEWS_API_KEY) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://gnews.io/api/v4/top-headlines?category=business&lang=en&max=15&apikey=${encodeURIComponent(CONFIG.GNEWS_API_KEY)}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.articles)) {
          data.articles.forEach((a: any) => {
            if (a.title) {
              results.push({
                id: `gnews-${a.title.replace(/\W+/g, '-').slice(0, 40)}`,
                title: a.title,
                description: a.description || a.title,
                content: a.content || a.description || '',
                url: a.url || '',
                source: a.source?.name || 'GNews Business',
                publishedAt: a.publishedAt || new Date().toISOString(),
                provider: 'gnews',
                credibilityScore: 84
              });
            }
          });
        }
      }
    } catch (err) {
      console.warn('GNews fetch warning:', (err as Error).message);
    }
  }

  return results;
}

export async function testNewsApiConnection(): Promise<{
  status: 'CONNECTED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'NO_DATA' | 'NOT_CONFIGURED';
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
}> {
  if (!CONFIG.NEWS_API_KEY) {
    return {
      status: 'NOT_CONFIGURED',
      details: 'NEWS_API_KEY is not set in environment.'
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&pageSize=2&apiKey=${encodeURIComponent(CONFIG.NEWS_API_KEY)}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'INVALID_KEY',
        latencyMs,
        details: 'NewsAPI returned 401/403 Unauthorized.'
      };
    }

    if (res.status === 429) {
      return {
        status: 'RATE_LIMITED',
        latencyMs,
        details: 'NewsAPI 429 rate limit reached for current key.'
      };
    }

    if (!res.ok) {
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        details: `NewsAPI returned HTTP ${res.status}.`
      };
    }

    const data = await res.json();
    const count = Array.isArray(data?.articles) ? data.articles.length : 0;

    return {
      status: count > 0 ? 'CONNECTED' : 'NO_DATA',
      latencyMs,
      itemsRetrieved: count,
      details: `Successfully fetched ${count} business headlines from NewsAPI.`
    };
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      latencyMs: Date.now() - startTime,
      details: `NewsAPI request failed: ${err.message}`
    };
  }
}

