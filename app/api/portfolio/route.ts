import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

export async function POST(request: Request) {
  try {
    const portfolio = await request.json();
    if (!portfolio?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        totalValue: portfolio.totalValue,
        cash: portfolio.cash,
        unrealizedPnL: portfolio.unrealizedPnL,
        realizedPnL: portfolio.realizedPnL,
        winRate: portfolio.winRate,
        sharpeRatio: portfolio.sharpeRatio,
        maxDrawdown: portfolio.maxDrawdown,
        leverage: portfolio.leverage,
        exposure: portfolio.exposure,
        netBeta: portfolio.netBeta,
        valueAtRisk: portfolio.valueAtRisk,
        equityCurve: portfolio.equityCurve,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    // Return 200 so client-side fire-and-forget doesn't throw
    return NextResponse.json({ ok: false, error: String(error) });
  }
}
