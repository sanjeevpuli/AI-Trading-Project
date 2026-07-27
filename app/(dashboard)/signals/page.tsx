"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignalsPage() {
  const agentDiagnostics = useTradingStore((s) => s.agentDiagnostics);
  const agentSignals = useTradingStore((s) => s.agentSignals);
  const latestConsensusReasoning = useTradingStore((s) => s.latestConsensusReasoning);
  const latestConsensusConfidence = useTradingStore((s) => s.latestConsensusConfidence);
  const selectedAsset = useTradingStore((s) => s.selectedAsset);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-[50vh]"><div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  const signals = Object.values(agentSignals);
  const buySignals = signals.filter((s) => s.type === "BUY").length;
  const sellSignals = signals.filter((s) => s.type === "SELL").length;
  const holdSignals = signals.filter((s) => s.type === "HOLD").length;

  const consensusAction = buySignals > sellSignals ? "BUY" : sellSignals > buySignals ? "SELL" : "HOLD";
  const consensusColor = consensusAction === "BUY" ? "text-emerald-400" : consensusAction === "SELL" ? "text-red-400" : "text-zinc-400";

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Signals Center</h1>
          <p className="text-zinc-500 text-sm mt-1">AI agent signals for {selectedAsset}</p>
        </div>
        <button
          onClick={() => router.push("/trading")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
        >
          Execute Trade →
        </button>
      </div>

      {/* Consensus Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Consensus Signal</div>
            <div className={`text-4xl font-extrabold ${consensusColor}`}>{consensusAction}</div>
            <div className="text-sm text-zinc-400 mt-1">{latestConsensusConfidence}% confidence</div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{buySignals}</div>
              <div className="text-xs text-zinc-500">BUY</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-400">{holdSignals}</div>
              <div className="text-xs text-zinc-500">HOLD</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{sellSignals}</div>
              <div className="text-xs text-zinc-500">SELL</div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400 leading-relaxed">{latestConsensusReasoning}</p>
        </div>
      </div>

      {/* Agent Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agentDiagnostics.map((agent) => {
          const signal = agentSignals[agent.id];
          const signalType = signal?.type || "HOLD";
          const signalColor = signalType === "BUY" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : signalType === "SELL" ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-zinc-400 bg-zinc-500/10 border-zinc-700";

          return (
            <div key={agent.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{agent.icon}</span>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{agent.name}</div>
                    <div className="text-xs text-zinc-500">{agent.role}</div>
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full border ${signalColor}`}>
                  {signalType}
                </div>
              </div>

              {/* Confidence Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Confidence</span>
                  <span>{agent.confidence}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${agent.confidence}%` }}
                  />
                </div>
              </div>

              {signal && (
                <div className="text-xs text-zinc-500 leading-relaxed">{signal.reason}</div>
              )}

              <div className="mt-3 pt-3 border-t border-zinc-800/50">
                <div className="flex justify-between text-xs text-zinc-600">
                  <span>Latency: {agent.latency}</span>
                  <span className={agent.health === "HEALTHY" ? "text-emerald-500" : "text-amber-500"}>{agent.health}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
