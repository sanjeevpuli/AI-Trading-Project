import { NextResponse } from 'next/server';
export async function POST() {
  // Clear the authentication cookie
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.delete('auth_token');
  return response;
}
