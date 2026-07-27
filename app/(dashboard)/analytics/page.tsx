"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import PerformanceHistoryChart from "@/components/portfolio/PerformanceHistoryChart";
import AllocationChart from "@/components/portfolio/AllocationChart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage() {
  const getStats = useTradingStore((s) => s.getStats);
  const history = useTradingStore((s) => s.history);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  const stats = getStats();

  const wins = history.filter((t) => t.pnl > 0);
  const losses = history.filter((t) => t.pnl < 0);
  const avgWin = wins.length > 0 ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, t) => a + t.pnl, 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  const summaryCards = [
    { label: "Portfolio Value", value: `$${stats.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "text-zinc-100" },
    { label: "Total P&L", value: `${stats.realizedPnL >= 0 ? "+" : ""}$${stats.realizedPnL.toFixed(2)}`, color: stats.realizedPnL >= 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Win Rate", value: `${stats.winRate.toFixed(1)}%`, color: stats.winRate >= 50 ? "text-emerald-400" : "text-amber-400" },
    { label: "Sharpe Ratio", value: stats.sharpeRatio.toString(), color: stats.sharpeRatio >= 1 ? "text-emerald-400" : "text-blue-400" },
    { label: "Profit Factor", value: profitFactor.toFixed(2), color: profitFactor >= 1.5 ? "text-emerald-400" : "text-amber-400" },
    { label: "Max Drawdown", value: `-${stats.maxDrawdown}%`, color: stats.maxDrawdown > 15 ? "text-red-400" : "text-amber-400" },
    { label: "Total Trades", value: history.length.toString(), color: "text-zinc-100" },
    { label: "Avg. Win", value: `$${avgWin.toFixed(2)}`, color: "text-emerald-400" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Performance Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">Comprehensive performance and portfolio breakdown</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/portfolio")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg border border-zinc-700 transition"
          >
            Full Portfolio
          </button>
          <button
            onClick={() => router.push("/history")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Trade History
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
            <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
            <div className="text-xs text-zinc-500 mt-1 leading-tight">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[350px]">
          <PerformanceHistoryChart />
        </div>
        <div className="min-h-[350px]">
          <AllocationChart />
        </div>
      </div>

      {/* Monthly Breakdown */}
      {history.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Recent Trades Performance</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Symbol</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Type</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Entry</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Exit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">P&L</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {history.slice(0, 10).map((trade) => (
                  <tr key={trade.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-2.5 font-medium text-zinc-100">{trade.symbol}</td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${trade.type === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">${trade.entryPrice.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-zinc-400 font-mono">${trade.exitPrice.toFixed(2)}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-medium ${trade.pnlPercentage >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {trade.pnlPercentage >= 0 ? "+" : ""}{trade.pnlPercentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
