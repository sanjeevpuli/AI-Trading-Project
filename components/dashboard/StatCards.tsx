"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";
import { useEffect, useState } from "react";

export default function StatCards() {
  const balance = useTradingStore((s) => s.balance);
  const positions = useTradingStore((s) => s.positions);
  const history = useTradingStore((s) => s.history);
  const agentDiagnostics = useTradingStore((s) => s.agentDiagnostics);
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const isDashboardLoading = useTradingStore((s) => s.isDashboardLoading);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || isDashboardLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 animate-pulse h-[102px]">
            <div className="h-4 w-24 bg-zinc-800 rounded mb-2" />
            <div className="h-6 w-32 bg-zinc-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Compute metrics
  const unrealizedPnL = positions.reduce((sum, p) => sum + p.pnl, 0);

  // Today's P&L (Today's closed trades PnL + current open unrealized PnL)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const closedTodayPnL = history
    .filter((t) => new Date(t.exitTime) >= todayStart)
    .reduce((sum, t) => sum + t.pnl, 0);
  const todaysPnL = closedTodayPnL + unrealizedPnL;
  const isTodayPositive = todaysPnL >= 0;

  // Total Account Balance = Cash (Balance) + Margin allocated to open positions + Unrealized P&L
  const marginInUse = positions.reduce((sum, p) => sum + (p.entryPrice * p.amount), 0);
  const accountBalance = balance + marginInUse + unrealizedPnL;

  // Win Rate calculation based on trade history
  const winningTrades = history.filter((t) => t.pnl > 0).length;
  const winRate = history.length > 0 ? ((winningTrades / history.length) * 100).toFixed(1) : "—";

  const activeAgents = agentDiagnostics.filter((a) => a.status !== "IDLE").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Account Balance */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 relative overflow-hidden">
        {socketStatus === "CONNECTING" && (
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
        )}
        {socketStatus === "CONNECTED" && (
          <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-emerald-500" />
        )}
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Account Balance</h3>
        <div className="text-2xl font-bold text-zinc-100">{formatPrice(accountBalance)}</div>
        <div className="text-sm mt-1 text-zinc-500">
          Equity value
        </div>
      </div>

      {/* 2. Today's P&L */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Today's P&L</h3>
        <div className={`text-2xl font-bold ${isTodayPositive ? "text-emerald-500" : "text-rose-500"}`}>
          {isTodayPositive ? "+" : ""}{formatPrice(todaysPnL)}
        </div>
        <div className="text-sm mt-1 text-zinc-500">
          Incl. open P&L
        </div>
      </div>

      {/* 3. Open Positions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Open Positions</h3>
        <div className="text-2xl font-bold text-zinc-100">{positions.length}</div>
        <div className="text-sm mt-1 text-zinc-500">
          {positions.length === 0
            ? "No active positions"
            : `Across ${new Set(positions.map((p) => p.symbol)).size} market${
                new Set(positions.map((p) => p.symbol)).size !== 1 ? "s" : ""
              }`}
        </div>
      </div>

      {/* 4. Win Rate */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Win Rate</h3>
        <div className="text-2xl font-bold text-zinc-100">
          {winRate !== "—" ? `${winRate}%` : "—"}
        </div>
        <div className="text-sm mt-1 text-zinc-500">
          {history.length > 0 ? `${winningTrades}/${history.length} trades won` : "No closed trades"}
        </div>
      </div>

      {/* 5. Available Margin (Buying Power) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <h3 className="text-zinc-400 text-sm font-medium mb-1">Available Margin</h3>
        <div className="text-2xl font-bold text-zinc-100">{formatPrice(balance)}</div>
        <div className="text-sm mt-1 text-zinc-500">
          {((balance / (accountBalance || 1)) * 100).toFixed(1)}% cash available
        </div>
      </div>
    </div>
  );
}
