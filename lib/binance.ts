export interface TickerData {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
}

const BINANCE_API_URL = "https://api.binance.com/api/v3/ticker/24hr";

/**
 * Fetches 24hr ticker price change statistics for the given symbols.
 * @param symbols Array of trading pairs (e.g., ["BTCUSDT", "ETHUSDT"])
 */
export async function fetchTickers(symbols: string[]): Promise<TickerData[]> {
  try {
    const symbolsQuery = JSON.stringify(symbols);
    const response = await fetch(`${BINANCE_API_URL}?symbols=${encodeURIComponent(symbolsQuery)}`);
    
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as TickerData[];
  } catch (error) {
    console.error("Failed to fetch from Binance:", error);
    throw error;
  }
}

/**
 * Formats a price string to a standard currency format
 */
export function formatPrice(priceStr: string | number): string {
  const price = typeof priceStr === 'string' ? parseFloat(priceStr) : priceStr;
  
  if (isNaN(price)) return "$0.00";

  // Use more decimals for cheaper coins if needed, but 2 is standard for dashboard
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
}

/**
 * Formats a percentage change string
 */
export function formatPercentage(percentStr: string | number): string {
  const percent = typeof percentStr === 'string' ? parseFloat(percentStr) : percentStr;
  
  if (isNaN(percent)) return "0.00%";
  
  const formatted = Math.abs(percent).toFixed(2) + "%";
  return percent > 0 ? `+${formatted}` : `-${formatted}`;
}
