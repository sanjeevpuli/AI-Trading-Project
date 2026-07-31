import { AgentSignal } from "../../types/trading";

/**
 * Computes volatility percentage based on recent close prices.
 */
export function calculateVolatility(prices: number[]): number {
  if (prices.length < 5) return 1.5;
  const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
  if (avg === 0) return 0;
  const sqDiffs = prices.map((p) => Math.pow(p - avg, 2));
  const variance = sqDiffs.reduce((s, d) => s + d, 0) / prices.length;
  const stdDev = Math.sqrt(variance);
  return (stdDev / avg) * 100; // Returns volatility percentage
}

export function evaluateMarketRegime(symbol: string, prices: number[], ema20: number, ema50: number): AgentSignal {
  if (prices.length < 5) {
    return {
      id: `SIG-REGIME-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      agentId: "market-analysis",
      symbol,
      type: "HOLD",
      confidence: 50,
      reason: "Insufficient data for regime evaluation.",
      riskScore: 2,
      timestamp: new Date().toISOString(),
    };
  }

  const vol = calculateVolatility(prices);
  let regimeType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let regimeConf = 65;
  let regimeReason = "Market is in a standard low-volatility accumulation regime.";

  if (vol > 2.5) {
    regimeType = "HOLD";
    regimeConf = 85;
    regimeReason = `Extreme Volatility detected (${vol.toFixed(2)}%). Advise holding cash margin buffer.`;
  } else if (ema20 > ema50) {
    regimeType = "BUY";
    regimeConf = 70;
    regimeReason = "Confirmed macro Bullish regime - buy trend retracements.";
  } else if (ema20 < ema50) {
    regimeType = "SELL";
    regimeConf = 72;
    regimeReason = "Confirmed macro Bearish regime - sell resistance bounces.";
  }

  return {
    id: `SIG-REGIME-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "market-analysis",
    symbol,
    type: regimeType,
    confidence: regimeConf,
    reason: regimeReason,
    riskScore: vol > 2.5 ? 5 : 2,
    timestamp: new Date().toISOString(),
  };
}
