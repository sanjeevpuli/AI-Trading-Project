"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

const TICKER_SYMBOLS = [
  { symbol: "BTCUSDT", label: "BTC", icon: "₿", color: "text-amber-500" },
  { symbol: "ETHUSDT", label: "ETH", icon: "Ξ", color: "text-indigo-400" },
  { symbol: "SOLUSDT", label: "SOL", icon: "◎", color: "text-purple-400" },
];

export default function MarketTicker() {
  const prices = useTradingStore((s) => s.prices);
  const priceChanges = useTradingStore((s) => s.priceChanges);
  const socketStatus = useTradingStore((s) => s.socketStatus);

  const isLive = socketStatus === "CONNECTED";

  return (
    <div className="flex items-center gap-4 overflow-x-auto">
      {TICKER_SYMBOLS.map(({ symbol, label, icon, color }) => {
        const price = prices[symbol] ?? 0;
        const change = priceChanges[symbol] ?? 0;
        const isPositive = change >= 0;

        return (
          <div
            key={symbol}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 rounded-md border border-zinc-800/50 shrink-0 select-none"
          >
            <span className={`text-sm font-bold ${color}`}>{icon}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-300">{label}</span>
              <span className="text-xs font-mono text-zinc-100 tabular-nums">
                {price > 0 ? formatPrice(price) : "—"}
              </span>
              <span
                className={`text-[10px] font-bold tabular-nums ${
                  isPositive ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </span>
            </div>
          </div>
        );
      })}
      {isLive && (
        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          LIVE
        </span>
      )}
    </div>
  );
}
