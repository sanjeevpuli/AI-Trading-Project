import { NextResponse } from "next/server";

export async function GET() {
  // Return simulated server representation of the live WebSocket pricing feed
  const marketState = {
    connection: "CONNECTED",
    provider: "Binance WebSocket Streams",
    latency: "14ms",
    symbols: [
      { symbol: "BTCUSDT", asset: "BTC", price: 68210.00, changePercent: 0.8 },
      { symbol: "ETHUSDT", asset: "ETH", price: 3850.50, changePercent: 1.5 },
      { symbol: "SOLUSDT", asset: "SOL", price: 164.20, changePercent: -1.2 },
    ],
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(marketState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
