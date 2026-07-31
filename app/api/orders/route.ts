import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET – return user's pending limit orders from DB
export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET /api/orders db error:", error);
    return NextResponse.json([]);
  }
}

// POST – write/upsert an order record
export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const order = await request.json();
    if (!order?.id) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        userId: user.id,
        symbol: order.symbol,
        type: order.type,
        orderType: order.orderType,
        status: order.status,
        amount: order.amount,
        price: order.price,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
      },
      update: {
        status: order.status,
        amount: order.amount,
        price: order.price,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}

// DELETE – delete an order record (e.g., when canceled or filled and we don't want to keep it in this table)
export async function DELETE(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/orders error:", error);
    return NextResponse.json({ ok: false, error: String(error) });
  }
}
