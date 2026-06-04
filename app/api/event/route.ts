/**
 * POST /api/event — збір анонімних подій та спроб.
 * Антибот-гігієна: дедуплікація у вікні + ігнор очевидних ботів за UA.
 */
import { NextRequest, NextResponse } from 'next/server';
import { logEvent, logAttempt, notDuplicate, type AttemptRow } from '@/lib/store';

const BOT_UA = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|python-requests|curl|wget/i;

const ALLOWED_EVENTS = new Set([
  'exam_completed',
  'share_created',
  'share_clicked',
  'telegram_clicked',
  'page_view',
]);

function clampStr(v: unknown, max = 120): string | undefined {
  if (typeof v !== 'string') return undefined;
  return v.slice(0, max);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Ігнор очевидних ботів
  const ua = req.headers.get('user-agent') ?? '';
  if (BOT_UA.test(ua)) return NextResponse.json({ ok: true, skipped: 'bot' });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const type = String(body.type ?? '');
  if (!ALLOWED_EVENTS.has(type)) return NextResponse.json({ ok: false, error: 'bad type' }, { status: 400 });

  const sessionId = clampStr(body.session_id, 64);
  const ts = Date.now();

  // Дедуплікація: однакова подія від тієї ж сесії у короткому вікні
  const dedupKey = `${type}:${sessionId ?? 'anon'}:${JSON.stringify(body.meta ?? {})}`.slice(0, 200);
  const fresh = await notDuplicate(dedupKey, 8);
  if (!fresh) return NextResponse.json({ ok: true, deduped: true });

  try {
    // exam_completed також пишемо як attempt (для статистики балів/доменів)
    if (type === 'exam_completed') {
      const meta = (body.meta ?? {}) as Record<string, unknown>;
      const attempt: AttemptRow = {
        session_id: sessionId ?? 'anon',
        mode: meta.mode === 'practice' ? 'practice' : 'exam',
        score: Number(meta.score ?? 0),
        domain_breakdown: (meta.domain_breakdown as AttemptRow['domain_breakdown']) ?? {},
        completed_at: ts,
        referrer: clampStr(meta.referrer),
        utm_source: clampStr(meta.utm_source),
        utm_medium: clampStr(meta.utm_medium),
        utm_campaign: clampStr(meta.utm_campaign),
      };
      await logAttempt(attempt);
    }

    await logEvent({
      type,
      session_id: sessionId,
      ts,
      meta: (body.meta as Record<string, unknown>) ?? {},
    });
  } catch (err) {
    console.error('[api/event]', err);
    // Не валимо клієнт — подія втрачена, але UX не страждає
  }

  return NextResponse.json({ ok: true });
}
