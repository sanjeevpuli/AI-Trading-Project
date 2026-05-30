import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(_request: NextRequest) {
  // Clear the authentication cookie
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('auth_token');
  return response;
}
