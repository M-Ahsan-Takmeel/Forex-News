import { CONFIG } from '../../config';
import { MacroSeries, MacroDataPoint } from '../../../src/types';

interface FredCacheEntry {
  data: MacroSeries;
  timestamp: number;
}

const fredCache = new Map<string, FredCacheEntry>();

const SERIES_METADATA: Record<string, { title: string; units: string; frequency: string }> = {
  FEDFUNDS: {
    title: 'Federal Funds Effective Rate',
    units: '%',
    frequency: 'Monthly'
  },
  CPIAUCSL: {
    title: 'Consumer Price Index for All Urban Consumers (CPI)',
    units: 'Index 1982-1984=100',
    frequency: 'Monthly'
  },
  UNRATE: {
    title: 'Civilian Unemployment Rate',
    units: '%',
    frequency: 'Monthly'
  },
  DGS10: {
    title: '10-Year Treasury Constant Maturity Rate',
    units: '%',
    frequency: 'Daily'
  },
  GDP: {
    title: 'Gross Domestic Product',
    units: 'Billions of Dollars',
    frequency: 'Quarterly'
  }
};

export async function fetchFredSeries(seriesId: string, limit = 12): Promise<MacroSeries | null> {
  const normalizedId = seriesId.toUpperCase();
  const cached = fredCache.get(normalizedId);

  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL.FRED_SERIES) {
    return cached.data;
  }

  if (!CONFIG.FRED_API_KEY) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${encodeURIComponent(normalizedId)}&api_key=${encodeURIComponent(CONFIG.FRED_API_KEY)}&file_type=json&sort_order=desc&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`FRED API returned status ${res.status} for ${normalizedId}`);
      return null;
    }

    const json = await res.json();
    const rawObs = json?.observations;

    if (!Array.isArray(rawObs)) {
      return null;
    }

    const observations: MacroDataPoint[] = rawObs
      .filter((o: any) => o.value !== '.' && !isNaN(Number(o.value)))
      .map((o: any) => ({
        date: o.date,
        value: Number(Number(o.value).toFixed(2))
      }))
      .reverse();

    const meta = SERIES_METADATA[normalizedId] || {
      title: `Macroeconomic Series (${normalizedId})`,
      units: 'Units',
      frequency: 'Standard'
    };

    const seriesData: MacroSeries = {
      id: normalizedId,
      title: meta.title,
      units: meta.units,
      frequency: meta.frequency,
      lastUpdated: new Date().toISOString(),
      observations
    };

    fredCache.set(normalizedId, {
      data: seriesData,
      timestamp: Date.now()
    });

    return seriesData;
  } catch (err) {
    console.warn(`FRED fetch failed for ${normalizedId}:`, (err as Error).message);
    return null;
  }
}

export async function testFredConnection(): Promise<{
  status: 'CONNECTED' | 'INVALID_KEY' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
  latencyMs?: number;
  itemsRetrieved?: number;
  details?: string;
}> {
  if (!CONFIG.FRED_API_KEY) {
    return {
      status: 'NOT_CONFIGURED',
      details: 'FRED_API_KEY is not set in environment.'
    };
  }

  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${encodeURIComponent(CONFIG.FRED_API_KEY)}&file_type=json&sort_order=desc&limit=2`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'INVALID_KEY',
        latencyMs,
        details: 'FRED authentication rejected API key.'
      };
    }

    if (res.status === 429) {
      return {
        status: 'RATE_LIMITED',
        latencyMs,
        details: 'FRED request quota or rate limit exceeded.'
      };
    }

    if (!res.ok) {
      return {
        status: 'UNAVAILABLE',
        latencyMs,
        details: `FRED server returned HTTP ${res.status}.`
      };
    }

    const data = await res.json();
    const obsCount = Array.isArray(data?.observations) ? data.observations.length : 0;

    return {
      status: 'CONNECTED',
      latencyMs,
      itemsRetrieved: obsCount,
      details: `Successfully authenticated with St. Louis Fed FRED. Retrieved ${obsCount} observations.`
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      status: 'UNAVAILABLE',
      latencyMs,
      details: `FRED network timeout or unreachable: ${err.message}`
    };
  }
}
