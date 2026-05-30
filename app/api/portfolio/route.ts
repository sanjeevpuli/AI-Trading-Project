import { NextResponse } from "next/server";

export async function GET() {
  const portfolioState = {
    balance: 100000.0,
    startingBalance: 100000.0,
    unrealizedPnL: 586.20,
    realizedPnL: 797.35,
    netExposure: "42.50%",
    winRate: "75.0%",
    sharpeRatio: 1.95,
    maxDrawdown: "3.85%",
    systemLeverage: "0.85x",
    marginLevel: "Healthy",
    maintenanceMarginRequired: "10.0%",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(portfolioState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
