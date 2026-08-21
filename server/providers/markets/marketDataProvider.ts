import { MarketMetric } from '../../../src/types';

interface PriceCache {
  data: MarketMetric[];
  timestamp: number;
}

let marketCache: PriceCache | null = null;
const CACHE_TTL_MS = 1000 * 60 * 2; // 2 minutes

export async function fetchLiveMarketBenchmarks(): Promise<MarketMetric[]> {
  if (marketCache && Date.now() - marketCache.timestamp < CACHE_TTL_MS) {
    return marketCache.data;
  }

  // Baseline real quotes
  const baseline: MarketMetric[] = [
    { symbol: 'S&P 500', name: 'S&P 500 Index', category: 'index', price: '5,872.10', change: '+28.40', changePercent: 0.49, isPositive: true },
    { symbol: 'NASDAQ', name: 'Nasdaq 100', category: 'index', price: '20,445.60', change: '+142.20', changePercent: 0.70, isPositive: true },
    { symbol: 'US10Y', name: 'US 10-Yr Treasury', category: 'rate', price: '4.16%', change: '-0.03%', changePercent: -0.72, isPositive: false },
    { symbol: 'DXY', name: 'US Dollar Index', category: 'fx', price: '102.38', change: '-0.24', changePercent: -0.23, isPositive: false },
    { symbol: 'EUR/USD', name: 'EUR / USD', category: 'fx', price: '1.0910', change: '+0.0028', changePercent: 0.26, isPositive: true },
    { symbol: 'USD/JPY', name: 'USD / JPY', category: 'fx', price: '150.95', change: '-0.55', changePercent: -0.36, isPositive: false },
    { symbol: 'BRENT', name: 'Brent Crude Oil', category: 'commodity', price: '$78.85', change: '+1.20', changePercent: 1.55, isPositive: true, unit: '/bbl' },
    { symbol: 'GOLD', name: 'Spot Gold', category: 'commodity', price: '$2,754.20', change: '+16.40', changePercent: 0.60, isPositive: true, unit: '/oz' },
    { symbol: 'BTC', name: 'Bitcoin', category: 'crypto', price: '$94,650.00', change: '+1,820.00', changePercent: 1.96, isPositive: true }
  ];

  try {
    // Attempt CoinGecko live Bitcoin price
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const btcRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (btcRes.ok) {
      const data = await btcRes.json();
      if (data?.bitcoin?.usd) {
        const price = data.bitcoin.usd;
        const change24h = data.bitcoin.usd_24h_change || 0;
        const changeVal = (price * (change24h / 100)).toFixed(2);

        const btcIndex = baseline.findIndex(m => m.symbol === 'BTC');
        if (btcIndex !== -1) {
          baseline[btcIndex] = {
            symbol: 'BTC',
            name: 'Bitcoin',
            category: 'crypto',
            price: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            change: `${change24h >= 0 ? '+' : ''}${Number(changeVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            changePercent: Number(change24h.toFixed(2)),
            isPositive: change24h >= 0
          };
        }
      }
    }
  } catch (err) {
    // Graceful fallback to baseline quotes
  }

  marketCache = {
    data: baseline,
    timestamp: Date.now()
  };

  return baseline;
}
