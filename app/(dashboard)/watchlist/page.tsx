"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const DEFAULT_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT", "DOGEUSDT", "AVAXUSDT"];

const COIN_META: Record<string, { name: string; icon: string }> = {
  BTCUSDT: { name: "Bitcoin", icon: "₿" },
  ETHUSDT: { name: "Ethereum", icon: "Ξ" },
  SOLUSDT: { name: "Solana", icon: "◎" },
  BNBUSDT: { name: "BNB", icon: "B" },
  ADAUSDT: { name: "Cardano", icon: "A" },
  XRPUSDT: { name: "XRP", icon: "X" },
  DOGEUSDT: { name: "Dogecoin", icon: "Ð" },
  AVAXUSDT: { name: "Avalanche", icon: "▲" },
};

export default function WatchlistPage() {
  const prices = useTradingStore((s) => s.prices);
  const priceChanges = useTradingStore((s) => s.priceChanges);
  const setSelectedAsset = useTradingStore((s) => s.setSelectedAsset);
  const router = useRouter();
  const [watchlist, setWatchlist] = useState<string[]>(["BTCUSDT", "ETHUSDT", "SOLUSDT"]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const fetchWatchlist = async () => {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            setWatchlist(list);
            localStorage.setItem("quant_watchlist", JSON.stringify(list));
            return;
          }
        }
      } catch (error) {
        console.error("Failed to fetch watchlist from DB, using fallback:", error);
      }

      const saved = localStorage.getItem("quant_watchlist");
      if (saved) setWatchlist(JSON.parse(saved));
    };

    fetchWatchlist();
  }, []);

  const toggleSymbol = async (symbol: string) => {
    const next = watchlist.includes(symbol)
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];
    setWatchlist(next);
    localStorage.setItem("quant_watchlist", JSON.stringify(next));

    try {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols: next }),
      });
    } catch (error) {
      console.error("Failed to sync watchlist to DB:", error);
    }
  };

  const handleTrade = (symbol: string) => {
    setSelectedAsset(symbol);
    router.push("/trading");
  };

  const filtered = DEFAULT_SYMBOLS.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()) ||
    (COIN_META[s]?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Watchlist</h1>
          <p className="text-zinc-500 text-sm mt-1">Track your favorite assets</p>
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-zinc-500"
          />
          <span className="absolute left-3 top-2.5 text-zinc-500 text-sm">🔍</span>
        </div>
      </div>

      {/* Watched assets */}
      {watchlist.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Watching ({watchlist.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((symbol) => {
              const price = prices[symbol] || 0;
              const change = priceChanges[symbol] || 0;
              const meta = COIN_META[symbol] || { name: symbol, icon: "?" };
              return (
                <div key={symbol} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                        {meta.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-zinc-100">{symbol.replace("USDT", "")}</div>
                        <div className="text-xs text-zinc-500">{meta.name}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSymbol(symbol)}
                      className="text-yellow-400 text-lg hover:text-zinc-400 transition"
                      title="Remove from watchlist"
                    >
                      ★
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-zinc-100">
                        ${price > 0 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </div>
                      <div className={`text-xs font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleTrade(symbol)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-xs font-medium rounded-lg border border-blue-500/30 hover:border-blue-600 transition"
                    >
                      Trade
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All symbols */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">All Assets</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Asset</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">24h</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((symbol) => {
                const price = prices[symbol] || 0;
                const change = priceChanges[symbol] || 0;
                const meta = COIN_META[symbol] || { name: symbol, icon: "?" };
                const isWatched = watchlist.includes(symbol);
                return (
                  <tr key={symbol} className="hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {meta.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-zinc-100">{symbol.replace("USDT", "")}</div>
                          <div className="text-xs text-zinc-500">{meta.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-100">
                      ${price > 0 ? price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleSymbol(symbol)}
                          className={`text-base transition ${isWatched ? "text-yellow-400 hover:text-zinc-400" : "text-zinc-600 hover:text-yellow-400"}`}
                          title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                        >
                          {isWatched ? "★" : "☆"}
                        </button>
                        <button
                          onClick={() => handleTrade(symbol)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition"
                        >
                          Trade
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
