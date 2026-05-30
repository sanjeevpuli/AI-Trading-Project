"use client";

import React from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

export default function RiskMetricsGrid() {
  const getStats = useTradingStore((s) => s.getStats);
  const history = useTradingStore((s) => s.history);

  const stats = getStats();

  const isPnLPositive = stats.unrealizedPnL >= 0;
  const winRate = stats.winRate;
  const winCount = history.filter((t) => t.pnl > 0).length;
  const lossCount = history.length - winCount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 1. Unrealized PnL Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-40">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
            Simulated Unrealized P&L
          </span>
          <h4 className="text-zinc-400 text-xs font-semibold">Active Mark-To-Market</h4>
        </div>
        <div className="my-auto">
          <div
            className={`text-2xl font-bold ${
              isPnLPositive ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {isPnLPositive ? "↑" : "↓"} {isPnLPositive ? "+" : ""}
            {formatPrice(stats.unrealizedPnL)}
          </div>
          <div className="text-[10px] text-zinc-500 mt-1">
            Running valuation across {stats.exposure > 0 ? "active" : "no"} open positions.
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Realized P&L:</span>
          <span
            className={`font-semibold ${
              stats.realizedPnL >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {stats.realizedPnL >= 0 ? "+" : ""}
            {formatPrice(stats.realizedPnL)}
          </span>
        </div>
      </div>

      {/* 2. Win Rate Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-40">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
            Historical Win Rate
          </span>
          <h4 className="text-zinc-400 text-xs font-semibold">Closed Executions Ratio</h4>
        </div>
        <div className="my-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-100">{winRate.toFixed(1)}%</span>
            <span className="text-[10px] text-zinc-500 font-semibold">
              ({winCount}W — {lossCount}L)
            </span>
          </div>
          <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden mt-2.5 border border-zinc-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-700"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Total Closed Trades:</span>
          <span className="font-semibold text-zinc-100">{history.length}</span>
        </div>
      </div>

      {/* 3. Exposure / Leverage Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col justify-between h-40">
        <div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
            Margin & Exposure
          </span>
          <h4 className="text-zinc-400 text-xs font-semibold">Capital Allocation Metrics</h4>
        </div>
        <div className="my-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-zinc-500 block">Total Exposure</span>
              <span className="text-lg font-bold text-zinc-100">{stats.exposure.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">System Leverage</span>
              <span className="text-lg font-bold text-zinc-100">{stats.leverage.toFixed(2)}x</span>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-2 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Net Exposure Level:</span>
          <span className="font-semibold text-zinc-100">
            {stats.exposure > 80
              ? "⚠️ High Exposure"
              : stats.exposure > 30
              ? "Moderate"
              : "Conservative"}
          </span>
        </div>
      </div>

      {/* 4. Sharpe Ratio */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center h-20">
        <div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
            Sharpe Ratio
          </span>
          <span className="text-xs text-zinc-400 font-medium mt-0.5">Risk-adjusted return</span>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold block ${
              stats.sharpeRatio >= 1 ? "text-emerald-400" : stats.sharpeRatio >= 0 ? "text-blue-400" : "text-rose-400"
            }`}
          >
            {stats.sharpeRatio}
          </span>
          <span className="text-[9px] text-zinc-500">Benchmark: 1.0</span>
        </div>
      </div>

      {/* 5. Max Drawdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center h-20">
        <div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
            Max Drawdown
          </span>
          <span className="text-xs text-zinc-400 font-medium mt-0.5">Peak-to-trough decline</span>
        </div>
        <div className="text-right">
          <span
            className={`text-lg font-bold block ${
              stats.maxDrawdown > 15 ? "text-rose-500" : "text-amber-400"
            }`}
          >
            -{stats.maxDrawdown}%
          </span>
          <span className="text-[9px] text-zinc-500">Target limit: &lt; 15%</span>
        </div>
      </div>

      {/* 6. Net Beta & VaR */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center h-20">
        <div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
            Net Beta & VaR
          </span>
          <span className="text-xs text-zinc-400 font-medium mt-0.5">SPY relative volatility</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-zinc-100 block">{stats.netBeta}</span>
          <span className="text-[9px] text-zinc-500 block">1-Day 95% VaR: {stats.valueAtRisk}%</span>
        </div>
      </div>
    </div>
  );
}
