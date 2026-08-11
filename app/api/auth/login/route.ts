import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("LOGIN ROUTE HIT");
    const { email, password } = await request.json();
    console.log("LOGIN ROUTE — email:", email);

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("LOGIN ROUTE — user:", user ? "found" : "NOT found");

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const valid = await comparePassword(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Sign JWT
    const token = signToken({ id: user.id, email: user.email });

    const response = NextResponse.json({ message: 'Logged in', user: { id: user.id, email: user.email } });
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

    console.log("LOGIN ROUTE — success");
    return response;
  } catch (error: unknown) {
    console.error("LOGIN ROUTE ERROR:", error instanceof Error ? error.message : error);
    const isTimeout = error instanceof Error && (error.message.includes("ETIMEDOUT") || error.message.includes("connect"));
    return NextResponse.json(
      { error: isTimeout ? "Database connection failed. Please try again later." : "Internal server error" },
      { status: 503 }
    );
  }
}

