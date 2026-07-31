"use client";

import { useEffect, useRef, useState } from "react";
import { useTradingStore } from "@/lib/store/tradingStore";

// Extend window type for TradingView
declare global {
  interface Window {
    TradingView: {
      widget: new (config: Record<string, unknown>) => void;
    };
  }
}

const CONTAINER_ID = "tradingview_advanced_chart";

const TIMEFRAMES = [
  { label: "5m",  interval: "5" },
  { label: "15m", interval: "15" },
  { label: "1h",  interval: "60" },
  { label: "4h",  interval: "240" },
  { label: "1D",  interval: "D" },
  { label: "1W",  interval: "W" },
];

function initWidget(interval: string, symbol: string) {
  new window.TradingView.widget({
    autosize:          true,
    symbol:            `BINANCE:${symbol}`,
    interval,
    timezone:          "Etc/UTC",
    theme:             "dark",
    style:             "1",
    locale:            "en",
    toolbar_bg:        "#18181b",
    enable_publishing: false,
    hide_top_toolbar:  false,
    hide_legend:       false,
    save_image:        false,
    backgroundColor:   "rgba(9, 9, 11, 1)",
    gridColor:         "rgba(63, 63, 70, 0.35)",
    withdateranges:    true,
    allow_symbol_change: false,
    container_id:      CONTAINER_ID,
  });
}

export default function ChartSection() {
  const selectedAsset = useTradingStore((s) => s.selectedAsset);
  const portfolioMetrics = useTradingStore((s) => s.portfolioMetrics);
  const [activeInterval, setActiveInterval] = useState("60");
  // Track whether the <script> tag is already in the DOM
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Clear any previously injected widget iframe
    const container = document.getElementById(CONTAINER_ID);
    if (container) container.innerHTML = "";

    const boot = () => initWidget(activeInterval, selectedAsset);

    if (typeof window !== "undefined" && window.TradingView) {
      // Library already loaded (e.g. interval change) — just re-init
      boot();
    } else if (!document.getElementById("tv-script")) {
      // First load — inject the script once
      const script = document.createElement("script");
      script.id  = "tv-script";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.addEventListener("load", boot);
      document.head.appendChild(script);
      scriptRef.current = script;
    } else {
      // Script tag exists but not yet evaluated — wait for it
      const existing = document.getElementById("tv-script") as HTMLScriptElement;
      existing.addEventListener("load", boot);
    }

    return () => {
      // Clear widget on cleanup so the next render starts fresh
      const c = document.getElementById(CONTAINER_ID);
      if (c) c.innerHTML = "";
    };
  }, [activeInterval, selectedAsset]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 gap-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">₿</span>
          </div>
          <div>
            <span className="text-zinc-100 font-semibold text-sm">{selectedAsset}</span>
            <span className="ml-2 text-zinc-500 text-xs">{selectedAsset.replace("USDT", "")} / Tether · Binance</span>
          </div>
          {portfolioMetrics && portfolioMetrics.length > 0 && (
            <div className="ml-4 px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700">
               <span className="text-xs text-zinc-400" title="Historical Portfolio Metrics chart rendering requires custom TradingView Datafeed. Falling back to asset view.">
                 Portfolio Value: <span className="text-zinc-200">${portfolioMetrics[portfolioMetrics.length - 1].totalValue.toFixed(2)}</span>
               </span>
            </div>
          )}
        </div>

        {/* Timeframe switcher */}
        <div className="flex gap-1 bg-zinc-950 rounded-md p-0.5 border border-zinc-800 self-end sm:self-auto">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.interval}
              onClick={() => setActiveInterval(tf.interval)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                activeInterval === tf.interval
                  ? "bg-zinc-700 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* TradingView widget mount point */}
      <div className="flex-1 relative overflow-hidden rounded-b-lg">
        <div
          id={CONTAINER_ID}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}
