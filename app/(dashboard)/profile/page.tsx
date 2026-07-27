"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTradingStore } from "@/lib/store/tradingStore";

export default function ProfilePage() {
  const { user } = useAuth();
  const balance = useTradingStore((s) => s.balance);
  const history = useTradingStore((s) => s.history);
  const getStats = useTradingStore((s) => s.getStats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = getStats();
  const totalTrades = history.length;
  const wins = history.filter((t) => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">User Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Manage your trading identity, account status, and API credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
          <div className="h-20 w-20 rounded-full bg-blue-600/10 border-2 border-blue-500 flex items-center justify-center text-2xl font-bold text-blue-400 mb-4 shadow-lg shadow-blue-500/5">
            {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
          </div>
          <h2 className="text-lg font-bold text-zinc-200 truncate w-full">
            {user?.email || "Anonymous Trader"}
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold mt-2">
            PRO trader (Paper)
          </span>

          <div className="w-full border-t border-zinc-800 mt-6 pt-6 space-y-3 text-left">
            <div>
              <p className="text-xs text-zinc-500">Virtual Portfolio</p>
              <p className="text-lg font-bold text-zinc-100 mt-0.5">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500">Leverage Limit</p>
              <p className="text-sm font-semibold text-zinc-200 mt-0.5">20x max</p>
            </div>
          </div>
        </div>

        {/* Right Side: Details & Stats */}
        <div className="md:col-span-2 space-y-6">
          {/* Account Details */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-200 pb-3 border-b border-zinc-800">
              Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500">User ID</p>
                <p className="text-sm font-mono font-medium text-zinc-300 mt-0.5">{user?.id || "usr_paper_trading"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Registered Email</p>
                <p className="text-sm font-medium text-zinc-300 mt-0.5">{user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Account Type</p>
                <p className="text-sm font-medium text-zinc-300 mt-0.5">Mock Paper Trading Account</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Date Joined</p>
                <p className="text-sm font-medium text-zinc-300 mt-0.5">June 2026</p>
              </div>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-zinc-200 pb-3 border-b border-zinc-800">
              Trading Performance Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                <p className="text-xs text-zinc-500">Total Trades</p>
                <p className="text-lg font-bold text-zinc-200 mt-1">{totalTrades}</p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                <p className="text-xs text-zinc-500">Win Rate</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{winRate.toFixed(1)}%</p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                <p className="text-xs text-zinc-500">Net Profit</p>
                <p className={`text-lg font-bold mt-1 ${stats.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  ${stats.unrealizedPnL >= 0 ? "+" : ""}{stats.unrealizedPnL.toFixed(2)}
                </p>
              </div>
              <div className="bg-zinc-950/40 p-3 rounded-lg border border-zinc-850">
                <p className="text-xs text-zinc-500">Uptime Connected</p>
                <p className="text-lg font-bold text-amber-400 mt-1">100%</p>
              </div>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-zinc-200">
                Exchange API Integration
              </h3>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                Disabled
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Integrate your live Binance or Coinbase API keys to convert this account to trade live assets. Keep keys secure and grant limited read/write permissions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <input
                type="text"
                disabled
                placeholder="Binance API Key (Disabled in Demo)"
                className="flex-1 bg-zinc-955 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-500 cursor-not-allowed"
              />
              <button
                disabled
                className="px-4 py-2 bg-blue-600/50 text-white/50 text-xs font-semibold rounded-lg cursor-not-allowed"
              >
                Connect Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
