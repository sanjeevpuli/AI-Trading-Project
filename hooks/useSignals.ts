import { useState, useEffect } from "react";
import { generateSignal, AISignal } from "@/lib/signals";

const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines";

/**
 * Fetches klines (candlesticks) for a given symbol and interval.
 */
async function fetchKlines(symbol: string, interval: string = "15m", limit: number = 100): Promise<number[]> {
  const url = `${BINANCE_KLINES_URL}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch klines for ${symbol}`);
  }

  const data = await response.json();
  // Binance kline array format: [Open time, Open, High, Low, Close, ...]
  // We just need the closing prices
  return data.map((candle: any[]) => parseFloat(candle[4]));
}

export function useSignals(symbols: string[], refreshIntervalMs: number = 10000) {
  const [signals, setSignals] = useState<AISignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchAllSignals = async () => {
      try {
        const signalPromises = symbols.map(async (symbol) => {
          const prices = await fetchKlines(symbol);
          return generateSignal(symbol, prices);
        });

        const newSignals = await Promise.all(signalPromises);

        if (isMounted) {
          setSignals(newSignals);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to fetch signals"));
          if (signals.length === 0) setIsLoading(false);
        }
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchAllSignals, refreshIntervalMs);
        }
      }
    };

    fetchAllSignals();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [symbols.join(","), refreshIntervalMs]);

  return { signals, isLoading, error };
}
