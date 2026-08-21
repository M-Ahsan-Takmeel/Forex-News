import { RawNewsItem } from '../types/providerTypes';
import { SourceReference, EntitiesExtracted } from '../../src/types';
import { extractEntities } from './entityExtractor';
import { CONFIG } from '../config';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for',
  'with', 'by', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out',
  'against', 'during', 'without', 'before', 'under', 'around', 'among', 'of', 'from', 'up', 'down',
  'says', 'said', 'will', 'amid', 'new', 'after', 'more', 'than', 'could', 'may', 'its', 'their', 'has', 'have',
  'today', 'report', 'reports', 'news', 'update', 'market', 'markets', 'latest'
]);

export interface NormalizedStoryCluster {
  clusterId: string;
  primary: RawNewsItem;
  duplicates: RawNewsItem[];
  allSources: SourceReference[];
  independentSourcesCount: number;
  isVerified: boolean;
  firstReportedTimestamp: string;
  lastUpdatedTimestamp: string;
  entities: EntitiesExtracted;
}

function tokenize(text: string): Set<string> {
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ');
  const tokenSet = new Set<string>();

  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word)) {
      tokenSet.add(word);
    }
  }

  return tokenSet;
}

function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersectionCount++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize === 0 ? 0 : intersectionCount / unionSize;
}

function extractDomainOrPublisher(sourceName: string, url: string): string {
  if (sourceName && sourceName.trim().length > 1) {
    const cleaned = sourceName.toLowerCase().trim();
    if (cleaned.includes('reuters')) return 'reuters.com';
    if (cleaned.includes('bloomberg')) return 'bloomberg.com';
    if (cleaned.includes('financial times') || cleaned.includes('ft.com')) return 'ft.com';
    if (cleaned.includes('wall street journal') || cleaned.includes('wsj')) return 'wsj.com';
    if (cleaned.includes('cnbc')) return 'cnbc.com';
    if (cleaned.includes('marketwatch')) return 'marketwatch.com';
    if (cleaned.includes('investing.com') || cleaned.includes('investing')) return 'investing.com';
    if (cleaned.includes('federal reserve') || cleaned.includes('fed wire')) return 'federalreserve.gov';
    if (cleaned.includes('yahoo')) return 'yahoo.com';
    if (cleaned.includes('associated press') || cleaned.includes('ap news')) return 'apnews.com';
    return cleaned;
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'independent-wire';
  }
}

function calculateEntityOverlap(entA: EntitiesExtracted, entB: EntitiesExtracted): number {
  let matched = 0;
  let total = 0;

  const compareLists = (listA: string[], listB: string[]) => {
    if (listA.length === 0 && listB.length === 0) return;
    total += Math.max(listA.length, listB.length);
    for (const a of listA) {
      if (listB.includes(a)) matched += 2;
    }
  };

  compareLists(entA.institutions, entB.institutions);
  compareLists(entA.companies, entB.companies);
  compareLists(entA.currencies, entB.currencies);
  compareLists(entA.assets, entB.assets);
  compareLists(entA.countries, entB.countries);

  return total === 0 ? 0 : Math.min(1, matched / total);
}

function timeDifferenceHours(dateA: string, dateB: string): number {
  try {
    const tA = new Date(dateA).getTime();
    const tB = new Date(dateB).getTime();
    return Math.abs(tA - tB) / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

function timeAgo(dateStr: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diffMin = Math.floor((now - past) / (1000 * 60));
    if (diffMin < 60) return `${Math.max(1, diffMin)}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'recent';
  }
}

export function deduplicateAndClusterNews(items: RawNewsItem[]): NormalizedStoryCluster[] {
  if (!items || items.length === 0) return [];

  const clusters: NormalizedStoryCluster[] = [];
  const tokenizedMap = new Map<string, Set<string>>();
  const entityMap = new Map<string, EntitiesExtracted>();

  items.forEach(item => {
    tokenizedMap.set(item.id, tokenize(`${item.title} ${item.description}`));
    entityMap.set(item.id, extractEntities(`${item.title} ${item.description}`));
  });

  const assigned = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    if (assigned.has(current.id)) continue;

    const currentTokens = tokenizedMap.get(current.id) || new Set();
    const currentEntities = entityMap.get(current.id) || { countries: [], currencies: [], assets: [], institutions: [], companies: [] };
    const currentClusterItems: RawNewsItem[] = [current];
    assigned.add(current.id);

    for (let j = i + 1; j < items.length; j++) {
      const candidate = items[j];
      if (assigned.has(candidate.id)) continue;

      // Must be within 36 hours
      if (timeDifferenceHours(current.publishedAt, candidate.publishedAt) > 36) continue;

      const candidateTokens = tokenizedMap.get(candidate.id) || new Set();
      const candidateEntities = entityMap.get(candidate.id) || { countries: [], currencies: [], assets: [], institutions: [], companies: [] };

      const jaccardSim = calculateJaccardSimilarity(currentTokens, candidateTokens);
      const entitySim = calculateEntityOverlap(currentEntities, candidateEntities);

      // Blended similarity score
      // A high entity match requires less text overlap; high text overlap links stories even with partial entity tag
      const blendedSimilarity = jaccardSim * 0.65 + entitySim * 0.35;

      // Distinct event protection: if both mention different specific action keywords, keep separate
      const titleA = current.title.toLowerCase();
      const titleB = candidate.title.toLowerCase();
      const hasDivergentAction =
        (titleA.includes('emergency') && !titleB.includes('emergency')) ||
        (titleA.includes('resigns') && !titleB.includes('resigns')) ||
        (titleA.includes('record high') && titleB.includes('record low'));

      if (!hasDivergentAction && (blendedSimilarity >= CONFIG.DEDUPLICATION_SIMILARITY_THRESHOLD || jaccardSim >= 0.55)) {
        currentClusterItems.push(candidate);
        assigned.add(candidate.id);
      }
    }

    // Sort items inside cluster to pick the primary (highest credibility and most complete description)
    currentClusterItems.sort((a, b) => {
      if (b.credibilityScore !== a.credibilityScore) {
        return b.credibilityScore - a.credibilityScore;
      }
      return b.description.length - a.description.length;
    });

    const primary = currentClusterItems[0];
    const duplicates = currentClusterItems.slice(1);

    // Calculate source diversity (unique independent publisher domains)
    const uniquePublishers = new Set<string>();
    const allSources: SourceReference[] = currentClusterItems.map(item => {
      const publisherDomain = extractDomainOrPublisher(item.source, item.url);
      uniquePublishers.add(publisherDomain);

      return {
        name: item.source,
        url: item.url,
        timeAgo: timeAgo(item.publishedAt),
        snippet: item.description.slice(0, 140) + (item.description.length > 140 ? '...' : ''),
        credibilityScore: item.credibilityScore
      };
    });

    const independentSourcesCount = uniquePublishers.size;
    const isVerified = independentSourcesCount >= 2;

    // Aggregate timestamps across all articles in cluster
    const timestamps = currentClusterItems
      .map(item => new Date(item.publishedAt).getTime())
      .filter(t => !isNaN(t));

    const firstReportedTimestamp = timestamps.length > 0
      ? new Date(Math.min(...timestamps)).toISOString()
      : primary.publishedAt;

    const lastUpdatedTimestamp = timestamps.length > 0
      ? new Date(Math.max(...timestamps)).toISOString()
      : primary.publishedAt;

    // Aggregate extracted entities for the cluster
    const clusterEntities = extractEntities(
      currentClusterItems.map(item => `${item.title} ${item.description}`).join(' ')
    );

    clusters.push({
      clusterId: `cluster-${primary.id}`,
      primary,
      duplicates,
      allSources,
      independentSourcesCount,
      isVerified,
      firstReportedTimestamp,
      lastUpdatedTimestamp,
      entities: clusterEntities
    });
  }

  return clusters;
}
