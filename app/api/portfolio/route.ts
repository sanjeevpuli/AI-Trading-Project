import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  
  const defaultPortfolio = {
    balance: 100000.0,
    startingBalance: 100000.0,
    unrealizedPnL: 0.0,
    realizedPnL: 0.0,
    netExposure: "0.0%",
    winRate: "0.0%",
    sharpeRatio: 0.0,
    maxDrawdown: "0.0%",
    systemLeverage: "1.00x",
    marginLevel: "Healthy",
    maintenanceMarginRequired: "10.0%",
    timestamp: new Date().toISOString(),
  };

  if (!user) {
    return NextResponse.json(defaultPortfolio, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  try {
    const dbPortfolio = await prisma.portfolio.findUnique({
      where: { userId: user.id },
    });

    if (dbPortfolio) {
      return NextResponse.json({
        balance: dbPortfolio.cash,
        startingBalance: 100000.0,
        unrealizedPnL: dbPortfolio.unrealizedPnL,
        realizedPnL: dbPortfolio.realizedPnL,
        netExposure: `${(dbPortfolio.exposure * 100).toFixed(2)}%`,
        winRate: `${dbPortfolio.winRate.toFixed(1)}%`,
        sharpeRatio: dbPortfolio.sharpeRatio,
        maxDrawdown: `${dbPortfolio.maxDrawdown.toFixed(2)}%`,
        systemLeverage: `${dbPortfolio.leverage.toFixed(2)}x`,
        marginLevel: "Healthy",
        maintenanceMarginRequired: "10.0%",
        timestamp: new Date().toISOString(),
      }, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  } catch (error) {
    console.error("GET /api/portfolio db error, using default fallback:", error);
  }

  return NextResponse.json(defaultPortfolio, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const portfolio = await request.json();
    if (!portfolio) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.portfolio.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        totalValue: portfolio.totalValue ?? 100000.0,
        cash: portfolio.cash ?? 100000.0,
        unrealizedPnL: portfolio.unrealizedPnL ?? 0.0,
        realizedPnL: portfolio.realizedPnL ?? 0.0,
        winRate: portfolio.winRate ?? 0.0,
        sharpeRatio: portfolio.sharpeRatio ?? 0.0,
        maxDrawdown: portfolio.maxDrawdown ?? 0.0,
        leverage: portfolio.leverage ?? 1.0,
        exposure: portfolio.exposure ?? 0.0,
        netBeta: portfolio.netBeta ?? 0.0,
        valueAtRisk: portfolio.valueAtRisk ?? 0.0,
        equityCurve: portfolio.equityCurve ?? "[]",
      },
      update: {
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
