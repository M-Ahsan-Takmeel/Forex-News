import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { triggerDataSync, fetchHealthStatus, fetchDiagnostics } from '../services/api';
import { ProviderDiagnostic, SummaryDepth, FeedRankingMode } from '../types';
import {
  X,
  Sliders,
  Check,
  RotateCcw,
  Globe,
  DollarSign,
  Layers,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Activity,
  Zap,
  Clock,
  Compass,
  Bookmark,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

const ALL_MARKETS = ['Forex', 'Equities', 'Bonds', 'Commodities', 'Crypto'];
const ALL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'CNY'];
const ALL_TOPICS = [
  'Central Banks',
  'Inflation',
  'Interest Rates',
  'Employment',
  'Economic Growth',
  'Geopolitics',
  'Energy',
  'Trade',
  'Technology',
  'AI',
  'Corporate Earnings'
];
const ALL_COUNTRIES = [
  'United States',
  'Eurozone',
  'United Kingdom',
  'Japan',
  'China',
  'Canada',
  'Australia'
];

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    preferences,
    updatePreferences,
    toggleMarket,
    toggleCurrency,
    toggleTopic,
    toggleCountry,
    setSummaryDepth,
    setFeedRankingMode,
    resetPreferences
  } = useApp();

  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [diagnostics, setDiagnostics] = useState<ProviderDiagnostic[]>([]);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const loadPipelineStatus = async () => {
    try {
      const data = await fetchHealthStatus();
      setPipelineStatus(data);
    } catch {
      // ignore
    }
  };

  const handleRunDiagnostics = async () => {
    try {
      setIsRunningDiagnostics(true);
      const res = await fetchDiagnostics();
      setDiagnostics(res.diagnostics || []);
    } catch (err: any) {
      console.warn('Diagnostics query error:', err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  useEffect(() => {
    if (isSettingsOpen) {
      loadPipelineStatus();
      handleRunDiagnostics();
    }
  }, [isSettingsOpen]);

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      setSyncMessage('Fetching news and economic events across providers...');
      const res = await triggerDataSync();
      setPipelineStatus(res.status);
      setSyncMessage('Pipeline synchronized successfully!');
      handleRunDiagnostics();
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err: any) {
      setSyncMessage(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isSettingsOpen) return null;

  const getStatusBadge = (status: ProviderDiagnostic['status']) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
            Connected
          </span>
        );
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            <Clock className="w-2.5 h-2.5 text-amber-600" />
            Rate Limited
          </span>
        );
      case 'INVALID_KEY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
            <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
            Invalid Key
          </span>
        );
      case 'NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold">
            No Data
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">
            Unconfigured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 text-[10px]">
            Unavailable
          </span>
        );
    }
  };

  const totalFeedbackCount =
    (preferences.feedback?.likedTopics?.length || 0) +
    (preferences.feedback?.dislikedTopics?.length || 0) +
    (preferences.feedback?.likedArticleIds?.length || 0) +
    (preferences.feedback?.dislikedArticleIds?.length || 0);

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        id="settings-modal-panel"
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personalization & System Settings</h2>
              <p className="text-xs text-slate-500">Configure interest profiles, feed ranking, reading depth, and API status</p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={() => setIsSettingsOpen(false)}
            className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Monitored Asset Classes / Markets */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>1. Monitored Asset Classes / Markets</span>
            </label>
            <p className="text-slate-500 text-[11px]">Select asset classes to prioritize in your intelligent feed and AI analysis.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_MARKETS.map((market) => {
                const selected = preferences.selectedMarkets.includes(market);
                return (
                  <button
                    key={market}
                    id={`btn-pref-market-${market.toLowerCase()}`}
                    onClick={() => toggleMarket(market)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-emerald-300" />}
                    <span>{market}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tracked Benchmark Currencies */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Tracked Benchmark Currencies</span>
            </label>
            <p className="text-slate-500 text-[11px]">Prioritize news, economic indicators, and sensitivity models for these currencies.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_CURRENCIES.map((curr) => {
                const selected = preferences.selectedCurrencies.includes(curr);
                return (
                  <button
                    key={curr}
                    id={`btn-pref-curr-${curr.toLowerCase()}`}
                    onClick={() => toggleCurrency(curr)}
                    className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Macroeconomic Focus Topics */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>3. Macroeconomic Focus Topics</span>
            </label>
            <p className="text-slate-500 text-[11px]">Stories matching these thematic areas receive personal relevance scoring boosts.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_TOPICS.map((topic) => {
                const selected = preferences.selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    id={`btn-pref-topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-amber-800 text-white border-amber-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-amber-300" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Geographic Regions / Countries */}
          <div className="space-y-2">
            <label className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>4. Geographic Regions & Economies</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_COUNTRIES.map((country) => {
                const selected = preferences.selectedCountries.includes(country);
                return (
                  <button
                    key={country}
                    id={`btn-pref-country-${country.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleCountry(country)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-blue-800 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-blue-300" />}
                    <span>{country}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: AI Synthesis Depth & Feed Ranking Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-600" />
                <span>AI Synthesis Depth</span>
              </label>
              <p className="text-[10px] text-slate-500">Controls drawer analysis detail level</p>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-semibold">
                {(['brief', 'standard', 'detailed'] as SummaryDepth[]).map((d) => (
                  <button
                    key={d}
                    id={`btn-summary-depth-${d}`}
                    onClick={() => setSummaryDepth(d)}
                    className={`flex-1 py-1 px-2 rounded capitalize text-[11px] transition-all ${
                      preferences.summaryDepth === d
                        ? 'bg-white shadow-xs text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
                <span>Default Feed Ranking</span>
              </label>
              <p className="text-[10px] text-slate-500">Balances personal affinity with global importance</p>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-semibold">
                {(
                  [
                    { id: 'intelligent', label: 'Intelligent' },
                    { id: 'global_importance', label: 'Importance' },
                    { id: 'latest', label: 'Latest' }
                  ] as { id: FeedRankingMode; label: string }[]
                ).map((m) => (
                  <button
                    key={m.id}
                    id={`btn-ranking-mode-${m.id}`}
                    onClick={() => setFeedRankingMode(m.id)}
                    className={`flex-1 py-1 px-1.5 rounded text-[11px] transition-all ${
                      preferences.feedRankingMode === m.id
                        ? 'bg-white shadow-xs text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: API Provider Health & Diagnostics */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-900 text-xs">API Provider Connectivity & Diagnostics</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-run-diagnostics"
                  onClick={handleRunDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-900 disabled:opacity-50 transition-colors text-[11px]"
                >
                  <Zap className={`w-3 h-3 ${isRunningDiagnostics ? 'animate-pulse' : ''}`} />
                  <span>{isRunningDiagnostics ? 'Testing...' : 'Test APIs'}</span>
                </button>
                <button
                  id="btn-sync-pipeline"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-800 text-white font-medium hover:bg-emerald-900 disabled:opacity-50 transition-colors text-[11px]"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Pipeline'}</span>
                </button>
              </div>
            </div>

            {syncMessage && (
              <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-2 rounded border border-emerald-200">
                {syncMessage}
              </p>
            )}

            {/* Provider Grid */}
            <div className="space-y-1.5 pt-1">
              {diagnostics.map((diag) => (
                <div
                  key={diag.provider}
                  className="p-2 bg-white rounded-lg border border-slate-200 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">{diag.provider}</span>
                      {diag.latencyMs !== undefined && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {diag.latencyMs}ms
                        </span>
                      )}
                    </div>
                    {getStatusBadge(diag.status)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[340px]">{diag.details || diag.service}</span>
                    {diag.itemsRetrieved !== undefined && (
                      <span className="font-medium text-slate-600 shrink-0">
                        {diag.itemsRetrieved} items
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">News Ingestion</span>
                <span className="font-bold text-slate-800">
                  {pipelineStatus?.articlesCount || 0} Clustered Stories
                </span>
              </div>
              <div className="p-2 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px]">Economic Calendar</span>
                <span className="font-bold text-slate-800">
                  {pipelineStatus?.eventsCount || 0} Macro Releases
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Reset Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="btn-reset-preferences"
                onClick={resetPreferences}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Defaults</span>
              </button>
              {totalFeedbackCount > 0 && (
                <span className="text-[11px] text-slate-400">
                  ({totalFeedbackCount} tuned feedback signals active)
                </span>
              )}
            </div>

            <button
              id="btn-save-settings"
              onClick={() => setIsSettingsOpen(false)}
              className="py-1.5 px-5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors shadow-xs"
            >
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



