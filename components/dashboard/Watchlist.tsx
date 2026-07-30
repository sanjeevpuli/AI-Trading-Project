"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const WATCHLIST_SYMBOLS = [
  { symbol: "BTCUSDT", icon: "₿", color: "text-amber-500" },
  { symbol: "ETHUSDT", icon: "Ξ", color: "text-indigo-400" },
  { symbol: "SOLUSDT", icon: "◎", color: "text-purple-400" },
];

export default function Watchlist() {
  const prices = useTradingStore((s) => s.prices);
  const priceChanges = useTradingStore((s) => s.priceChanges);
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const setSelectedAsset = useTradingStore((s) => s.setSelectedAsset);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isConnected = socketStatus === "CONNECTED";
  const isLoading = socketStatus === "CONNECTING";
  const isError = socketStatus === "ERROR";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
        <h2 className="text-zinc-100 font-medium text-sm flex items-center gap-2">
          Watchlist
          {isLoading && (
            <span className="h-3 w-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
          )}
          {isConnected && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          )}
        </h2>
        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
          {isConnected ? "Live" : isLoading ? "Loading…" : isError ? "Error" : "Offline"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isError ? (
          <div className="p-4 text-center">
            <p className="text-xs text-rose-400 mb-2">Market stream disconnected</p>
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded border border-zinc-700 transition-colors"
            >
              Reconnect Stream
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800/50">
            {WATCHLIST_SYMBOLS.map(({ symbol, icon, color }) => {
              const price = prices[symbol] ?? 0;
              const change = priceChanges[symbol] ?? 0;
              const isPositive = change >= 0;

              return (
                <li
                  key={symbol}
                  onClick={() => {
                    setSelectedAsset(symbol);
                    router.push("/trading");
                  }}
                  className="p-4 hover:bg-zinc-800/20 transition-colors cursor-pointer flex justify-between items-center group select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${color}`}>{icon}</span>
                    <div>
                      <div className="font-medium text-zinc-200 group-hover:text-zinc-100 transition-colors">
                        {symbol.replace("USDT", "")}
                      </div>
                      <div className="text-xs text-zinc-500">Perp</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-zinc-100 tabular-nums">
                      {price > 0 ? formatPrice(price) : "—"}
                    </div>
                    <div
                      className={`text-xs font-medium tabular-nums ${
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {change.toFixed(2)}%
                    </div>
                  </div>
                </li>
              );
            })}

            {/* Skeletons while prices haven't loaded yet */}
            {(!mounted || (isLoading && Object.keys(prices).length === 0)) &&
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="p-4 flex justify-between items-center animate-pulse">
                  <div>
                    <div className="h-4 w-12 bg-zinc-800 rounded mb-1" />
                    <div className="h-3 w-8 bg-zinc-800 rounded" />
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="h-4 w-16 bg-zinc-800 rounded mb-1" />
                    <div className="h-3 w-10 bg-zinc-800 rounded" />
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
