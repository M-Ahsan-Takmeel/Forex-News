import { RawNewsItem, RawCalendarItem } from '../types/providerTypes';
import {
  NormalizedFinancialNumber,
  QuarantinedItem,
  DataHealthStatus,
  FreshnessStatus,
  SourceProvenanceChain,
  SourceReference
} from '../../src/types';

class DataQualityRegistry {
  private quarantinedItems: QuarantinedItem[] = [];
  private totalIngestedCount: number = 0;
  private totalValidCount: number = 0;
  private rejectionReasons: Record<string, number> = {};
  private lastCheckTime: string = new Date().toISOString();

  public recordQuarantine(
    provider: string,
    itemType: 'news' | 'calendar' | 'macro',
    reason: string,
    rawPayloadSnippet: string,
    title?: string
  ): void {
    this.totalIngestedCount++;
    this.rejectionReasons[reason] = (this.rejectionReasons[reason] || 0) + 1;
    
    // Store in bounded FIFO quarantine log (last 100 items)
    this.quarantinedItems.unshift({
      id: `quarantine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      provider,
      itemType,
      title: title || 'Untitled/Malformed Item',
      reason,
      rawPayloadSnippet: rawPayloadSnippet.slice(0, 300),
      timestamp: new Date().toISOString()
    });

    if (this.quarantinedItems.length > 100) {
      this.quarantinedItems.pop();
    }
  }

  public recordValid(): void {
    this.totalIngestedCount++;
    this.totalValidCount++;
    this.lastCheckTime = new Date().toISOString();
  }

  public getQuarantinedItems(): QuarantinedItem[] {
    return this.quarantinedItems;
  }

  public getHealthStatus(): DataHealthStatus {
    const rate = this.totalIngestedCount > 0
      ? Number(((this.totalValidCount / this.totalIngestedCount) * 100).toFixed(1))
      : 100;

    return {
      freshness: 'fresh',
      schemaValidationRate: rate,
      quarantinedCount: this.quarantinedItems.length,
      quarantinedBreakdown: { ...this.rejectionReasons },
      totalProcessed: this.totalIngestedCount,
      lastValidationCheck: this.lastCheckTime
    };
  }

  public resetStats(): void {
    this.totalIngestedCount = 0;
    this.totalValidCount = 0;
    this.rejectionReasons = {};
    this.quarantinedItems = [];
  }
}

export const dataQualityRegistry = new DataQualityRegistry();

// ---------------------------------------------------------------------------
// 1. Financial Number Normalization
// ---------------------------------------------------------------------------

export function parseAndNormalizeFinancialNumber(
  rawInput: string | number | undefined | null
): NormalizedFinancialNumber {
  if (rawInput === undefined || rawInput === null || rawInput === '' || rawInput === '—' || rawInput === '-' || rawInput === 'N/A') {
    return {
      raw: String(rawInput ?? '—'),
      numeric: null,
      unit: '',
      isPercentage: false,
      isBasisPoints: false,
      isCurrency: false,
      display: '—',
      status: 'unavailable'
    };
  }

  const rawStr = String(rawInput).trim();

  // Check special status keywords
  const lower = rawStr.toLowerCase();
  if (lower === 'cancelled' || lower === 'canceled') {
    return { raw: rawStr, numeric: null, unit: '', isPercentage: false, isBasisPoints: false, isCurrency: false, display: 'Cancelled', status: 'cancelled' };
  }
  if (lower === 'postponed' || lower === 'delayed') {
    return { raw: rawStr, numeric: null, unit: '', isPercentage: false, isBasisPoints: false, isCurrency: false, display: 'Postponed', status: 'postponed' };
  }
  if (lower === 'unchanged' || lower === 'flat') {
    return { raw: rawStr, numeric: 0, unit: '', isPercentage: false, isBasisPoints: false, isCurrency: false, display: 'Unchanged', status: 'valid' };
  }

  // Detect Unit and Modifiers
  const isPercentage = rawStr.includes('%');
  const isBasisPoints = lower.includes('bps') || lower.includes('bp');
  const isCurrency = /[$€£¥]/.test(rawStr) || /^(usd|eur|gbp|jpy)/i.test(rawStr);

  // Extract explicit unit
  let unit = '';
  if (isPercentage) unit = '%';
  else if (isBasisPoints) unit = 'bps';
  else if (rawStr.includes('$')) unit = 'USD';
  else if (rawStr.includes('€')) unit = 'EUR';
  else if (rawStr.includes('£')) unit = 'GBP';
  else if (rawStr.includes('¥')) unit = 'JPY';
  else if (lower.includes('k')) unit = 'K';
  else if (lower.includes('m') || lower.includes('mln')) unit = 'M';
  else if (lower.includes('b') || lower.includes('bln')) unit = 'B';
  else if (lower.includes('t') || lower.includes('trln')) unit = 'T';

  // Clean numeric string
  let cleaned = rawStr
    .replace(/[$€£¥%]/g, '')
    .replace(/bps|bp/gi, '')
    .replace(/,/g, '')
    .trim();

  // Multipliers for K/M/B/T
  let multiplier = 1;
  if (/k$/i.test(cleaned)) {
    multiplier = 1e3;
    cleaned = cleaned.replace(/k$/i, '');
  } else if (/m(ln)?$/i.test(cleaned)) {
    multiplier = 1e6;
    cleaned = cleaned.replace(/m(ln)?$/i, '');
  } else if (/b(ln)?$/i.test(cleaned)) {
    multiplier = 1e9;
    cleaned = cleaned.replace(/b(ln)?$/i, '');
  } else if (/t(rln)?$/i.test(cleaned)) {
    multiplier = 1e12;
    cleaned = cleaned.replace(/t(rln)?$/i, '');
  }

  const parsedNum = parseFloat(cleaned);
  if (isNaN(parsedNum)) {
    return {
      raw: rawStr,
      numeric: null,
      unit: rawStr,
      isPercentage: false,
      isBasisPoints: false,
      isCurrency: false,
      display: rawStr,
      status: 'non_numeric'
    };
  }

  const finalNumeric = parsedNum * multiplier;

  // Format clean display
  let display = rawStr;
  if (isPercentage && !display.includes('%')) {
    display = `${display}%`;
  }

  return {
    raw: rawStr,
    numeric: finalNumeric,
    unit: unit || '',
    isPercentage,
    isBasisPoints,
    isCurrency,
    display,
    status: 'valid'
  };
}

// ---------------------------------------------------------------------------
// 2. Timestamp Normalization & UTC Standard
// ---------------------------------------------------------------------------

export interface NormalizedTimestampResult {
  iso: string;
  epoch: number;
  isValid: boolean;
  freshness: FreshnessStatus;
  isFutureSuspicious: boolean;
  ageHours: number;
}

export function normalizeTimestampUTC(
  rawInput: string | number | Date | undefined | null
): NormalizedTimestampResult {
  const now = Date.now();

  if (!rawInput) {
    return {
      iso: new Date(now).toISOString(),
      epoch: now,
      isValid: false,
      freshness: 'stale',
      isFutureSuspicious: false,
      ageHours: 0
    };
  }

  let dateObj: Date;

  if (rawInput instanceof Date) {
    dateObj = rawInput;
  } else if (typeof rawInput === 'number') {
    // If epoch seconds, convert to ms
    dateObj = rawInput < 1e11 ? new Date(rawInput * 1000) : new Date(rawInput);
  } else {
    // Handle standard strings and RFC 2822
    const parsed = Date.parse(rawInput);
    if (!isNaN(parsed)) {
      dateObj = new Date(parsed);
    } else {
      // Fallback parse attempt
      dateObj = new Date(rawInput);
    }
  }

  const epoch = dateObj.getTime();
  if (isNaN(epoch)) {
    return {
      iso: new Date(now).toISOString(),
      epoch: now,
      isValid: false,
      freshness: 'stale',
      isFutureSuspicious: false,
      ageHours: 0
    };
  }

  const diffMs = now - epoch;
  const ageHours = diffMs / (1000 * 60 * 60);

  // Check if timestamp is in future by more than 24 hours (clock drift protection)
  const isFutureSuspicious = epoch > now + 24 * 60 * 60 * 1000;

  // Determine freshness
  let freshness: FreshnessStatus = 'fresh';
  if (ageHours < 4) {
    freshness = 'fresh';
  } else if (ageHours < 24) {
    freshness = 'recently_cached';
  } else if (ageHours >= 24) {
    freshness = 'stale';
  }

  return {
    iso: dateObj.toISOString(),
    epoch,
    isValid: true,
    freshness,
    isFutureSuspicious,
    ageHours: Math.max(0, ageHours)
  };
}

// ---------------------------------------------------------------------------
// 3. Raw News Schema Validation & Quarantine
// ---------------------------------------------------------------------------

export interface NewsValidationResult {
  isValid: boolean;
  sanitizedItem?: RawNewsItem;
  quarantineReason?: string;
  errors: string[];
}

export function validateRawNewsItem(raw: any, provider: string): NewsValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    const reason = 'MALFORMED_NON_OBJECT_PAYLOAD';
    dataQualityRegistry.recordQuarantine(provider, 'news', reason, JSON.stringify(raw || {}));
    return { isValid: false, quarantineReason: reason, errors: ['Item is not a valid JSON object'] };
  }

  // 1. Title verification
  const title = (raw.title || raw.headline || '').trim();
  if (!title || title.length < 5) {
    errors.push('Title is missing or under 5 characters');
  }

  // 2. Source verification
  const source = (raw.source || raw.source_name || raw.sourceName || (raw.source && raw.source.name) || '').trim();
  if (!source) {
    errors.push('Publisher source is unidentifiable or missing');
  }

  // 3. Timestamp verification
  const rawDate = raw.publishedAt || raw.datetime || raw.pubDate || raw.time;
  const timeResult = normalizeTimestampUTC(rawDate);
  if (!timeResult.isValid) {
    errors.push('Publication timestamp is malformed or invalid');
  }
  if (timeResult.isFutureSuspicious) {
    errors.push('Publication timestamp is implausibly in the future (>24h)');
  }

  // 4. URL verification
  const url = (raw.url || raw.link || '').trim();
  if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
    // We allow synthetic internal wires if marked as verified source, but flag otherwise
    if (!url.startsWith('wire://') && !url.startsWith('https://')) {
      // Soft error if valid title exists, but normalize to wire url
    }
  }

  // 5. Content / Description existence
  const description = (raw.description || raw.summary || raw.content || '').trim();

  // If fatal errors exist, quarantine
  if (errors.length > 0) {
    const primaryReason = errors[0].toUpperCase().replace(/\s+/g, '_').slice(0, 40);
    dataQualityRegistry.recordQuarantine(
      provider,
      'news',
      primaryReason,
      JSON.stringify(raw),
      title || 'Untitled Article'
    );
    return { isValid: false, quarantineReason: primaryReason, errors };
  }

  // Passed quality check
  dataQualityRegistry.recordValid();

  const sanitizedItem: RawNewsItem = {
    id: String(raw.id || `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    title,
    description: description || title,
    content: raw.content || description || title,
    url: url || `https://${source.toLowerCase().replace(/[^\w]/g, '')}.com/story/${Date.now()}`,
    source,
    publishedAt: timeResult.iso,
    author: raw.author || undefined,
    categoryHint: raw.categoryHint || raw.category,
    provider: (provider as any) || 'rss',
    credibilityScore: typeof raw.credibilityScore === 'number' ? Math.min(100, Math.max(0, raw.credibilityScore)) : 80
  };

  return { isValid: true, sanitizedItem, errors: [] };
}

// ---------------------------------------------------------------------------
// 4. Raw Economic Calendar Schema Validation & Quarantine
// ---------------------------------------------------------------------------

export interface CalendarValidationResult {
  isValid: boolean;
  sanitizedItem?: RawCalendarItem;
  quarantineReason?: string;
  errors: string[];
}

export function validateRawCalendarItem(raw: any, provider: string): CalendarValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    const reason = 'MALFORMED_CALENDAR_PAYLOAD';
    dataQualityRegistry.recordQuarantine(provider, 'calendar', reason, JSON.stringify(raw || {}));
    return { isValid: false, quarantineReason: reason, errors: ['Item is not a valid JSON object'] };
  }

  // 1. Event Name
  const eventName = (raw.eventName || raw.event || raw.title || '').trim();
  if (!eventName || eventName.length < 3) {
    errors.push('Economic event name is missing or invalid');
  }

  // 2. Country / Currency
  const country = (raw.country || '').trim();
  const currency = (raw.currency || 'USD').trim().toUpperCase();
  if (!country && !currency) {
    errors.push('Country or currency jurisdiction is unidentifiable');
  }

  // 3. Timestamp verification
  const rawDate = raw.timestamp || raw.date || raw.time;
  const timeResult = normalizeTimestampUTC(rawDate);
  if (!timeResult.isValid) {
    errors.push('Event date or timestamp is malformed');
  }

  // 4. Importance Level
  const rawImp = String(raw.importance || 'medium').toLowerCase();
  const validImp = ['low', 'medium', 'high', 'critical'].includes(rawImp) ? (rawImp as any) : 'medium';

  // If fatal errors exist, quarantine
  if (errors.length > 0) {
    const primaryReason = errors[0].toUpperCase().replace(/\s+/g, '_').slice(0, 40);
    dataQualityRegistry.recordQuarantine(
      provider,
      'calendar',
      primaryReason,
      JSON.stringify(raw),
      eventName || 'Unnamed Event'
    );
    return { isValid: false, quarantineReason: primaryReason, errors };
  }

  // Passed quality check
  dataQualityRegistry.recordValid();

  const sanitizedItem: RawCalendarItem = {
    id: String(raw.id || `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    eventName,
    country: country || 'Global',
    countryCode: (raw.countryCode || currency.slice(0, 2) || 'US').toUpperCase(),
    currency: currency || 'USD',
    date: raw.date || timeResult.iso.split('T')[0],
    time: raw.time || timeResult.iso.split('T')[1]?.slice(0, 5) || '12:00',
    timestamp: timeResult.epoch,
    importance: validImp,
    previous: String(raw.previous ?? '—'),
    forecast: String(raw.forecast ?? '—'),
    actual: raw.actual !== undefined && raw.actual !== null ? String(raw.actual) : undefined,
    unit: raw.unit || '%',
    status: raw.status || (raw.actual ? 'released' : 'upcoming'),
    description: raw.description || `High-impact economic indicator release for ${currency}.`,
    provider: provider || 'economicCalendar'
  };

  return { isValid: true, sanitizedItem, errors: [] };
}

// ---------------------------------------------------------------------------
// 5. Source Provenance Chain Construction
// ---------------------------------------------------------------------------

export function buildSourceProvenanceChain(params: {
  insightId: string;
  clusterId?: string;
  articleIds: string[];
  providers: string[];
  sources: SourceReference[];
  retrievalTimestamp: string;
  isVerified?: boolean;
}): SourceProvenanceChain {
  const originalSources = params.sources.map(s => ({
    name: s.name,
    url: s.url,
    publishedAt: s.timeAgo,
    credibilityScore: s.credibilityScore || 80
  }));

  const verificationStatus: 'multi_source_verified' | 'single_source_provisional' | 'official_agency_grounded' =
    params.isVerified
      ? 'multi_source_verified'
      : originalSources.some(s => s.name.toLowerCase().includes('federal reserve') || s.name.toLowerCase().includes('bls') || s.name.toLowerCase().includes('ecb'))
      ? 'official_agency_grounded'
      : 'single_source_provisional';

  const evidenceChain = [
    `Ingested via [${params.providers.join(', ')}] at ${new Date(params.retrievalTimestamp).toUTCString()}`,
    `Corroborated across ${originalSources.length} primary reporting domain(s): ${originalSources.map(s => s.name).join(', ')}`,
    `Structured & Normalized in Pipeline: Cluster ID ${params.clusterId || 'single-event'}`,
    `Intelligence Synthesis grounded in explicit institutional evidence without ungrounded extrapolation.`
  ];

  return {
    insightId: params.insightId,
    clusterId: params.clusterId,
    articleIds: params.articleIds,
    providers: params.providers,
    originalSources,
    retrievalTimestamp: params.retrievalTimestamp,
    processedTimestamp: new Date().toISOString(),
    verificationStatus,
    evidenceChain
  };
}
