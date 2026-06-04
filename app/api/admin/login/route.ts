import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, createSession, loginAllowed, ADMIN_COOKIE, SESSION_MAX_AGE } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const SITE = 'https://cca.thevibe.works';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const fp = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();

  if (!(await loginAllowed(fp))) {
    return NextResponse.redirect(`${SITE}/admin/login?e=rate`, { status: 303 });
  }

  let password = '';
  const ct = req.headers.get('content-type') ?? '';
  try {
    if (ct.includes('application/json')) {
      password = String((await req.json()).password ?? '');
    } else {
      password = String((await req.formData()).get('password') ?? '');
    }
  } catch { /* ignore */ }

  if (!checkPassword(password)) {
    return NextResponse.redirect(`${SITE}/admin/login?e=1`, { status: 303 });
  }

  const token = await createSession();
  const res = NextResponse.redirect(`${SITE}/admin/stats`, { status: 303 });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
