import express from 'express';
import dotenv from 'dotenv';
import { dataStore } from './pipeline/dataStore';
import { processArticleAIAnalysis, processEconomicEventAIAnalysis } from './pipeline/aiProcessor';
import { runFullProviderDiagnostics, runMultiTierDiagnostics } from './services/diagnosticsService';
import { runCompleteReliabilityTestSuite } from './services/reliabilityTestSuite';

dotenv.config();

export const app = express();

app.use(express.json());

// Helper to parse user preferences from query or header or body
function parsePreferences(req: express.Request): any {
  try {
    if (req.query.preferences && typeof req.query.preferences === 'string') {
      return JSON.parse(req.query.preferences);
    }
    if (req.headers['x-user-preferences'] && typeof req.headers['x-user-preferences'] === 'string') {
      return JSON.parse(req.headers['x-user-preferences']);
    }
    if (req.body?.preferences) {
      return req.body.preferences;
    }
  } catch {
    // ignore invalid json
  }
  return undefined;
}

// Router to handle all API endpoints with or without /api prefix
const apiRouter = express.Router();

// Root API status endpoint
apiRouter.get('/', (req, res) => {
  res.json({
    status: 'ok',
    runtime: 'vercel',
    api: true
  });
});

// 1. Health and Provider Status (Lightweight and instant)
apiRouter.get('/health', async (req, res) => {
  const status = dataStore.getStatus();
  const dataHealth = dataStore.getDataHealth();
  const intHealth = dataStore.getIntelligenceHealth();
  res.json({
    status: 'ok',
    runtime: 'vercel',
    api: true,
    ...status,
    dataHealth,
    intelligenceHealth: intHealth
  });
});

// 2. Comprehensive Provider Diagnostics and Connection Health Check
apiRouter.get('/diagnostics', async (req, res) => {
  try {
    const results = await runFullProviderDiagnostics();
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run diagnostics' });
  }
});

// 3. Multi-Tier Diagnostics (Infrastructure, Data Quality, Intelligence, Reliability Test Suite)
apiRouter.get('/diagnostics/multi-tier', async (req, res) => {
  try {
    const results = await runMultiTierDiagnostics();
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run multi-tier diagnostics' });
  }
});

// 4. Quarantined Items List (Data Quality Layer)
apiRouter.get('/diagnostics/quarantined', (req, res) => {
  try {
    const quarantined = dataStore.getQuarantinedItems();
    res.json({
      total: quarantined.length,
      items: quarantined
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch quarantined records' });
  }
});

// 5. Automated Reliability Test Suite Execution
apiRouter.get('/diagnostics/reliability-tests', async (req, res) => {
  try {
    const report = await runCompleteReliabilityTestSuite();
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to run reliability test suite' });
  }
});

// 6. St. Louis Fed FRED Macroeconomic Time Series
apiRouter.get('/macro/series/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const series = await dataStore.getMacroSeries(id);
    if (!series) {
      return res.status(404).json({ error: `Macroeconomic series "${id}" not found or unavailable.` });
    }
    res.json({ series });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch series' });
  }
});

// 7. Manual or UI-triggered data pipeline refresh
apiRouter.post('/sync/refresh', async (req, res) => {
  try {
    await dataStore.syncAllData(true);
    res.json({
      success: true,
      message: 'Data synchronization completed',
      status: dataStore.getStatus()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Sync failed' });
  }
});

// 8. Live market benchmarks
apiRouter.get('/markets/summary', (req, res) => {
  const metrics = dataStore.getMarketMetrics();
  res.json({
    metrics,
    lastUpdated: new Date().toISOString()
  });
});

// 9. Normalized, clustered news feed
apiRouter.get('/news', async (req, res) => {
  const { category, importance, market, currency, search, limit, rankingMode } = req.query;
  const preferences = parsePreferences(req);

  // If cold-start without initial sync, await first sync
  if (dataStore.getArticles().articles.length === 0) {
    await dataStore.syncAllData().catch(() => {});
  }

  const result = dataStore.getArticles({
    category: category as string,
    importance: importance as string,
    market: market as string,
    currency: currency as string,
    search: search as string,
    limit: limit ? Number(limit) : undefined,
    rankingMode: rankingMode as any,
    preferences
  });

  res.json(result);
});

// 10. Get single article by ID
apiRouter.get('/news/:id', (req, res) => {
  const preferences = parsePreferences(req);
  const article = dataStore.getArticleById(req.params.id, preferences);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ article });
});

// 11. On-demand AI deep-dive analysis for article
apiRouter.post('/ai/analyze-news', async (req, res) => {
  try {
    const { articleId, articleData, preferences } = req.body;
    let target = articleData;
    if (articleId) {
      target = dataStore.getArticleById(articleId, preferences) || target;
    }
    if (!target) {
      return res.status(400).json({ error: 'Article data or valid ID is required.' });
    }

    const analysis = await processArticleAIAnalysis(target);
    res.json({ analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to analyze article' });
  }
});

// 12. Economic calendar list & filters
apiRouter.get('/calendar', async (req, res) => {
  const { status, importance, currency, country, date, sort } = req.query;
  const preferences = parsePreferences(req);

  if (dataStore.getEvents().events.length === 0) {
    await dataStore.syncAllData().catch(() => {});
  }

  const result = dataStore.getEvents({
    status: status as string,
    importance: importance as string,
    currency: currency as string,
    country: country as string,
    date: date as string,
    sort: sort as any,
    preferences
  });

  res.json(result);
});

// 13. Economic event AI explanation & sensitivity
apiRouter.get('/calendar/:id/analysis', async (req, res) => {
  try {
    const preferences = parsePreferences(req);
    const event = dataStore.getEventById(req.params.id, preferences);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const explanation = await processEconomicEventAIAnalysis(event);
    res.json({ explanation, event });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to analyze economic event' });
  }
});

// 14. Dynamic Macro Intelligence Pulse
apiRouter.get('/insights/macro-pulse', async (req, res) => {
  const preferences = parsePreferences(req);
  if (dataStore.getArticles().articles.length === 0) {
    await dataStore.syncAllData().catch(() => {});
  }
  const overview = dataStore.getMacroPulse(preferences);
  res.json({ overview });
});

// 15. Recurring Macro Thematic Clusters
apiRouter.get('/thematic-clusters', (req, res) => {
  const clusters = dataStore.getThematicClusters();
  res.json({ clusters });
});

// 16. Grounded Natural Language Financial Intelligence Engine
apiRouter.post('/insights/ask', async (req, res) => {
  try {
    const { query, preferences } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'A query string is required.' });
    }

    const answer = await dataStore.askQuery(query, preferences);
    res.json({ answer });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to process intelligence query' });
  }
});

// 17. Global search across news, events, and topics
apiRouter.get('/search', (req, res) => {
  const q = String(req.query.q || '');
  const result = dataStore.searchAll(q);
  res.json(result);
});

// Mount router on /api
app.use('/api', apiRouter);

// Global error handling middleware for API routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errName = err?.name || 'ServerError';
  const errMsg = err?.message || 'An unexpected server error occurred';
  console.error(`[API Error] ${req.method} ${req.originalUrl || req.url} - ${errName}: ${errMsg}`);
  if (!res.headersSent) {
    res.status(500).json({
      error: true,
      message: errMsg,
      path: req.originalUrl || req.url
    });
  }
});

export default app;
