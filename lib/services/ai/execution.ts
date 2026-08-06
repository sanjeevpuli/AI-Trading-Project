import { ConsolidatedDecision } from "../agentCoordinator";

export interface OrderPreparation {
  symbol: string;
  type: "LONG" | "SHORT";
  orderType: "MARKET";
  amount: number;
  price: number;
  stopLoss: number;
  takeProfit: number;
  reason: string;
}

/**
 * Execution Agent
 * Responsible for order preparation, sizing based on consensus, and calculating SL/TP bounds.
 */
export function evaluateExecution(
  symbol: string,
  currentPrice: number,
  balance: number,
  hasExistingPosition: boolean,
  consensus: ConsolidatedDecision
): OrderPreparation | null {
  // Reject if no action or if we already have an open position for this asset
  if (consensus.action === "HOLD" || hasExistingPosition) {
    return null;
  }

  // Reject if position sizing is zero or negative
  if (consensus.positionSizePercent <= 0) {
    return null;
  }

  // Calculate position sizing
  const targetRiskAllocUsd = (balance * consensus.positionSizePercent) / 100;
  const orderQty = targetRiskAllocUsd / currentPrice;

  // Enforce bounds (e.g., minimum order size, insufficient balance)
  if (orderQty <= 0.0001 || balance < targetRiskAllocUsd) {
    return null;
  }

  const type = consensus.action === "BUY" ? "LONG" : "SHORT";
  
  // Calculate dynamic Stop Loss & Take Profit based on volatility risk
  // For a high risk score, tighten the stop loss.
  const riskFactor = consensus.riskScore / 5; // 0.2 to 1.0
  const slPercent = 0.04 - (0.02 * riskFactor); // 2% to 4% SL
  const tpPercent = 0.08 + (0.04 * (1 - riskFactor)); // 8% to 12% TP

  const stopLoss = type === "LONG" 
    ? currentPrice * (1 - slPercent) 
    : currentPrice * (1 + slPercent);
    
  const takeProfit = type === "LONG"
    ? currentPrice * (1 + tpPercent)
    : currentPrice * (1 - tpPercent);

  return {
    symbol,
    type,
    orderType: "MARKET",
    amount: orderQty,
    price: currentPrice,
    stopLoss,
    takeProfit,
    reason: `Executing ${type} based on Consensus (${consensus.confidence}% conf). Sized at ${consensus.positionSizePercent}% of portfolio.`,
  };
}
