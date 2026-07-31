import { useState } from "react";
import { runBacktest, StrategyType, BacktestResult } from "@/lib/services/backtestEngine";
import { fetchHistoricalKlines } from "@/lib/services/binanceService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function BacktestDashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [capital, setCapital] = useState(10000);
  const [strategy, setStrategy] = useState<StrategyType>("AI_CONSENSUS");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const startMs = new Date(startDate).getTime();
      const endMs = new Date(endDate).getTime();
      
      const prices = await fetchHistoricalKlines(symbol, "1h", startMs, endMs, 1000);
      if (prices.length < 50) {
        throw new Error("Not enough data fetched. Try a different date range or symbol.");
      }

      const data = await runBacktest(symbol, prices, capital, strategy);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(String(e));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!result) return;
    const header = "id,symbol,type,entryPrice,exitPrice,amount,pnl,pnlPercentage,entryTime,exitTime,exitReason\n";
    const rows = result.trades.map(t => 
      `${t.id},${t.symbol},${t.type},${t.entryPrice},${t.exitPrice},${t.amount},${t.pnl},${t.pnlPercentage},${t.entryTime},${t.exitTime},${t.exitReason}`
    ).join("\n");
    
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backtest_${symbol}_${strategy}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-zinc-950 rounded-lg shadow-lg text-zinc-100">
      <h2 className="text-2xl font-bold mb-4">Backtesting Engine</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Initial Capital</label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(parseFloat(e.target.value))}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value as StrategyType)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm"
          >
            <option value="AI_CONSENSUS">AI Consensus Strategy</option>
            <option value="EMA_CROSSOVER">EMA Crossover (20/50)</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          onClick={handleRun}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition"
        >
          {loading ? "Running Backtest..." : "Run Backtest"}
        </button>

        {result && (
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-200 border border-zinc-700 transition"
          >
            Export Trades (CSV)
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-bold">Total Trades</p>
                <p className="text-xl font-bold">{result.metrics.totalTrades}</p>
             </div>
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-bold">Win Rate</p>
                <p className="text-xl font-bold">{result.metrics.winRate.toFixed(1)}%</p>
             </div>
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-bold">Profit Factor</p>
                <p className="text-xl font-bold">{result.metrics.profitFactor.toFixed(2)}</p>
             </div>
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-bold">Max Drawdown</p>
                <p className="text-xl font-bold text-red-400">{result.metrics.maxDrawdown.toFixed(2)}%</p>
             </div>
             <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
                <p className="text-zinc-500 text-xs mb-1 uppercase font-bold">Final Equity</p>
                <p className={`text-xl font-bold ${result.portfolio.totalValue >= capital ? "text-emerald-400" : "text-red-400"}`}>
                  ${result.portfolio.totalValue.toFixed(2)}
                </p>
             </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.portfolio.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => `$${value}`}
                    stroke="#a1a1aa"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Equity']}
                    labelFormatter={() => ''}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
