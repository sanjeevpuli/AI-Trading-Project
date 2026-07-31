"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useEffect, useState } from "react";

export default function AgentActivity() {
  const diagnostics = useTradingStore((s) => s.agentDiagnostics);
  const isDashboardLoading = useTradingStore((s) => s.isDashboardLoading);
  const dashboardError = useTradingStore((s) => s.dashboardError);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-[400px] overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-zinc-100 font-medium text-sm">Agent Activity Log</h2>
          <div className="text-[10px] text-zinc-500 mt-0.5">Last analysis: Just now</div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {dashboardError ? (
           <div className="flex flex-col items-center justify-center py-6 text-center">
             <p className="text-xs text-rose-400 mb-2">Failed to sync agent activity</p>
           </div>
        ) : !mounted || isDashboardLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-800/40 rounded animate-pulse w-full" />
          ))
        ) : (
          diagnostics.map((agent) => (
            <div key={agent.id} className="flex gap-3 text-sm">
              <div className="mt-0.5 shrink-0">
                {agent.status === 'EXECUTING' && <div className="text-emerald-500 font-bold">✓</div>}
                {agent.status === 'ACTIVE' && <div className="text-blue-500 font-bold">ℹ</div>}
                {agent.status !== 'EXECUTING' && agent.status !== 'ACTIVE' && <div className="text-amber-500 font-bold">!</div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-zinc-200 truncate">{agent.name}</span>
                  <span className="text-xs text-zinc-500 shrink-0">{agent.status}</span>
                </div>
                <p className="text-zinc-400 mt-0.5 text-xs leading-relaxed truncate">{agent.activity[0] || "Waiting for market data..."}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
