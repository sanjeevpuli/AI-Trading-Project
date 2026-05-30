import { NextResponse } from "next/server";

export async function GET() {
  const tradesState = {
    activePositions: [
      {
        id: "POS-BTC-1",
        symbol: "BTCUSDT",
        type: "LONG",
        entryPrice: 67920.0,
        currentPrice: 68210.0,
        amount: 0.25,
        pnl: 72.5,
        pnlPercentage: 0.43,
        timestamp: new Date().toISOString(),
      },
    ],
    executionHistory: [
      {
        id: "TRD-MOCK-1",
        symbol: "BTCUSDT",
        type: "LONG",
        entryPrice: 67120.5,
        exitPrice: 68420.0,
        amount: 0.5,
        pnl: 649.75,
        pnlPercentage: 1.93,
        exitReason: "TAKE_PROFIT",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  };

  return NextResponse.json(tradesState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
