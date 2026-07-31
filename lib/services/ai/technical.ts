import { AgentSignal } from "../../types/trading";
import { calculateEMA, calculateRSI, calculateMACD } from "../../indicators";

export function evaluateTechnical(symbol: string, prices: number[]): AgentSignal {
  if (prices.length < 35) {
    return {
      id: `SIG-TECH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      agentId: "technical-analysis",
      symbol,
      type: "HOLD",
      confidence: 50,
      reason: "Insufficient data for technical analysis.",
      riskScore: 3,
      timestamp: new Date().toISOString(),
    };
  }

  const currentPrice = prices[prices.length - 1];
  const rsiVals = calculateRSI(prices, 14);
  const ema20Vals = calculateEMA(prices, 20);
  const ema50Vals = calculateEMA(prices, 30); // Use 30 for safety on smaller price vectors
  const macdData = calculateMACD(prices, 12, 26, 9);

  const rsi = rsiVals.length > 0 ? rsiVals[rsiVals.length - 1] : 50;
  const ema20 = ema20Vals.length > 0 ? ema20Vals[ema20Vals.length - 1] : currentPrice;
  const ema50 = ema50Vals.length > 0 ? ema50Vals[ema50Vals.length - 1] : currentPrice;
  const hist = macdData.histogram.length > 0 ? macdData.histogram[macdData.histogram.length - 1] : 0;

  let techType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let techConf = 50;
  let techReason = "MACD histogram and RSI indicator values represent ranging market conditions.";

  if (rsi < 35) {
    techType = "BUY";
    techConf = rsi < 25 ? 90 : 78;
    techReason = `Asset is oversold (RSI: ${rsi.toFixed(1)}). Reversal expected.`;
  } else if (rsi > 65) {
    techType = "SELL";
    techConf = rsi > 75 ? 92 : 80;
    techReason = `Asset is overbought (RSI: ${rsi.toFixed(1)}). Mean reversion expected.`;
  } else if (ema20 > ema50 && hist > 0) {
    techType = "BUY";
    techConf = 68;
    techReason = `Bullish trend confirmed by EMA crossover (20 > 50) and rising MACD momentum.`;
  } else if (ema20 < ema50 && hist < 0) {
    techType = "SELL";
    techConf = 70;
    techReason = `Bearish trend confirmed by EMA crossover (20 < 50) and downward MACD momentum.`;
  }

  return {
    id: `SIG-TECH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "technical-analysis",
    symbol,
    type: techType,
    confidence: techConf,
    reason: techReason,
    riskScore: rsi < 25 || rsi > 75 ? 4 : 2,
    timestamp: new Date().toISOString(),
  };
}
