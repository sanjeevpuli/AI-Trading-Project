import { Trade, Position, PortfolioStats, PortfolioMetrics } from "../types/trading";

/**
 * Calculates win rate percentage.
 */
export function calculateWinRate(history: Trade[]): number {
  if (history.length === 0) return 0;
  const wins = history.filter((t) => t.pnl > 0).length;
  return (wins / history.length) * 100;
}

/**
 * Calculates complete portfolio metrics and returns PortfolioStats conforming to strict interface.
 */
export function calculatePortfolioStats(
  cash: number,
  positions: Position[],
  history: Trade[],
  metricsHistory: PortfolioMetrics[] = []
): PortfolioStats {
  let unrealizedPnL = 0;
  let totalPositionValue = 0;

  positions.forEach((pos) => {
    unrealizedPnL += pos.pnl;
    totalPositionValue += pos.entryPrice * pos.amount;
  });

  const totalValue = cash + totalPositionValue + unrealizedPnL;
  const exposure = totalValue > 0 ? (totalPositionValue / totalValue) * 100 : 0;
  const leverage = totalValue > 0 ? totalPositionValue / totalValue : 0;

  // Realized PnL
  const realizedPnL = history.reduce((sum, t) => sum + t.pnl, 0);

  // Win Rate
  const winRate = calculateWinRate(history);

  // Sharpe Ratio calculations
  let sharpeRatio = 0.0;
  if (history.length >= 3) {
    const pnls = history.map((t) => t.pnlPercentage);
    const avg = pnls.reduce((s, p) => s + p, 0) / pnls.length;
    const sqDiffs = pnls.map((p) => Math.pow(p - avg, 2));
    const variance = sqDiffs.reduce((s, d) => s + d, 0) / pnls.length;
    const stdDev = Math.sqrt(variance);
    // Sharpe = (avg return - risk free rate) / standard deviation
    if (stdDev > 0) {
      sharpeRatio = Number(((avg - 0.01) / stdDev).toFixed(2));
      sharpeRatio = Math.max(-2.0, Math.min(3.5, sharpeRatio));
    }
  } else if (metricsHistory.length >= 2) {
      // Calculate sharpe from metrics
      const dailyReturns = [];
      for (let i = 1; i < metricsHistory.length; i++) {
        const prev = metricsHistory[i - 1].totalValue;
        const curr = metricsHistory[i].totalValue;
        if (prev > 0) dailyReturns.push((curr - prev) / prev);
      }
      if (dailyReturns.length >= 2) {
        const avg = dailyReturns.reduce((s, r) => s + r, 0) / dailyReturns.length;
        const variance = dailyReturns.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / dailyReturns.length;
        const stdDev = Math.sqrt(variance);
        if (stdDev > 0) sharpeRatio = Number(((avg - 0.0001) / stdDev).toFixed(2));
      }
  }

  // Drawdown
  let maxDrawdown = 0.0;
  if (metricsHistory.length > 0) {
      let peak = metricsHistory[0].totalValue;
      let worstDrawdown = 0;
      metricsHistory.forEach((m) => {
          if (m.totalValue > peak) peak = m.totalValue;
          const dd = peak > 0 ? ((peak - m.totalValue) / peak) * 100 : 0;
          if (dd > worstDrawdown) worstDrawdown = dd;
      });
      // Also check current against peak
      if (totalValue > peak) peak = totalValue;
      const currentDd = peak > 0 ? ((peak - totalValue) / peak) * 100 : 0;
      if (currentDd > worstDrawdown) worstDrawdown = currentDd;
      
      maxDrawdown = Number(worstDrawdown.toFixed(2));
  } else if (history.length > 0) {
    let currentEquity = cash; // approximation
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

  // Compile Dynamic Equity Curve
  const equityCurve: { time: string; value: number }[] = [];
  
  if (metricsHistory.length > 0) {
      metricsHistory.forEach(m => {
          equityCurve.push({
              time: new Date(m.timestamp).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
              }),
              value: Math.round(m.totalValue)
          });
      });
  }

  // Add the current live portfolio value to the end of the curve
  equityCurve.push({
      time: new Date().toLocaleDateString([], {
          month: "short",
          day: "numeric",
      }),
      value: Math.round(totalValue)
  });

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
    netBeta: 1.0, // Should be calculated vs SPY eventually
    valueAtRisk: maxDrawdown * 0.5, // Simple approximation
    equityCurve,
  };
}
