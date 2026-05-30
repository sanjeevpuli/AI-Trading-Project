"use client";

import React from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

export default function OpenPositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const closePosition = useTradingStore((s) => s.closePosition);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h2 className="text-zinc-100 font-semibold text-sm flex items-center gap-2">
          <span>Active Positions</span>
          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded-full font-bold">
            {positions.length}
          </span>
        </h2>
        {positions.length > 0 && (
          <span className="text-[10px] text-zinc-500">
            Unrealized: {(() => {
              const total = positions.reduce((s, p) => s + p.pnl, 0);
              return (
                <span className={total >= 0 ? "text-emerald-500 font-semibold" : "text-rose-500 font-semibold"}>
                  {total >= 0 ? "+" : ""}{formatPrice(total)}
                </span>
              );
            })()}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {positions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <span className="text-2xl mb-2">💼</span>
            <p className="text-sm font-medium text-zinc-400">No active positions</p>
            <p className="text-xs text-zinc-500 max-w-[280px] mt-1">
              Select an asset and quantity in the Order Form to open a simulated LONG or SHORT contract.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-950 border-b border-zinc-800 sticky top-0 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Entry Price</th>
                <th className="px-4 py-3 text-right">Mark Price</th>
                <th className="px-4 py-3 text-center">SL / TP</th>
                <th className="px-4 py-3 text-right">Unrealized P&L</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {positions.map((pos) => {
                const isPositive = pos.pnl >= 0;
                const sizeUsd = pos.entryPrice * pos.amount;

                return (
                  <tr key={pos.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-200">
                        {pos.symbol.replace("USDT", "")}
                      </div>
                      <div className="text-[10px] text-zinc-500">Perp Perpetual</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          pos.type === "LONG"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {pos.type}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="font-medium text-zinc-200">{pos.amount}</div>
                      <div className="text-[10px] text-zinc-500">{formatPrice(sizeUsd)}</div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-300">
                      {formatPrice(pos.entryPrice)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-100">
                      {formatPrice(pos.currentPrice)}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-[10px]">
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          SL: {pos.stopLoss ? formatPrice(pos.stopLoss) : "None"}
                        </span>
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                          TP: {pos.takeProfit ? formatPrice(pos.takeProfit) : "None"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-bold">
                      <span className={isPositive ? "text-emerald-500" : "text-rose-500"}>
                        {isPositive ? "+" : ""}
                        {formatPrice(pos.pnl)}
                      </span>
                      <div
                        className={`text-[10px] font-medium ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {pos.pnlPercentage.toFixed(2)}%
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => closePosition(pos.id, "MANUAL")}
                        className="bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/30 text-zinc-300 font-semibold px-2.5 py-1 rounded text-[10px] transition-all"
                      >
                        Close
                      </button>
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
