import { EconomicEvent, DeviationImpact } from '../../src/types';

interface IndicatorProfile {
  whatItMeasures: string;
  whyItMatters: string;
  higherThanExpectedImpact: string;
  lowerThanExpectedImpact: string;
  sensitiveMarkets: string[];
  // Higher value means economic acceleration/inflation vs higher value means labor weakness
  higherIsHawkish: boolean;
}

const INDICATOR_PROFILES: Record<string, IndicatorProfile> = {
  'cpi': {
    whatItMeasures: 'Consumer Price Index measures the average change over time in prices paid by urban consumers for a basket of consumer goods and services.',
    whyItMatters: 'Primary gauge of headline consumer inflation monitored by central banks to set target policy rates and maintain price stability.',
    higherThanExpectedImpact: 'Signals persistent price pressures. Generally increases rate-hike/higher-for-longer expectations, pushing Treasury yields up and supporting the currency, while pressuring high-valuation equities.',
    lowerThanExpectedImpact: 'Signals disinflation. Encourages rate-cut expectations, typically softening yields and supporting risk assets like growth stocks.',
    sensitiveMarkets: ['US 10-Year Yield', 'S&P 500', 'EUR/USD', 'USD/JPY', 'Gold'],
    higherIsHawkish: true
  },
  'pce': {
    whatItMeasures: 'Personal Consumption Expenditures Price Index tracks price changes of goods and services purchased by consumers throughout the domestic economy.',
    whyItMatters: 'The Federal Reserve\'s preferred core inflation benchmark due to its comprehensive chained-weighting methodology.',
    higherThanExpectedImpact: 'Reinforces monetary tightening or delayed rate cuts; lifts yields and strengthens USD.',
    lowerThanExpectedImpact: 'Validates inflation trajectory towards 2% target, creating room for accommodative monetary policy.',
    sensitiveMarkets: ['Fed Funds Futures', 'US 2-Year Yield', 'S&P 500', 'US Dollar Index'],
    higherIsHawkish: true
  },
  'nonfarm payrolls': {
    whatItMeasures: 'Total number of paid workers in the US excluding farm employees, government officials, private household staff, and non-profit employees.',
    whyItMatters: 'Top-tier barometer of macroeconomic labor health and domestic hiring momentum.',
    higherThanExpectedImpact: 'Demonstrates robust labor market resilience. Reduces immediate urgency for central bank easing, pushing yields higher.',
    lowerThanExpectedImpact: 'Points to labor market cooling or economic softening, amplifying recession caution and boosting rate-cut bets.',
    sensitiveMarkets: ['S&P 500', 'Nasdaq 100', 'US 10-Year Yield', 'DXY', 'Gold'],
    higherIsHawkish: true
  },
  'unemployment rate': {
    whatItMeasures: 'Percentage of the total civilian labor force that is unemployed and actively seeking employment.',
    whyItMatters: 'Direct mandate indicator for central banks (e.g. Fed maximum employment goal); Sahm Rule trigger indicator.',
    higherThanExpectedImpact: 'Signals labor market slack and potential economic deceleration. Puts downward pressure on bond yields and currency value while increasing rate-cut probabilities.',
    lowerThanExpectedImpact: 'Indicates tight labor conditions and potential wage pressure; hawkish for rates.',
    sensitiveMarkets: ['US Treasuries', 'USD/JPY', 'Russell 2000', 'Equities'],
    higherIsHawkish: false // Higher unemployment = dovish
  },
  'gdp': {
    whatItMeasures: 'Gross Domestic Product measures the annualized monetary value of all finished goods and services produced within a nation.',
    whyItMatters: 'The broad summary benchmark of total national economic growth and output capacity.',
    higherThanExpectedImpact: 'Confirms resilient domestic demand and growth momentum; supportive for cyclical equities and sovereign yields.',
    lowerThanExpectedImpact: 'Raises concerns over growth slowdown, stagflation risks, or recessionary drag.',
    sensitiveMarkets: ['S&P 500', 'Dow Jones', '10Y Yield', 'Industrial Commodities'],
    higherIsHawkish: true
  },
  'retail sales': {
    whatItMeasures: 'Total dollar volume of consumer spending across retail merchandise and food services establishments.',
    whyItMatters: 'Consumer spending represents approximately two-thirds of GDP in major developed economies.',
    higherThanExpectedImpact: 'Demonstrates resilient consumer balance sheets; supportive for corporate earnings but can keep inflation sticky.',
    lowerThanExpectedImpact: 'Points to consumer fatigue and discretionary spending pullback.',
    sensitiveMarkets: ['Consumer Discretionary ETF', 'S&P 500', 'US Dollar'],
    higherIsHawkish: true
  },
  'interest rate': {
    whatItMeasures: 'Central bank benchmark overnight lending target rate.',
    whyItMatters: 'The foundational cost of capital across the entire banking and financial system.',
    higherThanExpectedImpact: 'Immediate contractionary policy shock; surges front-end yields and currency, tightens credit spreads.',
    lowerThanExpectedImpact: 'Immediate liquidity relief and monetary stimulus; lowers cost of capital for businesses and consumers.',
    sensitiveMarkets: ['2-Year Treasury', 'Banking Sector', 'Forex Crosses', 'Real Estate'],
    higherIsHawkish: true
  },
  'fomc': {
    whatItMeasures: 'Federal Open Market Committee monetary policy decision and statement.',
    whyItMatters: 'Determines the baseline interest rate corridor and quantitative tightening run-off pace for the global reserve currency.',
    higherThanExpectedImpact: 'Hawkish stance or upward revised dot-plot projections elevates discount rates across global financial assets.',
    lowerThanExpectedImpact: 'Dovish pivot or easing roadmap lowers hurdle rates and sparks risk-on rallies.',
    sensitiveMarkets: ['Global Equities', 'US Treasuries', 'Forex', 'Gold', 'Crypto'],
    higherIsHawkish: true
  }
};

export function enrichEconomicEventIntelligence(event: EconomicEvent): EconomicEvent {
  const nameLower = event.eventName.toLowerCase();

  // Find matching profile
  let matchedKey = Object.keys(INDICATOR_PROFILES).find(k => nameLower.includes(k));
  const profile = matchedKey ? INDICATOR_PROFILES[matchedKey] : {
    whatItMeasures: `${event.eventName} provides timely statistical data regarding macroeconomic activity and market dynamics in ${event.country}.`,
    whyItMatters: 'Monitored by institutional investors and policymakers to assess underlying cyclical trends and calibrate risk exposure.',
    higherThanExpectedImpact: 'Typically viewed as an upside macroeconomic surprise, influencing asset valuations depending on current monetary policy posture.',
    lowerThanExpectedImpact: 'Typically viewed as a downside macroeconomic surprise, signaling potential economic moderation or demand cooling.',
    sensitiveMarkets: ['Sovereign Bond Yields', `${event.currency} Crosses`, 'Domestic Equities'],
    higherIsHawkish: true
  };

  // Forecast vs Actual Analysis
  let deviation: DeviationImpact = 'pending';
  let deviationNote = '';

  if (event.actual && event.actual !== 'N/A' && event.actual !== '--') {
    const actNum = parseFloat(event.actual.replace(/[^\d.-]/g, ''));
    const fcastNum = event.forecast && event.forecast !== 'N/A' && event.forecast !== '--'
      ? parseFloat(event.forecast.replace(/[^\d.-]/g, ''))
      : NaN;

    if (!isNaN(actNum) && !isNaN(fcastNum)) {
      const diff = actNum - fcastNum;
      const diffFormatted = diff > 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);

      if (Math.abs(diff) < 0.05) {
        deviation = 'in_line';
        deviationNote = `Actual (${event.actual}) matched consensus forecast (${event.forecast}) within statistical margin.`;
      } else if (diff > 0) {
        deviation = profile.higherIsHawkish ? 'better_than_expected' : 'worse_than_expected';
        deviationNote = `Beat consensus by ${diffFormatted}${event.unit || ''} (Actual: ${event.actual} vs Forecast: ${event.forecast}).`;
      } else {
        deviation = profile.higherIsHawkish ? 'worse_than_expected' : 'better_than_expected';
        deviationNote = `Missed consensus by ${diffFormatted}${event.unit || ''} (Actual: ${event.actual} vs Forecast: ${event.forecast}).`;
      }
    } else {
      deviationNote = `Latest released figure: ${event.actual} (Previous: ${event.previous}).`;
    }
  }

  return {
    ...event,
    deviation: event.deviation || deviation,
    deviationNote: event.deviationNote || deviationNote,
    aiExplanation: {
      whatItMeasures: profile.whatItMeasures,
      whyItMatters: profile.whyItMatters,
      higherThanExpectedImpact: profile.higherThanExpectedImpact,
      lowerThanExpectedImpact: profile.lowerThanExpectedImpact,
      sensitiveMarkets: profile.sensitiveMarkets
    }
  };
}
