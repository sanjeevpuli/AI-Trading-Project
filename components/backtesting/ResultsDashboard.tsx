import { BacktestResult } from "@/lib/backtesting/engine";

export default function ResultsDashboard({ result }: { result: BacktestResult | null }) {
  if (!result) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-12 flex flex-col items-center justify-center text-zinc-500 h-[400px]">
        <span className="text-4xl mb-4">📊</span>
        <p>Configure and run a backtest to view results.</p>
      </div>
    );
  }

  const { totalPnL, winRate, totalTrades, maxDrawdown, sharpeRatio, initialCapital, finalCapital, equityCurve } = result;
  
  const pnlPercent = (totalPnL / initialCapital) * 100;
  const isPositive = totalPnL >= 0;

  // Simple SVG sparkline logic for equity curve
  const minEquity = Math.min(...equityCurve.map(p => p.equity));
  const maxEquity = Math.max(...equityCurve.map(p => p.equity));
  
  // Normalized points for SVG (0 to 100 on Y axis, 0 to 100 on X axis)
  const points = equityCurve.length > 0 
    ? equityCurve.map((point, i) => {
        const x = (i / (equityCurve.length - 1)) * 100;
        // Invert Y so highest value is top (0)
        const y = maxEquity === minEquity ? 50 : 100 - (((point.equity - minEquity) / (maxEquity - minEquity)) * 100);
        return `${x},${y}`;
      }).join(' ')
    : "0,50 100,50";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">Total Net Profit</div>
          <div className={`text-xl font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? '+' : '-'}{Math.abs(pnlPercent).toFixed(2)}%
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">Win Rate</div>
          <div className="text-xl font-bold text-zinc-100">
            {winRate.toFixed(2)}%
          </div>
          <div className="text-xs text-zinc-500">
            {totalTrades} Total Trades
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">Max Drawdown</div>
          <div className="text-xl font-bold text-rose-500">
            -{maxDrawdown.toFixed(2)}%
          </div>
          <div className="text-xs text-zinc-500">Peak to trough</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">Sharpe Ratio</div>
          <div className="text-xl font-bold text-zinc-100">
            {sharpeRatio.toFixed(2)}
          </div>
          <div className="text-xs text-zinc-500">Risk-adjusted return</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <div className="text-zinc-400 text-xs mb-1">Final Capital</div>
          <div className="text-xl font-bold text-zinc-100">
            ${finalCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500">From ${initialCapital.toLocaleString()} initial</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-zinc-100 font-medium mb-4">Equity Curve</h3>
        <div className="h-[300px] w-full relative">
          {equityCurve.length > 0 ? (
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {/* Fill Area */}
              <polygon 
                points={`0,100 ${points} 100,100`} 
                className="fill-blue-500/10"
              />
              {/* Line */}
              <polyline 
                points={points} 
                fill="none" 
                className="stroke-blue-500"
                strokeWidth="0.5" 
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-zinc-500">No trades executed</div>
          )}
        </div>
      </div>
    </div>
  );
}
