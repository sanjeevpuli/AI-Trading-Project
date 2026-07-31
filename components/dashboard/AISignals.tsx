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

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {dashboardError ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-xs text-rose-400 mb-2">Failed to sync AI consensus signals</p>
          </div>
        ) : !mounted || (isDashboardLoading && signalsList.length === 0) ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-800/50 rounded-lg p-3 space-y-3 border border-zinc-800">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-zinc-700 rounded" />
                <div className="h-5 w-12 bg-zinc-700 rounded" />
              </div>
              <div className="h-3 w-full bg-zinc-700 rounded" />
              <div className="flex gap-2">
                <div className="h-3 w-10 bg-zinc-700 rounded" />
                <div className="h-3 w-10 bg-zinc-700 rounded" />
              </div>
            </div>
          ))
        ) : (
          signalsList.map((sig) => {
            const badgeColor = 
              sig.type === "BUY" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              sig.type === "SELL" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
              "bg-amber-500/10 text-amber-500 border-amber-500/20";
              
            return (
              <div key={sig.id || sig.symbol} className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-zinc-100">{sig.symbol.replace("USDT", "")}</div>
                    <div className="text-[10px] text-zinc-500">Analysis: Database Sync</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeColor}`}>
                    {sig.type} • {sig.confidence}%
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {sig.reason}
                </p>
                
                <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                  <div className="flex flex-col">
                    <span>Risk Score</span>
                    <span className="text-zinc-300">{sig.riskScore}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
