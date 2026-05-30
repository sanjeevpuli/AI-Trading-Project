import { useState } from "react";
import { runBacktest } from "@/lib/services/backtestEngine";

export default function BacktestDashboard() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [capital, setCapital] = useState(10000);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      // Supply mock prices and a dummy strategy to satisfy the expected type signature
      const mockPrices = [{ time: startDate, close: 100 }, { time: endDate, close: 150 }];
      const mockStrategy = () => null;
      const data = await runBacktest(mockPrices, capital, mockStrategy);
      
      setResult({
        totalTrades: data.trades.length,
        winRate: data.portfolio.winRate,
        sharpeRatio: data.portfolio.sharpeRatio,
        maxDrawdown: data.portfolio.maxDrawdown,
        finalEquity: data.portfolio.totalValue
      });
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-zinc-950 rounded-lg shadow-lg text-zinc-100">
      <h2 className="text-2xl font-bold mb-4">Backtesting Engine</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
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
      </div>
      <button
        onClick={handleRun}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
      >
        {loading ? "Running…" : "Run Backtest"}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Results</h3>
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-zinc-700">
                <td className="py-2 font-medium">Total Trades</td>
                <td className="py-2">{result.totalTrades}</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2 font-medium">Win Rate</td>
                <td className="py-2">{(result.winRate * 100).toFixed(2)}%</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2 font-medium">Sharpe Ratio</td>
                <td className="py-2">{result.sharpeRatio.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-zinc-700">
                <td className="py-2 font-medium">Max Drawdown</td>
                <td className="py-2">{(result.maxDrawdown * 100).toFixed(2)}%</td>
              </tr>
              <tr>
                <td className="py-2 font-medium">Final Equity</td>
                <td className="py-2">${result.finalEquity.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
