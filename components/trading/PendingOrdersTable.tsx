"use client";

import React from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

export default function PendingOrdersTable() {
  const pendingOrders = useTradingStore((s) => s.pendingOrders);
  const cancelOrder = useTradingStore((s) => s.cancelOrder);
  const prices = useTradingStore((s) => s.prices);

  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <h2 className="text-zinc-100 font-semibold text-xs flex items-center gap-2">
          <span>Pending Orders</span>
          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs px-2 py-0.5 rounded-full font-bold">
            {pendingOrders.length}
          </span>
        </h2>
      </div>

      <div className="flex-1 overflow-auto">
        {pendingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <span className="text-2xl mb-2">⏱️</span>
            <p className="text-sm font-medium text-zinc-400">No pending limit orders</p>
            <p className="text-xs text-zinc-500 max-w-[280px] mt-1">
              Select "Limit" in the Order Form to place an order at a specific price.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse min-w-[600px]">
            <thead className="text-[10px] text-zinc-500 uppercase bg-zinc-950 border-b border-zinc-800 sticky top-0 font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-right">Limit Price</th>
                <th className="px-4 py-3 text-right">Mark Price</th>
                <th className="px-4 py-3 text-center">Distance</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {pendingOrders.map((order) => {
                const currentPrice = prices[order.symbol] || 0;
                const distance = currentPrice > 0 ? ((Math.abs(currentPrice - order.price) / currentPrice) * 100).toFixed(2) : "0.00";
                const sizeUsd = order.price * order.amount;

                return (
                  <tr key={order.id} className="hover:bg-zinc-800/10 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-200">
                        {order.symbol.replace("USDT", "")}
                      </div>
                      <div className="text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          order.type === "LONG"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                        }`}
                      >
                        {order.type} LIMIT
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="font-medium text-zinc-200">{order.amount}</div>
                      <div className="text-[10px] text-zinc-500">{formatPrice(sizeUsd)}</div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-300">
                      {formatPrice(order.price)}
                    </td>

                    <td className="px-4 py-3.5 text-right font-medium text-zinc-100">
                      {currentPrice > 0 ? formatPrice(currentPrice) : "Loading..."}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {distance}% away
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/30 text-zinc-300 font-semibold px-2.5 py-1 rounded text-[10px] transition-all"
                      >
                        Cancel
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
