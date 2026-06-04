/**
 * POST /api/leaderboard — додати запис у лідерборд (лише повний екзамен).
 * Body: { score, nick, session_id }. Нік санітизується. Без ПД.
 */
import { NextRequest, NextResponse } from 'next/server';
import { addLeaderboard, notDuplicate } from '@/lib/store';
import { sanitizeNick } from '@/lib/share';

const BOT_UA = /bot|crawl|spider|slurp|headless|python-requests|curl|wget/i;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return NextResponse.json({ ok: true, skipped: 'bot' });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const score = Math.round(Number(body.score));
  if (!Number.isFinite(score) || score < 100 || score > 1000) {
    return NextResponse.json({ ok: false, error: 'Невалідний бал' }, { status: 400 });
  }

  const nick = sanitizeNick(body.nick);
  if (!nick.ok || !nick.value) {
    return NextResponse.json({ ok: false, error: nick.error ?? 'Потрібен нікнейм' }, { status: 400 });
  }

  const session = String(body.session_id ?? 'anon').slice(0, 64);
  // один запис на сесію у вікні 30с (захист від подвійного кліку)
  if (!(await notDuplicate(`lb:${session}`, 30))) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  try { await addLeaderboard(nick.value, score); } catch (e) { console.error('[leaderboard]', e); return NextResponse.json({ ok: false }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
