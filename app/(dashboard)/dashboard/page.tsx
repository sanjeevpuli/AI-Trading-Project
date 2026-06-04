"use client";

import StatCards from "@/components/dashboard/StatCards";
import ChartSection from "@/components/dashboard/ChartSection";
import AgentActivity from "@/components/dashboard/AgentActivity";
import TradesTable from "@/components/dashboard/TradesTable";
import Watchlist from "@/components/dashboard/Watchlist";
import AISignals from "@/components/dashboard/AISignals";
import { useTradingStore } from "@/lib/store/tradingStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STATUS_DOT: Record<string, string> = {
  CONNECTED: "bg-emerald-500",
  CONNECTING: "bg-amber-500 animate-pulse",
  DISCONNECTED: "bg-zinc-600",
  ERROR: "bg-rose-500",
};

export default function DashboardPage() {
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Trading Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${STATUS_DOT[socketStatus] ?? "bg-zinc-600"}`} />
            {socketStatus === "CONNECTED"
              ? "Live — Binance WebSocket connected"
              : socketStatus === "CONNECTING"
              ? "Connecting to market feed…"
              : "Overview of your automated strategies"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/portfolio")}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-medium rounded-md border border-zinc-700 transition-colors cursor-pointer"
          >
            Portfolio Analytics
          </button>
          <button
            onClick={() => router.push("/trading")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors cursor-pointer"
          >
            Start Paper Trading
          </button>
        </div>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <ChartSection />
          <TradesTable />
        </div>
        <div className="flex flex-col gap-6">
          <div className="h-[400px]">
            <Watchlist />
          </div>
          <div className="h-[350px] flex flex-col">
            <AISignals />
          </div>
          <AgentActivity />
        </div>
      </div>
    </div>
  );
}
