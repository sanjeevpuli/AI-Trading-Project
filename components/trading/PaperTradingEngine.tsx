"use client";

import React, { useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import ChartSection from "@/components/dashboard/ChartSection";
import TradingPanel from "./TradingPanel";
import OpenPositionsTable from "./OpenPositionsTable";
import ClosedTradesHistory from "./ClosedTradesHistory";

export default function PaperTradingEngine() {
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const latestConsensusReasoning = useTradingStore((s) => s.latestConsensusReasoning);
  const latestConsensusConfidence = useTradingStore((s) => s.latestConsensusConfidence);
  const [showConsensus, setShowConsensus] = useState(true);

  const isConnected = socketStatus === "CONNECTED";

  return (
    <div className="flex flex-col gap-6">
      {/* Live Connection / AI Consensus Status Bar */}
      {showConsensus && (
        <div
          className={`rounded-lg p-3 text-xs flex justify-between items-center ${
            isConnected
              ? "bg-blue-500/10 border border-blue-500/20 text-blue-400"
              : "bg-zinc-800/50 border border-zinc-700 text-zinc-500"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {isConnected ? (
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            ) : (
              <span className="h-2 w-2 rounded-full bg-zinc-600 shrink-0" />
            )}
            <span className="font-semibold shrink-0">
              {isConnected ? `AI Consensus [${latestConsensusConfidence}% confidence]:` : "Connecting to Binance…"}
            </span>
            {isConnected && (
              <span className="text-blue-300/80 truncate">{latestConsensusReasoning}</span>
            )}
          </div>
          <button
            onClick={() => setShowConsensus(false)}
            className="text-zinc-400 hover:text-zinc-200 font-semibold px-2 py-0.5 shrink-0 ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main trading portal row: Chart (3/4) + Order ticket (1/4) */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 flex flex-col h-[520px]">
          <ChartSection />
        </div>
        <div className="xl:col-span-1 h-[520px]">
          <TradingPanel />
        </div>
      </div>

      {/* Tables row: Active positions and Completed executions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="min-h-[350px]">
          <OpenPositionsTable />
        </div>
        <div className="min-h-[350px]">
          <ClosedTradesHistory />
        </div>
      </div>
    </div>
  );
}
