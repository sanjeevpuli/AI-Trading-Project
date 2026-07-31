"use client";

interface StreamMessage {
  stream: string;
  data: Record<string, string | number | boolean | Record<string, string | number | boolean>>;
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
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastMessageTime = 0;
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private backoffMs = 1000;

  private currentSymbols: string[] = [];

  // Candle price vectors for indicators (compiled from WebSocket stream)
  private candleHistory: Record<string, number[]> = {};

  constructor() {
    // Only initialization, connect is explicitly called later
  }

  public connect(symbols: string[]) {
    if (typeof window === "undefined" || typeof WebSocket === "undefined") {
      return;
    }

    const newSymbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Incremental subscription update without dropping connection
      const currentSet = new Set(this.currentSymbols);
      const newSet = new Set(newSymbols);

      const added = newSymbols.filter(s => !currentSet.has(s));
      const removed = this.currentSymbols.filter(s => !newSet.has(s));

      if (added.length > 0) {
        const addStreams = added.flatMap(s => [`${s.toLowerCase()}@ticker`, `${s.toLowerCase()}@kline_1m`]);
        this.socket.send(JSON.stringify({
          method: "SUBSCRIBE",
          params: addStreams,
          id: Date.now()
        }));
      }

      if (removed.length > 0) {
        const removeStreams = removed.flatMap(s => [`${s.toLowerCase()}@ticker`, `${s.toLowerCase()}@kline_1m`]);
        this.socket.send(JSON.stringify({
          method: "UNSUBSCRIBE",
          params: removeStreams,
          id: Date.now() + 1
        }));
      }

      this.currentSymbols = newSymbols;
      return;
    }

    // Connect from scratch
    this.currentSymbols = newSymbols;

    if (this.currentSymbols.length === 0) {
      this.setStatus("DISCONNECTED");
      return;
    }

    this.setStatus("CONNECTING");
    
    // Combined streams for initial connection
    const streamNames = this.currentSymbols.flatMap(s => [
      `${s.toLowerCase()}@ticker`,
      `${s.toLowerCase()}@kline_1m`
    ]);
    
    const streams = streamNames.join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.setStatus("CONNECTED");
        this.reconnectAttempts = 0;
        this.backoffMs = 1000;
        this.lastMessageTime = Date.now();
        console.log(`QuantAI: Connected to Binance WebSocket Streams for ${this.currentSymbols.length} assets.`);
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        this.lastMessageTime = Date.now();
        try {
          const payload: StreamMessage = JSON.parse(event.data);
          // Binance sends response payloads for SUBSCRIBE/UNSUBSCRIBE without stream fields
          if (payload.stream) {
            this.handleStreamMessage(payload);
          }
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
        this.stopHeartbeat();
        this.handleReconnect();
      };
    } catch (e) {
      console.error("QuantAI: Failed to initialize WebSocket:", e);
      this.setStatus("ERROR");
      this.handleReconnect();
    }
  }
  
  public disconnect() {
    if (this.socket) {
      this.socket.onclose = null;
      this.socket.close();
      this.socket = null;
    }
    this.stopHeartbeat();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.setStatus("DISCONNECTED");
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      // If no message received for 10 seconds, reconnect
      if (Date.now() - this.lastMessageTime > 10000) {
        console.warn("QuantAI: WebSocket heartbeat timeout. Reconnecting...");
        if (this.socket) {
          this.socket.close(); // Triggers onclose -> reconnect
        }
      }
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handleStreamMessage(msg: StreamMessage) {
    if (!msg || !msg.stream || !msg.data) return;
    
    const stream = msg.stream;
    const data = msg.data as unknown as Record<string, unknown>;

    // Handle ticker updates
    if (stream.endsWith("@ticker")) {
      const symbol = data.s as string; // e.g. BTCUSDT
      const lastPrice = parseFloat(data.c as string); // current close
      const changePercent = parseFloat(data.P as string); // percentage change
      
      this.tickerCallbacks.forEach((cb) => cb(symbol, lastPrice, changePercent));
    }

    // Handle kline updates
    if (stream.endsWith("@kline_1m")) {
      const symbol = data.s as string;
      const kline = data.k as Record<string, unknown>;
      const closePrice = parseFloat(kline.c as string);
      const isClosed = kline.x as boolean; // true if candle closed

      if (isClosed) {
        // Append price and keep history at max 100 elements to save space
        if (!this.candleHistory[symbol]) {
          this.candleHistory[symbol] = [];
        }
        const history = this.candleHistory[symbol];
        history.push(closePrice);
        if (history.length > 100) {
          history.shift();
        }
      }

      this.klineCallbacks.forEach((cb) =>
        cb(symbol, closePrice, isClosed, this.candleHistory[symbol] || [closePrice])
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
      this.connect(this.currentSymbols);
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
