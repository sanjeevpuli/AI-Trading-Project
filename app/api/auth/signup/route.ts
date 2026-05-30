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

    // Create user and a default portfolio in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      await tx.portfolio.create({
        data: {
          userId: newUser.id,
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
          equityCurve: JSON.stringify([{ time: new Date().toISOString().split("T")[0], value: 100000.0 }]),
        },
      });

      return newUser;
    });

    const token = signToken({ id: user.id, email: user.email });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });

    // Set token as an HttpOnly, secure, sameSite cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
