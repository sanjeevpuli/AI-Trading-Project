"use client";

import { useEffect, useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  severity?: "info" | "warning" | "success" | "danger";
}
// Helper for severity mapping
function getSeverity(type: string): "info" | "warning" | "success" | "danger" {
  if (type === "TRADE_EXECUTED" || type === "TAKE_PROFIT") return "success";
  if (type === "STOP_LOSS" || type === "RISK_ALERT") return "danger";
  if (type === "PORTFOLIO_ALERT") return "warning";
  return "info";
}

const getSeverityColor = (severity: "info" | "warning" | "success" | "danger" = "info") => {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  };
  return styles[severity];
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "trade" | "agent" | "system">("all");
  const [mounted, setMounted] = useState(false);
  const history = useTradingStore((s) => s.history);
  const positions = useTradingStore((s) => s.positions);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    async function loadNotifications() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    }
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true })
    });
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "all", isRead: true })
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "trade") return n.type === "TRADE_EXECUTED" || n.type === "POSITION_CLOSED" || n.type === "STOP_LOSS" || n.type === "TAKE_PROFIT";
    if (filter === "agent") return n.type === "AI_CONSENSUS";
    if (filter === "system") return n.type === "SYSTEM";
    return true;
  });

  const categoryLabels = {
    all: "All Logs",
    trade: "Trades",
    agent: "AI Agents",
    system: "System",
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
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
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
              >
                Mark all read
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex border-b border-zinc-800">
        {(["all", "trade", "agent", "system"] as const).map((tab) => {
          const count = tab === "all" ? notifications.length : notifications.filter((n) => {
            if (tab === "trade") return n.type === "TRADE_EXECUTED" || n.type === "POSITION_CLOSED" || n.type === "STOP_LOSS" || n.type === "TAKE_PROFIT";
            if (tab === "agent") return n.type === "AI_CONSENSUS";
            if (tab === "system") return n.type === "SYSTEM";
            return false;
          }).length;
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
              {categoryLabels[tab]} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
            <span className="text-3xl block mb-2">🔔</span>
            <p className="text-sm font-medium">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border rounded-xl flex items-start gap-4 transition-all ${
                notif.isRead ? "bg-zinc-900/40 border-zinc-800/80" : "bg-zinc-900 border-zinc-700/60"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  !notif.isRead ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "bg-transparent"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${!notif.isRead ? "text-zinc-100" : "text-zinc-300"}`}>
                      {notif.title}
                    </p>
                    <p className={`text-xs ${!notif.isRead ? "text-zinc-400" : "text-zinc-500"}`}>
                      {notif.message}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 whitespace-nowrap pt-0.5">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getSeverityColor(
                      getSeverity(notif.type)
                    )}`}
                  >
                    {notif.type.replace('_', ' ')}
                  </span>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-[10px] text-cyan-500 hover:text-cyan-400 font-medium transition-colors ml-auto"
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notif.id)}
                    className="text-[10px] text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
