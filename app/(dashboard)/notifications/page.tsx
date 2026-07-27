"use client";

import { useEffect, useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";

interface NotificationItem {
  id: string;
  category: "trade" | "agent" | "system";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  severity: "info" | "warning" | "success" | "danger";
}

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "welcome",
    category: "system",
    title: "Welcome to QuantAI",
    description: "Your $100,000 virtual trading account has been initialized. Happy paper trading!",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    read: false,
    severity: "success",
  },
  {
    id: "feed-connected",
    category: "system",
    title: "Binance Live Feed Connected",
    description: "Real-time market feed subscription active for BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT.",
    timestamp: new Date(Date.now() - 3600000 * 1.8).toISOString(), // 1.8 hours ago
    read: true,
    severity: "info",
  },
  {
    id: "agent-consensus",
    category: "agent",
    title: "Agent Consensus Formed",
    description: "Market Analysis and Technical Analysis agents reached a 85% LONG consensus consensus for BTCUSDT.",
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
    read: false,
    severity: "info",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "trade" | "agent" | "system">("all");
  const [mounted, setMounted] = useState(false);
  const history = useTradingStore((s) => s.history);
  const positions = useTradingStore((s) => s.positions);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Load existing notifications or seed
    const saved = localStorage.getItem("quant_notifications");
    let list: NotificationItem[] = [];
    if (saved) {
      list = JSON.parse(saved);
    } else {
      list = [...SEED_NOTIFICATIONS];
    }

    // Dynamic generation from recent trades if not already tracked
    history.slice(-3).forEach((trade) => {
      const id = `trade-${trade.id}`;
      if (!list.some((n) => n.id === id)) {
        list.unshift({
          id,
          category: "trade",
          title: `Trade Closed: ${trade.symbol}`,
          description: `Closed ${trade.type} position. Amount: ${trade.amount} units. Exit Price: $${trade.exitPrice?.toFixed(2)}. Net P&L: $${trade.pnl.toFixed(2)}`,
          timestamp: trade.exitTime || new Date().toISOString(),
          read: true,
          severity: trade.pnl >= 0 ? "success" : "danger",
        });
      }
    });

    positions.forEach((pos) => {
      const id = `pos-open-${pos.id}`;
      if (!list.some((n) => n.id === id)) {
        list.unshift({
          id,
          category: "trade",
          title: `Position Opened: ${pos.symbol}`,
          description: `Opened ${pos.type} position at $${pos.entryPrice.toFixed(2)}. Size: ${pos.amount} units.`,
          timestamp: pos.timestamp || new Date().toISOString(),
          read: false,
          severity: "info",
        });
      }
    });

    // Sort notifications by timestamp desc
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setNotifications(list);
    localStorage.setItem("quant_notifications", JSON.stringify(list));
  }, [history, positions]);

  const saveAndSet = (list: NotificationItem[]) => {
    setNotifications(list);
    localStorage.setItem("quant_notifications", JSON.stringify(list));
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveAndSet(updated);
  };

  const clearAll = () => {
    saveAndSet([]);
  };

  const toggleRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: !n.read } : n));
    saveAndSet(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveAndSet(updated);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const filtered = notifications.filter((n) => filter === "all" || n.category === filter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const categoryLabels = {
    trade: "Trades",
    agent: "AI Agents",
    system: "System",
  };

  const severityStyles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  };

  const severityBadges = {
    info: "◆",
    success: "✓",
    warning: "⚠️",
    danger: "❌",
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Notification Center
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            System logs, execution status, and AI agent diagnostic signals.
          </p>
        </div>

        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
              >
                Mark all read
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 transition"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-zinc-800">
        {(["all", "trade", "agent", "system"] as const).map((tab) => {
          const count = tab === "all" ? notifications.length : notifications.filter((n) => n.category === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                filter === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab === "all" ? "All Logs" : categoryLabels[tab]} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            <span className="text-3xl block mb-2">🔔</span>
            <p className="text-sm font-medium">No notifications found</p>
            <p className="text-xs text-zinc-600 mt-1">Everything is running smoothly.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-xl flex items-start gap-4 transition-all relative ${
                item.read ? "bg-zinc-900/40 border-zinc-800/80" : "bg-zinc-900 border-zinc-700/60 shadow-lg"
              }`}
            >
              {/* Unread indicator */}
              {!item.read && (
                <div className="absolute top-4 left-4 h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}

              {/* Status Indicator Icon */}
              <div
                className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 font-bold ${
                  severityStyles[item.severity]
                } ${!item.read ? "" : "opacity-60"}`}
              >
                {severityBadges[item.severity]}
              </div>

              {/* Text Context */}
              <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold truncate ${item.read ? "text-zinc-300" : "text-zinc-100"}`}>
                    {item.title}
                  </h3>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                    {categoryLabels[item.category]}
                  </span>
                </div>
              </div>

              {/* Individual Actions */}
              <div className="absolute right-4 top-4 flex gap-1">
                <button
                  onClick={() => toggleRead(item.id)}
                  title={item.read ? "Mark as unread" : "Mark as read"}
                  className="text-zinc-500 hover:text-zinc-300 p-1 text-xs transition-colors cursor-pointer"
                >
                  {item.read ? "⚪" : "⚫"}
                </button>
                <button
                  onClick={() => deleteNotification(item.id)}
                  title="Delete notification"
                  className="text-zinc-500 hover:text-rose-400 p-1 text-xs transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
