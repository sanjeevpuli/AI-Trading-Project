import { AgentSignal } from "../../types/trading";

export function evaluateAllocation(symbol: string, portfolioExposure: number, techType: "BUY" | "SELL" | "HOLD"): AgentSignal {
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

  return {
    id: `SIG-ALLOC-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "portfolio-allocation",
    symbol,
    type: allocType,
    confidence: allocConf,
    reason: allocReason,
    riskScore: portfolioExposure > 75.0 ? 4 : 2,
    timestamp: new Date().toISOString(),
  };
}
