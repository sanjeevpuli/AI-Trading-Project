import { KlineData } from "./binance";
import { Strategy } from "../strategies";

export interface Trade {
  entryTime: number;
  entryPrice: number;
  exitTime: number | null;
  exitPrice: number | null;
  pnl: number;
  pnlPercent: number;
}

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalPnL: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: { time: number; equity: number }[];
  trades: Trade[];
}

export function runBacktest(data: KlineData[], strategy: Strategy, initialCapital: number = 10000): BacktestResult {
  let capital = initialCapital;
  let position: number = 0; // Amount of asset held
  let entryPrice: number = 0;
  let entryTime: number = 0;
  
  const trades: Trade[] = [];
  const equityCurve: { time: number; equity: number }[] = [];
  const dailyReturns: number[] = [];
  
  let peakEquity = initialCapital;
  let maxDrawdown = 0;
  let previousEquity = initialCapital;

  // We need at least enough data points to compute indicators. 
  // We'll feed the data into the strategy progressively.
  const prices: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const candle = data[i];
    prices.push(candle.close);
    
    // Evaluate strategy
    const signal = strategy.evaluate(prices);
    
    // Execute Trades
    if (signal === "BUY" && position === 0) {
      // Go Long (using 100% of capital for simplicity)
      entryPrice = candle.close;
      entryTime = candle.time;
      position = capital / entryPrice;
      capital = 0;
    } else if (signal === "SELL" && position > 0) {
      // Close Long
      const exitPrice = candle.close;
      const exitTime = candle.time;
      capital = position * exitPrice;
      
      const pnl = capital - (position * entryPrice);
      const pnlPercent = (exitPrice - entryPrice) / entryPrice;
      
      trades.push({
        entryTime,
        entryPrice,
        exitTime,
        exitPrice,
        pnl,
        pnlPercent
      });
      
      position = 0;
    }
    
    // Track Equity
    const currentEquity = capital + (position * candle.close);
    equityCurve.push({ time: candle.time, equity: currentEquity });
    
    // Track Max Drawdown
    if (currentEquity > peakEquity) {
      peakEquity = currentEquity;
    }
    const drawdown = (peakEquity - currentEquity) / peakEquity;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
    
    // Track Returns for Sharpe
    const periodReturn = (currentEquity - previousEquity) / previousEquity;
    dailyReturns.push(periodReturn);
    previousEquity = currentEquity;
  }
  
  // Close any open position at the end of the backtest
  if (position > 0) {
    const lastCandle = data[data.length - 1];
    capital = position * lastCandle.close;
    const pnl = capital - (position * entryPrice);
    const pnlPercent = (lastCandle.close - entryPrice) / entryPrice;
    
    trades.push({
      entryTime,
      entryPrice,
      exitTime: lastCandle.time,
      exitPrice: lastCandle.close,
      pnl,
      pnlPercent
    });
    position = 0;
  }

  // Calculate Metrics
  const totalPnL = capital - initialCapital;
  const winningTrades = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  
  // Simplified Sharpe Ratio (Risk-free rate = 0)
  const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualized assuming daily data (approx 365 periods). 
  // If timeframe is different, this is a rough approximation.
  const sharpeRatio = stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(365);

  return {
    initialCapital,
    finalCapital: capital,
    totalPnL,
    winRate,
    totalTrades: trades.length,
    maxDrawdown: maxDrawdown * 100,
    sharpeRatio,
    equityCurve,
    trades
  };
}
