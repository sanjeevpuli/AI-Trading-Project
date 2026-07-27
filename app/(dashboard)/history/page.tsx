"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import ClosedTradesHistory from "@/components/trading/ClosedTradesHistory";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const history = useTradingStore((s) => s.history);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const totalPnl = history.reduce((acc, t) => acc + t.pnl, 0);
  const wins = history.filter((t) => t.pnl > 0).length;
  const winRate = history.length > 0 ? (wins / history.length) * 100 : 0;
  const bestTrade = history.length > 0 ? Math.max(...history.map((t) => t.pnl)) : 0;
  const worstTrade = history.length > 0 ? Math.min(...history.map((t) => t.pnl)) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Trade History</h1>
        <p className="text-zinc-500 text-sm mt-1">{history.length} completed trade{history.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Realized P&L",
            value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
            color: totalPnl >= 0 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Win Rate",
            value: `${winRate.toFixed(1)}%`,
            color: winRate >= 50 ? "text-emerald-400" : "text-amber-400",
          },
          {
            label: "Best Trade",
            value: `+$${bestTrade.toFixed(2)}`,
            color: "text-emerald-400",
          },
          {
            label: "Worst Trade",
            value: `$${worstTrade.toFixed(2)}`,
            color: "text-red-400",
          },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <ClosedTradesHistory />
    </div>
  );
}
