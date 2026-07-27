"use client";

import React, { useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const ASSET_COLORS: Record<string, string> = {
  USD:     "#3b82f6",
  BTCUSDT: "#f59e0b",
  ETHUSDT: "#6366f1",
  SOLUSDT: "#a855f7",
  BNBUSDT: "#eab308",
  ADAUSDT: "#10b981",
};

export default function AllocationChart() {
  const balance = useTradingStore((s) => s.balance);
  const positions = useTradingStore((s) => s.positions);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Build allocation map: cash + each open position at current mark price
  const allocations: Record<string, number> = { USD: balance };
  positions.forEach((pos) => {
    const value = pos.currentPrice * pos.amount;
    allocations[pos.symbol] = (allocations[pos.symbol] || 0) + value;
  });

  const totalValue = Object.values(allocations).reduce((sum, v) => sum + v, 0);

  const allocationItems: AllocationItem[] = Object.entries(allocations)
    .map(([key, val]) => ({
      name: key === "USD" ? "Cash (USD)" : key.replace("USDT", ""),
      value: val,
      percentage: totalValue > 0 ? (val / totalValue) * 100 : 0,
      color: ASSET_COLORS[key] || "#64748b",
    }))
    .sort((a, b) => b.value - a.value);

  // SVG donut calculations
  const radius = 50;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  
  const { itemsWithAccumulated } = allocationItems.reduce(
    (acc, item) => {
      acc.itemsWithAccumulated.push({ ...item, accumulated: acc.currentAccumulated });
      acc.currentAccumulated += item.percentage;
      return acc;
    },
    { currentAccumulated: 0, itemsWithAccumulated: [] as (AllocationItem & { accumulated: number })[] }
  );

  const activeItem =
    hoveredIndex !== null
      ? allocationItems[hoveredIndex]
      : allocationItems[0] || { name: "Total Portfolio", value: totalValue, percentage: 100, color: "#fff" };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col h-full justify-between">
      <div className="pb-3 border-b border-zinc-800">
        <h3 className="text-zinc-100 font-semibold text-sm">Asset Allocation</h3>
        <p className="text-[10px] text-zinc-500 mt-0.5">Live mark-to-market weighting</p>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-6 my-auto">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background ring */}
            <circle cx="60" cy="60" r={radius} fill="transparent" stroke="#18181b" strokeWidth={strokeWidth} />

            {itemsWithAccumulated.map((item, idx) => {
              if (item.percentage <= 0) return null;
              const dashLength = (item.percentage / 100) * circumference;
              const dashOffset = circumference - (item.accumulated / 100) * circumference;
              const isHovered = hoveredIndex === idx;

              return (
                <circle
                  key={item.name}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="transition-all duration-300 cursor-pointer"
                  style={{ filter: isHovered ? `drop-shadow(0px 0px 5px ${item.color})` : "none" }}
                />
              );
            })}
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              {hoveredIndex !== null ? activeItem.name : "Total Value"}
            </span>
            <span className="text-sm font-bold text-zinc-100 mt-0.5">
              {formatPrice(activeItem.value)}
            </span>
            <span
              className="text-[10px] font-bold mt-0.5 px-1.5 rounded"
              style={{
                backgroundColor: hoveredIndex !== null ? `${activeItem.color}18` : "transparent",
                color: hoveredIndex !== null ? activeItem.color : "#71717a",
              }}
            >
              {activeItem.percentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {allocationItems.map((item, idx) => (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`flex items-center justify-between p-2 rounded transition-colors cursor-pointer ${
                hoveredIndex === idx ? "bg-zinc-800/40" : "hover:bg-zinc-800/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                />
                <span className="text-xs font-semibold text-zinc-300">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-zinc-100 block">{formatPrice(item.value)}</span>
                <span className="text-[10px] text-zinc-500 block">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
