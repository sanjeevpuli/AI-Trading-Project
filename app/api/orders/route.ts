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

import { placeOrder } from "@/lib/services/backendTradingEngine";

// POST – Execute a market order or create a pending limit order
export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate order inputs
    if (!body.symbol || !body.type || !body.orderType || !body.amount || !body.price) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    const result = await placeOrder(user.id, {
      symbol: body.symbol,
      type: body.type,
      orderType: body.orderType,
      amount: Number(body.amount),
      price: Number(body.price),
      stopLoss: body.stopLoss ? Number(body.stopLoss) : undefined,
      takeProfit: body.takeProfit ? Number(body.takeProfit) : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 400 });
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
