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

  // 6. MULTI-AGENT CONSENSUS LOGIC
  // - Technical Agent: Primary Direction
  // - Risk Agent: Veto power
  // - Market/Sentiment Agents: Confidence Modifiers
  // - Portfolio Agent: Sizing Modifier

  let finalAction = techSignal.type;
  let consensusReasoning = `Technical Agent suggests ${techSignal.type} (${techSignal.confidence}%).`;
  
  // Apply Risk Veto
  if (riskSignal.type === "HOLD") {
    finalAction = "HOLD";
    consensusReasoning = `Risk Agent VETOED trade. ${riskSignal.reason}`;
  } else if (finalAction !== "HOLD") {
    // Both Risk and Technical are aligned (or Risk is OK with the direction)
    consensusReasoning += ` Risk Agent approved.`;
  }

  // Calculate Base Confidence from Technical
  let finalConfidence = techSignal.confidence;
  
  if (finalAction !== "HOLD") {
    // Regime Modifier (+/- 15%)
    if (regimeSignal.type === finalAction) {
      finalConfidence += 15;
      consensusReasoning += ` Regime confirms trend.`;
    } else if (regimeSignal.type !== "HOLD") {
      finalConfidence -= 15;
      consensusReasoning += ` Regime diverges.`;
    }

    // Sentiment Modifier (+/- 10%)
    if (sentSignal.type === finalAction) {
      finalConfidence += 10;
      consensusReasoning += ` Sentiment confirms.`;
    } else if (sentSignal.type !== "HOLD") {
      finalConfidence -= 10;
      consensusReasoning += ` Sentiment diverges.`;
    }
  }

  // Bound confidence
  finalConfidence = Math.max(0, Math.min(100, finalConfidence));

  // Determine Position Sizing via Portfolio Agent + Confidence
  const finalRiskScore = Math.max(riskSignal.riskScore, regimeSignal.riskScore);
  let positionSizePercent = 0;

  if (finalAction !== "HOLD") {
    const baseSize = 10.0;
    const confidenceMultiplier = finalConfidence / 100;
    
    // Portfolio Agent influence: if it recommends HOLD, it wants to reduce sizing
    const portfolioMultiplier = allocSignal.type === finalAction ? 1.2 : allocSignal.type === "HOLD" ? 0.8 : 0.5;

    const riskPenalty = (6 - finalRiskScore) / 5; // Higher risk = smaller multiplier
    positionSizePercent = Number((baseSize * confidenceMultiplier * portfolioMultiplier * Math.max(0.2, riskPenalty)).toFixed(1));
  }

  return {
    action: finalAction,
    confidence: Math.round(finalConfidence),
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
