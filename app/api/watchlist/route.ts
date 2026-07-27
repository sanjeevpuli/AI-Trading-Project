import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const watchlist = await prisma.watchlist.findUnique({
      where: { userId: user.id },
    });
    return NextResponse.json(watchlist?.symbols || []);
  } catch (error) {
    console.error("GET /api/watchlist db error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const symbols = body?.symbols;

    if (!Array.isArray(symbols)) {
      return NextResponse.json({ error: "Symbols must be an array of strings" }, { status: 400 });
    }

    await prisma.watchlist.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        symbols,
      },
      update: {
        symbols,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/watchlist error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}
