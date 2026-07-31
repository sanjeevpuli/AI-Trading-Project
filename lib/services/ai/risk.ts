import { AgentSignal } from "../../types/trading";

export function evaluateRisk(symbol: string, portfolioDrawdown: number, techType: "BUY" | "SELL" | "HOLD"): AgentSignal {
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

  return {
    id: `SIG-RISK-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    agentId: "risk-management",
    symbol,
    type: riskType,
    confidence: riskConf,
    reason: riskReason,
    riskScore: portfolioDrawdown > 8.0 ? 5 : 1,
    timestamp: new Date().toISOString(),
  };
}
