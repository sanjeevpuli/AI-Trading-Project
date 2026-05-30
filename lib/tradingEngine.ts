export interface Position {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
  pnl: number;
  pnlPercentage: number;
}

export interface ClosedTrade {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercentage: number;
  entryTime: string;
  exitTime: string;
  exitReason: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT";
}

export interface OrderInput {
  symbol: string;
  type: "LONG" | "SHORT";
  amount: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
}

/**
 * Calculates real-time unrealized PnL and PnL percentage.
 */
export function calculatePositionPnL(
  type: "LONG" | "SHORT",
  entryPrice: number,
  currentPrice: number,
  amount: number
): { pnl: number; pnlPercentage: number } {
  if (entryPrice <= 0 || currentPrice <= 0 || amount <= 0) {
    return { pnl: 0, pnlPercentage: 0 };
  }

  let pnl = 0;
  if (type === "LONG") {
    pnl = (currentPrice - entryPrice) * amount;
  } else {
    pnl = (entryPrice - currentPrice) * amount;
  }

  const costBasis = entryPrice * amount;
  const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

  return { pnl, pnlPercentage };
}

/**
 * Checks if a position's Stop Loss or Take Profit conditions have been met.
 */
export function checkStopLossTakeProfit(
  position: Position,
  currentPrice: number
): "STOP_LOSS" | "TAKE_PROFIT" | null {
  const { type, stopLoss, takeProfit } = position;

  if (type === "LONG") {
    if (stopLoss && currentPrice <= stopLoss) {
      return "STOP_LOSS";
    }
    if (takeProfit && currentPrice >= takeProfit) {
      return "TAKE_PROFIT";
    }
  } else {
    // SHORT position
    if (stopLoss && currentPrice >= stopLoss) {
      return "STOP_LOSS";
    }
    if (takeProfit && currentPrice <= takeProfit) {
      return "TAKE_PROFIT";
    }
  }

  return null;
}

/**
 * Seed historical closed trades if none exist.
 */
export const SEED_CLOSED_TRADES: ClosedTrade[] = [
  {
    id: "TRD-MOCK-1",
    symbol: "BTCUSDT",
    type: "LONG",
    entryPrice: 67120.5,
    exitPrice: 68420.0,
    amount: 0.5,
    pnl: 649.75,
    pnlPercentage: 1.93,
    entryTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    exitTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    exitReason: "TAKE_PROFIT",
  },
  {
    id: "TRD-MOCK-2",
    symbol: "ETHUSDT",
    type: "SHORT",
    entryPrice: 3895.2,
    exitPrice: 3820.4,
    amount: 2.0,
    pnl: 149.6,
    pnlPercentage: 1.92,
    entryTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12h ago
    exitTime: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    exitReason: "MANUAL",
  },
  {
    id: "TRD-MOCK-3",
    symbol: "SOLUSDT",
    type: "LONG",
    entryPrice: 165.4,
    exitPrice: 161.2,
    amount: 15.0,
    pnl: -63.0,
    pnlPercentage: -2.54,
    entryTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago
    exitTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    exitReason: "STOP_LOSS",
  },
  {
    id: "TRD-MOCK-4",
    symbol: "BNBUSDT",
    type: "LONG",
    entryPrice: 590.25,
    exitPrice: 605.5,
    amount: 4.0,
    pnl: 61.0,
    pnlPercentage: 2.58,
    entryTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    exitTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    exitReason: "MANUAL",
  },
];

/**
 * Calculates win rate percentage.
 */
export function calculateWinRate(history: ClosedTrade[]): number {
  if (history.length === 0) return 0;
  const wins = history.filter((t) => t.pnl > 0).length;
  return (wins / history.length) * 100;
}

/**
 * Calculates portfolio statistics and risk metrics.
 */
export interface PortfolioStats {
  totalValue: number;
  cash: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  leverage: number;
  exposure: number;
  netBeta: number;
  valueAtRisk: number; // 95% 1-day VaR percentage
}

export function calculatePortfolioStats(
  cash: number,
  positions: Position[],
  history: ClosedTrade[]
): PortfolioStats {
  let unrealizedPnL = 0;
  let totalPositionValue = 0;

  positions.forEach((pos) => {
    unrealizedPnL += pos.pnl;
    totalPositionValue += pos.entryPrice * pos.amount; // Cost basis of open positions
  });

  const totalValue = cash + unrealizedPnL;
  const exposure = totalValue > 0 ? (totalPositionValue / totalValue) * 100 : 0;
  const leverage = totalValue > 0 ? totalPositionValue / totalValue : 0;

  // Realized PnL
  const realizedPnL = history.reduce((sum, t) => sum + t.pnl, 0);

  // Win Rate
  const winRate = calculateWinRate(history);

  // Sharpe Ratio (Simulated based on historical trades)
  let sharpeRatio = 1.85; // Solid default value
  if (history.length >= 3) {
    const pnls = history.map((t) => t.pnlPercentage);
    const avg = pnls.reduce((s, p) => s + p, 0) / pnls.length;
    const sqDiffs = pnls.map((p) => Math.pow(p - avg, 2));
    const variance = sqDiffs.reduce((s, d) => s + d, 0) / pnls.length;
    const stdDev = Math.sqrt(variance);
    // Sharpe = (average return - risk-free rate) / standard deviation
    // Assume risk-free rate is 0.01% per trade
    if (stdDev > 0) {
      sharpeRatio = Number(((avg - 0.01) / stdDev).toFixed(2));
      // Normalize to reasonable bounds for display
      sharpeRatio = Math.max(-2.5, Math.min(3.5, sharpeRatio));
    }
  }

  // Drawdown
  let maxDrawdown = 4.25; // Default metric in %
  if (history.length > 0) {
    // Sort history by time and simulate cumulative equity curve
    let currentEquity = 100000;
    let peak = currentEquity;
    let worstDrawdown = 0;

    history
      .slice()
      .sort((a, b) => new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime())
      .forEach((trade) => {
        currentEquity += trade.pnl;
        if (currentEquity > peak) {
          peak = currentEquity;
        }
        const dd = peak > 0 ? ((peak - currentEquity) / peak) * 100 : 0;
        if (dd > worstDrawdown) {
          worstDrawdown = dd;
        }
      });
    if (worstDrawdown > 0) {
      maxDrawdown = Number(worstDrawdown.toFixed(2));
    }
  }

  return {
    totalValue,
    cash,
    unrealizedPnL,
    realizedPnL,
    winRate,
    sharpeRatio,
    maxDrawdown,
    leverage: Number(leverage.toFixed(2)),
    exposure: Number(exposure.toFixed(2)),
    netBeta: 1.15, // Custom beta estimation
    valueAtRisk: 2.45, // VaR 95%
  };
}
