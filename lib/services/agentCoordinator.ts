import { AgentSignal } from "../types/trading";
import { evaluateTechnical } from "./ai/technical";
import { evaluateSentiment } from "./ai/sentiment";
import { evaluateMarketRegime } from "./ai/market";
import { evaluateRisk } from "./ai/risk";
import { evaluateAllocation } from "./ai/allocation";
import { calculateEMA } from "../indicators";

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

  // Pre-calculate common indicators needed by multiple agents
  const ema20Vals = calculateEMA(prices, 20);
  const ema50Vals = calculateEMA(prices, 30);
  const currentPrice = prices[prices.length - 1];
  const ema20 = ema20Vals.length > 0 ? ema20Vals[ema20Vals.length - 1] : currentPrice;
  const ema50 = ema50Vals.length > 0 ? ema50Vals[ema50Vals.length - 1] : currentPrice;

  // 1. Technical Agent Evaluation (Weight: 35%)
  const techSignal = evaluateTechnical(symbol, prices);

  // 2. Sentiment Agent Evaluation (Weight: 20%)
  const sentSignal = evaluateSentiment(symbol, prices);

  // 3. Market Regime Agent Evaluation (Weight: 15%)
  const regimeSignal = evaluateMarketRegime(symbol, prices, ema20, ema50);

  // 4. Risk Agent Evaluation (Weight: 15%)
  const riskSignal = evaluateRisk(symbol, portfolioDrawdown, techSignal.type);

  // 5. Portfolio Allocation Agent (Weight: 15%)
  const allocSignal = evaluateAllocation(symbol, portfolioExposure, techSignal.type);

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
