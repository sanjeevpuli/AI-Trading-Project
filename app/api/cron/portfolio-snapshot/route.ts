import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { calculatePortfolioStats } from "@/lib/services/portfolioService";

export async function GET(request: NextRequest) {
  // Check authorization header for a cron secret (if in production)
  const authHeader = request.headers.get("authorization");
  const CRON_SECRET = process.env.CRON_SECRET || "development-secret";
  
  if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // We fetch all users and their data.
    // In a real massive-scale production app this would need chunking or a queue worker.
    const users = await prisma.user.findMany({
      include: {
        portfolios: true,
        positions: true,
        trades: true,
      }
    });

    let snapshotCount = 0;

    for (const user of users) {
      if (!user.portfolios) continue;

      const balance = user.portfolios.cash;
      const positions = user.positions.map(p => ({
        id: p.id,
        symbol: p.symbol,
        type: p.type as "LONG" | "SHORT",
        entryPrice: p.entryPrice,
        currentPrice: p.currentPrice,
        amount: p.amount,
        pnl: p.pnl,
        pnlPercentage: p.pnlPercentage,
        timestamp: p.timestamp.toISOString(),
      }));
      const history = user.trades.map(t => ({
        id: t.id,
        userId: t.userId,
        symbol: t.symbol,
        type: t.type as "LONG" | "SHORT",
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        amount: t.amount,
        pnl: t.pnl,
        pnlPercentage: t.pnlPercentage,
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime.toISOString(),
        exitReason: t.exitReason as "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT" | "LIQUIDATION",
        fee: t.fee,
        slippage: t.slippage,
      }));

      const stats = calculatePortfolioStats(balance, positions, history);

      await prisma.portfolioMetrics.create({
        data: {
          userId: user.id,
          totalValue: stats.totalValue,
          cash: balance,
          realizedPnL: stats.realizedPnL,
          unrealizedPnL: stats.unrealizedPnL,
          drawDown: stats.maxDrawdown, // Note: maxDrawdown is peak-to-trough, not current drawdown
        }
      });
      snapshotCount++;
    }

    return NextResponse.json({ ok: true, snapshotCount });
  } catch (error) {
    console.error("Cron Portfolio Snapshot Error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
