import { Position, Trade } from "../types/trading";
import { calculatePositionPnL } from "../tradingEngine";

const TAKER_FEE_PCT = 0.04; // 0.04% Binance Futures standard perp taker fee rate

/**
 * Computes randomized simulated slippage based on asset type and general volatility.
 * Average slippage ranges from 0.02% to 0.08%.
 */
export function calculateSlippage(price: number): { percentage: number; amount: number } {
  // Generate random percentage between 0.02% and 0.08%
  const percentage = 0.02 + Math.random() * 0.06;
  const amount = (price * percentage) / 100;
  return { percentage, amount };
}

/**
 * Executes a simulated market order, applying slippage and transaction fee rules.
 */
export function executeSimulatedOrder(
  order: { symbol: string; type: "LONG" | "SHORT"; amount: number; price: number; stopLoss?: number; takeProfit?: number },
  cash: number
): {
  success: boolean;
  position?: Position;
  fee: number;
  slippageAmount: number;
  executionPrice: number;
  error?: string;
} {
  const marketPrice = order.price;
  const { percentage: slippagePct, amount: slippageAmount } = calculateSlippage(marketPrice);

  // Apply slippage to entry price
  // BUY (LONG) -> Executed slightly higher
  // SELL (SHORT) -> Executed slightly lower
  const executionPrice =
    order.type === "LONG" ? marketPrice + slippageAmount : marketPrice - slippageAmount;

  const positionSizeUsd = order.amount * executionPrice;
  const fee = (positionSizeUsd * TAKER_FEE_PCT) / 100;

  // Check if balance can cover both the transaction cost AND the fee
  const totalCost = positionSizeUsd + fee;
  if (cash < totalCost) {
    return {
      success: false,
      fee: 0,
      slippageAmount: 0,
      executionPrice: 0,
      error: `Insufficient cash to cover order cost and fee. Required: $${totalCost.toFixed(
        2
      )}, Available: $${cash.toFixed(2)}`,
    };
  }

  const newPosition: Position = {
    id: `POS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    symbol: order.symbol,
    type: order.type,
    entryPrice: executionPrice,
    currentPrice: marketPrice,
    amount: order.amount,
    stopLoss: order.stopLoss,
    takeProfit: order.takeProfit,
    timestamp: new Date().toISOString(),
    pnl: 0,
    pnlPercentage: 0,
  };

  return {
    success: true,
    position: newPosition,
    fee,
    slippageAmount,
    executionPrice,
  };
}

/**
 * Closes an active position manually or via trigger. Applies exit slippage and exit Taker fee.
 */
export function closeSimulatedPosition(
  position: Position,
  exitPrice: number,
  reason: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT"
): {
  closedTrade: Trade;
  cashReturn: number;
  fee: number;
} {
  const { amount, type, entryPrice, timestamp } = position;
  const { amount: exitSlippageAmount } = calculateSlippage(exitPrice);

  // Exit slippage:
  // Exiting LONG -> Executed slightly lower
  // Exiting SHORT -> Executed slightly higher
  const finalExitPrice = type === "LONG" ? exitPrice - exitSlippageAmount : exitPrice + exitSlippageAmount;

  const exitPositionSizeUsd = amount * finalExitPrice;
  const fee = (exitPositionSizeUsd * TAKER_FEE_PCT) / 100;

  // Calculate final MTM PnL based on final exit price (post-slippage)
  const { pnl, pnlPercentage } = calculatePositionPnL(type, entryPrice, finalExitPrice, amount);

  // Cash returned back to margin:
  // Spot cost basis + PnL - exit Taker fee
  const costBasis = entryPrice * amount;
  const cashReturn = costBasis + pnl - fee;

  const closedTrade: Trade = {
    id: `TRD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    symbol: position.symbol,
    type: position.type,
    entryPrice: position.entryPrice,
    exitPrice: finalExitPrice,
    amount: position.amount,
    pnl,
    pnlPercentage,
    entryTime: timestamp,
    exitTime: new Date().toISOString(),
    exitReason: reason,
    fee,
    slippage: exitSlippageAmount,
  };

  return {
    closedTrade,
    cashReturn,
    fee,
  };
}
