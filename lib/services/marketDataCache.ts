import { fetchHistoricalKlines } from "./binanceService";

type MarketPriceCache = {
  prices: Record<string, number>;
  lastUpdated: number;
};

const globalForMarket = globalThis as unknown as {
  marketCache: MarketPriceCache | undefined;
};

export const marketCache: MarketPriceCache = globalForMarket.marketCache ?? {
  prices: {},
  lastUpdated: 0,
};

if (process.env.NODE_ENV !== "production") {
  globalForMarket.marketCache = marketCache;
}

/**
 * Validates and updates the backend price cache.
 * If prices are too stale (e.g., > 10 seconds old) or missing, it fetches fresh prices from Binance REST.
 */
export async function getAuthoritativePrices(symbols: string[]): Promise<Record<string, number>> {
  const now = Date.now();
  
  if (symbols.length === 0) return marketCache.prices;

  // If cache is fresh, return it
  if (now - marketCache.lastUpdated < 10000) {
    const hasAll = symbols.every(s => marketCache.prices[s] !== undefined);
    if (hasAll) {
      return marketCache.prices;
    }
  }

  // Otherwise, fetch from Binance REST to validate/populate
  try {
    // Binance requires double quotes around the strings in the array e.g. ["BTCUSDT","ETHUSDT"]
    const query = encodeURIComponent(JSON.stringify(symbols));
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=${query}`;
    const response = await fetch(url, { cache: 'no-store' }); 
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          marketCache.prices[item.symbol] = parseFloat(item.price);
        });
        marketCache.lastUpdated = Date.now();
      }
    } else {
      console.warn(`[MarketCache] Binance REST failed: ${response.status}`);
    }
  } catch (error) {
    console.error("Failed to fetch authoritative prices from Binance:", error);
  }

  return marketCache.prices;
}

/**
 * Allows the engine tick to opportunistically update the cache,
 * but only if the prices seem reasonable (e.g. within 10% of existing cache if available).
 */
export function updateAuthoritativePrice(symbol: string, price: number) {
  const existing = marketCache.prices[symbol];
  
  if (existing) {
    const change = Math.abs(price - existing) / existing;
    if (change > 0.10) {
      console.warn(`[MarketCache] Rejected spoofed/erroneous price for ${symbol}: ${price} (was ${existing})`);
      return; 
    }
  }

  marketCache.prices[symbol] = price;
  marketCache.lastUpdated = Date.now();
}
