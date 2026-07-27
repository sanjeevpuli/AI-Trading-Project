"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import OpenPositionsTable from "@/components/trading/OpenPositionsTable";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PositionsPage() {
  const positions = useTradingStore((s) => s.positions);

  const getStats = useTradingStore((s) => s.getStats);
  const router = useRouter();
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

  const stats = getStats();
  const totalUnrealized = stats.unrealizedPnL;

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Open Positions</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {positions.length} active position{positions.length !== 1 ? "s" : ""} — live P&amp;L updating
          </p>
        </div>
        <button
          onClick={() => router.push("/trading")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          + Open New Position
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open Positions", value: positions.length.toString(), color: "text-zinc-100" },
          {
            label: "Unrealized P&L",
            value: `${totalUnrealized >= 0 ? "+" : ""}$${totalUnrealized.toFixed(2)}`,
            color: totalUnrealized >= 0 ? "text-emerald-400" : "text-red-400",
          },
          {
            label: "Total Exposure",
            value: `${(stats.exposure * 100).toFixed(1)}%`,
            color: "text-amber-400",
          },
          {
            label: "Net Leverage",
            value: `${stats.leverage.toFixed(2)}x`,
            color: "text-zinc-100",
          },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Positions Table */}
      <OpenPositionsTable />
    </div>
  );
}
