import { ProviderDiagnostic, MultiTierDiagnostics } from '../../src/types';
import { testGeminiConnection, getAiGroundingHealthStatus } from '../pipeline/aiProcessor';
import { testNewsApiConnection } from '../providers/news/newsApiProvider';
import { testAlphaVantageConnection } from '../providers/news/alphaVantageNewsProvider';
import { testFinnhubConnection } from '../providers/news/finnhubNewsProvider';
import { testRssConnection } from '../providers/news/rssProvider';
import { testFredConnection } from '../providers/fred/fredProvider';
import { testEconomicCalendarConnection } from '../providers/calendar/economicCalendarProvider';
import { dataStore } from '../pipeline/dataStore';
import { dataQualityRegistry } from '../pipeline/dataQualityLayer';
import { runCompleteReliabilityTestSuite } from './reliabilityTestSuite';

export async function runFullProviderDiagnostics(): Promise<{
  timestamp: string;
  diagnostics: ProviderDiagnostic[];
  connectedCount: number;
  totalConfigured: number;
}> {
  const [
    geminiRes,
    newsApiRes,
    avRes,
    finnhubRes,
    fredRes,
    rssRes,
    calRes
  ] = await Promise.allSettled([
    testGeminiConnection(),
    testNewsApiConnection(),
    testAlphaVantageConnection(),
    testFinnhubConnection(),
    testFredConnection(),
    testRssConnection(),
    testEconomicCalendarConnection()
  ]);

  const nowIso = new Date().toISOString();
  const diagnostics: ProviderDiagnostic[] = [];

  // 1. Gemini AI
  if (geminiRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'Google Gemini',
      service: 'AI Intelligence & Macro Synthesizer (gemini-3.7-flash)',
      status: geminiRes.value.status,
      latencyMs: geminiRes.value.latencyMs,
      itemsRetrieved: geminiRes.value.itemsRetrieved,
      details: geminiRes.value.details,
      lastChecked: nowIso
    });
  }

  // 2. NewsAPI
  if (newsApiRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'NewsAPI',
      service: 'Global Business & Financial Headlines',
      status: newsApiRes.value.status,
      latencyMs: newsApiRes.value.latencyMs,
      itemsRetrieved: newsApiRes.value.itemsRetrieved,
      details: newsApiRes.value.details,
      lastChecked: nowIso
    });
  }

  // 3. Alpha Vantage
  if (avRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'Alpha Vantage',
      service: 'Market News & Sentiment Analytics',
      status: avRes.value.status,
      latencyMs: avRes.value.latencyMs,
      itemsRetrieved: avRes.value.itemsRetrieved,
      details: avRes.value.details,
      lastChecked: nowIso
    });
  }

  // 4. Finnhub
  if (finnhubRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'Finnhub',
      service: 'Real-Time Financial News & Market Disclosures',
      status: finnhubRes.value.status,
      latencyMs: finnhubRes.value.latencyMs,
      itemsRetrieved: finnhubRes.value.itemsRetrieved,
      details: finnhubRes.value.details,
      lastChecked: nowIso
    });
  }

  // 5. FRED (St. Louis Fed)
  if (fredRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'FRED St. Louis Fed',
      service: 'Federal Reserve Macroeconomic Series (FEDFUNDS, CPI, GDP, 10Y)',
      status: fredRes.value.status,
      latencyMs: fredRes.value.latencyMs,
      itemsRetrieved: fredRes.value.itemsRetrieved,
      details: fredRes.value.details,
      lastChecked: nowIso
    });
  }

  // 6. Institutional RSS Wire
  if (rssRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'Institutional RSS Wire',
      service: 'Federal Reserve, Yahoo Finance, MarketWatch, CNBC, Investing.com',
      status: rssRes.value.status,
      latencyMs: rssRes.value.latencyMs,
      itemsRetrieved: rssRes.value.itemsRetrieved,
      details: rssRes.value.details,
      lastChecked: nowIso
    });
  }

  // 7. Economic Calendar Provider
  if (calRes.status === 'fulfilled') {
    diagnostics.push({
      provider: 'Economic Calendar Service',
      service: 'High-Impact Central Bank & Macro Statistical Releases',
      status: calRes.value.status,
      latencyMs: calRes.value.latencyMs,
      itemsRetrieved: calRes.value.itemsRetrieved,
      details: calRes.value.details,
      lastChecked: nowIso
    });
  }

  const connectedCount = diagnostics.filter(d => d.status === 'CONNECTED').length;
  const totalConfigured = diagnostics.filter(d => d.status !== 'NOT_CONFIGURED').length;

  return {
    timestamp: nowIso,
    diagnostics,
    connectedCount,
    totalConfigured
  };
}

export async function runMultiTierDiagnostics(): Promise<MultiTierDiagnostics> {
  const providerDiag = await runFullProviderDiagnostics();
  const dataHealth = dataStore.getDataHealth();
  const intelligenceHealth = dataStore.getIntelligenceHealth();
  const testReport = await runCompleteReliabilityTestSuite();

  const memUsage = process.memoryUsage();
  const memoryMb = Math.round(memUsage.heapUsed / (1024 * 1024));

  const isHealthy =
    providerDiag.connectedCount >= 2 &&
    dataHealth.schemaValidationPassRate >= 90 &&
    intelligenceHealth.groundingVerificationRate >= 80 &&
    testReport.passRate >= 90;

  return {
    timestamp: new Date().toISOString(),
    overallStatus: isHealthy ? 'healthy' : 'degraded',
    infrastructure: {
      uptimeSeconds: Math.round(process.uptime()),
      memoryUsageMb: memoryMb,
      activePort: 3000,
      environment: 'production'
    },
    providers: providerDiag.diagnostics,
    dataQuality: dataHealth,
    intelligence: intelligenceHealth,
    reliabilityTestSuite: testReport
  };
}

