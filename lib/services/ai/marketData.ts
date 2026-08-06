import { binanceWebsocketService, SocketStatus } from "../binanceService";

// Temporary mock for historical data since the original might be elsewhere
async function getHistoricalKlines(symbol: string, interval: string, limit: number) {
  const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch historical klines");
  return await res.json();
}

export interface MarketDataCallback {
  onTick: (symbol: string, price: number, changePercent: number) => void;
  onCandleClose: (symbol: string, closePrice: number, isClosed: boolean, historyPrices: number[]) => void;
  onStatusChange: (status: SocketStatus) => void;
}

/**
 * Market Data Agent
 * Owns all exchange WebSocket subscriptions, historical candle loading,
 * and market state caching. Exposes a clean interface for other agents.
 */
class MarketDataAgent {
  private activeSymbols: string[] = [];

  private unsubStatus: (() => void) | null = null;
  private unsubTicker: (() => void) | null = null;
  private unsubKline: (() => void) | null = null;

  public initialize(symbols: string[], callbacks: MarketDataCallback) {
    this.activeSymbols = symbols;

    this.unsubStatus = binanceWebsocketService.onStatusChange(callbacks.onStatusChange);
    this.unsubTicker = binanceWebsocketService.onTickerUpdate(callbacks.onTick);
    this.unsubKline = binanceWebsocketService.onKlineUpdate(callbacks.onCandleClose);

    binanceWebsocketService.connect(symbols);
  }

  public shutdown() {
    if (this.unsubStatus) this.unsubStatus();
    if (this.unsubTicker) this.unsubTicker();
    if (this.unsubKline) this.unsubKline();
    binanceWebsocketService.disconnect();
  }

  public async fetchHistoricalCandles(symbol: string): Promise<number[]> {
    try {
      const data = await getHistoricalKlines(symbol, "1h", 100);
      return data.map((d: any[]) => parseFloat(d[4]));
    } catch (error) {
      console.error(`MarketDataAgent: Failed to fetch historical data for ${symbol}`, error);
      return [];
    }
  }

  public subscribe(symbol: string) {
    if (!this.activeSymbols.includes(symbol)) {
      this.activeSymbols.push(symbol);
      binanceWebsocketService.connect(this.activeSymbols);
    }
  }

  public unsubscribe(symbol: string) {
    this.activeSymbols = this.activeSymbols.filter(s => s !== symbol);
    binanceWebsocketService.connect(this.activeSymbols);
  }
}

export const marketDataAgent = new MarketDataAgent();
