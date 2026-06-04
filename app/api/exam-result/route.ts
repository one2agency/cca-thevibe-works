/**
 * POST /api/exam-result — анонімні лічильники по питаннях (для «найважчих питань»).
 * Викликається на завершення ПОВНОГО екзамену. Без ПД.
 * Body: { results: [{id, correct}], session_id }
 */
import { NextRequest, NextResponse } from 'next/server';
import { bumpQuestionStats, notDuplicate } from '@/lib/store';

const BOT_UA = /bot|crawl|spider|slurp|headless|python-requests|curl|wget/i;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (BOT_UA.test(req.headers.get('user-agent') ?? '')) return NextResponse.json({ ok: true, skipped: 'bot' });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const results = body.results;
  if (!Array.isArray(results) || results.length < 30 || results.length > 60) {
    // лише повний екзамен (≈60 питань); відсікаємо практику/сміття
    return NextResponse.json({ ok: false, error: 'not a full exam' }, { status: 400 });
  }

  const session = String(body.session_id ?? 'anon').slice(0, 64);
  // дедуп: один запис на завершення (вікно 30с на сесію)
  if (!(await notDuplicate(`examresult:${session}`, 30))) {
    return NextResponse.json({ ok: true, deduped: true });
  }

  const clean = results
    .filter((x): x is { id: string; correct: boolean } => x && typeof x.id === 'string' && typeof x.correct === 'boolean')
    .map(x => ({ id: x.id.slice(0, 16), correct: x.correct }));

  try { await bumpQuestionStats(clean); } catch (e) { console.error('[exam-result]', e); }
  return NextResponse.json({ ok: true, counted: clean.length });
}
