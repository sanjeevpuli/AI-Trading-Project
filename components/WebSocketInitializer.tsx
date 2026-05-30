"use client";

import { useEffect } from "react";
import { binanceWebsocketService } from "@/lib/services/binanceService";
import { useTradingStore } from "@/lib/store/tradingStore";

/**
 * WebSocketInitializer — Mounts once at the app root level.
 * Wires the Binance WebSocket service events to the Zustand trading store.
 * No UI output — purely a side-effect bridge component.
 */
export default function WebSocketInitializer() {
  const updatePrice = useTradingStore((s) => s.updatePrice);
  const updateKlineClose = useTradingStore((s) => s.updateKlineClose);
  const updateSocketStatus = useTradingStore((s) => s.updateSocketStatus);

  // Run once on client mount to set up WebSocket listeners.
  useEffect(() => {
    // Subscribe to connection status changes
    const unsubStatus = binanceWebsocketService.onStatusChange((status) => {
      updateSocketStatus(status);
    });

    // Subscribe to live ticker price updates (fires every ~1 second per symbol)
    const unsubTicker = binanceWebsocketService.onTickerUpdate(
      (symbol, price, changePercent) => {
        updatePrice(symbol, price, changePercent);
      }
    );

    // Subscribe to 1m candle close events — triggers AI consensus engine
    const unsubKline = binanceWebsocketService.onKlineUpdate(
      (symbol, closePrice, isClosed, historyPrices) => {
        if (isClosed) {
          updateKlineClose(symbol, closePrice, historyPrices);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      unsubStatus();
      unsubTicker();
      unsubKline();
    };
  }, [updatePrice, updateKlineClose, updateSocketStatus]);

  // No visual UI – this component only registers side‑effects.
  return null;
}

