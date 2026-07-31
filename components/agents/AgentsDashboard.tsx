"use client";

import React, { useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { AgentDiagnostic, AgentSignal } from "@/lib/types/trading";

export default function AgentsDashboard() {
  const agents = useTradingStore((s) => s.agentDiagnostics);
  const agentSignals = useTradingStore((s) => s.agentSignals);
  const latestConsensusReasoning = useTradingStore((s) => s.latestConsensusReasoning);
  const latestConsensusConfidence = useTradingStore((s) => s.latestConsensusConfidence);
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    "market-analysis": true,
    "technical-analysis": true,
    "sentiment-analysis": true,
    "risk-management": true,
    "portfolio-allocation": true,
    "trade-execution": true,
  });

  const toggleAgent = (id: string) => {
    setActiveToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusColor = (status: AgentDiagnostic["status"], active: boolean) => {
    if (!active) return "bg-zinc-600 text-zinc-400";
    switch (status) {
      case "ANALYZING":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "EXECUTING":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "ACTIVE":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
    }
  };

  const getStatusLabel = (status: AgentDiagnostic["status"], active: boolean) => {
    if (!active) return "OFFLINE";
    return status;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <span>🤖</span> AI Agents Dashboard
          </h1>
          <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                socketStatus === "CONNECTED"
                  ? "bg-emerald-500"
                  : socketStatus === "CONNECTING"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-zinc-600"
              }`}
            />
            {socketStatus === "CONNECTED"
              ? "System Status: All agents operational and receiving live WebSocket ticks"
              : "Connecting to WebSocket for live agent reasoning..."}
          </p>
        </div>
      </div>

      {/* Consensus Panel */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h3 className="text-zinc-100 font-semibold text-sm mb-3">Live Multi-Agent Consensus Decision</h3>
        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded text-sm text-zinc-300 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="flex-1">{latestConsensusReasoning}</p>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Consensus Confidence</span>
            <span className="text-xl font-extrabold text-blue-400">{latestConsensusConfidence}%</span>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const isActive = activeToggles[agent.id];
          const radius = 24;
          const strokeWidth = 5;
          const circumference = 2 * Math.PI * radius; // ~150.8
          const strokeDashoffset = circumference - (agent.confidence / 100) * circumference;

          return (
            <div
              key={agent.id}
              className={`bg-zinc-900 border rounded-lg p-5 flex flex-col justify-between min-h-[360px] transition-all relative overflow-hidden ${
                isActive ? "border-zinc-800 shadow-lg" : "border-zinc-850/50 opacity-60"
              }`}
            >
              {/* Agent Title & Toggle */}
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="text-2xl mt-0.5 bg-zinc-950 p-2 rounded-lg border border-zinc-850">
                      {agent.icon}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100">{agent.name}</h3>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{agent.role}</p>
                    </div>
                  </div>

                  {/* Switch Toggle */}
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative focus:outline-none ${
                      isActive ? "bg-blue-600" : "bg-zinc-850 border border-zinc-800"
                    }`}
                  >
                    <div
                      className={`h-3.8 w-3.8 rounded-full bg-white shadow transition-transform ${
                        isActive ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Status and Confidence */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-850">
                  {/* Status Badge */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                      Execution State
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1.5 shrink-0 ${getStatusColor(
                        agent.status,
                        isActive
                      )}`}
                    >
                      {isActive && agent.status !== "IDLE" && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
                        </span>
                      )}
                      {getStatusLabel(agent.status, isActive)}
                    </span>
                  </div>

                  {/* Confidence circular ring */}
                  <div className="flex items-center gap-2.5">
                    <div className="text-right">
                      <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                        Confidence
                      </span>
                      <span className="text-xs font-extrabold text-zinc-200">
                        {isActive ? `${agent.confidence}%` : "—"}
                      </span>
                    </div>

                    {isActive ? (
                      <div className="relative h-12 w-12 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Circle BG */}
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            fill="transparent"
                            stroke="#18181b"
                            strokeWidth={strokeWidth}
                          />
                          {/* Circle Progress */}
                          <circle
                            cx="24"
                            cy="24"
                            r={radius}
                            fill="transparent"
                            stroke={agent.id === "risk-management" ? "#10b981" : "#3b82f6"}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="h-12 w-12 border-2 border-dashed border-zinc-800 rounded-full shrink-0 flex items-center justify-center text-zinc-700 text-xs">
                        🔒
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Thinking Ticker Terminal */}
              <div className="bg-zinc-950/70 border border-zinc-850 rounded p-3 my-4 flex-1 flex flex-col justify-between">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
                  Live Activity stream
                </span>
                <div className="font-mono text-[10px] text-zinc-400 space-y-1.5 flex-1 overflow-y-auto max-h-[80px]">
                  {isActive ? (
                    agent.activity.map((act, idx) => (
                      <div key={idx} className="flex gap-1.5 items-start">
                        <span className="text-blue-500 shrink-0">&gt;</span>
                        <p className="leading-normal">{act}</p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center text-zinc-650 h-full">
                      [Agent is offline]
                    </div>
                  )}
                </div>
              </div>

              {/* Health Diagnostic Panel */}
              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-3 border-t border-zinc-850">
                <div className="flex items-center gap-1">
                  <span>Health:</span>
                  <span
                    className={`font-bold ${
                      isActive && agent.health === "HEALTHY"
                        ? "text-emerald-500"
                        : "text-zinc-500"
                    }`}
                  >
                    {isActive ? agent.health : "OFFLINE"}
                  </span>
                </div>
                <div>
                  Uptime: <span className="font-bold text-zinc-400">{isActive ? agent.uptime : "—"}</span>
                </div>
                <div>
                  Latency: <span className="font-bold text-zinc-400">{isActive ? agent.latency : "—"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
