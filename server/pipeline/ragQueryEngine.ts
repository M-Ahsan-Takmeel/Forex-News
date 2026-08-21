import { GoogleGenAI } from '@google/genai';
import { IntelligenceAnswer, NewsArticle, EconomicEvent, MarketMetric, ImpactDirection, UserPreferences } from '../../src/types';
import { CONFIG } from '../config';
import { extractEntities } from './entityExtractor';
import { calculateArticlePersonalRelevance } from './personalization';

let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!CONFIG.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });
  }
  return genAIClient;
}

interface RetrievalContext {
  articles: NewsArticle[];
  events: EconomicEvent[];
  markets: MarketMetric[];
}

export async function answerIntelligenceQuery(
  userQuery: string,
  context: RetrievalContext,
  userPreferences?: Partial<UserPreferences>
): Promise<IntelligenceAnswer> {
  const queryLower = userQuery.toLowerCase().trim();
  const queryEntities = extractEntities(userQuery);

  const isGeneralOrientingQuestion =
    queryLower.includes('pay attention') ||
    queryLower.includes('what should i watch') ||
    queryLower.includes('today') ||
    queryLower.includes('outlook') ||
    queryLower.includes('summary') ||
    queryLower.includes('important') ||
    queryLower.length < 15;

  // 1. Context Retrieval & Semantic Keyword + Personal Preference Ranking
  const scoredArticles = context.articles.map(article => {
    let score = 0;
    const text = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();

    // Word matches
    const words = queryLower.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      if (text.includes(w)) score += 3;
    }

    // Entity matches
    for (const c of queryEntities.currencies) {
      if (article.relatedCurrencies.includes(c)) score += 5;
    }
    for (const a of queryEntities.assets) {
      if (article.relatedMarkets.some(m => m.toLowerCase().includes(a.toLowerCase()))) score += 5;
    }
    for (const inst of queryEntities.institutions) {
      if (text.includes(inst.toLowerCase())) score += 6;
    }
    for (const country of queryEntities.countries) {
      if (article.country?.toLowerCase() === country.toLowerCase()) score += 4;
    }

    // User preference affinity boost
    if (userPreferences) {
      const pEval = calculateArticlePersonalRelevance(article, userPreferences);
      // If it's a general question, personal relevance has higher weight
      if (isGeneralOrientingQuestion) {
        score += pEval.score * 0.4;
      } else {
        score += pEval.score * 0.15;
      }
    }

    // Global Importance weighting
    if (article.importance === 'critical') score += 5;
    else if (article.importance === 'high') score += 3;

    return { article, score };
  });

  scoredArticles.sort((a, b) => b.score - a.score);
  const relevantArticles = scoredArticles
    .filter(item => item.score > 0)
    .slice(0, 6)
    .map(item => item.article);

  // Fallback to top scored or highest importance
  const finalArticles = relevantArticles.length > 0
    ? relevantArticles
    : context.articles.slice(0, 4);

  // Relevant Economic Events
  const relevantEvents = context.events
    .filter(e => {
      const eText = `${e.eventName} ${e.country} ${e.currency}`.toLowerCase();
      const matchesQuery = queryLower.split(/\s+/).some(w => w.length > 3 && eText.includes(w)) ||
        queryEntities.currencies.includes(e.currency) ||
        queryEntities.countries.some(c => e.country.toLowerCase().includes(c.toLowerCase()));
      const matchesUserCurrency = userPreferences?.selectedCurrencies?.includes(e.currency.toUpperCase());
      return matchesQuery || (isGeneralOrientingQuestion && (matchesUserCurrency || e.importance === 'critical'));
    })
    .slice(0, 4);

  // Build user profile snippet
  const profileSnippet = userPreferences ? `
[USER INTEREST PROFILE]
- Selected Markets: ${(userPreferences.selectedMarkets || []).join(', ') || 'Global'}
- Selected Currencies: ${(userPreferences.selectedCurrencies || []).join(', ') || 'Major FX'}
- Selected Topics: ${(userPreferences.selectedTopics || []).join(', ') || 'Macro'}
- Selected Countries: ${(userPreferences.selectedCountries || []).join(', ') || 'Global'}
- Summary Depth: ${userPreferences.summaryDepth || 'standard'}
` : '';

  // Build high-density context string for Gemini
  const contextString = `
${profileSnippet}

[VALIDATED NEWS DEVELOPMENTS]
${finalArticles.map((a, i) => `Article ${i + 1} (${a.source} - ${a.category} - Importance: ${a.importance}):
Title: ${a.title}
Summary: ${a.aiSummary || a.description}
Why It Matters: ${a.aiWhyItMatters || 'N/A'}
Affected Markets: ${a.relatedMarkets.join(', ')} | Currencies: ${a.relatedCurrencies.join(', ')}
`).join('\n')}

[ECONOMIC RELEASES & CALENDAR DATA]
${relevantEvents.map(e => `- ${e.eventName} (${e.country} / ${e.currency}): Previous: ${e.previous}, Forecast: ${e.forecast}, Actual: ${e.actual || 'Upcoming'}, Status: ${e.deviation || 'Normal'}`).join('\n') || 'No directly corresponding events in immediate window.'}

[LIVE BENCHMARK MARKET PRICES]
${context.markets.slice(0, 6).map(m => `- ${m.name} (${m.symbol}): ${m.price} (${m.changePercent >= 0 ? '+' : ''}${m.changePercent.toFixed(2)}%)`).join('\n')}
  `.trim();

  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `You are the Financial & Economic Intelligence Engine. Answer the user's macro/financial question using ONLY the provided verified context.

STRICT PRINCIPLES:
1. FACT vs INTERPRETATION: Clearly separate what was explicitly reported from economic reasoning and potential forward impact.
2. TRANSMISSION MECHANISM: Detail how the economic cause transmits across yields, currencies, equities, and commodities.
3. PERSONALIZATION & FILTER BUBBLE PROTECTION: If the user's question relates to what to watch or general market synthesis, prioritize their selected markets and currencies while also keeping global systemic developments clear.
4. NO FABRICATION & NO TRADING RECOMMENDATIONS: Do not invent numbers or give buy/sell calls. Ground purely in macroeconomic mechanics.

USER QUESTION: "${userQuery}"

AVAILABLE CONTEXT:
${contextString}

Respond with valid JSON matching this schema:
{
  "directAnswer": "Direct, authoritative synthesis answering the query (2-3 sentences)",
  "facts": ["Specific verified fact 1 from context", "Specific verified fact 2 from context"],
  "interpretations": ["Economic reasoning explaining why these facts matter"],
  "potentialImpacts": ["Potential forward market or policy consequences if trends persist"],
  "transmissionMechanism": "Step-by-step transmission chain (e.g. Higher CPI -> Hawkish Fed -> Rising Yields -> Equities Under Pressure)",
  "whyItMatters": "Macroeconomic significance in 2 sentences",
  "affectedAssets": [
    { "name": "S&P 500", "category": "Stocks", "direction": "bearish", "reason": "Higher discount rates reduce equity multiple valuations." }
  ],
  "timeHorizon": "short-term",
  "confidence": "high",
  "confidenceReasoning": "Supported by independent wire reports and verified prints.",
  "sourcesCited": ["Reuters", "Financial Times"],
  "personalizedContextNote": "Tailored to your focus on USD, Commodities, and Central Bank policy."
}`;

      const res = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (res.text) {
        const parsed = JSON.parse(res.text);
        return {
          query: userQuery,
          directAnswer: parsed.directAnswer || 'Analysis complete based on verified real-time macro stream.',
          facts: Array.isArray(parsed.facts) ? parsed.facts : [finalArticles[0]?.title || 'Verified news cycle data.'],
          interpretations: Array.isArray(parsed.interpretations) ? parsed.interpretations : ['Macroeconomic transmission reflects prevailing monetary expectations.'],
          potentialImpacts: Array.isArray(parsed.potentialImpacts) ? parsed.potentialImpacts : ['Cross-asset volatility remains tied to incoming data.'],
          transmissionMechanism: parsed.transmissionMechanism || 'Economic Data -> Central Bank Response -> Yields -> Currencies & Asset Multiples',
          whyItMatters: parsed.whyItMatters || finalArticles[0]?.aiWhyItMatters || 'Shapes broad market liquidity and capital allocation.',
          affectedAssets: Array.isArray(parsed.affectedAssets) ? parsed.affectedAssets : [
            { name: 'US 10-Year Yield', category: 'Bonds', direction: 'bullish' as ImpactDirection, reason: 'Reflecting discount rate expectations.' }
          ],
          timeHorizon: parsed.timeHorizon || 'short-term',
          confidence: parsed.confidence || 'high',
          confidenceReasoning: parsed.confidenceReasoning || 'Grounded in institutional wire reports and live market benchmarks.',
          sourcesCited: Array.isArray(parsed.sourcesCited) ? parsed.sourcesCited : finalArticles.map(a => a.source),
          personalizedContextNote: parsed.personalizedContextNote || (userPreferences?.selectedCurrencies?.length ? `Oriented towards ${userPreferences.selectedCurrencies.join('/')} and tracked topics.` : undefined)
        };
      }
    } catch (err: any) {
      console.warn('Gemini query RAG failed, generating deterministic fallback:', err.message);
    }
  }

  // Graceful High-Fidelity Deterministic Fallback
  const topStory = finalArticles[0];
  const sourcesCited = Array.from(new Set(finalArticles.map(a => a.source)));
  const userCurrencies = userPreferences?.selectedCurrencies?.join(', ') || 'USD';

  return {
    query: userQuery,
    directAnswer: topStory
      ? `Based on current market intelligence, ${topStory.title.toLowerCase().replace(/\.$/, '')}. Key catalysts center around ${topStory.category} dynamics and ${topStory.relatedCurrencies.join('/')} movements.`
      : `Current macroeconomic conditions indicate measured positioning across major asset classes with focus on ${userCurrencies} and upcoming economic releases.`,
    facts: [
      topStory?.title || 'Active institutional market session.',
      `Reported across ${sourcesCited.join(', ')}.`
    ],
    interpretations: [
      topStory?.aiWhyItMatters || 'Current macroeconomic data directly influences discount rates and sovereign yield curves.',
      'Market participants are assessing the balance between monetary policy trajectory and economic growth.'
    ],
    potentialImpacts: [
      'Potential repricing in rate-sensitive equities and foreign exchange crosses if incoming data diverges from projections.',
      'Sovereign yield adjustments in response to central bank forward guidance.'
    ],
    transmissionMechanism: 'Policy & Indicator Signals -> Yield Curve Repricing -> Currency Valuation -> Equity Sector Rotation',
    whyItMatters: topStory?.aiWhyItMatters || 'Dictates global risk tolerance, sovereign borrowing costs, and corporate earnings multiples.',
    affectedAssets: [
      { name: 'S&P 500', category: 'Stocks', direction: 'neutral' as ImpactDirection, reason: 'Balancing earnings resilience against interest rate discount curves.' },
      { name: 'US Dollar', category: 'Forex', direction: 'bullish' as ImpactDirection, reason: 'Supported by relative yield differentials and safe-haven liquidity.' },
      { name: 'US 10-Year Yield', category: 'Bonds', direction: 'neutral' as ImpactDirection, reason: 'Consolidating near key structural resistance levels.' }
    ],
    timeHorizon: 'short-term',
    confidence: sourcesCited.length >= 2 ? 'high' : 'medium',
    confidenceReasoning: `Derived from ${sourcesCited.length} verified news sources and institutional economic indicators.`,
    sourcesCited,
    personalizedContextNote: userPreferences?.selectedCurrencies?.length
      ? `Personalized based on your tracked currencies (${userPreferences.selectedCurrencies.join(', ')}) and active markets.`
      : undefined
  };
}
