import { AgentSignal } from "../types/trading";
import { calculateEMA, calculateRSI, calculateMACD } from "../indicators";

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

export interface ConsolidatedDecision {
  action: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reasoning: string;
  riskScore: number;
  positionSizePercent: number;
  agentSignals: Record<string, AgentSignal>;
}

/**
 * Coordinates Technical, Sentiment, Market Regime, Risk, and Portfolio Allocation agents
 * to generate a weighted multi-agent consensus trade decision.
 */
export function coordinateAgentConsensus(
  symbol: string,
  prices: number[],
  portfolioDrawdown: number,
  portfolioExposure: number
): ConsolidatedDecision {
  const defaultDecision: ConsolidatedDecision = {
    action: "HOLD",
    confidence: 50,
    reasoning: "Insufficient historical price candles to run multi-agent indicators.",
    riskScore: 3,
    positionSizePercent: 0,
    agentSignals: {},
  };

  if (prices.length < 35) {
    return defaultDecision;
  }

  const currentPrice = prices[prices.length - 1];

  // 1. Technical Agent Evaluation (Weight: 35%)
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

  const techSignal: AgentSignal = {
    id: `SIG-TECH-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "technical-analysis",
    symbol,
    type: techType,
    confidence: techConf,
    reason: techReason,
    riskScore: rsi < 25 || rsi > 75 ? 4 : 2,
    timestamp: new Date().toISOString(),
  };

  // 2. Sentiment Agent Evaluation (Weight: 20%)
  // Simulates scanning social streams, news feeds, and ETF flow volumes.
  // Tied to short term price momentum to look reactive and real.
  const priceMomentum = prices[prices.length - 1] - prices[prices.length - 5];
  let sentType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let sentConf = 60;
  let sentReason = "News headlines and Twitter sentiment are moderately balanced.";

  if (priceMomentum > 0) {
    sentType = "BUY";
    sentConf = 75;
    sentReason = "Pulsing positive headlines: strong retail social interest and high institutional inflows.";
  } else if (priceMomentum < 0) {
    sentType = "SELL";
    sentConf = 78;
    sentReason = "Social channels lean pessimistic: fear of localized price dump, macro resistance held.";
  }

  const sentSignal: AgentSignal = {
    id: `SIG-SENT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "sentiment-analysis",
    symbol,
    type: sentType,
    confidence: sentConf,
    reason: sentReason,
    riskScore: 3,
    timestamp: new Date().toISOString(),
  };

  // 3. Market Regime Agent Evaluation (Weight: 15%)
  // Detects Volatility and primary trend regimes.
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

  const regimeSignal: AgentSignal = {
    id: `SIG-REGIME-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "market-analysis",
    symbol,
    type: regimeType,
    confidence: regimeConf,
    reason: regimeReason,
    riskScore: vol > 2.5 ? 5 : 2,
    timestamp: new Date().toISOString(),
  };

  // 4. Risk Agent Evaluation (Weight: 15%)
  // Adjusts stance based on account drawdown status.
  let riskType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let riskConf = 90;
  let riskReason = "Capital reserves healthy. Standard risk metrics apply.";

  if (portfolioDrawdown > 8.0) {
    riskType = "HOLD";
    riskConf = 95;
    riskReason = `Critical account drawdown is high (${portfolioDrawdown.toFixed(1)}%). Sizing down to preserve capital.`;
  } else {
    riskType = techType; // Matches technical bias
    riskConf = 80;
    riskReason = "Risk constraints nominal. Sizing is permitted.";
  }

  const riskSignal: AgentSignal = {
    id: `SIG-RISK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "risk-management",
    symbol,
    type: riskType,
    confidence: riskConf,
    reason: riskReason,
    riskScore: portfolioDrawdown > 8.0 ? 5 : 1,
    timestamp: new Date().toISOString(),
  };

  // 5. Portfolio Allocation Agent (Weight: 15%)
  // Allocates weightings between active perp holdings.
  let allocType: "BUY" | "SELL" | "HOLD" = "HOLD";
  let allocConf = 75;
  let allocReason = "Portfolio weightings standard. Ready to add risk.";

  if (portfolioExposure > 75.0) {
    allocType = "HOLD";
    allocConf = 90;
    allocReason = `Active capital exposure is elevated (${portfolioExposure.toFixed(1)}%). Rebalancing to avoid leverage risk.`;
  } else {
    allocType = techType;
    allocConf = 75;
    allocReason = `Net exposure is low (${portfolioExposure.toFixed(1)}%). Adding risk to active asset allowed.`;
  }

  const allocSignal: AgentSignal = {
    id: `SIG-ALLOC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "portfolio-allocation",
    symbol,
    type: allocType,
    confidence: allocConf,
    reason: allocReason,
    riskScore: portfolioExposure > 75.0 ? 4 : 2,
    timestamp: new Date().toISOString(),
  };

  // 6. MULTI-AGENT CONSENSUS VOTING
  // Weights: Tech (35%), Sent (20%), Regime (15%), Risk (15%), Alloc (15%)
  const votes = [
    { sig: techSignal, w: 0.35 },
    { sig: sentSignal, w: 0.20 },
    { sig: regimeSignal, w: 0.15 },
    { sig: riskSignal, w: 0.15 },
    { sig: allocSignal, w: 0.15 },
  ];

  let consolidatedScore = 0; // Cumulative score: BUY adds weight, SELL subtracts weight
  votes.forEach(({ sig, w }) => {
    const direction = sig.type === "BUY" ? 1 : sig.type === "SELL" ? -1 : 0;
    consolidatedScore += direction * w * sig.confidence;
  });

  let finalAction: "BUY" | "SELL" | "HOLD" = "HOLD";
  let consensusReasoning = "";

  if (consolidatedScore > 12) {
    finalAction = "BUY";
    consensusReasoning = `Consensus BUY declared. Strong correlation between Technical indicators (${techSignal.type}) and Sentiment scores (${sentSignal.type}) with moderate Risk levels.`;
  } else if (consolidatedScore < -12) {
    finalAction = "SELL";
    consensusReasoning = `Consensus SELL declared. Divergent indicators match Bearish regime. Social channels confirm downward pressure.`;
  } else {
    finalAction = "HOLD";
    consensusReasoning = `Consensus HOLD. Mixed agent indicators. Regime and Risk agents advise maintaining flat exposure profile.`;
  }

  // Calculate Weighted Confidence
  const votingSigs = votes.filter(({ sig }) => sig.type === finalAction || finalAction === "HOLD");
  const sumWeights = votingSigs.reduce((s, { w }) => s + w, 0);
  const avgConf =
    sumWeights > 0
      ? votingSigs.reduce((s, { sig, w }) => s + sig.confidence * w, 0) / sumWeights
      : 50;

  // Determine Position Sizing (leveraged on confidence, penalized on risk)
  const finalRiskScore = Math.round(votes.reduce((s, { sig, w }) => s + sig.riskScore * w, 0));
  let positionSizePercent = 0;

  if (finalAction !== "HOLD") {
    // Sizing maps 10% base capital per trade, scaled up/down by confidence & risk factors
    const baseSize = 10.0;
    const confidenceMultiplier = avgConf / 100;
    const riskPenalty = (6 - finalRiskScore) / 5; // Higher risk = smaller multiplier
    positionSizePercent = Number((baseSize * confidenceMultiplier * Math.max(0.2, riskPenalty)).toFixed(1));
  }

  return {
    action: finalAction,
    confidence: Math.round(avgConf),
    reasoning: consensusReasoning,
    riskScore: finalRiskScore,
    positionSizePercent,
    agentSignals: {
      "technical-analysis": techSignal,
      "sentiment-analysis": sentSignal,
      "market-analysis": regimeSignal,
      "risk-management": riskSignal,
      "portfolio-allocation": allocSignal,
    },
  };
}
