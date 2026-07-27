"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import RiskMetricsGrid from "@/components/portfolio/RiskMetricsGrid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RiskPage() {
  const getStats = useTradingStore((s) => s.getStats);
  const positions = useTradingStore((s) => s.positions);
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

  const riskLevel =
    stats.exposure > 80
      ? { label: "HIGH RISK", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" }
      : stats.exposure > 40
      ? { label: "MODERATE", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" }
      : { label: "LOW RISK", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Risk Management</h1>
          <p className="text-zinc-500 text-sm mt-1">Portfolio risk metrics and exposure analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-lg border text-sm font-bold ${riskLevel.bg} ${riskLevel.color}`}>
            {riskLevel.label}
          </div>
          <button
            onClick={() => router.push("/positions")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-lg border border-zinc-700 transition"
          >
            View Positions
          </button>
        </div>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Portfolio Exposure</div>
          <div className="text-3xl font-bold text-zinc-100">{stats.exposure.toFixed(1)}%</div>
          <div className="mt-3 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${stats.exposure > 80 ? "bg-red-500" : stats.exposure > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min(stats.exposure, 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-500 mt-1">Maximum: 100% | Recommended: &lt;50%</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Value at Risk (95%)</div>
          <div className="text-3xl font-bold text-amber-400">{stats.valueAtRisk}%</div>
          <div className="text-xs text-zinc-500 mt-2">Maximum expected daily loss with 95% confidence</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Open Positions</div>
          <div className="text-3xl font-bold text-zinc-100">{positions.length}</div>
          <div className="text-xs text-zinc-500 mt-2">Across {new Set(positions.map(p => p.symbol)).size} unique assets</div>
        </div>
      </div>

      {/* Full Risk Metrics Grid */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Detailed Risk Metrics</h2>
        <RiskMetricsGrid />
      </div>

      {/* Position Risk Table */}
      {positions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Position Risk Breakdown</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Symbol</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Side</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Size</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Stop Loss</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Take Profit</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3 font-medium text-zinc-100">{pos.symbol}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${pos.type === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">{pos.amount.toFixed(4)}</td>
                    <td className="px-4 py-3 text-right text-red-400">
                      {pos.stopLoss ? `$${pos.stopLoss.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400">
                      {pos.takeProfit ? `$${pos.takeProfit.toFixed(2)}` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)}
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
