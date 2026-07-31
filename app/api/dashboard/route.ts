import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [dbPortfolio, dbTrades, activePositions, dbWatchlist, dbMetrics] = await Promise.all([
      prisma.portfolio.findUnique({
        where: { userId: user.id },
      }),
      prisma.trade.findMany({
        where: { userId: user.id },
        orderBy: { exitTime: "desc" },
        take: 50,
      }),
      prisma.position.findMany({
        where: { userId: user.id },
      }),
      prisma.watchlist.findUnique({
        where: { userId: user.id },
      }),
      prisma.portfolioMetrics.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: "asc" },
        take: 100, // Fetch up to 100 historical data points
      })
    ]);

    return NextResponse.json({
      portfolio: dbPortfolio ? {
        balance: dbPortfolio.cash,
        startingBalance: 100000.0,
        unrealizedPnL: dbPortfolio.unrealizedPnL,
        realizedPnL: dbPortfolio.realizedPnL,
        netExposure: dbPortfolio.exposure,
        winRate: dbPortfolio.winRate,
        sharpeRatio: dbPortfolio.sharpeRatio,
        maxDrawdown: dbPortfolio.maxDrawdown,
        systemLeverage: dbPortfolio.leverage,
        timestamp: new Date().toISOString(),
      } : null,
      activePositions: activePositions.map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        type: pos.type,
        entryPrice: pos.entryPrice,
        currentPrice: pos.currentPrice,
        amount: pos.amount,
        pnl: pos.pnl,
        pnlPercentage: pos.pnlPercentage,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit,
        timestamp: pos.timestamp.toISOString(),
      })),
      executionHistory: dbTrades.map((t) => ({
        id: t.id,
        symbol: t.symbol,
        type: t.type,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        amount: t.amount,
        pnl: t.pnl,
        pnlPercentage: t.pnlPercentage,
        exitReason: t.exitReason,
        fee: t.fee,
        slippage: t.slippage,
        timestamp: t.exitTime.toISOString(),
      })),
      watchlist: dbWatchlist?.symbols || [],
      metrics: dbMetrics.map((m) => ({
        timestamp: m.timestamp.toISOString(),
        totalValue: m.totalValue,
        cash: m.cash,
        realizedPnL: m.realizedPnL,
        unrealizedPnL: m.unrealizedPnL,
        drawDown: m.drawDown,
      })),
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard DB error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
