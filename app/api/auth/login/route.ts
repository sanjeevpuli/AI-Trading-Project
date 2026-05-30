import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
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

  // Set HttpOnly cookie
  const response = NextResponse.json({ message: 'Logged in' });
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}
