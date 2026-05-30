"use client";

import React from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import RiskMetricsGrid from "./RiskMetricsGrid";
import AllocationChart from "./AllocationChart";
import PerformanceHistoryChart from "./PerformanceHistoryChart";
import { formatPrice } from "@/lib/binance";

export default function PortfolioAnalytics() {
  const getStats = useTradingStore((s) => s.getStats);
  const resetStore = useTradingStore((s) => s.resetStore);
  const socketStatus = useTradingStore((s) => s.socketStatus);

  const stats = getStats();

  const handleReset = () => {
    if (confirm("Reset your simulated account to $100,000.00? All positions and history will be cleared.")) {
      resetStore();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>💼</span> Portfolio Analytics
          </h1>
          <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                socketStatus === "CONNECTED"
                  ? "bg-emerald-500"
                  : socketStatus === "CONNECTING"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-zinc-600"
              }`}
            />
            {socketStatus === "CONNECTED"
              ? "Live — positions updating in real time"
              : "Simulated paper portfolio valuation and exposure risk metrics"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5">
            <span>Portfolio Equity:</span>
            <span className="font-bold text-zinc-100">{formatPrice(stats.totalValue)}</span>
          </div>
          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 text-zinc-400 text-xs font-semibold rounded transition-colors"
          >
            Reset Portfolio
          </button>
        </div>
      </div>

      {/* Risk metrics row */}
      <RiskMetricsGrid />

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-h-[300px]">
          <AllocationChart />
        </div>
        <div className="min-h-[300px]">
          <PerformanceHistoryChart />
        </div>
      </div>
    </div>
  );
}
