import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchEconomicEvents } from '../services/api';
import { EconomicEvent } from '../types';
import {
  Calendar,
  Filter,
  Globe,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronRight,
  Target
} from 'lucide-react';

export const EconomicCalendar: React.FC = () => {
  const { setSelectedEvent, preferences, recordInteraction } = useApp();
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [importanceFilter, setImportanceFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');

  const loadCalendar = async () => {
    try {
      setLoading(true);
      const data = await fetchEconomicEvents({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        importance: importanceFilter !== 'all' ? importanceFilter : undefined,
        currency: currencyFilter !== 'all' ? currencyFilter : undefined,
        preferences,
        sort: 'relevance'
      });
      setEvents(data.events);
    } catch (err) {
      console.error('Failed to load economic events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, [statusFilter, importanceFilter, currencyFilter, preferences]);

  const currencies = ['all', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CNY', 'CHF'];

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDeviationBadge = (dev?: string) => {
    switch (dev) {
      case 'better_than_expected':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          label: 'Beat Forecast',
          icon: <TrendingUp className="w-3 h-3 text-emerald-600" />
        };
      case 'worse_than_expected':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          label: 'Missed Forecast',
          icon: <TrendingDown className="w-3 h-3 text-rose-600" />
        };
      case 'in_line':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          label: 'In Line',
          icon: null
        };
      default:
        return null;
    }
  };

  return (
    <div id="economic-calendar-section" className="space-y-6 pb-12">
      {/* Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Macroeconomic Calendar & Event Intelligence</span>
            </h1>
            <p className="text-xs text-slate-500">
              Track global central bank releases, inflation gauges, and labor statistics prioritized for {preferences.selectedCurrencies.join(', ')}
            </p>
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold self-start md:self-auto">
            <button
              id="cal-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events
            </button>
            <button
              id="cal-status-upcoming"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'upcoming' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
            <button
              id="cal-status-released"
              onClick={() => setStatusFilter('released')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === 'released' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recently Released
            </button>
          </div>
        </div>

        {/* Currency & Importance Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Currency Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Currency:</span>
            {currencies.map((curr) => {
              const isActive = currencyFilter === curr;
              const isTracked = curr !== 'all' && preferences.selectedCurrencies.includes(curr);

              return (
                <button
                  key={curr}
                  id={`cal-curr-pill-${curr.toLowerCase()}`}
                  onClick={() => setCurrencyFilter(curr)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all uppercase flex items-center gap-1 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isTracked
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{curr === 'all' ? 'All' : curr}</span>
                  {isTracked && curr !== 'all' && !isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Importance Select */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-400">Importance:</span>
            <select
              id="select-calendar-importance"
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Levels</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Only</option>
              <option value="medium">Medium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Event List / Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs">Fetching macro indicator schedule...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-1">No economic events found</p>
          <p className="text-xs text-slate-400">Try adjusting your currency or importance filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Table for Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Time & Country</th>
                  <th className="py-3.5 px-4">Indicator / Event</th>
                  <th className="py-3.5 px-3 text-center">Importance</th>
                  <th className="py-3.5 px-3 text-right">Actual</th>
                  <th className="py-3.5 px-3 text-right">Forecast</th>
                  <th className="py-3.5 px-3 text-right">Previous</th>
                  <th className="py-3.5 px-4 text-center">AI Intelligence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => {
                  const devBadge = getDeviationBadge(evt.deviation);
                  const isTrackedCurrency = preferences.selectedCurrencies.includes(evt.currency);

                  return (
                    <tr
                      key={evt.id}
                      id={`cal-row-${evt.id}`}
                      onClick={() => {
                        recordInteraction('event', evt.id);
                        setSelectedEvent(evt);
                      }}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Time & Country */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                            isTrackedCurrency
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'text-slate-900 bg-slate-100'
                          }`}>
                            {evt.currency}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-800 block">{evt.country}</span>
                            <span className="text-[10px] text-slate-400">{evt.time}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event Name */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors text-sm">
                              {evt.eventName}
                            </span>
                            {isTrackedCurrency && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                Tracked
                              </span>
                            )}
                          </div>
                          {devBadge && (
                            <div className="flex items-center gap-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.2 rounded border ${devBadge.bg}`}>
                                {devBadge.icon}
                                {devBadge.label}
                              </span>
                              {evt.deviationNote && (
                                <span className="text-[11px] text-slate-500 italic truncate max-w-xs">
                                  — {evt.deviationNote}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Importance */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${getImportanceBadge(evt.importance)}`}>
                          {evt.importance}
                        </span>
                      </td>

                      {/* Actual */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        {evt.status === 'released' ? (
                          <span className="font-mono font-bold text-slate-900 text-sm">
                            {evt.actual}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* Forecast */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-slate-600">
                        {evt.forecast || '—'}
                      </td>

                      {/* Previous */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono text-slate-500">
                        {evt.previous}
                      </td>

                      {/* AI Button */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          id={`btn-event-explain-${evt.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            recordInteraction('event', evt.id);
                            setSelectedEvent(evt);
                          }}
                          className="inline-flex items-center gap-1 py-1 px-2.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>AI Breakdown</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Card list for Mobile / Small Screens */}
          <div className="lg:hidden divide-y divide-slate-100">
            {events.map((evt) => {
              const devBadge = getDeviationBadge(evt.deviation);
              const isTrackedCurrency = preferences.selectedCurrencies.includes(evt.currency);

              return (
                <div
                  key={evt.id}
                  id={`cal-card-mobile-${evt.id}`}
                  onClick={() => {
                    recordInteraction('event', evt.id);
                    setSelectedEvent(evt);
                  }}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        isTrackedCurrency ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-slate-900 bg-slate-100'
                      }`}>
                        {evt.currency}
                      </span>
                      <span className="font-semibold text-slate-700">{evt.country}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${getImportanceBadge(evt.importance)}`}>
                      {evt.importance}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {evt.eventName}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Actual</span>
                      <span className="font-mono font-bold text-slate-900">
                        {evt.status === 'released' ? evt.actual : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Forecast</span>
                      <span className="font-mono text-slate-700">{evt.forecast || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Previous</span>
                      <span className="font-mono text-slate-500">{evt.previous}</span>
                    </div>
                  </div>

                  {devBadge && (
                    <div className="flex items-center gap-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded border ${devBadge.bg}`}>
                        {devBadge.icon}
                        {devBadge.label}
                      </span>
                      {evt.deviationNote && (
                        <span className="text-[11px] text-slate-500 italic truncate">
                          {evt.deviationNote}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-400">{evt.time}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>View AI Impact Guide</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

