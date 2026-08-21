import React, { useEffect, useState } from 'react';
import { fetchMarketMetrics } from '../services/api';
import { MarketMetric } from '../types';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const MarketTicker: React.FC = () => {
  const [metrics, setMetrics] = useState<MarketMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await fetchMarketMetrics();
      setMetrics(data.metrics);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to load market metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="market-ticker-bar" className="w-full bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Macro Benchmarks</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          {metrics.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 whitespace-nowrap shrink-0">
              <span className="font-medium text-slate-300">{item.name}</span>
              <span className="font-mono text-slate-100">{item.price}</span>
              <span
                className={`flex items-center gap-0.5 font-mono font-medium ${
                  item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.change} ({item.changePercent > 0 ? `+${item.changePercent}` : item.changePercent}%)
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0 text-slate-400">
          <span>Updated {lastRefreshed || 'Just now'}</span>
          <button
            id="btn-refresh-ticker"
            onClick={loadMetrics}
            title="Refresh Benchmarks"
            className="p-1 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
