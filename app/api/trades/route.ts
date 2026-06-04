import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST – write/upsert a trade record
export async function POST(request: Request) {
  try {
    const trade = await request.json();
    if (!trade?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }
    await prisma.trade.upsert({
      where: { id: trade.id },
      create: {
        id: trade.id,
        userId: trade.userId ?? "",
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
        fee: trade.fee,
        slippage: trade.slippage,
      },
      update: {
        exitPrice: trade.exitPrice,
        exitTime: new Date(trade.exitTime),
        exitReason: trade.exitReason,
        pnl: trade.pnl,
        pnlPercentage: trade.pnlPercentage,
        fee: trade.fee,
        slippage: trade.slippage,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/trades error:', error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

// GET – return mock trades data (read‑only)
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
