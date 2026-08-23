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
    <div id="market-ticker-bar" className="w-full bg-[#0A0A0A] text-[#A0A0A0] border-b border-[#242424] text-xs py-1.5 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3B82F6]"></span>
          <span className="font-mono font-medium text-[#777777] uppercase tracking-widest text-[10px]">Macro Benchmarks</span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          {metrics.map((item) => (
            <div key={item.symbol} className="flex items-center gap-2 whitespace-nowrap shrink-0 text-xs">
              <span className="font-medium text-[#777777]">{item.name}</span>
              <span className="font-mono-num font-medium text-[#F2F2F2]">{item.price}</span>
              <span
                className={`flex items-center gap-0.5 font-mono-num text-[11px] font-medium ${
                  item.isPositive ? 'text-[#3B82F6]' : 'text-[#EF4444]'
                }`}
              >
                {item.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {item.change} ({item.changePercent > 0 ? `+${item.changePercent}` : item.changePercent}%)
              </span>
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2 shrink-0 text-[#777777] text-[11px]">
          <span className="font-mono-num">SYNCED {lastRefreshed || 'LIVE'}</span>
          <button
            id="btn-refresh-ticker"
            onClick={loadMetrics}
            title="Refresh Benchmarks"
            className="p-1 text-[#777777] hover:text-[#F2F2F2] transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

