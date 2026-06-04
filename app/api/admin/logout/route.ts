import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const res = NextResponse.redirect('https://cca.thevibe.works/admin/login', { status: 303 });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  return res;
}
