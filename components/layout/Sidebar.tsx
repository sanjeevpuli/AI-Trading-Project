"use client";

import { useTradingStore } from "@/lib/store/tradingStore";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navSections = [
  {
    title: "Core Trading",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      { name: "Paper Trading", path: "/trading", icon: "📈" },
      { name: "Watchlist", path: "/watchlist", icon: "⭐" },
      { name: "Market Scanner", path: "/scanner", icon: "🔍" },
      { name: "Signals Center", path: "/signals", icon: "📡" },
    ],
  },
  {
    title: "Portfolio & Risk",
    items: [
      { name: "Portfolio", path: "/portfolio", icon: "💼" },
      { name: "Open Positions", path: "/positions", icon: "🎯" },
      { name: "Trade History", path: "/history", icon: "📜" },
      { name: "Risk Management", path: "/risk", icon: "🛡️" },
      { name: "Performance Analytics", path: "/analytics", icon: "📉" },
    ],
  },
  {
    title: "System & Config",
    items: [
      { name: "AI Agents", path: "/agents", icon: "🤖" },
      { name: "Backtesting", path: "/backtesting", icon: "🧪" },
      { name: "Settings", path: "/settings", icon: "⚙️" },
    ],
  },
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
  const socketStatus = useTradingStore((s) => s.socketStatus);
  const positions = useTradingStore((s) => s.positions);
  const { logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 hidden lg:flex flex-col select-none shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <span className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span className="text-blue-500">◆</span> QuantAI
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                      mounted && isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                    {mounted && item.path === "/trading" && positions.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                        {positions.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800 space-y-3">
        {/* Sign Out Button */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>

        {/* Market status feed */}
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
