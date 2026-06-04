"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice, formatPercentage } from "@/lib/binance";
import { useEffect, useState } from "react";

export default function StatCards() {
  const balance = useTradingStore((s) => s.balance);
  const positions = useTradingStore((s) => s.positions);
  const agentDiagnostics = useTradingStore((s) => s.agentDiagnostics);
  const socketStatus = useTradingStore((s) => s.socketStatus);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse h-[102px]">
            <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
            <div className="h-6 w-32 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Compute live unrealized PnL across all open positions
  const unrealizedPnL = positions.reduce((sum, p) => sum + p.pnl, 0);
  const isPositive = unrealizedPnL >= 0;
  // Total Value = Cash + (Cost Basis of Positions + Unrealized PnL)
  const totalValue = balance + positions.reduce((s, p) => s + (p.entryPrice * p.amount) + p.pnl, 0);

  const activeAgents = agentDiagnostics.filter((a) => a.status !== "IDLE").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Portfolio Value */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 relative overflow-hidden">
        {socketStatus === "CONNECTING" && (
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        )}
        {socketStatus === "CONNECTED" && (
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500" />
        )}
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Total Portfolio Value</h3>
        <div className="text-2xl font-bold text-zinc-100">{formatPrice(totalValue)}</div>
        <div
          className={`text-sm mt-1 flex items-center gap-1 ${
            isPositive ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          <span>{isPositive ? "↑" : "↓"}</span>
          {isPositive ? "+" : ""}
          {formatPrice(Math.abs(unrealizedPnL))} open P&L
        </div>
      </div>

      {/* Active Agents */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Active Agents</h3>
        <div className="text-2xl font-bold text-zinc-100">{activeAgents}</div>
        <div className="text-sm mt-1 text-zinc-500">
          {activeAgents}/{agentDiagnostics.length} currently executing
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Open Positions</h3>
        <div className="text-2xl font-bold text-zinc-100">{positions.length}</div>
        <div className="text-sm mt-1 text-zinc-500">
          {positions.length === 0
            ? "No active contracts"
            : `Across ${new Set(positions.map((p) => p.symbol)).size} market${
                new Set(positions.map((p) => p.symbol)).size !== 1 ? "s" : ""
              }`}
        </div>
      </div>

      {/* Buying Power (Cash) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Buying Power</h3>
        <div className="text-2xl font-bold text-zinc-100">{formatPrice(balance)}</div>
        <div className="text-sm mt-1 text-zinc-500">
          {((balance / (totalValue || 1)) * 100).toFixed(1)}% cash buffer available
        </div>
      </div>
    </div>
  );
}
