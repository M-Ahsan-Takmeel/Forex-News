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
  Target,
  ArrowUpRight
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
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      case 'high':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30';
      case 'medium':
        return 'bg-[#3B82F6]/15 text-[#3B82F6] border-[#3B82F6]/30';
      default:
        return 'bg-[#151515] text-[#777777] border-[#242424]';
    }
  };

  const getDeviationBadge = (dev?: string) => {
    switch (dev) {
      case 'better_than_expected':
        return {
          bg: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30',
          label: 'BEAT FORECAST',
          icon: <TrendingUp className="w-3 h-3 text-[#3B82F6]" />
        };
      case 'worse_than_expected':
        return {
          bg: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30',
          label: 'MISSED FORECAST',
          icon: <TrendingDown className="w-3 h-3 text-[#EF4444]" />
        };
      case 'in_line':
        return {
          bg: 'bg-[#151515] text-[#A0A0A0] border-[#242424]',
          label: 'IN LINE',
          icon: null
        };
      default:
        return null;
    }
  };

  return (
    <div id="economic-calendar-section" className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-[#101010] rounded-lg border border-[#242424] p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-[#777777]">GLOBAL MACRO CALENDAR</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F2F2F2] tracking-tight mt-0.5">
              Economic Indicators & Event Intelligence
            </h1>
            <p className="text-xs text-[#777777] mt-0.5">
              Track global central bank releases, inflation gauges, and labor statistics prioritized for {preferences.selectedCurrencies.join(', ')}
            </p>
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#050505] rounded border border-[#242424] text-xs font-semibold self-start md:self-auto">
            <button
              id="cal-status-all"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === 'all' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              All Events
            </button>
            <button
              id="cal-status-upcoming"
              onClick={() => setStatusFilter('upcoming')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === 'upcoming' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              Upcoming
            </button>
            <button
              id="cal-status-released"
              onClick={() => setStatusFilter('released')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === 'released' ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold' : 'text-[#777777] hover:text-[#A0A0A0]'
              }`}
            >
              Recently Released
            </button>
          </div>
        </div>

        {/* Currency & Importance Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#242424]">
          {/* Currency Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <span className="font-mono text-[10px] uppercase text-[#777777] mr-1.5 shrink-0">CURRENCY:</span>
            {currencies.map((curr) => {
              const isActive = currencyFilter === curr;
              const isTracked = curr !== 'all' && preferences.selectedCurrencies.includes(curr);

              return (
                <button
                  key={curr}
                  id={`cal-curr-pill-${curr.toLowerCase()}`}
                  onClick={() => setCurrencyFilter(curr)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all uppercase flex items-center gap-1 ${
                    isActive
                      ? 'bg-[#151515] text-[#F2F2F2] border border-[#242424] font-semibold'
                      : isTracked
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30'
                      : 'bg-[#0A0A0A] text-[#777777] hover:text-[#A0A0A0] border border-transparent'
                  }`}
                >
                  <span>{curr === 'all' ? 'All' : curr}</span>
                  {isTracked && curr !== 'all' && !isActive && (
                    <span className="w-1 h-1 rounded-full bg-[#3B82F6]"></span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Importance Select */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] uppercase text-[#777777]">IMPORTANCE:</span>
            <select
              id="select-calendar-importance"
              value={importanceFilter}
              onChange={(e) => setImportanceFilter(e.target.value)}
              className="py-1 px-2 bg-[#050505] border border-[#242424] rounded text-xs text-[#A0A0A0] focus:outline-none focus:border-[#3B82F6]"
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
        <div className="p-12 text-center text-[#777777] bg-[#101010] rounded-lg border border-[#242424]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#3B82F6]" />
          <p className="font-mono text-xs">SYNCHRONIZING MACRO INDICATOR SCHEDULE...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center text-[#777777] bg-[#101010] rounded-lg border border-[#242424] space-y-2">
          <p className="text-sm font-semibold text-[#F2F2F2]">No economic events found</p>
          <p className="text-xs text-[#777777]">Try adjusting your currency or importance filters.</p>
        </div>
      ) : (
        <div className="bg-[#101010] rounded-lg border border-[#242424] overflow-hidden">
          {/* Table for Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs text-[#A0A0A0]">
              <thead className="bg-[#0A0A0A] border-b border-[#242424] text-[10px] font-mono uppercase tracking-wider text-[#777777]">
                <tr>
                  <th className="py-3 px-4">TIME & JURISDICTION</th>
                  <th className="py-3 px-4">INDICATOR / EVENT</th>
                  <th className="py-3 px-3 text-center">SEVERITY</th>
                  <th className="py-3 px-3 text-right">ACTUAL</th>
                  <th className="py-3 px-3 text-right">FORECAST</th>
                  <th className="py-3 px-3 text-right">PREVIOUS</th>
                  <th className="py-3 px-4 text-center">INTELLIGENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242424]">
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
                      className="hover:bg-[#151515] transition-colors cursor-pointer group"
                    >
                      {/* Time & Country */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold px-1.5 py-0.2 rounded-xs text-[10px] ${
                            isTrackedCurrency
                              ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30'
                              : 'text-[#F2F2F2] bg-[#151515] border border-[#242424]'
                          }`}>
                            {evt.currency}
                          </span>
                          <div>
                            <span className="font-semibold text-[#F2F2F2] block">{evt.country}</span>
                            <span className="font-mono text-[10px] text-[#777777]">{evt.time}</span>
                          </div>
                        </div>
                      </td>

                      {/* Event Name */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#F2F2F2] group-hover:text-white transition-colors text-xs">
                              {evt.eventName}
                            </span>
                            {isTrackedCurrency && (
                              <span className="font-mono text-[9px] px-1 py-0.2 rounded-xs bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 font-bold uppercase">
                                Tracked
                              </span>
                            )}
                          </div>
                          {devBadge && (
                            <div className="flex items-center gap-1">
                              <span className={`font-mono inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-xs border ${devBadge.bg}`}>
                                {devBadge.icon}
                                {devBadge.label}
                              </span>
                              {evt.deviationNote && (
                                <span className="text-[10px] text-[#777777] truncate max-w-xs">
                                  — {evt.deviationNote}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Importance */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-mono px-1.5 py-0.2 rounded-xs font-bold uppercase text-[9px] border ${getImportanceBadge(evt.importance)}`}>
                          {evt.importance}
                        </span>
                      </td>

                      {/* Actual */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {evt.status === 'released' ? (
                          <span className="font-mono font-bold text-[#F2F2F2] text-xs">
                            {evt.actual}
                          </span>
                        ) : (
                          <span className="font-mono text-[#777777] text-xs">PENDING</span>
                        )}
                      </td>

                      {/* Forecast */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono text-xs text-[#A0A0A0]">
                        {evt.forecast || '—'}
                      </td>

                      {/* Previous */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono text-xs text-[#777777]">
                        {evt.previous}
                      </td>

                      {/* AI Button */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <button
                          id={`btn-event-explain-${evt.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            recordInteraction('event', evt.id);
                            setSelectedEvent(evt);
                          }}
                          className="inline-flex items-center gap-1 py-1 px-2 rounded bg-[#151515] hover:bg-[#202020] text-[#F2F2F2] border border-[#242424] font-mono text-[10px] font-medium transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-[#3B82F6]" />
                          <span>BREAKDOWN</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Card list for Mobile / Small Screens */}
          <div className="lg:hidden divide-y divide-[#242424]">
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
                  className="p-4 space-y-2.5 hover:bg-[#151515] transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono font-bold px-1.5 py-0.2 rounded-xs text-[10px] ${
                        isTrackedCurrency ? 'bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30' : 'text-[#F2F2F2] bg-[#151515]'
                      }`}>
                        {evt.currency}
                      </span>
                      <span className="font-semibold text-[#F2F2F2]">{evt.country}</span>
                    </div>
                    <span className={`font-mono px-1.5 py-0.2 rounded-xs font-bold uppercase text-[9px] border ${getImportanceBadge(evt.importance)}`}>
                      {evt.importance}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-[#F2F2F2] leading-snug">
                    {evt.eventName}
                  </h3>

                  <div className="grid grid-cols-3 gap-2 bg-[#0A0A0A] p-2 rounded border border-[#242424] text-center text-xs">
                    <div>
                      <span className="font-mono text-[9px] text-[#777777] uppercase block">Actual</span>
                      <span className="font-mono font-bold text-[#F2F2F2]">
                        {evt.status === 'released' ? evt.actual : 'Pending'}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-[#777777] uppercase block">Forecast</span>
                      <span className="font-mono text-[#A0A0A0]">{evt.forecast || '—'}</span>
                    </div>
                    <div>
                      <span className="font-mono text-[9px] text-[#777777] uppercase block">Previous</span>
                      <span className="font-mono text-[#777777]">{evt.previous}</span>
                    </div>
                  </div>

                  {devBadge && (
                    <div className="flex items-center gap-1">
                      <span className={`font-mono inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-xs border ${devBadge.bg}`}>
                        {devBadge.icon}
                        {devBadge.label}
                      </span>
                      {evt.deviationNote && (
                        <span className="text-[10px] text-[#777777] truncate">
                          {evt.deviationNote}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="font-mono text-[10px] text-[#777777]">{evt.time}</span>
                    <span className="text-[#3B82F6] font-mono text-[11px] font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI Breakdown</span>
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


