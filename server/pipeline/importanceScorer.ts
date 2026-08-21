import { ImportanceLevel, ImportanceBreakdown } from '../../src/types';
import { EntitiesExtracted } from '../../src/types';

interface ImportanceInput {
  title: string;
  description: string;
  category: string;
  entities: EntitiesExtracted;
  independentSourcesCount: number;
  avgCredibilityScore: number;
  publishedAt: string;
}

export function calculateImportance(input: ImportanceInput): ImportanceBreakdown {
  const fullText = `${input.title} ${input.description}`.toLowerCase();

  // 1. Central Bank Relevance (0 - 25)
  let centralBankScore = 0;
  if (
    input.category === 'Central Banks' ||
    input.entities.institutions.some(i => ['Federal Reserve', 'European Central Bank', 'Bank of Japan', 'Bank of England', "People's Bank of China"].includes(i)) ||
    fullText.includes('rate cut') ||
    fullText.includes('rate hike') ||
    fullText.includes('fomc') ||
    fullText.includes('powell') ||
    fullText.includes('lagarde') ||
    fullText.includes('monetary policy')
  ) {
    centralBankScore = 20;
    if (fullText.includes('emergency') || fullText.includes('surprise') || fullText.includes('decision') || fullText.includes('hike') || fullText.includes('cut')) {
      centralBankScore = 25;
    }
  } else if (fullText.includes('interest rate') || fullText.includes('yield curve')) {
    centralBankScore = 12;
  }

  // 2. Economic Significance (0 - 25)
  let economicScore = 0;
  if (
    fullText.includes('cpi') ||
    fullText.includes('inflation') ||
    fullText.includes('gdp') ||
    fullText.includes('nonfarm') ||
    fullText.includes('payrolls') ||
    fullText.includes('unemployment rate') ||
    fullText.includes('pce') ||
    fullText.includes('tariff') ||
    fullText.includes('trade war') ||
    fullText.includes('recession')
  ) {
    economicScore = 22;
    if (fullText.includes('record high') || fullText.includes('unexpected') || fullText.includes('surges') || fullText.includes('plunges')) {
      economicScore = 25;
    }
  } else if (fullText.includes('retail sales') || fullText.includes('pmi') || fullText.includes('housing') || fullText.includes('trade deficit')) {
    economicScore = 14;
  } else if (input.category === 'Economy') {
    economicScore = 10;
  }

  // 3. Source Diversity & Credibility (0 - 20)
  let sourceScore = 0;
  if (input.independentSourcesCount >= 4) {
    sourceScore = 20;
  } else if (input.independentSourcesCount === 3) {
    sourceScore = 16;
  } else if (input.independentSourcesCount === 2) {
    sourceScore = 12;
  } else {
    sourceScore = 6;
  }
  // Add credibility weighting
  sourceScore = Math.min(20, Math.round(sourceScore * (input.avgCredibilityScore / 80)));

  // 4. Market Sensitivity & Geographic Scope (0 - 20)
  let marketSensitivityScore = 0;
  const broadAssetCount = input.entities.assets.length + input.entities.currencies.length;
  if (broadAssetCount >= 3 || input.entities.countries.includes('United States') || input.entities.countries.includes('China') || input.entities.countries.includes('Eurozone')) {
    marketSensitivityScore = 16;
  } else if (broadAssetCount >= 1) {
    marketSensitivityScore = 10;
  } else {
    marketSensitivityScore = 5;
  }

  if (fullText.includes('bond yield') || fullText.includes('dollar') || fullText.includes('crude') || fullText.includes('s&p 500')) {
    marketSensitivityScore = Math.min(20, marketSensitivityScore + 4);
  }

  // 5. Breaking Urgency & Tone (0 - 10)
  let breakingScore = 0;
  const isBreakingWord = fullText.includes('breaking') || fullText.includes('just in') || fullText.includes('alert') || fullText.includes('urgent') || fullText.includes('surges') || fullText.includes('tumbles');
  if (isBreakingWord) {
    breakingScore = 10;
  } else {
    breakingScore = 5;
  }

  const totalScore = centralBankScore + economicScore + sourceScore + marketSensitivityScore + breakingScore;

  let level: ImportanceLevel = 'low';
  let reasoning = '';

  if (totalScore >= 75) {
    level = 'critical';
    reasoning = `High systemic weight: strong central bank / macro indicator overlap (${economicScore + centralBankScore} pts) reinforced by ${input.independentSourcesCount} independent sources.`;
  } else if (totalScore >= 50) {
    level = 'high';
    reasoning = `Significant cross-asset influence across ${input.entities.assets.join(', ') || 'broad markets'} with validated institutional reporting.`;
  } else if (totalScore >= 28) {
    level = 'medium';
    reasoning = `Standard macroeconomic/industry release with moderate financial transmission sensitivity.`;
  } else {
    level = 'low';
    reasoning = `Localized corporate or routine business coverage with low systemic cross-asset spillover.`;
  }

  return {
    score: totalScore,
    level,
    factors: {
      centralBankRelevance: centralBankScore,
      economicSignificance: economicScore,
      sourceDiversity: sourceScore,
      marketSensitivity: marketSensitivityScore,
      breakingUrgency: breakingScore
    },
    reasoning
  };
}
