"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [leverage, setLeverage] = useState(5);
  const [riskLimit, setRiskLimit] = useState(2); // max risk % per trade
  const [agentConsensus, setAgentConsensus] = useState(70); // consensus confidence threshold
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [executionAlerts, setExecutionAlerts] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // Load from local storage if available
    const savedLev = localStorage.getItem("quant_settings_leverage");
    const savedRisk = localStorage.getItem("quant_settings_risk");
    const savedCons = localStorage.getItem("quant_settings_consensus");

    if (savedLev) setLeverage(parseInt(savedLev));
    if (savedRisk) setRiskLimit(parseFloat(savedRisk));
    if (savedCons) setAgentConsensus(parseInt(savedCons));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("quant_settings_leverage", leverage.toString());
    localStorage.setItem("quant_settings_risk", riskLimit.toString());
    localStorage.setItem("quant_settings_consensus", agentConsensus.toString());

    setSuccessMsg("Settings updated successfully! ✨");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-zinc-800 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
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
        {/* Risk Profile Settings */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            Risk &amp; Leverage Constraints
          </h3>
          
          <div className="space-y-4">
            {/* Default Leverage */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Default Position Leverage</label>
                <span className="text-sm font-bold text-blue-400">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-[11px] text-zinc-500">
                Leverage applied by default to newly initialized manual paper trades. Max 20x.
              </p>
            </div>

            {/* Max Risk Per Trade */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Max Portfolio Risk Per Position</label>
                <span className="text-sm font-bold text-blue-400">{riskLimit}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5"
                step="0.5"
                value={riskLimit}
                onChange={(e) => setRiskLimit(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-[11px] text-zinc-500">
                Pre-trade risk validator checks: rejects order execution if stop loss risk exceeds this % of total balance.
              </p>
            </div>
          </div>
        </div>

        {/* AI Agent Configuration */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            AI Agent Execution Consensus
          </h3>

          {/* Consensus Confidence Threshold */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-300">Signal Consensus Threshold</label>
              <span className="text-sm font-bold text-blue-400">{agentConsensus}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={agentConsensus}
              onChange={(e) => setAgentConsensus(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              disabled
            />
            <p className="text-[11px] text-zinc-500">
              [Auto Trading Locked] Confidence threshold required from consolidated agent diagnostics to execute automated system trades.
            </p>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-zinc-200 pb-2 border-b border-zinc-800">
            System Alerts &amp; Notifications
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900 focus:ring-offset-2"
              />
              <div>
                <p className="text-sm font-medium text-zinc-300">Email Trade Summaries</p>
                <p className="text-[11px] text-zinc-500">Receive daily PDF summaries of agent consensus metrics.</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer border-t border-zinc-800/60 pt-3">
              <input
                type="checkbox"
                checked={executionAlerts}
                onChange={(e) => setExecutionAlerts(e.target.checked)}
                className="h-4 w-4 bg-zinc-800 border-zinc-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900 focus:ring-offset-2"
              />
              <div>
                <p className="text-sm font-medium text-zinc-300">Live In-App Order Sound Notifications</p>
                <p className="text-[11px] text-zinc-500">Play a chime whenever a stop-loss, take-profit or manual trade order completes.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
