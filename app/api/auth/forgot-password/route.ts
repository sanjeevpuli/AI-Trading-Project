import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string = (body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Look up user — but NEVER reveal whether the email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Invalidate any existing unused tokens for this user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() }, // mark old tokens used so they can't be reused
      });

      // Generate a cryptographically secure token (32 bytes → 64 hex chars)
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt },
      });

      // Fire-and-forget — we swallow errors so response time stays constant
      sendPasswordResetEmail(user.email, token).catch((err) =>
        console.error("[forgot-password] email delivery error:", err)
      );
    }

    // Always return the same response to prevent email enumeration
    return NextResponse.json({
      message:
        "If an account exists for that email address, a reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password] unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
