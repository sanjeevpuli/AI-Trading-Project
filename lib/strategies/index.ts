import { calculateEMA, calculateMACD, calculateRSI } from "../indicators";

export type Signal = "BUY" | "SELL" | "HOLD";

export interface Strategy {
  id: string;
  name: string;
  description: string;
  // Receives an array of historical prices up to the current evaluation point
  evaluate: (prices: number[]) => Signal;
}

export const rsiStrategy: Strategy = {
  id: "rsi_standard",
  name: "RSI Standard (14)",
  description: "Buys when RSI < 30 (oversold) and sells when RSI > 70 (overbought).",
  evaluate: (prices: number[]) => {
    if (prices.length < 15) return "HOLD";
    const rsi = calculateRSI(prices, 14);
    const currentRSI = rsi[rsi.length - 1];
    
    if (currentRSI < 30) return "BUY";
    if (currentRSI > 70) return "SELL";
    return "HOLD";
  }
};

export const emaCrossoverStrategy: Strategy = {
  id: "ema_crossover",
  name: "EMA Crossover (20/50)",
  description: "Buys on Golden Cross (EMA20 > EMA50), sells on Death Cross (EMA20 < EMA50).",
  evaluate: (prices: number[]) => {
    if (prices.length < 51) return "HOLD";
    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);
    
    const curr20 = ema20[ema20.length - 1];
    const prev20 = ema20[ema20.length - 2];
    const curr50 = ema50[ema50.length - 1];
    const prev50 = ema50[ema50.length - 2];
    
    // Golden Cross
    if (curr20 > curr50 && prev20 <= prev50) return "BUY";
    // Death Cross
    if (curr20 < curr50 && prev20 >= prev50) return "SELL";
    
    return "HOLD";
  }
};

export const macdStrategy: Strategy = {
  id: "macd_standard",
  name: "MACD Trend",
  description: "Buys when MACD histogram flips positive, sells when it flips negative.",
  evaluate: (prices: number[]) => {
    if (prices.length < 35) return "HOLD";
    const { histogram } = calculateMACD(prices, 12, 26, 9);
    
    const currHist = histogram[histogram.length - 1];
    const prevHist = histogram[histogram.length - 2];
    
    if (currHist > 0 && prevHist <= 0) return "BUY";
    if (currHist < 0 && prevHist >= 0) return "SELL";
    
    return "HOLD";
  }
};

export const AVAILABLE_STRATEGIES: Record<string, Strategy> = {
  rsi_standard: rsiStrategy,
  ema_crossover: emaCrossoverStrategy,
  macd_standard: macdStrategy,
};
