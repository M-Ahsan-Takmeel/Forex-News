import { XMLParser } from 'fast-xml-parser';
import { RawNewsItem } from '../../types/providerTypes';

interface RSSFeedConfig {
  name: string;
  url: string;
  categoryHint?: RawNewsItem['categoryHint'];
  credibilityScore: number;
}

const RSS_FEEDS: RSSFeedConfig[] = [
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    credibilityScore: 88
  },
  {
    name: 'MarketWatch',
    url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    credibilityScore: 90
  },
  {
    name: 'CNBC Markets',
    url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=markets&sort=date&output=rss',
    credibilityScore: 89
  },
  {
    name: 'CNBC Economy',
    url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=economy&sort=date&output=rss',
    categoryHint: 'Economy',
    credibilityScore: 89
  },
  {
    name: 'Federal Reserve News',
    url: 'https://www.federalreserve.gov/feeds/press_all.xml',
    categoryHint: 'Central Banks',
    credibilityScore: 99
  },
  {
    name: 'Investing.com News',
    url: 'https://www.investing.com/rss/news.rss',
    credibilityScore: 85
  }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true
});

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function generateHashId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'rss-' + Math.abs(hash).toString(36);
}

export async function fetchRSSNews(): Promise<RawNewsItem[]> {
  const articles: RawNewsItem[] = [];

  const promises = RSS_FEEDS.map(async feed => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 FinancialIntelligenceBot/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return;
      }

      const xmlText = await res.text();
      const parsed = parser.parse(xmlText);

      // Handle standard RSS or Atom feeds
      const channel = parsed.rss?.channel || parsed.feed;
      if (!channel) return;

      const items = channel.item || channel.entry || [];
      const itemArray = Array.isArray(items) ? items : [items];

      for (const item of itemArray.slice(0, 15)) {
        const rawTitle = item.title?.['#text'] || item.title || '';
        const title = stripHtml(typeof rawTitle === 'string' ? rawTitle : '');
        if (!title || title.length < 10) continue;

        const rawDesc = item.description?.['#text'] || item.description || item.summary?.['#text'] || item.summary || item['content:encoded'] || '';
        const description = stripHtml(typeof rawDesc === 'string' ? rawDesc : '').slice(0, 500);

        const rawLink = item.link?.['@_href'] || item.link?.['#text'] || item.link || item.guid?.['#text'] || item.guid || '';
        const url = typeof rawLink === 'string' ? rawLink : '';

        const pubDateRaw = item.pubDate || item.published || item.updated || item['dc:date'] || new Date().toISOString();
        let publishedAt: string;
        try {
          publishedAt = new Date(pubDateRaw).toISOString();
        } catch {
          publishedAt = new Date().toISOString();
        }

        const id = generateHashId(url || title);

        articles.push({
          id,
          title,
          description: description || title,
          content: description,
          url: url || 'https://finance.yahoo.com',
          source: feed.name,
          publishedAt,
          categoryHint: feed.categoryHint,
          provider: 'rss',
          credibilityScore: feed.credibilityScore
        });
      }
    } catch (err) {
      // Individual feed failures should not break the pipeline
      console.warn(`RSS feed fetch warning for ${feed.name}:`, (err as Error).message);
    }
  });

  await Promise.allSettled(promises);
  return articles;
}

export async function testRssConnection(): Promise<{
  status: 'CONNECTED' | 'UNAVAILABLE' | 'NO_DATA';
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
}> {
  const startTime = Date.now();
  try {
    const items = await fetchRSSNews();
    const latencyMs = Date.now() - startTime;
    return {
      status: items.length > 0 ? 'CONNECTED' : 'NO_DATA',
      latencyMs,
      itemsRetrieved: items.length,
      details: `Active institutional RSS channels (Fed, Yahoo, MarketWatch, CNBC, Investing.com) delivered ${items.length} items.`
    };
  } catch (err: any) {
    return {
      status: 'UNAVAILABLE',
      latencyMs: Date.now() - startTime,
      details: `RSS network fetch failure: ${err.message}`
    };
  }
}

