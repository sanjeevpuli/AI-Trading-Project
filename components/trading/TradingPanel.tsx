"use client";

import React, { useState, useEffect } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

const ASSETS = [
  { symbol: "BTCUSDT", label: "Bitcoin", icon: "₿", color: "text-amber-500" },
  { symbol: "ETHUSDT", label: "Ethereum", icon: "Ξ", color: "text-indigo-500" },
  { symbol: "SOLUSDT", label: "Solana", icon: "◎", color: "text-purple-400" },
];

export default function TradingPanel() {
  const balance = useTradingStore((s) => s.balance);
  const executeOrder = useTradingStore((s) => s.executeOrder);
  const selectedAsset = useTradingStore((s) => s.selectedAsset);
  const setSelectedAsset = useTradingStore((s) => s.setSelectedAsset);
  const prices = useTradingStore((s) => s.prices);

  const [orderType, setOrderType] = useState<"LONG" | "SHORT">("LONG");
  const [amount, setAmount] = useState<string>("0.1");
  const [useSl, setUseSl] = useState(false);
  const [slPrice, setSlPrice] = useState<string>("");
  const [useTp, setUseTp] = useState(false);
  const [tpPrice, setTpPrice] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const currentPrice = prices[selectedAsset] ?? 0;

  // Auto-suggest SL/TP defaults when toggled on
  useEffect(() => {
    if (currentPrice > 0) {
      if (useSl && !slPrice) {
        const offset = orderType === "LONG" ? 0.95 : 1.05;
        setSlPrice((currentPrice * offset).toFixed(2));
      }
      if (useTp && !tpPrice) {
        const offset = orderType === "LONG" ? 1.1 : 0.9;
        setTpPrice((currentPrice * offset).toFixed(2));
      }
    }
  }, [useSl, useTp, currentPrice, orderType]);

  // Reset SL/TP when switching asset or direction
  useEffect(() => {
    setSlPrice("");
    setTpPrice("");
  }, [orderType, selectedAsset]);

  const sizeInUsd = currentPrice * (parseFloat(amount) || 0);
  const sizePercentage = balance > 0 ? (sizeInUsd / balance) * 100 : 0;

  const handlePercentageClick = (pct: number) => {
    if (currentPrice > 0 && balance > 0) {
      const targetUsd = balance * (pct / 100);
      const computedAmount = targetUsd / currentPrice;
      const decimals = selectedAsset === "BTCUSDT" ? 4 : selectedAsset === "ETHUSDT" ? 3 : 2;
      setAmount(computedAmount.toFixed(decimals));
      setFormError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid amount");
      return;
    }
    if (currentPrice <= 0) {
      setFormError("Waiting for live asset price…");
      return;
    }

    const slVal = useSl ? parseFloat(slPrice) : undefined;
    const tpVal = useTp ? parseFloat(tpPrice) : undefined;

    if (useSl && (isNaN(slVal!) || slVal! <= 0)) {
      setFormError("Please enter a valid Stop Loss price");
      return;
    }
    if (useTp && (isNaN(tpVal!) || tpVal! <= 0)) {
      setFormError("Please enter a valid Take Profit price");
      return;
    }

    if (orderType === "LONG") {
      if (slVal && slVal >= currentPrice) {
        setFormError("Stop Loss for a LONG must be below Entry Price");
        return;
      }
      if (tpVal && tpVal <= currentPrice) {
        setFormError("Take Profit for a LONG must be above Entry Price");
        return;
      }
    } else {
      if (slVal && slVal <= currentPrice) {
        setFormError("Stop Loss for a SHORT must be above Entry Price");
        return;
      }
      if (tpVal && tpVal >= currentPrice) {
        setFormError("Take Profit for a SHORT must be below Entry Price");
        return;
      }
    }

    const result = executeOrder({
      symbol: selectedAsset,
      type: orderType,
      amount: parsedAmount,
      price: currentPrice,
      stopLoss: slVal,
      takeProfit: tpVal,
    });

    if (result.success) {
      setFormSuccess("Simulated order executed successfully!");
      setUseSl(false);
      setUseTp(false);
      setSlPrice("");
      setTpPrice("");
    } else {
      setFormError(result.error || "Order execution failed");
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-semibold text-sm">New Paper Order</h2>
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
            <span>Buying Power:</span>
            <span className="font-bold text-zinc-100">{formatPrice(balance)}</span>
          </div>
        </div>

        {/* Long / Short Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-md border border-zinc-800 mt-4">
          <button
            type="button"
            onClick={() => setOrderType("LONG")}
            className={`py-1.5 text-xs font-semibold rounded transition-colors ${
              orderType === "LONG"
                ? "bg-emerald-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            BUY (Long)
          </button>
          <button
            type="button"
            onClick={() => setOrderType("SHORT")}
            className={`py-1.5 text-xs font-semibold rounded transition-colors ${
              orderType === "SHORT"
                ? "bg-rose-600 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            SELL (Short)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Asset Selection */}
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1.5">Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-zinc-700"
            >
              {ASSETS.map((asset) => (
                <option key={asset.symbol} value={asset.symbol}>
                  {asset.icon} {asset.symbol.replace("USDT", "")} — {asset.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-medium text-zinc-400">Order Quantity</label>
              {currentPrice > 0 && (
                <span className="text-xs text-zinc-500">
                  ≈ {formatPrice(sizeInUsd)} ({sizePercentage.toFixed(1)}%)
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.000001"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFormError(null);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 text-sm rounded pl-3 pr-16 py-2 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-700"
                placeholder="0.0"
              />
              <div className="absolute right-3 top-2 text-xs font-semibold text-zinc-500">
                {selectedAsset.replace("USDT", "")}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {[10, 25, 50, 100].map((pct) => (
                <button
                  type="button"
                  key={pct}
                  onClick={() => handlePercentageClick(pct)}
                  className="bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-zinc-100 py-1 rounded transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Stop Loss */}
          <div className="bg-zinc-950 border border-zinc-850 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSl}
                  onChange={(e) => setUseSl(e.target.checked)}
                  className="rounded border-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-300">Stop Loss</span>
              </label>
              {useSl && currentPrice > 0 && slPrice && (
                <span className="text-[10px] text-zinc-500">
                  Est. Risk: {formatPrice(Math.abs(currentPrice - parseFloat(slPrice)) * (parseFloat(amount) || 0))}
                </span>
              )}
            </div>
            {useSl && (
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={slPrice}
                  onChange={(e) => { setSlPrice(e.target.value); setFormError(null); }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded pl-3 pr-12 py-1.5 focus:outline-none focus:border-zinc-700"
                  placeholder="Trigger price"
                />
                <span className="absolute right-3 top-1.5 text-[10px] font-semibold text-zinc-500">USD</span>
              </div>
            )}
          </div>

          {/* Take Profit */}
          <div className="bg-zinc-950 border border-zinc-850 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTp}
                  onChange={(e) => setUseTp(e.target.checked)}
                  className="rounded border-zinc-800 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-zinc-900"
                />
                <span className="text-xs font-medium text-zinc-300">Take Profit</span>
              </label>
              {useTp && currentPrice > 0 && tpPrice && (
                <span className="text-[10px] text-zinc-500">
                  Est. Reward: {formatPrice(Math.abs(parseFloat(tpPrice) - currentPrice) * (parseFloat(amount) || 0))}
                </span>
              )}
            </div>
            {useTp && (
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={tpPrice}
                  onChange={(e) => { setTpPrice(e.target.value); setFormError(null); }}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs rounded pl-3 pr-12 py-1.5 focus:outline-none focus:border-zinc-700"
                  placeholder="Trigger price"
                />
                <span className="absolute right-3 top-1.5 text-[10px] font-semibold text-zinc-500">USD</span>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-800">
        {currentPrice > 0 && (
          <div className="flex justify-between text-xs text-zinc-500 mb-3">
            <span>Mark Price:</span>
            <span className="font-semibold text-zinc-300">{formatPrice(currentPrice)}</span>
          </div>
        )}

        {formError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded p-2.5 mb-3 text-center">
            ⚠️ {formError}
          </div>
        )}
        {formSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded p-2.5 mb-3 text-center">
            ✓ {formSuccess}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className={`w-full py-2.5 text-xs font-semibold text-white rounded transition-colors ${
            orderType === "LONG"
              ? "bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-950/20"
              : "bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-950/20"
          }`}
        >
          {orderType === "LONG" ? "Open LONG Contract" : "Open SHORT Contract"}
        </button>
      </div>
    </div>
  );
}
