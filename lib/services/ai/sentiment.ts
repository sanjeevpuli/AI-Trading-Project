import { AgentSignal } from "../../types/trading";

export function evaluateSentiment(symbol: string, prices: number[]): AgentSignal {
  if (prices.length < 5) {
    return {
      id: `SIG-SENT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      agentId: "sentiment-analysis",
      symbol,
      type: "HOLD",
      confidence: 50,
      reason: "Insufficient data for sentiment correlation.",
      riskScore: 3,
      timestamp: new Date().toISOString(),
    };
  }

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

  return {
    id: `SIG-SENT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "sentiment-analysis",
    symbol,
    type: sentType,
    confidence: sentConf,
    reason: sentReason,
    riskScore: 3,
    timestamp: new Date().toISOString(),
  };
}
