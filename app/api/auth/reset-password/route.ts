import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token: string = (body.token ?? "").trim();
    const password: string = body.password ?? "";

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Find token record
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    // Unified error — never reveal why the token is invalid
    const invalid = NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    );

    if (!record) return invalid;
    if (record.usedAt !== null) return invalid;           // already used
    if (record.expiresAt < new Date()) return invalid;    // expired

    // Hash new password and update user in a transaction
    const hashed = hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password: hashed },
      }),
      // Mark token as used so it cannot be reused
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: "Password updated successfully. You can now sign in." });
  } catch (err) {
    console.error("[reset-password] unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
