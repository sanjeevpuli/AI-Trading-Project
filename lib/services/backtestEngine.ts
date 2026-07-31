import type { Trade, Position, Portfolio } from '@/lib/types/trading';
import { coordinateAgentConsensus } from './agentCoordinator';
import { calculateEMA } from '@/lib/indicators';

export interface BacktestResult {
  portfolio: Portfolio;
  trades: Trade[];
  metrics: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

export type StrategyType = "AI_CONSENSUS" | "EMA_CROSSOVER";

/**
 * Simulate a backtest over a series of price candles.
 * 100% in-memory execution. Does not touch live database.
 */
export async function runBacktest(
  symbol: string,
  prices: number[],
  initialCapital: number,
  strategyType: StrategyType
): Promise<BacktestResult> {
  const portfolio: Portfolio = {
    id: 'backtest',
    totalValue: initialCapital,
    cash: initialCapital,
    unrealizedPnL: 0,
    realizedPnL: 0,
    winRate: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    leverage: 1,
    exposure: 0,
    netBeta: 0,
    valueAtRisk: 0,
    equityCurve: [],
  };

  const trades: Trade[] = [];
  let currentPosition: Position | null = null;
  let peakEquity = initialCapital;
  let maxDrawdown = 0;

  // Pre-calculate EMA if needed by EMA strategy
  const ema20 = calculateEMA(prices, 20);
  const ema50 = calculateEMA(prices, 50);

  // We need at least 50 candles for indicators to start working correctly
  for (let i = 50; i < prices.length; i++) {
    const currentPrice = prices[i];
    const historicalSlice = prices.slice(0, i + 1);
    
    // Evaluate Strategy
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";

    if (strategyType === "AI_CONSENSUS") {
      const decision = coordinateAgentConsensus(symbol, historicalSlice, maxDrawdown, currentPosition ? 100 : 0);
      action = decision.action;
    } else if (strategyType === "EMA_CROSSOVER") {
      const currentEma20 = ema20[i];
      const currentEma50 = ema50[i];
      const prevEma20 = ema20[i - 1];
      const prevEma50 = ema50[i - 1];

      if (prevEma20 <= prevEma50 && currentEma20 > currentEma50) {
        action = "BUY"; // Golden cross
      } else if (prevEma20 >= prevEma50 && currentEma20 < currentEma50) {
        action = "SELL"; // Death cross
      }
    }

    // Execution Logic
    if (action === "BUY" && !currentPosition) {
      // Open Long
      const amount = portfolio.cash / currentPrice; // 100% allocation for simple backtest
      portfolio.cash = 0;
      currentPosition = {
        id: `pos-${i}`,
        symbol,
        type: "LONG",
        entryPrice: currentPrice,
        currentPrice: currentPrice,
        amount,
        timestamp: new Date().toISOString(), // Mock timestamp for now
        pnl: 0,
        pnlPercentage: 0
      };
    } else if (action === "SELL" && currentPosition) {
      // Close Long
      const exitValue = currentPosition.amount * currentPrice;
      const pnl = exitValue - (currentPosition.amount * currentPosition.entryPrice);
      portfolio.cash += exitValue;
      
      trades.push({
        id: `trade-${i}`,
        userId: "backtest",
        symbol,
        type: "LONG",
        entryPrice: currentPosition.entryPrice,
        exitPrice: currentPrice,
        amount: currentPosition.amount,
        pnl,
        pnlPercentage: (pnl / (currentPosition.amount * currentPosition.entryPrice)) * 100,
        entryTime: currentPosition.timestamp,
        exitTime: new Date().toISOString(),
        exitReason: "MANUAL",
        fee: 0,
        slippage: 0
      } as Trade);
      
      currentPosition = null;
    }

    // Update equity curve
    let currentEquity = portfolio.cash;
    if (currentPosition) {
      currentEquity += currentPosition.amount * currentPrice;
    }
    
    portfolio.equityCurve.push({ time: i.toString(), value: currentEquity });

    // Update Max Drawdown
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }
    const currentDrawdown = ((peakEquity - currentEquity) / peakEquity) * 100;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }
  }

  // Force close position at end of backtest
  if (currentPosition) {
    const exitValue = currentPosition.amount * prices[prices.length - 1];
    const pnl = exitValue - (currentPosition.amount * currentPosition.entryPrice);
    portfolio.cash += exitValue;
    trades.push({
      id: `trade-end`,
      userId: "backtest",
      symbol,
      type: "LONG",
      entryPrice: currentPosition.entryPrice,
      exitPrice: prices[prices.length - 1],
      amount: currentPosition.amount,
      pnl,
      pnlPercentage: (pnl / (currentPosition.amount * currentPosition.entryPrice)) * 100,
      entryTime: currentPosition.timestamp,
      exitTime: new Date().toISOString(),
      exitReason: "MANUAL",
      fee: 0,
      slippage: 0
    } as Trade);
  }

  portfolio.totalValue = portfolio.cash;
  portfolio.realizedPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  // Metrics Calculation
  const winTrades = trades.filter((t) => t.pnl > 0);
  const lossTrades = trades.filter((t) => t.pnl <= 0);
  
  const grossProfit = winTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.pnl, 0));
  
  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 999 : 0) : grossProfit / grossLoss;
  const winRate = trades.length > 0 ? (winTrades.length / trades.length) * 100 : 0;

  // Simplified Sharpe Ratio calculation (assuming risk-free rate of 0)
  let sharpeRatio = 0;
  if (trades.length > 0) {
    const returns = trades.map(t => t.pnlPercentage);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    sharpeRatio = stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  portfolio.winRate = winRate;
  portfolio.maxDrawdown = maxDrawdown;
  portfolio.sharpeRatio = sharpeRatio;

  return {
    portfolio,
    trades,
    metrics: {
      totalTrades: trades.length,
      winRate,
      profitFactor,
      maxDrawdown,
      sharpeRatio
    }
  };
}
