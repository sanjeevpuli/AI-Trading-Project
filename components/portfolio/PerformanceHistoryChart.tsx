"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";
import { formatPrice } from "@/lib/binance";

interface DataPoint {
  date: string;
  value: number;
}

export default function PerformanceHistoryChart() {
  const getStats = useTradingStore((s) => s.getStats);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 500, height: 220 });

  const stats = getStats();

  // Use the real equity curve from portfolioService, or fallback to seed data
  const data: DataPoint[] =
    stats.equityCurve.length >= 2
      ? stats.equityCurve.map((pt) => ({
          date: new Date(pt.time).toLocaleDateString([], { month: "short", day: "numeric" }),
          value: pt.value,
        }))
      : (() => {
          // Seed 30-day fallback so chart always has content
          const result: DataPoint[] = [];
          const startVal = 92000;
          const now = new Date();
          for (let i = 29; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const drift = (29 - i) * 600;
            const noise = Math.sin((29 - i) * 0.7) * 1800 + Math.cos((29 - i) * 1.5) * 800;
            result.push({
              date: date.toLocaleDateString([], { month: "short", day: "numeric" }),
              value: Math.round(startVal + drift + noise),
            });
          }
          return result;
        })();

  // Responsive width tracking
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDims({ width: Math.max(200, entry.contentRect.width), height: 220 });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values) * 0.99;
  const maxVal = Math.max(...values) * 1.01;
  const valRange = maxVal - minVal || 1;

  const paddingLeft = 64;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = dims.width - paddingLeft - paddingRight;
  const chartHeight = dims.height - paddingTop - paddingBottom;

  const points = data.map((d, i) => ({
    x: paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth,
    y: paddingTop + chartHeight - ((d.value - minVal) / valRange) * chartHeight,
    ...d,
  }));

  const linePath =
    points.length > 0
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ")
      : "";

  const areaPath =
    linePath
      ? `${linePath} L ${points[points.length - 1].x} ${dims.height - paddingBottom} L ${points[0].x} ${dims.height - paddingBottom} Z`
      : "";

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
    });
    setHoveredIdx(closestIdx);
  };

  // Determine if chart is overall up or down for colour theming
  const isPositiveTrend = data.length >= 2 && data[data.length - 1].value >= data[0].value;
  const lineColor = isPositiveTrend ? "#10b981" : "#f43f5e";
  const gradientId = `perfGrad-${isPositiveTrend ? "up" : "dn"}`;

  const gridLines = Array.from({ length: 4 }).map((_, i) => {
    const val = minVal + (i / 3) * valRange;
    const y = paddingTop + chartHeight - (i / 3) * chartHeight;
    return { y, label: formatPrice(val) };
  });

  // Latest change stats
  const firstVal = data[0]?.value ?? 0;
  const lastVal = data[data.length - 1]?.value ?? 0;
  const changePct = firstVal > 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 flex flex-col h-full" ref={containerRef}>
      <div className="pb-3 border-b border-zinc-800 flex justify-between items-baseline">
        <div>
          <h3 className="text-zinc-100 font-semibold text-sm">Equity Curve</h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Simulated portfolio growth history</p>
        </div>
        <div className="text-right">
          <span
            className={`text-sm font-bold ${isPositiveTrend ? "text-emerald-400" : "text-rose-400"}`}
          >
            {changePct >= 0 ? "+" : ""}{changePct.toFixed(2)}%
          </span>
          <span className="text-[10px] text-zinc-500 block">{data.length}-day period</span>
        </div>
      </div>

      <div className="relative flex-1 mt-4">
        <svg
          width={dims.width}
          height={dims.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
          className="overflow-visible select-none cursor-crosshair"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-40">
              <line
                x1={paddingLeft} y1={line.y}
                x2={dims.width - paddingRight} y2={line.y}
                stroke="#27272a" strokeWidth="1" strokeDasharray="2 3"
              />
              <text x={paddingLeft - 8} y={line.y + 4} textAnchor="end" className="text-[9px] fill-zinc-500 font-semibold">
                {line.label}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

          {/* Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: `drop-shadow(0 2px 4px ${lineColor}60)` }}
            />
          )}

          {/* X-axis date labels */}
          {points.length > 1 && (
            <>
              <text x={points[0].x} y={dims.height - 10} textAnchor="start" className="text-[9px] fill-zinc-500 font-semibold">
                {points[0].date}
              </text>
              <text x={points[Math.floor(points.length / 2)].x} y={dims.height - 10} textAnchor="middle" className="text-[9px] fill-zinc-500 font-semibold">
                {points[Math.floor(points.length / 2)].date}
              </text>
              <text x={points[points.length - 1].x} y={dims.height - 10} textAnchor="end" className="text-[9px] fill-zinc-500 font-semibold">
                {points[points.length - 1].date}
              </text>
            </>
          )}

          {/* Hover crosshair + tooltip */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g>
              <line
                x1={points[hoveredIdx].x} y1={paddingTop}
                x2={points[hoveredIdx].x} y2={dims.height - paddingBottom}
                stroke="#3f3f46" strokeWidth="1"
              />
              <circle
                cx={points[hoveredIdx].x} cy={points[hoveredIdx].y}
                r="6" fill={lineColor} stroke="#18181b" strokeWidth="2"
                style={{ filter: `drop-shadow(0 0 4px ${lineColor})` }}
              />
              <foreignObject
                x={points[hoveredIdx].x > dims.width / 2 ? points[hoveredIdx].x - 148 : points[hoveredIdx].x + 15}
                y={points[hoveredIdx].y - 32}
                width="132" height="64"
                className="pointer-events-none"
              >
                <div className="bg-zinc-950 border border-zinc-800 rounded p-2 shadow-xl text-left">
                  <span className="text-[9px] text-zinc-500 font-bold block">{points[hoveredIdx].date}</span>
                  <span className="text-xs font-bold text-zinc-100 mt-0.5 block">
                    {formatPrice(points[hoveredIdx].value)}
                  </span>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
