import { useState, useEffect } from "react";
import { fetchTickers, TickerData } from "@/lib/binance";

interface UseMarketDataResult {
  data: TickerData[];
  isLoading: boolean;
  error: Error | null;
}

export function useMarketData(symbols: string[], refreshIntervalMs: number = 5000): UseMarketDataResult {
  const [data, setData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const symbolsKey = symbols.join(",");

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const result = await fetchTickers(symbols);
        if (isMounted) {
          setData(result);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error occurred"));
          // Optionally, don't set isLoading to false here if we want to keep showing the last valid data
          // But we should stop the initial loading spinner if it fails completely
          if (data.length === 0) {
              setIsLoading(false);
          }
        }
      } finally {
        if (isMounted) {
          timeoutId = setTimeout(fetchData, refreshIntervalMs);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey, refreshIntervalMs]);

  return { data, isLoading, error };
}
