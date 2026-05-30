"use client";

import { useSignals } from "@/hooks/useSignals";
import { useTradingStore } from "@/lib/store/tradingStore";

export default function AISignals() {
  const selectedAsset = useTradingStore((s) => s.selectedAsset);
  const { signals, isLoading, error } = useSignals([selectedAsset], 10000);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-zinc-100 font-medium text-sm flex items-center gap-2">
          AI Trading Signals
          {isLoading && signals.length === 0 && (
            <span className="h-3 w-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin"></span>
          )}
        </h2>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Algorithmic
        </span>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {error ? (
          <div className="text-sm text-rose-500 text-center py-2">
            Failed to load AI signals
          </div>
        ) : isLoading && signals.length === 0 ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-zinc-800/50 rounded-lg p-3 space-y-3 border border-zinc-800">
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-zinc-700 rounded"></div>
                <div className="h-5 w-12 bg-zinc-700 rounded"></div>
              </div>
              <div className="h-3 w-full bg-zinc-700 rounded"></div>
              <div className="flex gap-2">
                <div className="h-3 w-10 bg-zinc-700 rounded"></div>
                <div className="h-3 w-10 bg-zinc-700 rounded"></div>
              </div>
            </div>
          ))
        ) : (
          signals.map((sig) => {
            const badgeColor = 
              sig.type === "BUY" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
              sig.type === "SELL" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
              "bg-amber-500/10 text-amber-500 border-amber-500/20";
              
            return (
              <div key={sig.symbol} className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-zinc-100">{sig.symbol.replace("USDT", "")}</div>
                  <div className={`px-2 py-0.5 rounded text-xs font-bold border ${badgeColor}`}>
                    {sig.type} • {sig.confidence}%
                  </div>
                </div>
                
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {sig.reason}
                </p>
                
                <div className="flex gap-3 text-[10px] text-zinc-500 font-mono">
                  <div className="flex flex-col">
                    <span>RSI</span>
                    <span className={sig.indicators.rsi > 70 ? "text-rose-500" : sig.indicators.rsi < 30 ? "text-emerald-500" : "text-zinc-300"}>
                      {sig.indicators.rsi}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span>MACD</span>
                    <span className={sig.indicators.macd > 0 ? "text-emerald-500" : "text-rose-500"}>
                      {sig.indicators.macd}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span>EMA(20/50)</span>
                    <span className={sig.indicators.ema20 > sig.indicators.ema50 ? "text-emerald-500" : "text-rose-500"}>
                      {sig.indicators.ema20} / {sig.indicators.ema50}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
