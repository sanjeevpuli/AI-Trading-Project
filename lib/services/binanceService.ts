"use client";

interface StreamMessage {
  stream: string;
  data: any;
}

export type SocketStatus = "CONNECTING" | "CONNECTED" | "DISCONNECTED" | "ERROR";

type TickerCallback = (symbol: string, price: number, changePercent: number) => void;
type KlineCallback = (symbol: string, closePrice: number, isClosed: boolean, prices: number[]) => void;

class BinanceWebsocketService {
  private socket: WebSocket | null = null;
  private status: SocketStatus = "DISCONNECTED";
  private statusCallbacks: Set<(status: SocketStatus) => void> = new Set();
  private tickerCallbacks: Set<TickerCallback> = new Set();
  private klineCallbacks: Set<KlineCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private backoffMs = 1000;

  // Candle price vectors for indicators (compiled from WebSocket stream)
  private candleHistory: Record<string, number[]> = {
    BTCUSDT: Array.from({ length: 60 }, (_, i) => 67000 + Math.sin(i) * 300), // Pre-seeded
    ETHUSDT: Array.from({ length: 60 }, (_, i) => 3800 + Math.sin(i) * 20),
    SOLUSDT: Array.from({ length: 60 }, (_, i) => 160 + Math.sin(i) * 2),
  };

  constructor() {
    // Proactive checking for browser context
    if (typeof window !== "undefined" && typeof WebSocket !== "undefined") {
      this.connect();
    }
  }

  public connect() {
    if (this.socket) {
      this.socket.close();
    }

    this.setStatus("CONNECTING");
    
    // Combined streams: ticker (for 24h ticker stat ticks) and kline_1m (for high-fidelity technical indicator candles)
    const streams = [
      "btcusdt@ticker",
      "ethusdt@ticker",
      "solusdt@ticker",
      "btcusdt@kline_1m",
      "ethusdt@kline_1m",
      "solusdt@kline_1m",
    ].join("/");

    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.setStatus("CONNECTED");
        this.reconnectAttempts = 0;
        this.backoffMs = 1000;
        console.log("QuantAI: Connected to Binance WebSocket Stream.");
      };

      this.socket.onmessage = (event) => {
        try {
          const payload: StreamMessage = JSON.parse(event.data);
          this.handleStreamMessage(payload);
        } catch (err) {
          console.error("QuantAI: Error parsing socket frame:", err);
        }
      };

      this.socket.onerror = (err) => {
        console.error("QuantAI: WebSocket error occurred:", err);
        this.setStatus("ERROR");
      };

      this.socket.onclose = () => {
        this.setStatus("DISCONNECTED");
        this.socket = null;
        this.handleReconnect();
      };
    } catch (e) {
      console.error("QuantAI: Failed to initialize WebSocket:", e);
      this.setStatus("ERROR");
      this.handleReconnect();
    }
  }

  private handleStreamMessage(msg: StreamMessage) {
    const { stream, data } = msg;

    // Handle ticker updates
    if (stream.endsWith("@ticker")) {
      const symbol = data.s; // e.g. BTCUSDT
      const lastPrice = parseFloat(data.c); // current close
      const changePercent = parseFloat(data.P); // percentage change
      
      this.tickerCallbacks.forEach((cb) => cb(symbol, lastPrice, changePercent));
    }

    // Handle kline updates
    if (stream.endsWith("@kline_1m")) {
      const symbol = data.s;
      const kline = data.k;
      const closePrice = parseFloat(kline.c);
      const isClosed = kline.x; // true if candle closed

      if (isClosed) {
        // Append price and keep history at max 100 elements to save space
        const history = this.candleHistory[symbol] || [];
        history.push(closePrice);
        if (history.length > 100) {
          history.shift();
        }
        this.candleHistory[symbol] = history;
      }

      this.klineCallbacks.forEach((cb) =>
        cb(symbol, closePrice, isClosed, this.candleHistory[symbol] || [])
      );
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn("QuantAI: Max WebSocket reconnection attempts reached. Falling back.");
      return;
    }

    if (this.reconnectTimeout) return;

    this.reconnectAttempts++;
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      console.log(`QuantAI: Reconnecting to websocket (Attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, this.backoffMs);

    // Exponential Backoff
    this.backoffMs *= 2;
  }

  private setStatus(newStatus: SocketStatus) {
    this.status = newStatus;
    this.statusCallbacks.forEach((cb) => cb(newStatus));
  }

  // Event Subscription methods
  public onStatusChange(callback: (status: SocketStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    callback(this.status);
    return () => this.statusCallbacks.delete(callback);
  }

  public onTickerUpdate(callback: TickerCallback): () => void {
    this.tickerCallbacks.add(callback);
    return () => this.tickerCallbacks.delete(callback);
  }

  public onKlineUpdate(callback: KlineCallback): () => void {
    this.klineCallbacks.add(callback);
    return () => this.klineCallbacks.delete(callback);
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public getHistory(symbol: string): number[] {
    return this.candleHistory[symbol] || [];
  }
}

// Export single shared instance for browser compatibility
export const binanceWebsocketService = new BinanceWebsocketService();
