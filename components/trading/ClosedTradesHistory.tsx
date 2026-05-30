"use client";

import React from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

export default function ClosedTradesHistory() {
  const history = useTradingStore((s) => s.history);

  const getReasonStyle = (reason: string) => {
    switch (reason) {
      case "TAKE_PROFIT":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "STOP_LOSS":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-zinc-800 text-zinc-400 border border-zinc-700";
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case "TAKE_PROFIT":
        return "TP Target Hit";
      case "STOP_LOSS":
        return "SL Stop Triggered";
      case "MANUAL":
        return "Manual Exit";
      default:
        return reason;
    }
  };

  // Realized PnL summary
  const totalRealized = history.reduce((s, t) => s + t.pnl, 0);
  const winCount = history.filter((t) => t.pnl > 0).length;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h2 className="text-zinc-100 font-semibold text-sm">Execution History</h2>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <span className="text-[10px] text-zinc-500">
              Total:{" "}
              <span className={`font-bold ${totalRealized >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {totalRealized >= 0 ? "+" : ""}
                {formatPrice(totalRealized)}
              </span>
              {" "}· {winCount}W / {history.length - winCount}L
            </span>
          )}
          <span className="text-xs text-zinc-500">Last {Math.min(history.length, 50)} trades</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto max-h-[350px]">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-zinc-500">
            <span className="text-xl mb-1">📋</span>
            <p className="text-sm font-medium">No completed paper trades</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-950 border-b border-zinc-800 sticky top-0 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Exit Time</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3 text-right">Entry Price</th>
                <th className="px-4 py-3 text-right">Exit Price</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Closure Trigger</th>
                <th className="px-4 py-3 text-right">Realized P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {history.slice(0, 50).map((trade) => {
                const isPositive = trade.pnl >= 0;
                const formattedTime = new Date(trade.exitTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                const formattedDate = new Date(trade.exitTime).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <tr key={trade.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-4 py-3 text-zinc-400">
                      <div className="font-medium text-zinc-300">{formattedTime}</div>
                      <div className="text-[10px] text-zinc-500">{formattedDate}</div>
                    </td>

                    <td className="px-4 py-3 font-semibold text-zinc-200">
                      {trade.symbol.replace("USDT", "")}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          trade.type === "LONG"
                            ? "text-emerald-500 bg-emerald-500/5"
                            : "text-rose-500 bg-rose-500/5"
                        }`}
                      >
                        {trade.type}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-zinc-400">
                      {formatPrice(trade.entryPrice)}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-zinc-200">
                      {formatPrice(trade.exitPrice)}
                    </td>

                    <td className="px-4 py-3 text-right text-zinc-300">
                      {trade.amount}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${getReasonStyle(
                          trade.exitReason
                        )}`}
                      >
                        {getReasonLabel(trade.exitReason)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-bold">
                      <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
                        {isPositive ? "+" : ""}
                        {formatPrice(trade.pnl)}
                      </span>
                      <div
                        className={`text-[10px] font-medium ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {trade.pnlPercentage.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
