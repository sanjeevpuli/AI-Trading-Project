import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (min 6 characters) are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email." },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    // Create user and a default portfolio in a single atomic query
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        portfolios: {
          create: {
            totalValue: 100000.0,
            cash: 100000.0,
            unrealizedPnL: 0.0,
            realizedPnL: 0.0,
            winRate: 0.0,
            sharpeRatio: 0.0,
            maxDrawdown: 0.0,
            leverage: 1.0,
            exposure: 0.0,
            netBeta: 0.0,
            valueAtRisk: 0.0,
            equityCurve: [{ time: new Date().toISOString().split("T")[0], value: 100000.0 }],
          },
        },
      },
    });

    const token = signToken({ id: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = [
      `auth_token=${token}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${60 * 60 * 24 * 7}`,
      isProd ? "Secure" : "",
    ]
      .filter(Boolean)
      .join("; ");

    response.headers.append("Set-Cookie", cookieOptions);

    return response;
  } catch (error: unknown) {
    console.error("Signup error:", error instanceof Error ? error.message : error);
    const isTimeout = error instanceof Error && (error.message.includes("ETIMEDOUT") || error.message.includes("connect"));
    return NextResponse.json(
      { error: isTimeout ? "Database connection failed. Please try again later." : "Internal server error" },
      { status: isTimeout ? 503 : 500 }
    );
  }
}
