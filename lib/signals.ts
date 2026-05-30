import { calculateEMA, calculateRSI, calculateMACD } from "./indicators";

export type SignalType = "BUY" | "SELL" | "HOLD";

export interface AISignal {
  symbol: string;
  type: SignalType;
  confidence: number;
  reason: string;
  timestamp: Date;
  indicators: {
    rsi: number;
    macd: number;
    ema20: number;
    ema50: number;
  };
}

/**
 * Analyzes an array of historical closing prices to generate a trading signal.
 */
export function generateSignal(symbol: string, prices: number[]): AISignal {
  if (prices.length < 50) {
    return {
      symbol,
      type: "HOLD",
      confidence: 0,
      reason: "Insufficient data for analysis",
      timestamp: new Date(),
      indicators: { rsi: 0, macd: 0, ema20: 0, ema50: 0 }
    };
  }

  // Calculate indicators
  const rsiArray = calculateRSI(prices, 14);
  const ema20Array = calculateEMA(prices, 20);
  const ema50Array = calculateEMA(prices, 50);
  const { histogram } = calculateMACD(prices, 12, 26, 9);

  // Get latest values
  const lastIdx = prices.length - 1;
  const currentRSI = rsiArray[lastIdx];
  const currentEMA20 = ema20Array[lastIdx];
  const currentEMA50 = ema50Array[lastIdx];
  const currentMACDHist = histogram[lastIdx];
  const prevMACDHist = histogram[lastIdx - 1];

  let type: SignalType = "HOLD";
  let confidence = 50;
  let reason = "Market is ranging. No clear entry/exit conditions met.";

  // Bullish Conditions
  const isOversold = currentRSI < 35;
  const isGoldenCross = currentEMA20 > currentEMA50 && ema20Array[lastIdx - 1] <= ema50Array[lastIdx - 1];
  const isUptrend = currentEMA20 > currentEMA50;
  const isMacdBullish = currentMACDHist > 0 && currentMACDHist > prevMACDHist;

  // Bearish Conditions
  const isOverbought = currentRSI > 65;
  const isDeathCross = currentEMA20 < currentEMA50 && ema20Array[lastIdx - 1] >= ema50Array[lastIdx - 1];
  const isDowntrend = currentEMA20 < currentEMA50;
  const isMacdBearish = currentMACDHist < 0 && currentMACDHist < prevMACDHist;

  // Signal Logic
  if (isGoldenCross || (isOversold && isMacdBullish)) {
    type = "BUY";
    confidence = isGoldenCross && isOversold ? 92 : 78;
    reason = isGoldenCross 
      ? "Golden Cross pattern detected with rising momentum."
      : "Asset is oversold and MACD shows bullish reversal.";
  } else if (isDeathCross || (isOverbought && isMacdBearish)) {
    type = "SELL";
    confidence = isDeathCross && isOverbought ? 95 : 82;
    reason = isDeathCross
      ? "Death Cross pattern detected indicating heavy selling pressure."
      : "Asset is overbought and MACD indicates bearish divergence.";
  } else if (isUptrend && isMacdBullish) {
    type = "BUY";
    confidence = 65;
    reason = "Trend continuation confirmed by MACD histogram.";
  } else if (isDowntrend && isMacdBearish) {
    type = "SELL";
    confidence = 68;
    reason = "Downward trend continuation confirmed by momentum.";
  }

  return {
    symbol,
    type,
    confidence,
    reason,
    timestamp: new Date(),
    indicators: {
      rsi: Number(currentRSI.toFixed(2)),
      macd: Number(currentMACDHist.toFixed(4)),
      ema20: Number(currentEMA20.toFixed(2)),
      ema50: Number(currentEMA50.toFixed(2))
    }
  };
}
