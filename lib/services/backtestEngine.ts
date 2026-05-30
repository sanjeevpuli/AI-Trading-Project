import type { Trade, Position, Portfolio } from '@/lib/types/trading';
import { syncTrade, syncPosition, syncPortfolio } from '@/lib/services/dbSync';

/**
 * Simulate a backtest over a series of price candles.
 * `prices` is an array of { time: string, close: number }.
 * `strategy` is a function that receives the current price index and returns a Trade or null.
 */
export async function runBacktest(
  prices: { time: string; close: number }[],
  initialCapital: number,
  strategy: (index: number, prices: { time: string; close: number }[]) => Trade | null
) {
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

  const positions: Record<string, Position> = {};
  const trades: Trade[] = [];

  for (let i = 0; i < prices.length; i++) {
    const trade = strategy(i, prices);
    if (trade) {
      // Record trade and update cash
      trades.push(trade);
      await syncTrade(trade);
      portfolio.cash -= trade.entryPrice * trade.amount;
      // Open position
      const pos: Position = {
        id: trade.id,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice,
        currentPrice: trade.entryPrice,
        amount: trade.amount,
        timestamp: trade.entryTime,
        pnl: 0,
        pnlPercentage: 0,
      };
      positions[pos.id] = pos;
      await syncPosition(pos);
    }
    // Update positions with latest price
    const latestPrice = prices[i].close;
    Object.values(positions).forEach(async (pos) => {
      pos.currentPrice = latestPrice;
      const pnl = (latestPrice - pos.entryPrice) * (pos.type === 'LONG' ? 1 : -1) * pos.amount;
      pos.pnl = pnl;
      pos.pnlPercentage = (pnl / (pos.entryPrice * pos.amount)) * 100;
      await syncPosition(pos);
    });
    // Update portfolio equity curve
    const equity = portfolio.cash + Object.values(positions).reduce((sum, p) => sum + p.currentPrice * p.amount, 0);
    portfolio.totalValue = equity;
    portfolio.equityCurve.push({ time: prices[i].time, value: equity });
    await syncPortfolio(portfolio);
  }

  // Simple metrics (placeholder)
  const winTrades = trades.filter((t) => t.pnl > 0).length;
  portfolio.realizedPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  portfolio.unrealizedPnL = Object.values(positions).reduce((sum, p) => sum + p.pnl, 0);
  portfolio.winRate = trades.length ? winTrades / trades.length : 0;

  return { portfolio, trades, positions };
}
