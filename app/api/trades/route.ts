import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST – write/upsert a trade record
export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trade = await request.json();
    if (!trade?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await prisma.trade.upsert({
      where: { id: trade.id },
      create: {
        id: trade.id,
        userId: user.id,
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        amount: trade.amount,
        pnl: trade.pnl,
        pnlPercentage: trade.pnlPercentage,
        entryTime: new Date(trade.entryTime),
        exitTime: new Date(trade.exitTime),
        exitReason: trade.exitReason,
        fee: trade.fee ?? 0.0,
        slippage: trade.slippage ?? 0.0,
      },
      update: {
        exitPrice: trade.exitPrice,
        exitTime: new Date(trade.exitTime),
        exitReason: trade.exitReason,
        pnl: trade.pnl,
        pnlPercentage: trade.pnlPercentage,
        fee: trade.fee ?? 0.0,
        slippage: trade.slippage ?? 0.0,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/trades error:', error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

// GET – return user's trades from DB, or fallback to default
export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  
  const defaultTradesState = {
    activePositions: [],
    executionHistory: [],
  };

  if (!user) {
    return NextResponse.json(defaultTradesState, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  try {
    const dbTrades = await prisma.trade.findMany({
      where: { userId: user.id },
      orderBy: { exitTime: "desc" },
    });

    const activePositions = await prisma.position.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      activePositions: activePositions.map((pos) => ({
        id: pos.id,
        symbol: pos.symbol,
        type: pos.type,
        entryPrice: pos.entryPrice,
        currentPrice: pos.currentPrice,
        amount: pos.amount,
        pnl: pos.pnl,
        pnlPercentage: pos.pnlPercentage,
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
        timestamp: t.exitTime.toISOString(),
      })),
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GET /api/trades DB error, returning empty list:", error);
  }

  return NextResponse.json(defaultTradesState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
