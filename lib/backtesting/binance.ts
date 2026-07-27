export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines";

/**
 * Fetch historical klines from Binance.
 * Handles pagination if the timeframe requires more than 1000 candles (up to a reasonable safety limit).
 */
export async function fetchHistoricalKlines(
  symbol: string,
  interval: string,
  startTime: number,
  endTime: number
): Promise<KlineData[]> {
  let allKlines: KlineData[] = [];
  let currentStartTime = startTime;
  const limit = 1000;
  
  // Safety break to prevent infinite loops or huge data fetches hitting rate limits
  let iterations = 0;
  const MAX_ITERATIONS = 5; 

  while (currentStartTime < endTime && iterations < MAX_ITERATIONS) {
    const url = `${BINANCE_KLINES_URL}?symbol=${symbol}&interval=${interval}&startTime=${currentStartTime}&endTime=${endTime}&limit=${limit}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical klines: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.length === 0) break;

    const formattedData: KlineData[] = data.map((candle: (string | number)[]) => ({
      time: candle[0] as number,
      open: parseFloat(candle[1] as string),
      high: parseFloat(candle[2] as string),
      low: parseFloat(candle[3] as string),
      close: parseFloat(candle[4] as string),
      volume: parseFloat(candle[5] as string),
    }));

    allKlines = allKlines.concat(formattedData);
    
    // Advance start time to the last candle's time + 1ms to fetch the next batch
    currentStartTime = data[data.length - 1][0] + 1;
    iterations++;

    // If we received less than limit, we've hit the end of the available data
    if (data.length < limit) break;
  }

  return allKlines;
}
