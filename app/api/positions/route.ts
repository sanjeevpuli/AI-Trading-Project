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

import { closePosition } from "@/lib/services/backendTradingEngine";

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Missing position id" }, { status: 400 });
    }

    // Only allow updating stopLoss and takeProfit
    const position = await prisma.position.update({
      where: { id: body.id, userId: user.id },
      data: {
        stopLoss: body.stopLoss !== undefined ? Number(body.stopLoss) : null,
        takeProfit: body.takeProfit !== undefined ? Number(body.takeProfit) : null,
      },
    });

    return NextResponse.json({ ok: true, position });
  } catch (error: any) {
    console.error("POST /api/positions error:", error);
    return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const reason = searchParams.get("reason") || "MANUAL";

  if (!id) {
    return NextResponse.json({ error: "Missing position id" }, { status: 400 });
  }

  try {
    const result = await closePosition(user.id, id, undefined, reason as any);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("DELETE /api/positions error:", error);
    return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 400 });
  }
}
