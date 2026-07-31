import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const metrics = await prisma.portfolioMetrics.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "asc" },
      // Optional: limit to last 30 days or similar
    });

    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GET /api/portfolio/metrics error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body) {
      return NextResponse.json({ ok: false, error: "Empty body" }, { status: 400 });
    }

    const { totalValue, cash, realizedPnL, unrealizedPnL, drawDown } = body;

    const metric = await prisma.portfolioMetrics.create({
      data: {
        userId: user.id,
        totalValue: totalValue ?? 0,
        cash: cash ?? 0,
        realizedPnL: realizedPnL ?? 0,
        unrealizedPnL: unrealizedPnL ?? 0,
        drawDown: drawDown ?? 0,
      }
    });

    return NextResponse.json({ ok: true, metric });
  } catch (error) {
    console.error("POST /api/portfolio/metrics error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
