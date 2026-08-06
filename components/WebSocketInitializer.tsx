"use client";

import { useEffect } from "react";
import { marketDataAgent } from "@/lib/services/ai/marketData";
import { useTradingStore } from "@/lib/store/tradingStore";

/**
 * WebSocketInitializer — Mounts once at the app root level.
 * Wires the Market Data Agent to the Zustand trading store.
 * No UI output — purely a side-effect bridge component.
 */
export default function WebSocketInitializer() {
  const updatePrice = useTradingStore((s) => s.updatePrice);
  const updateKlineClose = useTradingStore((s) => s.updateKlineClose);
  const updateSocketStatus = useTradingStore((s) => s.updateSocketStatus);

  const fetchMarketData = useTradingStore((s) => s.fetchMarketData);
  const watchlistSymbols = useTradingStore((s) => s.watchlistSymbols);

  // Run once on client mount to set up WebSocket listeners.
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      marketDataAgent.shutdown();
    };
  }, []);

  // Handle dynamic symbol subscriptions
  useEffect(() => {
    const baseSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"];
    const allSymbols = Array.from(new Set([...baseSymbols, ...watchlistSymbols]));
    
    // Initialize Market Data Agent
    marketDataAgent.initialize(allSymbols, {
      onStatusChange: (status) => updateSocketStatus(status),
      onTick: (symbol, price, changePercent) => updatePrice(symbol, price, changePercent),
      onCandleClose: (symbol, closePrice, isClosed, historyPrices) => {
        // Only trigger update for completed candles
        if (isClosed && historyPrices && historyPrices.length > 0) {
           updateKlineClose(symbol, closePrice, historyPrices);
        }
      }
    });

    // Warmup historical data for AI consensus engine for all tracked symbols
    const warmupAsset = async (symbol: string) => {
      try {
        const history = await marketDataAgent.fetchHistoricalCandles(symbol);
        useTradingStore.getState().setHistoricalKlines(symbol, history);
      } catch (error) {
        console.error(`Failed to fetch history for ${symbol}:`, error);
      }
    };
    
    allSymbols.forEach(symbol => warmupAsset(symbol));
  }, [watchlistSymbols, fetchMarketData]);

  // No visual UI – this component only registers side‑effects.
  return null;
}
