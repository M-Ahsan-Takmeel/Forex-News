import { NewsCategory, ImportanceLevel, ImportanceBreakdown, EntitiesExtracted } from '../../src/types';
import { NormalizedStoryCluster } from './deduplication';
import { calculateImportance } from './importanceScorer';

const CATEGORY_RULES: Array<{
  category: NewsCategory;
  keywords: string[];
  weight: number;
}> = [
  {
    category: 'Central Banks',
    keywords: [
      'fed', 'federal reserve', 'fomc', 'powell', 'ecb', 'lagarde', 'bank of japan', 'boj',
      'rate cut', 'rate hike', 'interest rate', 'monetary policy', 'central bank', 'quantitative easing',
      'balance sheet', 'terminal rate', 'basis points', 'bank of england', 'pboc', 'rba', 'snb'
    ],
    weight: 1.2
  },
  {
    category: 'Commodities',
    keywords: [
      'crude', 'oil', 'brent', 'wti', 'opec', 'gold', 'silver', 'copper', 'natural gas', 'lng',
      'agriculture', 'grain', 'wheat', 'metals', 'refinery', 'barrel', 'petroleum', 'uranium', 'lithium'
    ],
    weight: 1.1
  },
  {
    category: 'Forex',
    keywords: [
      'dollar', 'dxy', 'euro', 'yen', 'yuan', 'sterling', 'forex', 'fx', 'currency', 'exchange rate',
      'devaluation', 'foreign exchange', 'usd/jpy', 'eur/usd', 'gbp/usd', 'usdcad', 'audusd', 'greenback'
    ],
    weight: 1.1
  },
  {
    category: 'Bonds',
    keywords: [
      'treasury', 'yield', 'bond', 'sovereign debt', 'gilt', 'bund', 'yield curve', 'debt ceiling',
      'fixed income', 'credit spread', '10-year', '2-year', 'coupon', 'duration', 'issuance', 'treasuries'
    ],
    weight: 1.15
  },
  {
    category: 'Crypto',
    keywords: [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 'sec etf', 'digital asset',
      'token', 'cryptocurrency', 'mining', 'solana', 'stablecoin'
    ],
    weight: 1.1
  },
  {
    category: 'Geopolitics',
    keywords: [
      'tariff', 'sanctions', 'trade war', 'embargo', 'geopolitical', 'taiwan', 'ukraine', 'middle east',
      'red sea', 'defense', 'treaty', 'export control', 'trade deal', 'strait of hormuz', 'protectionism'
    ],
    weight: 1.2
  },
  {
    category: 'Economy',
    keywords: [
      'inflation', 'cpi', 'pce', 'gdp', 'jobs', 'payrolls', 'unemployment', 'recession',
      'consumer confidence', 'pmi', 'retail sales', 'housing starts', 'deficit', 'labor market', 'productivity'
    ],
    weight: 1.2
  },
  {
    category: 'Stocks',
    keywords: [
      's&p', 'nasdaq', 'dow jones', 'equities', 'earnings', 'quarterly report', 'revenue',
      'wall street', 'shares', 'stock market', 'ipo', 'dividend', 'tech stocks', 'rally', 'selloff'
    ],
    weight: 1.0
  },
  {
    category: 'Business',
    keywords: [
      'merger', 'acquisition', 'deal', 'ceo', 'restructuring', 'layoffs', 'antitrust', 'supply chain',
      'corporate', 'venture', 'capex'
    ],
    weight: 0.9
  }
];

export function categorizeAndScoreCluster(cluster: NormalizedStoryCluster): {
  category: NewsCategory;
  secondaryCategories: NewsCategory[];
  country: string;
  countryCode: string;
  relatedCurrencies: string[];
  relatedMarkets: string[];
  relatedSectors: string[];
  importance: ImportanceLevel;
  importanceBreakdown: ImportanceBreakdown;
  entities: EntitiesExtracted;
  tags: string[];
} {
  const primary = cluster.primary;
  const fullText = `${primary.title} ${primary.description} ${primary.content || ''}`.toLowerCase();

  // Multi-category topic scoring
  const categoryScores: Array<{ category: NewsCategory; score: number }> = [];

  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (fullText.includes(kw)) {
        const inTitle = primary.title.toLowerCase().includes(kw);
        score += (inTitle ? 4 : 1.5) * rule.weight;
      }
    }
    if (score > 0) {
      categoryScores.push({ category: rule.category, score });
    }
  }

  categoryScores.sort((a, b) => b.score - a.score);

  const primaryCategory: NewsCategory = categoryScores.length > 0
    ? categoryScores[0].category
    : (primary.categoryHint || 'Economy');

  const secondaryCategories: NewsCategory[] = categoryScores
    .slice(1, 3)
    .filter(c => c.score >= 3 && c.category !== primaryCategory)
    .map(c => c.category);

  // Entities & Country detection
  const entities = cluster.entities;
  let detectedCountry = entities.countries[0] || 'United States';
  let detectedCountryCode = 'US';

  if (detectedCountry === 'United States') detectedCountryCode = 'US';
  else if (detectedCountry === 'Eurozone') detectedCountryCode = 'EU';
  else if (detectedCountry === 'Germany') detectedCountryCode = 'DE';
  else if (detectedCountry === 'Japan') detectedCountryCode = 'JP';
  else if (detectedCountry === 'United Kingdom') detectedCountryCode = 'GB';
  else if (detectedCountry === 'China') detectedCountryCode = 'CN';
  else if (detectedCountry === 'Canada') detectedCountryCode = 'CA';
  else if (detectedCountry === 'Australia') detectedCountryCode = 'AU';
  else if (detectedCountry === 'Switzerland') detectedCountryCode = 'CH';
  else {
    detectedCountry = 'Global';
    detectedCountryCode = 'GLOBAL';
  }

  // Related Currencies
  const relatedCurrencies = entities.currencies.length > 0 ? entities.currencies : ['USD'];

  // Related Markets
  const relatedMarkets: string[] = [];
  if (entities.assets.length > 0) {
    relatedMarkets.push(...entities.assets);
  }
  if (fullText.includes('s&p') || fullText.includes('equities') || fullText.includes('stock')) relatedMarkets.push('S&P 500');
  if (fullText.includes('nasdaq') || fullText.includes('tech')) relatedMarkets.push('Nasdaq 100');
  if (fullText.includes('treasury') || fullText.includes('yield') || fullText.includes('bond')) relatedMarkets.push('US Treasuries');
  if (fullText.includes('crude') || fullText.includes('oil') || fullText.includes('brent')) relatedMarkets.push('Brent Crude');
  if (fullText.includes('gold') || fullText.includes('precious metal')) relatedMarkets.push('Gold');
  if (fullText.includes('dollar') || fullText.includes('dxy')) relatedMarkets.push('US Dollar');
  if (fullText.includes('bitcoin') || fullText.includes('crypto')) relatedMarkets.push('Bitcoin');

  const uniqueMarkets = Array.from(new Set(relatedMarkets));
  if (uniqueMarkets.length === 0) {
    uniqueMarkets.push('Global Equities', 'Sovereign Debt');
  }

  // Related Sectors
  const relatedSectors: string[] = [];
  if (fullText.includes('bank') || fullText.includes('financial') || fullText.includes('credit')) relatedSectors.push('Financials');
  if (fullText.includes('tech') || fullText.includes('chip') || fullText.includes('ai') || fullText.includes('semiconductor')) relatedSectors.push('Technology');
  if (fullText.includes('energy') || fullText.includes('oil') || fullText.includes('gas')) relatedSectors.push('Energy');
  if (fullText.includes('auto') || fullText.includes('car') || fullText.includes('ev')) relatedSectors.push('Automotive');
  if (fullText.includes('health') || fullText.includes('drug') || fullText.includes('pharma')) relatedSectors.push('Healthcare');
  if (fullText.includes('real estate') || fullText.includes('housing') || fullText.includes('mortgage')) relatedSectors.push('Real Estate');

  // Compute Structured Importance
  const avgCredibility = cluster.allSources.length > 0
    ? cluster.allSources.reduce((acc, s) => acc + (s.credibilityScore || 80), 0) / cluster.allSources.length
    : 80;

  const importanceBreakdown = calculateImportance({
    title: primary.title,
    description: primary.description,
    category: primaryCategory,
    entities,
    independentSourcesCount: cluster.independentSourcesCount,
    avgCredibilityScore: avgCredibility,
    publishedAt: primary.publishedAt
  });

  // Dynamic tags
  const tagsSet = new Set<string>();
  tagsSet.add(primaryCategory);
  if (detectedCountry && detectedCountry !== 'Global') tagsSet.add(detectedCountry);
  relatedCurrencies.forEach(c => tagsSet.add(c));
  uniqueMarkets.slice(0, 2).forEach(m => tagsSet.add(m));
  entities.institutions.slice(0, 2).forEach(i => tagsSet.add(i));

  return {
    category: primaryCategory,
    secondaryCategories,
    country: detectedCountry,
    countryCode: detectedCountryCode,
    relatedCurrencies,
    relatedMarkets: uniqueMarkets,
    relatedSectors,
    importance: importanceBreakdown.level,
    importanceBreakdown,
    entities,
    tags: Array.from(tagsSet).slice(0, 6)
  };
}
