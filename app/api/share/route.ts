/**
 * POST /api/share — створює підписаний токен картки.
 * Екзамен:  { score:number, nick?:string }
 * Практика: { kind:'practice', correct:number, total:number, scope?:string, nick?:string }
 * Повертає: { ok, token, url } або { ok:false, error }
 */
import { NextRequest, NextResponse } from 'next/server';
import { signBadge, tierForScore, sanitizeNick } from '@/lib/share';

function cleanScope(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[<>]/g, '').slice(0, 48).trim();
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 }); }

  const nick = sanitizeNick(body.nick);
  if (!nick.ok) return NextResponse.json({ ok: false, error: nick.error }, { status: 400 });

  let token: string;

  if (body.kind === 'practice') {
    const correct = Math.round(Number(body.correct));
    const total = Math.round(Number(body.total));
    if (!Number.isFinite(correct) || !Number.isFinite(total) || total < 1 || correct < 0 || correct > total) {
      return NextResponse.json({ ok: false, error: 'Невалідні дані практики' }, { status: 400 });
    }
    token = await signBadge({ kind: 'practice', correct, total, scope: cleanScope(body.scope), nick: nick.value, ts: Date.now() });
  } else {
    const score = Math.round(Number(body.score));
    if (!Number.isFinite(score) || score < 100 || score > 1000) {
      return NextResponse.json({ ok: false, error: 'Невалідний бал' }, { status: 400 });
    }
    const tier = tierForScore(score);
    token = await signBadge({ score, tier: tier.key, nick: nick.value, ts: Date.now() });
  }

  return NextResponse.json({ ok: true, token, url: `https://cca.thevibe.works/r/${token}` });
}
