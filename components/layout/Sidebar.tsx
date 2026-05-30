"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", tab: "dashboard", icon: "📊" },
  { name: "Paper Trading", tab: "trading", icon: "📈" },
  { name: "AI Agents", tab: "agents", icon: "🤖" },
  { name: "Portfolio", tab: "portfolio", icon: "💼" },
];

const SOCKET_STATUS_COLOR: Record<string, string> = {
  CONNECTED: "bg-emerald-500",
  CONNECTING: "bg-amber-500 animate-pulse",
  DISCONNECTED: "bg-zinc-600",
  ERROR: "bg-rose-500",
};

const SOCKET_STATUS_LABEL: Record<string, string> = {
  CONNECTED: "Live feed active",
  CONNECTING: "Connecting…",
  DISCONNECTED: "Market feed offline",
  ERROR: "Connection error",
};

export default function Sidebar() {
  const activeTab = useTradingStore((s) => s.activeTab);
  const setActiveTab = useTradingStore((s) => s.setActiveTab);
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const positions = useTradingStore((s) => s.positions);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 hidden lg:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <span className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span className="text-blue-500">◆</span> QuantAI
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                mounted && activeTab === item.tab
                  ? "bg-zinc-800/50 text-zinc-100 border-l-2 border-blue-500 rounded-l-none"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30"
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
              {mounted && item.tab === "trading" && positions.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                  {positions.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="bg-zinc-900 rounded-lg p-3 text-sm border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-zinc-400 text-xs">Market Feed</span>
            <span
              className={`flex h-2 w-2 rounded-full ${
                SOCKET_STATUS_COLOR[socketStatus] ?? "bg-zinc-600"
              }`}
            />
          </div>
          <span className="text-zinc-100 font-medium text-xs">
            {SOCKET_STATUS_LABEL[socketStatus] ?? "Initializing…"}
          </span>
        </div>
      </div>
    </aside>
  );
}
