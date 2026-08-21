import { EntitiesExtracted } from '../../src/types';

interface EntityDictionary {
  countries: Array<{ name: string; terms: string[] }>;
  currencies: Array<{ name: string; terms: string[] }>;
  assets: Array<{ name: string; terms: string[] }>;
  institutions: Array<{ name: string; terms: string[] }>;
  companies: Array<{ name: string; terms: string[] }>;
}

const ENTITY_DICTIONARY: EntityDictionary = {
  countries: [
    { name: 'United States', terms: ['united states', 'u.s.', 'usa', 'america', 'american', 'washington', 'wall street'] },
    { name: 'China', terms: ['china', 'chinese', 'beijing', 'shanghai'] },
    { name: 'Eurozone', terms: ['eurozone', 'euro area', 'european union', 'eu', 'brussels'] },
    { name: 'Japan', terms: ['japan', 'japanese', 'tokyo'] },
    { name: 'United Kingdom', terms: ['united kingdom', 'uk', 'britain', 'british', 'london', 'england'] },
    { name: 'Germany', terms: ['germany', 'german', 'berlin', 'frankfurt'] },
    { name: 'Canada', terms: ['canada', 'canadian', 'ottawa', 'toronto'] },
    { name: 'Australia', terms: ['australia', 'australian', 'sydney', 'canberra'] },
    { name: 'Switzerland', terms: ['switzerland', 'swiss', 'zurich', 'bern'] },
    { name: 'India', terms: ['india', 'indian', 'mumbai', 'new delhi', 'rbi'] },
    { name: 'Saudi Arabia', terms: ['saudi arabia', 'saudi', 'riyadh', 'aramco'] },
    { name: 'Russia', terms: ['russia', 'russian', 'moscow', 'kremlin'] }
  ],
  currencies: [
    { name: 'USD', terms: ['usd', 'dollar', 'us dollar', 'greenback', 'dxy', 'buck'] },
    { name: 'EUR', terms: ['eur', 'euro', 'single currency'] },
    { name: 'GBP', terms: ['gbp', 'pound', 'sterling', 'cable', 'quid'] },
    { name: 'JPY', terms: ['jpy', 'yen', 'japanese yen'] },
    { name: 'CNY', terms: ['cny', 'yuan', 'renminbi', 'cnh'] },
    { name: 'CAD', terms: ['cad', 'canadian dollar', 'loonie'] },
    { name: 'AUD', terms: ['aud', 'australian dollar', 'aussie'] },
    { name: 'CHF', terms: ['chf', 'swiss franc'] }
  ],
  assets: [
    { name: 'Gold', terms: ['gold', 'xau', 'bullion', 'precious metal'] },
    { name: 'Silver', terms: ['silver', 'xag'] },
    { name: 'Brent Crude', terms: ['brent', 'crude oil', 'oil price', 'petroleum', 'wti'] },
    { name: 'Natural Gas', terms: ['natural gas', 'lng', 'henry hub'] },
    { name: 'Copper', terms: ['copper', 'doctor copper'] },
    { name: 'US 10-Year Treasury', terms: ['10-year', '10y treasury', '10-yr yield', 'treasury yield', 'benchmark yield', 'dgs10'] },
    { name: 'US 2-Year Treasury', terms: ['2-year', '2y treasury', '2-yr yield'] },
    { name: 'S&P 500', terms: ['s&p 500', 's&p', 'spx', 'broad market index'] },
    { name: 'Nasdaq 100', terms: ['nasdaq', 'tech-heavy', 'ndx', 'qqq'] },
    { name: 'Dow Jones', terms: ['dow jones', 'djia', 'blue chip'] },
    { name: 'Bitcoin', terms: ['bitcoin', 'btc'] },
    { name: 'Ethereum', terms: ['ethereum', 'eth'] }
  ],
  institutions: [
    { name: 'Federal Reserve', terms: ['federal reserve', 'fed', 'fomc', 'powell', 'jerome powell', 'board of governors'] },
    { name: 'European Central Bank', terms: ['ecb', 'european central bank', 'lagarde', 'christine lagarde'] },
    { name: 'Bank of Japan', terms: ['bank of japan', 'boj', 'ueda', 'kazuo ueda'] },
    { name: 'Bank of England', terms: ['bank of england', 'boe', 'bailey', 'andrew bailey', 'mpc'] },
    { name: 'People\'s Bank of China', terms: ['pboc', 'people\'s bank of china', 'central bank of china'] },
    { name: 'OPEC+', terms: ['opec', 'opec+', 'oil cartel'] },
    { name: 'International Monetary Fund', terms: ['imf', 'international monetary fund'] },
    { name: 'World Bank', terms: ['world bank'] },
    { name: 'US Treasury Department', terms: ['us treasury', 'treasury department', 'yellen', 'janet yellen'] },
    { name: 'Securities and Exchange Commission', terms: ['sec', 'securities and exchange commission', 'gensler'] }
  ],
  companies: [
    { name: 'NVIDIA', terms: ['nvidia', 'nvda', 'jensen huang'] },
    { name: 'Apple', terms: ['apple', 'aapl', 'tim cook'] },
    { name: 'Microsoft', terms: ['microsoft', 'msft', 'satya nadella'] },
    { name: 'Alphabet / Google', terms: ['alphabet', 'google', 'googl', 'sundar pichai'] },
    { name: 'Amazon', terms: ['amazon', 'amzn', 'andy jassy'] },
    { name: 'Meta', terms: ['meta', 'facebook', 'mark zuckerberg'] },
    { name: 'Tesla', terms: ['tesla', 'tsla', 'elon musk'] },
    { name: 'JPMorgan Chase', terms: ['jpmorgan', 'jpm', 'jamie dimon'] },
    { name: 'Saudi Aramco', terms: ['aramco', 'saudi aramco'] },
    { name: 'TSMC', terms: ['tsmc', 'taiwan semiconductor'] }
  ]
};

export function extractEntities(text: string): EntitiesExtracted {
  const lower = ` ${text.toLowerCase()} `;

  const matchCategory = (items: Array<{ name: string; terms: string[] }>): string[] => {
    const matched: string[] = [];
    for (const item of items) {
      const isMatch = item.terms.some(term => {
        // Match word boundaries or substring depending on term length
        if (term.length <= 3) {
          const regex = new RegExp(`\\b${term}\\b`, 'i');
          return regex.test(lower);
        }
        return lower.includes(term);
      });

      if (isMatch) {
        matched.push(item.name);
      }
    }
    return matched;
  };

  return {
    countries: matchCategory(ENTITY_DICTIONARY.countries),
    currencies: matchCategory(ENTITY_DICTIONARY.currencies),
    assets: matchCategory(ENTITY_DICTIONARY.assets),
    institutions: matchCategory(ENTITY_DICTIONARY.institutions),
    companies: matchCategory(ENTITY_DICTIONARY.companies)
  };
}
