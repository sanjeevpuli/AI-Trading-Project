"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [defaultSymbol, setDefaultSymbol] = useState("BTCUSDT");
  const [defaultTimeframe, setDefaultTimeframe] = useState("60");
  const [riskPreferences, setRiskPreferences] = useState("moderate");
  const [tradingPreferences, setTradingPreferences] = useState("manual");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [notificationPreferences, setNotificationPreferences] = useState({
    tradeExecuted: true,
    positionClosed: true,
    stopLossHit: true,
    takeProfitHit: true,
    aiConsensus: false,
    riskAlerts: true,
    portfolioAlerts: true,
    systemNotifications: true
  });
  const [aiPreferences, setAiPreferences] = useState({
    agentAutonomy: "low",
    riskTolerance: "medium"
  });
  
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.theme) setTheme(data.theme);
          if (data.defaultSymbol) setDefaultSymbol(data.defaultSymbol);
          if (data.defaultTimeframe) setDefaultTimeframe(data.defaultTimeframe);
          if (data.riskPreferences) setRiskPreferences(data.riskPreferences);
          if (data.tradingPreferences) setTradingPreferences(data.tradingPreferences);
          if (data.language) setLanguage(data.language);
          if (data.timezone) setTimezone(data.timezone);
          if (data.notificationPreferences) setNotificationPreferences(data.notificationPreferences as any);
          if (data.aiPreferences) setAiPreferences(data.aiPreferences as any);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          theme,
          defaultSymbol,
          defaultTimeframe,
          riskPreferences,
          tradingPreferences,
          language,
          timezone,
          notificationPreferences,
          aiPreferences
        })
      });

      setSuccessMsg("Settings updated successfully! ✨");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  };

  const handleNotifToggle = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-20">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Platform Settings</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Adjust risk parameters, trading configuration thresholds, and execution settings.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm text-center font-medium animate-in fade-in duration-200">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* General Preferences */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            General Preferences
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Default Symbol</label>
              <input
                type="text"
                value={defaultSymbol}
                onChange={(e) => setDefaultSymbol(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Default Timeframe</label>
              <select
                value={defaultTimeframe}
                onChange={(e) => setDefaultTimeframe(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="1">1 Minute</option>
                <option value="15">15 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="240">4 Hours</option>
                <option value="1D">1 Day</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Risk & Trading Profile */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            Trading &amp; Risk Configuration
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Trading Mode</label>
              <select
                value={tradingPreferences}
                onChange={(e) => setTradingPreferences(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="manual">Manual Only</option>
                <option value="semi-automated">Semi-Automated (Requires Approval)</option>
                <option value="automated">Fully Automated (AI Controlled)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-300">Risk Profile</label>
              <select
                value={riskPreferences}
                onChange={(e) => setRiskPreferences(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="conservative">Conservative (Low Risk, Strict SL)</option>
                <option value="moderate">Moderate (Balanced)</option>
                <option value="aggressive">Aggressive (High Leverage, Loose SL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Notifications */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            AI &amp; Notifications
          </h3>
          
          <div className="space-y-3">
            {[
              { id: 'tradeExecuted', label: 'Trade Executed' },
              { id: 'positionClosed', label: 'Position Closed' },
              { id: 'stopLossHit', label: 'Stop Loss Hit' },
              { id: 'takeProfitHit', label: 'Take Profit Hit' },
              { id: 'aiConsensus', label: 'AI Consensus Formed' },
              { id: 'riskAlerts', label: 'Risk & Liquidation Alerts' }
            ].map(pref => (
              <label key={pref.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => handleNotifToggle(pref.id as any)}>
                <div
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                    notificationPreferences[pref.id as keyof typeof notificationPreferences] ? "bg-blue-500" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition-transform ${
                      notificationPreferences[pref.id as keyof typeof notificationPreferences] ? "translate-x-5" : ""
                    }`}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                  {pref.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            className="px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-colors"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
