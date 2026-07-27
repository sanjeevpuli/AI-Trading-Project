import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const positions = await prisma.position.findMany({
      where: { userId: user.id },
    });
    return NextResponse.json(positions);
  } catch (error) {
    console.error("GET /api/positions db error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const position = await request.json();
    if (!position?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.position.upsert({
      where: { id: position.id },
      create: {
        id: position.id,
        userId: user.id,
        symbol: position.symbol,
        type: position.type,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        amount: position.amount,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        timestamp: position.timestamp ? new Date(position.timestamp) : new Date(),
        pnl: position.pnl ?? 0,
        pnlPercentage: position.pnlPercentage ?? 0,
      },
      update: {
        currentPrice: position.currentPrice,
        amount: position.amount,
        stopLoss: position.stopLoss,
        takeProfit: position.takeProfit,
        pnl: position.pnl ?? 0,
        pnlPercentage: position.pnlPercentage ?? 0,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/positions error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing position id" }, { status: 400 });
  }

  try {
    const pos = await prisma.position.findFirst({
      where: { id, userId: user.id },
    });

    if (!pos) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    await prisma.position.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/positions error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}
