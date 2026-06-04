/**
 * POST /api/share — створює підписаний токен бейджа.
 * Body: { score:number, nick?:string }
 * Повертає: { ok, token, url } або { ok:false, error }
 * Підпис через SHARE_SECRET (серверно). Нік санітизується тут.
 */
import { NextRequest, NextResponse } from 'next/server';
import { signBadge, tierForScore, sanitizeNick } from '@/lib/share';

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 }); }

  const score = Math.round(Number(body.score));
  if (!Number.isFinite(score) || score < 100 || score > 1000) {
    return NextResponse.json({ ok: false, error: 'Невалідний бал' }, { status: 400 });
  }

  const nick = sanitizeNick(body.nick);
  if (!nick.ok) {
    return NextResponse.json({ ok: false, error: nick.error }, { status: 400 });
  }

  const tier = tierForScore(score);
  const token = await signBadge({ score, tier: tier.key, nick: nick.value, ts: Date.now() });
  const url = `https://cca.thevibe.works/r/${token}`;

  return NextResponse.json({ ok: true, token, url });
}
