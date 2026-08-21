import {
  NewsArticle,
  EconomicEvent,
  UserPreferences,
  UserRelevanceEvaluation,
  ImportanceLevel,
  MacroOverview
} from '../../src/types';

// Standard topic mappings
const TOPIC_KEYWORD_MAP: Record<string, string[]> = {
  'Central Banks': ['fed', 'federal reserve', 'ecb', 'boj', 'boe', 'pboc', 'central bank', 'fomc', 'powell', 'lagarde', 'rate decision', 'monetary policy', 'quantitative tightening', 'rate cut', 'rate hike'],
  'Inflation': ['inflation', 'cpi', 'pce', 'ppi', 'cost of living', 'core inflation', 'price pressures', 'disinflation'],
  'Interest Rates': ['interest rate', 'rates', 'yield', 'yields', 'treasury', 'sovereign debt', 'discount rate', 'rate cut', 'rate hike', 'terminal rate'],
  'Employment': ['employment', 'jobs', 'nfp', 'payrolls', 'unemployment', 'jobless claims', 'wage growth', 'labor market'],
  'Economic Growth': ['gdp', 'growth', 'recession', 'expansion', 'pmi', 'manufacturing', 'services', 'retail sales', 'industrial production'],
  'Geopolitics': ['sanctions', 'geopolitical', 'war', 'tariff', 'taiwan', 'ukraine', 'middle east', 'red sea', 'defense', 'election'],
  'Energy': ['crude', 'oil', 'brent', 'wti', 'gas', 'opec', 'petroleum', 'energy', 'lng'],
  'Trade': ['trade', 'tariff', 'exports', 'imports', 'trade balance', 'shipping', 'wto', 'protectionism'],
  'Technology': ['tech', 'technology', 'semiconductor', 'chips', 'software', 'cloud', 'cybersecurity'],
  'AI': ['ai', 'artificial intelligence', 'gpu', 'llm', 'machine learning', 'datacenter', 'generative ai', 'nvidia'],
  'Corporate Earnings': ['earnings', 'revenue', 'guidance', 'profit', 'quarterly results', 'eps', 'margin', 'buyback']
};

const MARKET_CATEGORY_MAP: Record<string, string[]> = {
  'Forex': ['forex', 'fx', 'dollar', 'euro', 'yen', 'pound', 'currencies', 'usd', 'eur', 'gbp', 'jpy', 'cny', 'chf', 'aud', 'cad'],
  'Equities': ['stocks', 'equities', 'shares', 's&p 500', 'nasdaq', 'dow', 'stoxx', 'nikkei', 'indices', 'rally', 'selloff'],
  'Bonds': ['bonds', 'yields', 'treasury', 'gilts', 'bunds', 'jgb', 'fixed income', 'sovereign debt', 'credit spread'],
  'Commodities': ['commodities', 'gold', 'silver', 'copper', 'oil', 'crude', 'gas', 'metals', 'agriculture', 'grains'],
  'Crypto': ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'digital assets', 'blockchain', 'solana']
};

/**
 * Deterministic calculation of user personal relevance for a news story
 */
export function calculateArticlePersonalRelevance(
  article: NewsArticle,
  preferences?: Partial<UserPreferences>
): UserRelevanceEvaluation {
  // If user has no specific preferences configured, return global importance as base
  if (!preferences || (!preferences.selectedMarkets?.length && !preferences.selectedCurrencies?.length && !preferences.selectedTopics?.length && !preferences.selectedCountries?.length)) {
    const globalScore = article.importanceBreakdown?.score ?? (
      article.importance === 'critical' ? 90 : article.importance === 'high' ? 75 : article.importance === 'medium' ? 50 : 30
    );
    return {
      score: globalScore,
      level: article.importance,
      matchedFactors: ['Global Market Development'],
      whyItMattersToYou: 'Global financial development affecting broad macroeconomic conditions.'
    };
  }

  const selectedMarkets = preferences.selectedMarkets || [];
  const selectedCurrencies = (preferences.selectedCurrencies || []).map(c => c.toUpperCase());
  const selectedCountries = (preferences.selectedCountries || []).map(c => c.toLowerCase());
  const selectedTopics = preferences.selectedTopics || [];
  const feedback = preferences.feedback;

  let score = 25; // Base starting score
  const matchedFactors: string[] = [];

  const textToScan = `${article.title} ${article.description || ''} ${article.aiSummary || ''} ${article.tags.join(' ')}`.toLowerCase();

  // 1. Currency Matches (Up to 30 pts)
  const articleCurrencies = (article.relatedCurrencies || []).map(c => c.toUpperCase());
  const matchedCurrencies = selectedCurrencies.filter(curr =>
    articleCurrencies.includes(curr) ||
    textToScan.includes(` ${curr.toLowerCase()} `) ||
    textToScan.includes(`(${curr.toLowerCase()})`)
  );

  if (matchedCurrencies.length > 0) {
    score += Math.min(30, matchedCurrencies.length * 15);
    matchedFactors.push(`Currencies (${matchedCurrencies.join(', ')})`);
  }

  // 2. Market / Asset Class Matches (Up to 25 pts)
  const matchedMarkets: string[] = [];
  for (const market of selectedMarkets) {
    const keywords = MARKET_CATEGORY_MAP[market] || [market.toLowerCase()];
    const matchesCategory = article.category.toLowerCase().includes(market.toLowerCase()) ||
      (article.secondaryCategories || []).some(sc => sc.toLowerCase().includes(market.toLowerCase()));
    const matchesRelated = (article.relatedMarkets || []).some(m => m.toLowerCase().includes(market.toLowerCase()));
    const matchesText = keywords.some(kw => textToScan.includes(kw));

    if (matchesCategory || matchesRelated || matchesText) {
      matchedMarkets.push(market);
    }
  }

  if (matchedMarkets.length > 0) {
    score += Math.min(25, matchedMarkets.length * 12);
    matchedFactors.push(`Markets (${matchedMarkets.join(', ')})`);
  }

  // 3. Topic Matches (Up to 25 pts)
  const matchedTopics: string[] = [];
  for (const topic of selectedTopics) {
    const keywords = TOPIC_KEYWORD_MAP[topic] || [topic.toLowerCase()];
    const matchesTag = article.tags.some(t => t.toLowerCase() === topic.toLowerCase());
    const matchesKeyword = keywords.some(kw => textToScan.includes(kw));

    if (matchesTag || matchesKeyword) {
      matchedTopics.push(topic);
    }
  }

  if (matchedTopics.length > 0) {
    score += Math.min(25, matchedTopics.length * 10);
    matchedFactors.push(`Topics (${matchedTopics.join(', ')})`);
  }

  // 4. Country / Geography Matches (Up to 15 pts)
  const articleCountry = (article.country || '').toLowerCase();
  const matchedCountries = selectedCountries.filter(country =>
    articleCountry.includes(country) || textToScan.includes(country)
  );

  if (matchedCountries.length > 0) {
    score += Math.min(15, matchedCountries.length * 10);
    matchedFactors.push(`Region (${matchedCountries.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')})`);
  }

  // 5. Entity Extracted Matches (Up to 15 pts)
  if (article.entities) {
    const hasInstMatch = (article.entities.institutions || []).some(inst =>
      selectedTopics.includes('Central Banks') && (inst.includes('Fed') || inst.includes('ECB') || inst.includes('Bank'))
    );
    if (hasInstMatch) {
      score += 10;
      if (!matchedFactors.some(f => f.includes('Central Banks'))) {
        matchedFactors.push('Key Institution / Central Bank');
      }
    }
  }

  // 6. User Feedback Tuning (+/- 25 pts)
  if (feedback) {
    // Liked topics or entities
    const hasLikedTopic = (feedback.likedTopics || []).some(t => matchedTopics.includes(t) || textToScan.includes(t.toLowerCase()));
    const hasLikedEntity = (feedback.likedEntities || []).some(e => textToScan.includes(e.toLowerCase()));
    if (hasLikedTopic || hasLikedEntity) {
      score += 15;
    }

    // Disliked topics or entities
    const hasDislikedTopic = (feedback.dislikedTopics || []).some(t => matchedTopics.includes(t) || textToScan.includes(t.toLowerCase()));
    const hasDislikedEntity = (feedback.dislikedEntities || []).some(e => textToScan.includes(e.toLowerCase()));
    if (hasDislikedTopic || hasDislikedEntity) {
      score -= 25;
    }
  }

  // Clamp score 0 - 100
  score = Math.max(5, Math.min(100, Math.round(score)));

  // Derive level
  let level: ImportanceLevel = 'low';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';

  // Generate grounded "Why this matters to you"
  let whyItMattersToYou = '';
  if (matchedFactors.length > 0) {
    const reasons: string[] = [];
    if (matchedCurrencies.length > 0) {
      reasons.push(`You follow ${matchedCurrencies.join(' & ')}`);
    }
    if (matchedMarkets.length > 0) {
      reasons.push(`your active ${matchedMarkets.join(', ')} watchlists`);
    }
    if (matchedTopics.length > 0) {
      reasons.push(`key ${matchedTopics.slice(0, 2).join(' and ')} developments`);
    }

    whyItMattersToYou = `Directly impacts ${reasons.join(', ')}. ${
      article.aiMarketImpact?.length
        ? `Sensitivities detected across ${article.aiMarketImpact.slice(0, 2).map(m => m.market).join(', ')}.`
        : 'Influences capital flows and volatility in your tracked areas.'
    }`;
  } else {
    whyItMattersToYou = `Global macro development in ${article.category}. Retained to prevent filter isolation from major market trends.`;
  }

  return {
    score,
    level,
    matchedFactors: matchedFactors.length > 0 ? matchedFactors : ['Global Context'],
    whyItMattersToYou
  };
}

/**
 * Deterministic calculation of user personal relevance for an economic calendar event
 */
export function calculateEventPersonalRelevance(
  event: EconomicEvent,
  preferences?: Partial<UserPreferences>
): UserRelevanceEvaluation {
  if (!preferences || (!preferences.selectedMarkets?.length && !preferences.selectedCurrencies?.length && !preferences.selectedTopics?.length && !preferences.selectedCountries?.length)) {
    const globalScore = event.importance === 'critical' ? 95 : event.importance === 'high' ? 80 : event.importance === 'medium' ? 55 : 30;
    return {
      score: globalScore,
      level: event.importance,
      matchedFactors: ['Global Economic Calendar'],
      whyItMattersToYou: `Standard macro statistical release for ${event.country}.`
    };
  }

  const selectedMarkets = preferences.selectedMarkets || [];
  const selectedCurrencies = (preferences.selectedCurrencies || []).map(c => c.toUpperCase());
  const selectedCountries = (preferences.selectedCountries || []).map(c => c.toLowerCase());
  const selectedTopics = preferences.selectedTopics || [];

  let score = 20;
  const matchedFactors: string[] = [];

  // Currency Match
  if (selectedCurrencies.includes(event.currency.toUpperCase())) {
    score += 35;
    matchedFactors.push(`Currency (${event.currency})`);
  }

  // Country Match
  if (selectedCountries.some(c => event.country.toLowerCase().includes(c))) {
    score += 20;
    matchedFactors.push(`Country (${event.country})`);
  }

  // Topic & Indicator Match
  const eventNameLower = event.eventName.toLowerCase();
  let matchedTopic: string | null = null;

  if (eventNameLower.includes('cpi') || eventNameLower.includes('pce') || eventNameLower.includes('inflation')) {
    if (selectedTopics.includes('Inflation')) {
      score += 30;
      matchedTopic = 'Inflation';
    }
  } else if (eventNameLower.includes('rate') || eventNameLower.includes('fomc') || eventNameLower.includes('ecb') || eventNameLower.includes('central bank')) {
    if (selectedTopics.includes('Central Banks') || selectedTopics.includes('Interest Rates')) {
      score += 30;
      matchedTopic = 'Central Banks & Rates';
    }
  } else if (eventNameLower.includes('payroll') || eventNameLower.includes('employment') || eventNameLower.includes('job') || eventNameLower.includes('nfp')) {
    if (selectedTopics.includes('Employment')) {
      score += 30;
      matchedTopic = 'Employment';
    }
  } else if (eventNameLower.includes('gdp') || eventNameLower.includes('growth') || eventNameLower.includes('pmi') || eventNameLower.includes('retail sales')) {
    if (selectedTopics.includes('Economic Growth')) {
      score += 25;
      matchedTopic = 'Economic Growth';
    }
  }

  if (matchedTopic) {
    matchedFactors.push(`Topic (${matchedTopic})`);
  }

  // Market correlation
  if (selectedMarkets.includes('Forex') && matchedFactors.some(f => f.includes('Currency'))) {
    score += 10;
  }
  if (selectedMarkets.includes('Bonds') && (eventNameLower.includes('rate') || eventNameLower.includes('cpi') || eventNameLower.includes('treasury'))) {
    score += 10;
  }
  if (selectedMarkets.includes('Commodities') && (eventNameLower.includes('crude') || eventNameLower.includes('oil') || eventNameLower.includes('gold') || event.currency === 'USD')) {
    score += 10;
  }

  // Inherit high baseline if globally critical
  if (event.importance === 'critical') score += 15;

  score = Math.max(10, Math.min(100, Math.round(score)));

  let level: ImportanceLevel = 'low';
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';

  let whyItMattersToYou = '';
  if (matchedFactors.length > 0) {
    whyItMattersToYou = `You monitor ${event.currency} and ${matchedTopic || event.country} economic indicators. High deviation will transmit directly to your tracked assets.`;
  } else {
    whyItMattersToYou = `Global indicator for ${event.country} (${event.currency}). Included to maintain full macro visibility.`;
  }

  return {
    score,
    level,
    matchedFactors: matchedFactors.length > 0 ? matchedFactors : ['Global Indicator'],
    whyItMattersToYou
  };
}

/**
 * Intelligent feed ranking combining Global Importance + Personal Relevance + Freshness + Source Quality
 */
export function calculateIntelligentFeedRank(
  article: NewsArticle,
  preferences?: Partial<UserPreferences>
): number {
  // 1. Global Importance (0 - 100) -> 40% weight
  const globalScore = article.importanceBreakdown?.score ?? (
    article.importance === 'critical' ? 95 : article.importance === 'high' ? 75 : article.importance === 'medium' ? 50 : 25
  );

  // 2. Personal Relevance (0 - 100) -> 35% weight
  const personalEval = calculateArticlePersonalRelevance(article, preferences);
  const personalScore = personalEval.score;

  // 3. Freshness Factor (0 - 100) -> 15% weight
  const pubTime = new Date(article.publishedAt).getTime() || Date.now();
  const hoursOld = Math.max(0, (Date.now() - pubTime) / (1000 * 60 * 60));
  // Decay smoothly: 100 at 0 hrs, 80 at 6 hrs, 50 at 24 hrs, 20 at 48 hrs
  const freshnessScore = Math.max(10, Math.round(100 / (1 + (hoursOld / 12))));

  // 4. Source Quality & Multi-Publisher Verification (0 - 100) -> 10% weight
  let sourceQualityScore = 50;
  if (article.isVerified || (article.clusterCount && article.clusterCount > 1)) {
    sourceQualityScore = Math.min(100, 60 + ((article.clusterCount || 1) * 15));
  } else if (['Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal', 'CNBC'].includes(article.source)) {
    sourceQualityScore = 80;
  }

  // Combined score formula
  const finalRank = (
    (globalScore * 0.40) +
    (personalScore * 0.35) +
    (freshnessScore * 0.15) +
    (sourceQualityScore * 0.10)
  );

  return Math.round(finalRank * 100) / 100;
}

/**
 * Generates personalized daily macro view ("Your View") for the user
 */
export function generatePersonalizedMacroView(
  globalPulse: MacroOverview,
  articles: NewsArticle[],
  events: EconomicEvent[],
  preferences?: Partial<UserPreferences>
): {
  headline: string;
  macroSummary: string;
  keyDrivers: string[];
  matchedInterests: string[];
} {
  const selectedCurrencies = preferences?.selectedCurrencies || ['USD', 'EUR'];
  const selectedMarkets = preferences?.selectedMarkets || ['Forex', 'Equities'];
  const selectedTopics = preferences?.selectedTopics || ['Central Banks', 'Inflation'];

  const matchedInterests = [
    ...selectedMarkets.slice(0, 2),
    ...selectedCurrencies.slice(0, 2),
    ...selectedTopics.slice(0, 2)
  ];

  // Find most relevant articles for user
  const relevantStories = articles
    .map(a => ({ article: a, eval: calculateArticlePersonalRelevance(a, preferences) }))
    .sort((a, b) => b.eval.score - a.eval.score)
    .slice(0, 3);

  // Find most relevant events
  const relevantEvents = events
    .map(e => ({ event: e, eval: calculateEventPersonalRelevance(e, preferences) }))
    .sort((a, b) => b.eval.score - a.eval.score)
    .slice(0, 2);

  const headline = relevantStories[0]
    ? `${relevantStories[0].article.title}`
    : `Macro Intelligence for ${selectedCurrencies.join('/')} & ${selectedMarkets.join(', ')}`;

  const summaryParts: string[] = [];
  summaryParts.push(
    `You are tracking ${selectedCurrencies.join(', ')} across ${selectedMarkets.join(', ')}.`
  );

  if (relevantStories[0]) {
    summaryParts.push(
      `Primary development for your focus: ${relevantStories[0].article.aiSummary || relevantStories[0].article.description}`
    );
  }

  if (relevantEvents[0]) {
    summaryParts.push(
      `High-sensitivity catalyst ahead: ${relevantEvents[0].event.eventName} (${relevantEvents[0].event.country} - ${relevantEvents[0].event.currency}).`
    );
  }

  const keyDrivers: string[] = [];
  relevantStories.forEach(s => {
    if (s.article.aiWhyItMatters) {
      keyDrivers.push(`${s.article.title}: ${s.article.aiWhyItMatters}`);
    }
  });

  if (keyDrivers.length === 0) {
    keyDrivers.push(...globalPulse.keyDrivers.slice(0, 3));
  }

  return {
    headline,
    macroSummary: summaryParts.join(' '),
    keyDrivers: keyDrivers.slice(0, 3),
    matchedInterests
  };
}
