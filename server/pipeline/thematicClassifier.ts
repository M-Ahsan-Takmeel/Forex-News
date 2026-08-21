import { NewsArticle, ThematicCluster, ImpactDirection } from '../../src/types';

interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  category: any;
}

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'theme-monetary-policy',
    name: 'Central Bank Policy & Rate Divergence',
    description: 'Federal Reserve, ECB, and BOJ interest rate guidance, terminal rate expectations, and quantitative tightening dynamics.',
    keywords: ['fed', 'fomc', 'powell', 'ecb', 'lagarde', 'boj', 'rate cut', 'rate hike', 'terminal rate', 'monetary policy', 'basis points', 'central bank'],
    category: 'Central Banks'
  },
  {
    id: 'theme-inflation-pressures',
    name: 'Inflation Trajectory & Real Yields',
    description: 'Headline and core inflation data (CPI/PCE), wage pressures, and market-implied breakeven inflation rates.',
    keywords: ['inflation', 'cpi', 'pce', 'sticky inflation', 'price pressures', 'disinflation', 'deflation', 'wage growth'],
    category: 'Economy'
  },
  {
    id: 'theme-geopolitical-trade',
    name: 'Geopolitical Risk & Tariff Frictions',
    description: 'Protectionist trade measures, sanctions, export restrictions, and regional security flashpoints impacting supply chains.',
    keywords: ['tariff', 'trade war', 'sanctions', 'embargo', 'geopolitical', 'taiwan', 'ukraine', 'red sea', 'middle east', 'export control'],
    category: 'Geopolitics'
  },
  {
    id: 'theme-energy-commodities',
    name: 'Energy Supply & Commodity Dynamics',
    description: 'OPEC+ production quotas, crude oil inventory shifts, natural gas flows, and industrial metals pricing.',
    keywords: ['crude', 'oil', 'brent', 'wti', 'opec', 'natural gas', 'lng', 'copper', 'gold', 'petroleum'],
    category: 'Commodities'
  },
  {
    id: 'theme-sovereign-debt',
    name: 'Sovereign Debt & Yield Curve Shifts',
    description: 'Treasury issuance, deficit sustainability, yield curve steepening, and government bond market volatility.',
    keywords: ['treasury', 'yield', 'bond', 'deficit', 'debt ceiling', 'sovereign debt', 'gilt', 'bund', '10-year yield', 'yield curve'],
    category: 'Bonds'
  },
  {
    id: 'theme-ai-tech-capex',
    name: 'AI Infrastructure & Mega-Cap Tech Capex',
    description: 'Data center capital expenditures, semiconductor demand, cloud growth, and tech valuation multiples.',
    keywords: ['ai', 'artificial intelligence', 'nvidia', 'semiconductor', 'chips', 'data center', 'capex', 'tech earnings', 'cloud'],
    category: 'Stocks'
  }
];

export function extractThematicClusters(articles: NewsArticle[]): ThematicCluster[] {
  if (!articles || articles.length === 0) return [];

  const clusters: ThematicCluster[] = [];

  for (const def of THEME_DEFINITIONS) {
    const matchingStories = articles.filter(a => {
      const text = `${a.title} ${a.description} ${(a.tags || []).join(' ')}`.toLowerCase();
      return def.keywords.some(kw => text.includes(kw));
    });

    // Only create a theme cluster if at least 2 stories support it
    if (matchingStories.length >= 2) {
      // Calculate aggregate bias
      let bullishCount = 0;
      let bearishCount = 0;
      matchingStories.forEach(s => {
        if (s.sentiment === 'bullish') bullishCount++;
        else if (s.sentiment === 'bearish') bearishCount++;
      });

      let bias: ImpactDirection = 'unclear';
      if (bullishCount > bearishCount + 1) bias = 'bullish';
      else if (bearishCount > bullishCount + 1) bias = 'bearish';
      else if (bullishCount > 0 || bearishCount > 0) bias = 'neutral';

      // Extract key drivers
      const drivers = Array.from(new Set(
        matchingStories.slice(0, 3).map(s => s.title.replace(/\s*[-|–].*$/, '').trim())
      ));

      clusters.push({
        id: def.id,
        theme: def.name,
        headline: matchingStories[0].title,
        description: def.description,
        category: def.category,
        storyIds: matchingStories.map(s => s.id),
        storyCount: matchingStories.length,
        bias,
        keyDrivers: drivers
      });
    }
  }

  return clusters.sort((a, b) => b.storyCount - a.storyCount);
}
