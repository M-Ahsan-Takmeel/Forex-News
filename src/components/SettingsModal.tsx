import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { triggerDataSync, fetchHealthStatus, fetchDiagnostics, fetchMultiTierDiagnostics, fetchReliabilityTests } from '../services/api';
import { ProviderDiagnostic, SummaryDepth, FeedRankingMode, MultiTierDiagnostics } from '../types';
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
  Flame,
  ShieldCheck,
  Cpu,
  FileCheck
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
  const [multiTierDiag, setMultiTierDiag] = useState<MultiTierDiagnostics | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testSuiteReport, setTestSuiteReport] = useState<any>(null);

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
      const [provRes, multiRes] = await Promise.allSettled([
        fetchDiagnostics(),
        fetchMultiTierDiagnostics()
      ]);
      if (provRes.status === 'fulfilled') {
        setDiagnostics(provRes.value.diagnostics || []);
      }
      if (multiRes.status === 'fulfilled') {
        setMultiTierDiag(multiRes.value);
      }
    } catch (err: any) {
      console.warn('Diagnostics query error:', err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const handleRunReliabilityTests = async () => {
    try {
      setIsRunningTests(true);
      const report = await fetchReliabilityTests();
      setTestSuiteReport(report);
    } catch (err: any) {
      console.warn('Reliability test run error:', err);
    } finally {
      setIsRunningTests(false);
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
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 font-mono text-[9px] font-bold">
            <CheckCircle className="w-2.5 h-2.5 text-[#3B82F6]" />
            Connected
          </span>
        );
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 font-mono text-[9px] font-bold">
            <Clock className="w-2.5 h-2.5 text-[#F59E0B]" />
            Rate Limited
          </span>
        );
      case 'INVALID_KEY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 font-mono text-[9px] font-bold">
            <AlertCircle className="w-2.5 h-2.5 text-[#EF4444]" />
            Invalid Key
          </span>
        );
      case 'NO_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#151515] text-[#777777] border border-[#242424] font-mono text-[9px]">
            No Data
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#151515] text-[#555555] border border-[#242424] font-mono text-[9px]">
            Unconfigured
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-xs bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 font-mono text-[9px]">
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={() => setIsSettingsOpen(false)}
    >
      <div
        id="settings-modal-panel"
        className="w-full max-w-2xl bg-[#0A0A0A] rounded-lg shadow-2xl overflow-hidden border border-[#242424] text-[#A0A0A0] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#242424] bg-[#101010] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-[#151515] border border-[#242424] text-[#3B82F6]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F2F2F2]">System Architecture & Personalization</h2>
              <p className="font-mono text-[10px] text-[#777777]">Interest profile tuning, ranking heuristics, and data telemetry</p>
            </div>
          </div>

          <button
            id="btn-close-settings"
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded border border-[#242424] text-[#777777] hover:text-[#F2F2F2] hover:bg-[#151515] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Monitored Asset Classes / Markets */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-[#A0A0A0] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>1. Monitored Asset Classes & Markets</span>
            </label>
            <p className="text-[#777777] text-[11px]">Select asset classes to prioritize in your intelligent feed and AI analysis.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_MARKETS.map((market) => {
                const selected = preferences.selectedMarkets.includes(market);
                return (
                  <button
                    key={market}
                    id={`btn-pref-market-${market.toLowerCase()}`}
                    onClick={() => toggleMarket(market)}
                    className={`px-3 py-1 rounded font-mono text-xs font-semibold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                        : 'bg-[#101010] text-[#777777] border-[#242424] hover:text-[#F2F2F2] hover:bg-[#151515]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                    <span>{market}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Tracked Benchmark Currencies */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-[#A0A0A0] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>2. Tracked Benchmark Currencies</span>
            </label>
            <p className="text-[#777777] text-[11px]">Prioritize news, economic indicators, and sensitivity models for these currencies.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_CURRENCIES.map((curr) => {
                const selected = preferences.selectedCurrencies.includes(curr);
                return (
                  <button
                    key={curr}
                    id={`btn-pref-curr-${curr.toLowerCase()}`}
                    onClick={() => toggleCurrency(curr)}
                    className={`px-3 py-1 rounded font-mono text-xs font-bold transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-[#F2F2F2] text-black border-[#F2F2F2]'
                        : 'bg-[#101010] text-[#777777] border-[#242424] hover:text-[#F2F2F2] hover:bg-[#151515]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-black" />}
                    <span>{curr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Macroeconomic Focus Topics */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-[#A0A0A0] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>3. Macroeconomic Focus Topics</span>
            </label>
            <p className="text-[#777777] text-[11px]">Stories matching these thematic areas receive personal relevance scoring boosts.</p>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {ALL_TOPICS.map((topic) => {
                const selected = preferences.selectedTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    id={`btn-pref-topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => toggleTopic(topic)}
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40 font-bold'
                        : 'bg-[#101010] text-[#777777] border-[#242424] hover:text-[#F2F2F2] hover:bg-[#151515]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-[#F59E0B]" />}
                    <span>{topic}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Geographic Regions / Countries */}
          <div className="space-y-2">
            <label className="font-mono font-bold text-[#A0A0A0] uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
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
                    className={`px-2.5 py-1 rounded font-mono text-[11px] transition-all flex items-center gap-1 border ${
                      selected
                        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/40 font-bold'
                        : 'bg-[#101010] text-[#777777] border-[#242424] hover:text-[#F2F2F2] hover:bg-[#151515]'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-[#3B82F6]" />}
                    <span>{country}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: AI Synthesis Depth & Feed Ranking Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#242424]">
            <div className="space-y-1.5">
              <label className="font-mono font-bold text-[#A0A0A0] text-xs flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-[#777777]" />
                <span>AI Synthesis Depth</span>
              </label>
              <p className="font-mono text-[10px] text-[#777777]">Controls drawer analysis detail level</p>
              <div className="flex items-center gap-1 bg-[#101010] p-1 rounded border border-[#242424] font-mono">
                {(['brief', 'standard', 'detailed'] as SummaryDepth[]).map((d) => (
                  <button
                    key={d}
                    id={`btn-summary-depth-${d}`}
                    onClick={() => setSummaryDepth(d)}
                    className={`flex-1 py-1 px-2 rounded capitalize text-[11px] transition-all ${
                      preferences.summaryDepth === d
                        ? 'bg-[#151515] border border-[#242424] text-[#F2F2F2] font-bold'
                        : 'text-[#777777] hover:text-[#F2F2F2]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono font-bold text-[#A0A0A0] text-xs flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#777777]" />
                <span>Default Feed Ranking</span>
              </label>
              <p className="font-mono text-[10px] text-[#777777]">Balances personal affinity with global importance</p>
              <div className="flex items-center gap-1 bg-[#101010] p-1 rounded border border-[#242424] font-mono">
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
                        ? 'bg-[#151515] border border-[#242424] text-[#F2F2F2] font-bold'
                        : 'text-[#777777] hover:text-[#F2F2F2]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: API Provider Health & Diagnostics */}
          <div className="p-4 rounded bg-[#101010] border border-[#242424] space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#3B82F6]" />
                <span className="font-mono font-bold text-[#F2F2F2] text-xs uppercase tracking-wider">
                  Provider Connectivity & Diagnostics
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="btn-run-diagnostics"
                  onClick={handleRunDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#151515] border border-[#242424] text-[#F2F2F2] hover:bg-[#202020] disabled:opacity-50 transition-colors font-mono text-[10px]"
                >
                  <Zap className={`w-3 h-3 ${isRunningDiagnostics ? 'animate-pulse text-[#3B82F6]' : ''}`} />
                  <span>{isRunningDiagnostics ? 'Testing...' : 'Test APIs'}</span>
                </button>
                <button
                  id="btn-sync-pipeline"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#3B82F6] text-white font-medium hover:bg-[#2563EB] disabled:opacity-50 transition-colors font-mono text-[10px]"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Pipeline'}</span>
                </button>
              </div>
            </div>

            {syncMessage && (
              <p className="font-mono text-[10px] text-[#3B82F6] bg-[#3B82F6]/10 p-2 rounded border border-[#3B82F6]/30">
                {syncMessage}
              </p>
            )}

            {/* Provider Grid */}
            <div className="space-y-1.5 pt-1">
              {diagnostics.map((diag) => (
                <div
                  key={diag.provider}
                  className="p-2 bg-[#050505] rounded border border-[#242424] flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#F2F2F2] text-xs">{diag.provider}</span>
                      {diag.latencyMs !== undefined && (
                        <span className="text-[10px] text-[#777777] font-mono">
                          {diag.latencyMs}ms
                        </span>
                      )}
                    </div>
                    {getStatusBadge(diag.status)}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#777777]">
                    <span className="truncate max-w-[340px]">{diag.details || diag.service}</span>
                    {diag.itemsRetrieved !== undefined && (
                      <span className="text-[#A0A0A0] shrink-0 font-semibold">
                        {diag.itemsRetrieved} items
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-[#050505] rounded border border-[#242424]">
                <span className="font-mono text-[#777777] block text-[9px] uppercase">News Ingestion</span>
                <span className="font-mono font-bold text-[#F2F2F2]">
                  {pipelineStatus?.articlesCount || 0} Clustered Stories
                </span>
              </div>
              <div className="p-2 bg-[#050505] rounded border border-[#242424]">
                <span className="font-mono text-[#777777] block text-[9px] uppercase">Economic Calendar</span>
                <span className="font-mono font-bold text-[#F2F2F2]">
                  {pipelineStatus?.eventsCount || 0} Macro Releases
                </span>
              </div>
            </div>

            {/* Data Quality & Intelligence Hardening Telemetry */}
            {multiTierDiag && (
              <div className="p-3 bg-[#050505] rounded border border-[#242424] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#F2F2F2] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                    Data Quality & Grounding Guardrails
                  </span>
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                    multiTierDiag.overallStatus === 'healthy'
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                      : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}>
                    {multiTierDiag.overallStatus}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">Schema Valid</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.dataQuality.schemaValidationPassRate}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">AI Grounding</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.intelligence.groundingVerificationRate}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">Quarantined</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.dataQuality.quarantinedCount}</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">Corroboration</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.intelligence.multiSourceCorroborationRate}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">Time Compliance</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.dataQuality.utcTimestampComplianceRate}%</span>
                  </div>
                  <div className="p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#777777] block text-[9px] uppercase">Fallback Rate</span>
                    <span className="font-bold text-[#F2F2F2]">{multiTierDiag.intelligence.fallbackAnalysisRate}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Automated Reliability Test Suite Runner */}
            <div className="p-3 bg-[#050505] rounded border border-[#242424] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#F2F2F2] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                  Reliability Test Suite (7 Core Assertions)
                </span>
                <button
                  id="btn-run-reliability-tests"
                  onClick={handleRunReliabilityTests}
                  disabled={isRunningTests}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#151515] text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#202020] text-[10px] font-mono font-semibold transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                  <span>{isRunningTests ? 'Running Suite...' : 'Run Test Suite'}</span>
                </button>
              </div>

              {testSuiteReport && (
                <div className="space-y-1.5 font-mono text-[10px]">
                  <div className="flex items-center justify-between font-semibold p-1.5 rounded bg-[#101010] border border-[#242424]">
                    <span className="text-[#3B82F6]">
                      Overall: {testSuiteReport.passedSuites}/{testSuiteReport.totalSuites} Suites Passed ({testSuiteReport.passRate}%)
                    </span>
                    <span className="text-[#777777]">{testSuiteReport.executionDurationMs}ms</span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {testSuiteReport.suites?.map((s: any) => (
                      <div
                        key={s.name}
                        className={`p-1.5 rounded border flex items-center justify-between ${
                          s.passed
                            ? 'bg-[#101010] border-[#242424] text-[#F2F2F2]'
                            : 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {s.passed ? (
                            <CheckCircle className="w-3 h-3 text-[#3B82F6] shrink-0" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-[#EF4444] shrink-0" />
                          )}
                          <span className="font-medium truncate">{s.name}</span>
                        </div>
                        <span className="font-bold text-[9px] shrink-0">
                          {s.passedAssertions}/{s.totalAssertions} passed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Reset Footer */}
          <div className="pt-4 border-t border-[#242424] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                id="btn-reset-preferences"
                onClick={resetPreferences}
                className="inline-flex items-center gap-1 font-mono text-xs text-[#777777] hover:text-[#F2F2F2] font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              {totalFeedbackCount > 0 && (
                <span className="font-mono text-[10px] text-[#777777]">
                  ({totalFeedbackCount} feedback signals active)
                </span>
              )}
            </div>

            <button
              id="btn-save-settings"
              onClick={() => setIsSettingsOpen(false)}
              className="py-1.5 px-5 rounded bg-[#3B82F6] hover:bg-[#2563EB] text-white font-mono font-bold text-xs transition-colors shadow-xs"
            >
              Apply & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};




