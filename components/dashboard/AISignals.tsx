"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useEffect, useState } from "react";

export default function AISignals() {
  const agentSignals = useTradingStore((s) => s.agentSignals);
  const consensusAction = useTradingStore((s) => s.latestConsensusReasoning); // Wait, store consensus variables
  const consensusConfidence = useTradingStore((s) => s.latestConsensusConfidence);
  const isDashboardLoading = useTradingStore((s) => s.isDashboardLoading);
  const dashboardError = useTradingStore((s) => s.dashboardError);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const signalsList = Object.values(agentSignals);
  // Derive consensus action string from latestConsensusReasoning or just use a default
  const derivedConsensusAction = consensusConfidence > 60 ? "BUY" : consensusConfidence < 40 ? "SELL" : "HOLD";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-zinc-100 font-medium text-sm flex items-center gap-2">
            AI Overview & Signals
            {isDashboardLoading && (
              <span className="h-3 w-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin" />
            )}
          </h2>
          {mounted && (
            <div className="text-[10px] text-zinc-500 mt-0.5">
              Consensus: <span className={`font-semibold ${derivedConsensusAction === "BUY" ? "text-emerald-400" : derivedConsensusAction === "SELL" ? "text-rose-400" : "text-amber-400"}`}>{derivedConsensusAction}</span> ({consensusConfidence}% conf)
            </div>
          )}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          Algorithmic
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {dashboardError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-rose-400 mb-2">Failed to sync AI consensus signals</p>
          </div>
        ) : !mounted || (isDashboardLoading && signalsList.length === 0) ? (
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-zinc-800 mx-auto rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 bg-zinc-800 rounded" />
              <div className="h-16 bg-zinc-800 rounded" />
            </div>
            <div className="h-12 bg-zinc-800 rounded" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Stage 1: Market Data */}
            <div className="flex justify-center">
              <div className="bg-zinc-800/80 text-[11px] px-4 py-1.5 rounded-full border border-zinc-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Market Data (Binance WebSocket)
              </div>
            </div>
            
            <div className="flex justify-center text-zinc-700 text-xs py-1">↓</div>

            {/* Stage 2: Core Agents */}
            <div className="grid grid-cols-2 gap-2">
              {signalsList.map((sig) => {
                const badgeColor = 
                  sig.type === "BUY" ? "text-emerald-400" :
                  sig.type === "SELL" ? "text-rose-400" :
                  "text-amber-400";
                  
                return (
                  <div key={sig.agentId} className="bg-zinc-950/50 rounded p-2 border border-zinc-800/80 text-center flex flex-col justify-center">
                    <div className="text-[10px] text-zinc-500 mb-1 capitalize">
                      {sig.agentId.replace("-", " ")}
                    </div>
                    <div className={`text-xs font-bold ${badgeColor}`}>
                      {sig.type} <span className="text-zinc-600 font-normal">|</span> {sig.confidence}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center text-zinc-700 text-xs py-1">↓</div>

            {/* Stage 3: Consensus Coordinator */}
            <div className="bg-blue-900/10 border border-blue-900/30 rounded p-3 text-center">
              <div className="text-[10px] text-blue-400/80 mb-1 uppercase tracking-wider font-semibold">Consensus Coordinator</div>
              <div className={`font-bold text-sm ${derivedConsensusAction === "BUY" ? "text-emerald-400" : derivedConsensusAction === "SELL" ? "text-rose-400" : "text-amber-400"}`}>
                {derivedConsensusAction} • {consensusConfidence}% Conf
              </div>
              <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
                {consensusAction || "Analyzing sub-agent signals..."}
              </p>
            </div>

            <div className="flex justify-center text-zinc-700 text-xs py-1">↓</div>

            {/* Stage 4: Execution Agent */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-3 text-center">
              <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider font-semibold">Execution Agent</div>
              <div className="text-[11px] text-zinc-300">
                {derivedConsensusAction !== "HOLD" 
                  ? "Order prepared, sized, and routed to Trading Engine." 
                  : "Standing by. Maintaining current exposure limits."}
              </div>
            </div>

            <div className="flex justify-center text-zinc-700 text-xs py-1">↓</div>

            {/* Stage 5: Portfolio Update */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2 text-center">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Portfolio Updated</div>
            </div>

            <div className="flex justify-center text-zinc-700 text-xs py-1">↓</div>

            {/* Stage 6: Agent Memory */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded p-2 text-center">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Agent Memory Logged</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
