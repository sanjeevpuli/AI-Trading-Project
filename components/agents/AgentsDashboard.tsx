"use client";

import React, { useState, useEffect } from "react";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: "ACTIVE" | "IDLE" | "ANALYZING" | "EXECUTING";
  confidence: number;
  health: "HEALTHY" | "DEGRADED" | "OFFLINE";
  latency: string;
  uptime: string;
  color: string;
  activity: string[];
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "market-analysis",
    name: "Market Analysis Agent",
    role: "Fundamental & Macro scanning",
    icon: "📊",
    status: "ANALYZING",
    confidence: 84,
    health: "HEALTHY",
    latency: "18ms",
    uptime: "99.98%",
    color: "text-blue-400 border-blue-500/20",
    activity: [
      "Parsed FED meeting transcripts: moderately hawkish stance detected.",
      "Evaluating correlation matrix between BTC and Nasdaq index.",
      "Scanning volume profile value areas (VAH/VAL) for liquidity zones.",
    ],
  },
  {
    id: "technical-analysis",
    name: "Technical Analysis Agent",
    role: "Indicator & Candlestick analytics",
    icon: "📈",
    status: "EXECUTING",
    confidence: 91,
    health: "HEALTHY",
    latency: "8ms",
    uptime: "100.0%",
    color: "text-amber-500 border-amber-500/20",
    activity: [
      "Detected Bullish Golden Cross (EMA20 > EMA50) on 4H BTCUSDT chart.",
      "Computed current RSI: 58.42 (momentum is neutral-bullish).",
      "Identified double-bottom support pattern with high-volume confirmation.",
    ],
  },
  {
    id: "sentiment-analysis",
    name: "Sentiment Analysis Agent",
    role: "News feeds & Social media parsing",
    icon: "💬",
    status: "ACTIVE",
    confidence: 76,
    health: "HEALTHY",
    latency: "35ms",
    uptime: "99.92%",
    color: "text-pink-400 border-pink-500/20",
    activity: [
      "Aggregated 1,500 Twitter/X mentions; positive sentiment ratio is 68%.",
      "Scanned Google News: Crypto regulatory news is leaning optimistic.",
      "Fear & Greed Index parsed: 64 (Greed) - trending up.",
    ],
  },
  {
    id: "risk-management",
    name: "Risk Management Agent",
    role: "Stop loss & Capital allocation constraints",
    icon: "🛡️",
    status: "ACTIVE",
    confidence: 98,
    health: "HEALTHY",
    latency: "5ms",
    uptime: "100.0%",
    color: "text-emerald-400 border-emerald-500/20",
    activity: [
      "Total portfolio net exposure is 42.50% - well within safety margins.",
      "Simulated portfolio VaR (95% 1-day) computed: 2.45%.",
      "Calculated maximum potential drawdown parameters for active positions.",
    ],
  },
  {
    id: "portfolio-allocation",
    name: "Portfolio Allocation Agent",
    role: "Weight distribution optimizer",
    icon: "💼",
    status: "ACTIVE",
    confidence: 88,
    health: "HEALTHY",
    latency: "22ms",
    uptime: "99.95%",
    color: "text-purple-400 border-purple-500/20",
    activity: [
      "Re-estimating mean-variance frontier based on 14-day return metrics.",
      "Optimized Sharpe Ratio weights: suggest increasing ETH holding slightly.",
      "Calculated covariance matrices for active Perp contracts.",
    ],
  },
  {
    id: "trade-execution",
    name: "Trade Execution Agent",
    role: "Smart order routing & VWAP execution",
    icon: "⚡",
    status: "IDLE",
    confidence: 95,
    health: "HEALTHY",
    latency: "12ms",
    uptime: "100.0%",
    color: "text-cyan-400 border-cyan-500/20",
    activity: [
      "VWAP execution engine pre-loaded. Bid-ask spread: 0.01%.",
      "Last order routed: BUY 0.5 BTC completed in 140ms.",
      "Monitoring exchange order book liquidity profiles.",
    ],
  },
];

// Seed pools of realistic thoughts to draw from on live timer
const MOCK_THOUGHT_POOLS: Record<string, string[]> = {
  "market-analysis": [
    "Scanned macroeconomic indicators: DXY weakness supporting crypto bid.",
    "Analyzing order flow imbalances on Binance Futures order book.",
    "Calculated 30-day volatility curve: compressing, breakout imminent.",
    "Macro data updated: U.S. inflation data shows signs of cool down.",
  ],
  "technical-analysis": [
    "EMA200 support tested successfully on 1H ETHUSDT chart.",
    "Identified bearish divergence on hourly MACD histogram.",
    "Calculated pivot points: next resistance level at $69,200.",
    "RSI crossing above 60, signaling accelerating bullish momentum.",
  ],
  "sentiment-analysis": [
    "Sentiment Spike: Positive Reddit volume increases by +24% for SOL.",
    "Fear & Greed index ticked from 62 to 65 over last 24 hours.",
    "News parser: Institutional inflows into Bitcoin spot ETFs accelerating.",
    "Analyzed Discord dev chat logs: high developer activity on Solana.",
  ],
  "risk-management": [
    "Evaluating Sharpe threshold bounds: adjusting active portfolio risk.",
    "Checking trailing stop-loss configurations on open margin contracts.",
    "Risk Check: Net exposure levels analyzed. Zero margin alarms.",
    "Assessed historical correlation vectors between BTC and ETH holdings.",
  ],
  "portfolio-allocation": [
    "Performing weekly Markowitz rebalancing routine. Allocations nominal.",
    "Simulating asset weight adjustment scenarios under black-swan stress test.",
    "Diversification index evaluated: Portfolio is optimally diversified.",
    "Optimal cash buffer target calculated: 55.0% - target matching.",
  ],
  "trade-execution": [
    "Inspecting bid/ask depth on global spot books: liquidity is stable.",
    "Smart Router: Multi-hop routing pathways active for perp routing.",
    "Monitoring execution slippage. Current average: 0.008%.",
    "Heartbeat check: Binance websocket connection active, latency 11ms.",
  ],
};

export default function AgentsDashboard() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>({
    "market-analysis": true,
    "technical-analysis": true,
    "sentiment-analysis": true,
    "risk-management": true,
    "portfolio-allocation": true,
    "trade-execution": true,
  });

  // Background activity simulating scrolling quantitative logs in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick a random active agent to update
      const activeAgentIds = Object.keys(activeToggles).filter((id) => activeToggles[id]);
      if (activeAgentIds.length === 0) return;

      const randomId = activeAgentIds[Math.floor(Math.random() * activeAgentIds.length)];

      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.id === randomId) {
            // Update confidence slightly and push a new thought
            const confidenceChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newConfidence = Math.max(50, Math.min(100, agent.confidence + confidenceChange));

            const pool = MOCK_THOUGHT_POOLS[agent.id];
            const randomThought = pool[Math.floor(Math.random() * pool.length)];

            // Deduplicate thoughts in recent history
            const filteredActivity = agent.activity.filter((a) => a !== randomThought);
            const updatedActivity = [randomThought, ...filteredActivity.slice(0, 2)];

            // Cycle status for high-fidelity look
            const statuses: Agent["status"][] = ["ACTIVE", "ANALYZING", "EXECUTING"];
            const newStatus =
              agent.id === "trade-execution" && Math.random() > 0.6
                ? "IDLE"
                : statuses[Math.floor(Math.random() * statuses.length)];

            return {
              ...agent,
              confidence: newConfidence,
              activity: updatedActivity,
              status: newStatus,
            };
          }
          return agent;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [activeToggles]);

  const toggleAgent = (id: string) => {
    setActiveToggles((prev) => {
      const state = !prev[id];
      // Update agent stats immediately
      setAgents((prevAgents) =>
        prevAgents.map((agent) => {
          if (agent.id === id) {
            return {
              ...agent,
              status: state ? "ACTIVE" : "IDLE",
              health: state ? "HEALTHY" : "OFFLINE",
            };
          }
          return agent;
        })
      );
      return { ...prev, [id]: state };
    });
  };

  const getStatusColor = (status: Agent["status"], active: boolean) => {
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

  const getStatusLabel = (status: Agent["status"], active: boolean) => {
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
          <p className="text-zinc-500 text-xs mt-1">
            Real-time execution status, confidence metrics, and activity tracking for specialized trading agents
          </p>
        </div>
        <div className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Status:</span>
          <span className="font-bold text-zinc-100 uppercase">All agents operational</span>
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
