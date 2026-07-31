"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";
import { useEffect, useState } from "react";

export default function TradesTable() {
  const history = useTradingStore((s) => s.history);
  const isDashboardLoading = useTradingStore((s) => s.isDashboardLoading);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex flex-col">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="text-zinc-100 font-medium text-sm">Recent Trades</h2>
        {mounted && history.length > 0 && (
          <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full tabular-nums">
            {history.length} total
          </span>
        )}
      </div>

      {!mounted || isDashboardLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 bg-zinc-800/40 rounded animate-pulse w-full" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="text-3xl mb-3 opacity-40">📊</div>
          <p className="text-zinc-500 text-sm font-medium">No trades yet</p>
          <p className="text-zinc-600 text-xs mt-1">Your executed trades will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 bg-zinc-900/50 border-b border-zinc-800 select-none">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium text-right">Price</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-right">P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {history.slice(0, 10).map((trade) => (
                <tr key={trade.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3 text-zinc-400 tabular-nums">
                    {new Date(trade.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-200">{trade.symbol.replace("USDT", "")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">{formatPrice(trade.exitPrice)}</td>
                  <td className="px-4 py-3 text-right text-zinc-300 tabular-nums">
                    {trade.amount < 1 ? trade.amount.toFixed(4) : trade.amount.toFixed(2)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${
                    trade.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}{formatPrice(trade.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
