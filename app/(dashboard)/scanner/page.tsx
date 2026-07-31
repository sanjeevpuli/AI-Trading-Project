"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"];

const COIN_META: Record<string, { name: string; icon: string; sector: string }> = {
  BTCUSDT: { name: "Bitcoin", icon: "₿", sector: "Store of Value" },
  ETHUSDT: { name: "Ethereum", icon: "Ξ", sector: "Smart Contract" },
  SOLUSDT: { name: "Solana", icon: "◎", sector: "L1 Blockchain" },
  BNBUSDT: { name: "BNB", icon: "B", sector: "Exchange Token" },
  ADAUSDT: { name: "Cardano", icon: "A", sector: "Smart Contract" },
  XRPUSDT: { name: "XRP", icon: "X", sector: "Payments" },
};

type Signal = "STRONG BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG SELL";

function getSignal(change: number): { signal: Signal; color: string; bg: string } {
  if (change > 3) return { signal: "STRONG BUY", color: "text-emerald-300", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (change > 0.5) return { signal: "BUY", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (change > -0.5) return { signal: "NEUTRAL", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" };
  if (change > -3) return { signal: "SELL", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
  return { signal: "STRONG SELL", color: "text-red-300", bg: "bg-red-500/10 border-red-500/30" };
}

export default function ScannerPage() {
  const prices = useTradingStore((s) => s.prices);
  const priceChanges = useTradingStore((s) => s.priceChanges);
  const isMarketLoading = useTradingStore((s) => s.isMarketLoading);
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const setSelectedAsset = useTradingStore((s) => s.setSelectedAsset);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted || isMarketLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Scanning live markets...</p>
        </div>
      </div>
    );
  }

  const items = SYMBOLS.map((symbol) => {
    const price = prices[symbol] || 0;
    const change = priceChanges[symbol] || 0;
    const sig = getSignal(change);
    return { symbol, price, change, ...sig, meta: COIN_META[symbol] };
  });

  const filtered = items.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "BUY") return item.signal === "BUY" || item.signal === "STRONG BUY";
    return item.signal === "SELL" || item.signal === "STRONG SELL";
  });

  const buyCount = items.filter((i) => i.signal === "BUY" || i.signal === "STRONG BUY").length;
  const sellCount = items.filter((i) => i.signal === "SELL" || i.signal === "STRONG SELL").length;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-100">Market Scanner</h1>
            {socketStatus === "DISCONNECTED" || socketStatus === "ERROR" ? (
              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Offline
              </span>
            ) : socketStatus === "CONNECTING" ? (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Connecting
              </span>
            ) : (
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-sm mt-1">Real-time signal scanning across all tracked assets</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {(["ALL", "BUY", "SELL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                filter === f
                  ? f === "BUY"
                    ? "bg-emerald-600 text-white"
                    : f === "SELL"
                    ? "bg-red-600 text-white"
                    : "bg-zinc-700 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f === "ALL" ? "All" : f === "BUY" ? `Buy (${buyCount})` : `Sell (${sellCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{buyCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Buy Signals</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-zinc-400">{items.filter(i => i.signal === "NEUTRAL").length}</div>
          <div className="text-xs text-zinc-500 mt-1">Neutral</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">{sellCount}</div>
          <div className="text-xs text-zinc-500 mt-1">Sell Signals</div>
        </div>
      </div>

      {/* Scanner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.symbol}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  {item.meta?.icon}
                </div>
                <div>
                  <div className="font-semibold text-zinc-100">{item.symbol.replace("USDT", "")}</div>
                  <div className="text-xs text-zinc-500">{item.meta?.sector}</div>
                </div>
              </div>
              <div className={`text-xs font-bold px-2 py-1 rounded-full border ${item.bg} ${item.color}`}>
                {item.signal}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <div className="text-lg font-bold text-zinc-100 font-mono">
                  ${item.price > 0 ? item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                </div>
                <div className={`text-sm font-medium ${item.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}% 24h
                </div>
              </div>
              <button
                onClick={() => { setSelectedAsset(item.symbol); router.push("/trading"); }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition"
              >
                Trade →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
