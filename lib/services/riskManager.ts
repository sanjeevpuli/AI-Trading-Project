import { Position } from "../types/trading";

const MAX_LEVERAGE = 3.0; // Max allowed leverage 3x
const MAX_SINGLE_EXPOSURE_PCT = 50; // Max 50% single perp contract concentration
const MAX_TOTAL_EXPOSURE_PCT = 85; // Max 85% total perp contract allocation
const MAINTENANCE_MARGIN_PCT = 10; // Maintenance margin is 10% of total position size

/**
 * Validates if an order complies with the strict risk limits of the platform.
 */
export function validateOrderExecution(
  order: { symbol: string; type: "LONG" | "SHORT"; amount: number; price: number },
  cash: number,
  positions: Position[]
): { allowed: boolean; error?: string } {
  const orderValue = order.amount * order.price;
  
  // Calculate current portfolio stats
  let currentUnrealizedPnL = 0;
  let currentTotalPositionValue = 0;
  let singleAssetPositionValue = 0;

  positions.forEach((pos) => {
    currentUnrealizedPnL += pos.pnl;
    const posValue = pos.entryPrice * pos.amount;
    currentTotalPositionValue += posValue;
    if (pos.symbol === order.symbol) {
      singleAssetPositionValue += posValue;
    }
  });

  const currentEquity = cash + currentUnrealizedPnL;
  const newTotalPositionValue = currentTotalPositionValue + orderValue;
  const newSingleAssetPositionValue = singleAssetPositionValue + orderValue;

  if (currentEquity <= 0) {
    return { allowed: false, error: "Portfolio equity is depleted. Cannot open new positions." };
  }

  // 1. Check Max Leverage Limit
  const estimatedLeverage = newTotalPositionValue / currentEquity;
  if (estimatedLeverage > MAX_LEVERAGE) {
    return {
      allowed: false,
      error: `Order violates maximum Leverage limit of ${MAX_LEVERAGE}x. Estimated Leverage: ${estimatedLeverage.toFixed(2)}x.`,
    };
  }

  // 2. Check Single Perp Exposure limit
  const singleExposurePct = (newSingleAssetPositionValue / currentEquity) * 100;
  if (singleExposurePct > MAX_SINGLE_EXPOSURE_PCT) {
    return {
      allowed: false,
      error: `Order violates Single Position Concentration cap of ${MAX_SINGLE_EXPOSURE_PCT}%. Estimated Exposure for ${order.symbol.replace(
        "USDT",
        ""
      )}: ${singleExposurePct.toFixed(1)}%.`,
    };
  }

  // 3. Check Total Exposure safety limit
  const totalExposurePct = (newTotalPositionValue / currentEquity) * 100;
  if (totalExposurePct > MAX_TOTAL_EXPOSURE_PCT) {
    return {
      allowed: false,
      error: `Order violates Max Portfolio Capital Allocation limit of ${MAX_TOTAL_EXPOSURE_PCT}%. Estimated Total Exposure: ${totalExposurePct.toFixed(
        1
      )}%.`,
    };
  }

  return { allowed: true };
}

/**
 * Checks if the portfolio has hit a margin call / liquidation threshold.
 * Returns true if maintenance margin requirement is breached by unrealized losses.
 */
export function checkMarginLiquidation(
  cash: number,
  positions: Position[]
): { liquidateAll: boolean; message?: string } {
  if (positions.length === 0) return { liquidateAll: false };

  let unrealizedPnL = 0;
  let totalPositionValue = 0;

  positions.forEach((pos) => {
    unrealizedPnL += pos.pnl;
    totalPositionValue += pos.currentPrice * pos.amount; // Mark-to-market total position size
  });

  const totalEquity = cash + unrealizedPnL;
  const maintenanceMarginRequired = (totalPositionValue * MAINTENANCE_MARGIN_PCT) / 100;

  // Liquidation triggers if equity falls below the maintenance margin threshold
  if (totalEquity < maintenanceMarginRequired) {
    return {
      liquidateAll: true,
      message: `🚨 MARGIN LIQUIDATION TRIGGERED: Portfolio Equity ($${totalEquity.toFixed(
        2
      )}) fell below Maintenance Margin requirement ($${maintenanceMarginRequired.toFixed(
        2
      )}) which is ${MAINTENANCE_MARGIN_PCT}% of total Perp open positions size.`,
    };
  }

  return { liquidateAll: false };
}
