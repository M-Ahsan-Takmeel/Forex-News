import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { dataStore } from './server/pipeline/dataStore';
import { processArticleAIAnalysis, processEconomicEventAIAnalysis } from './server/pipeline/aiProcessor';
import { runFullProviderDiagnostics, runMultiTierDiagnostics } from './server/services/diagnosticsService';
import { runCompleteReliabilityTestSuite } from './server/services/reliabilityTestSuite';
import { CONFIG } from './server/config';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and provider status
  app.get('/api/health', (req, res) => {
    const status = dataStore.getStatus();
    const dataHealth = dataStore.getDataHealth();
    const intHealth = dataStore.getIntelligenceHealth();
    res.json({
      ...status,
      dataHealth,
      intelligenceHealth: intHealth
    });
  });

  // Comprehensive Provider Diagnostics and Connection Health Check
  app.get('/api/diagnostics', async (req, res) => {
    try {
      const results = await runFullProviderDiagnostics();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to run diagnostics' });
    }
  });

  // Multi-Tier Diagnostics (Infrastructure, Data Quality, Intelligence, Reliability Test Suite)
  app.get('/api/diagnostics/multi-tier', async (req, res) => {
    try {
      const results = await runMultiTierDiagnostics();
      res.json(results);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to run multi-tier diagnostics' });
    }
  });

  // Quarantined Items List (Data Quality Layer)
  app.get('/api/diagnostics/quarantined', (req, res) => {
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

  // Automated Reliability Test Suite Execution
  app.get('/api/diagnostics/reliability-tests', async (req, res) => {
    try {
      const report = await runCompleteReliabilityTestSuite();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to run reliability test suite' });
    }
  });

  // St. Louis Fed FRED Macroeconomic Time Series
  app.get('/api/macro/series/:id', async (req, res) => {
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

  // Manual or UI-triggered data pipeline refresh
  app.post('/api/sync/refresh', async (req, res) => {
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

  // Live market benchmarks
  app.get('/api/markets/summary', (req, res) => {
    const metrics = dataStore.getMarketMetrics();
    res.json({
      metrics,
      lastUpdated: new Date().toISOString()
    });
  });

  // Helper to parse user preferences from query or header
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

  // Normalized, clustered news feed
  app.get('/api/news', (req, res) => {
    const { category, importance, market, currency, search, limit, rankingMode } = req.query;
    const preferences = parsePreferences(req);

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

  // Get single article by ID
  app.get('/api/news/:id', (req, res) => {
    const preferences = parsePreferences(req);
    const article = dataStore.getArticleById(req.params.id, preferences);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ article });
  });

  // On-demand AI deep-dive analysis for article
  app.post('/api/ai/analyze-news', async (req, res) => {
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

  // Economic calendar list & filters
  app.get('/api/calendar', (req, res) => {
    const { status, importance, currency, country, date, sort } = req.query;
    const preferences = parsePreferences(req);

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

  // Economic event AI explanation & sensitivity
  app.get('/api/calendar/:id/analysis', async (req, res) => {
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

  // Dynamic Macro Intelligence Pulse
  app.get('/api/insights/macro-pulse', (req, res) => {
    const preferences = parsePreferences(req);
    const overview = dataStore.getMacroPulse(preferences);
    res.json({ overview });
  });

  // Recurring Macro Thematic Clusters
  app.get('/api/thematic-clusters', (req, res) => {
    const clusters = dataStore.getThematicClusters();
    res.json({ clusters });
  });

  // Grounded Natural Language Financial Intelligence Engine
  app.post('/api/insights/ask', async (req, res) => {
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

  // Global search across news, events, and topics
  app.get('/api/search', (req, res) => {
    const q = String(req.query.q || '');
    const result = dataStore.searchAll(q);
    res.json(result);
  });

  // Setup Vite in development or serve static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Financial Intelligence Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
});

