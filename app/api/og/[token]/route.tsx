import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { verifyBadge, tierForScore, flairForAccuracy, DISCLAIMER } from '@/lib/share';
import { ogFonts, OG_FONT_FAMILY } from '@/lib/og-fonts';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  try {
    return await render(params);
  } catch (err) {
    return new Response('OG_ERROR: ' + (err instanceof Error ? `${err.message}\n${err.stack}` : String(err)), { status: 500 });
  }
}

async function render(params: Promise<{ token: string }>): Promise<Response> {
  const { token } = await params;
  const payload = await verifyBadge(token);
  if (!payload) return new Response('Not found', { status: 404 });

  const nick = (payload.nick || '').slice(0, 24);
  const fonts = ogFonts();
  const ff = OG_FONT_FAMILY;
  const baseOpts = { width: 1200, height: 630, fonts, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } };

  // Кольоровий «seal»-кружок замість емодзі (Satori не має емодзі-гліфів у TTF)
  const seal = (bg: string, ring: string, label: string) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: 132, height: 132, borderRadius: 66, backgroundColor: ring, flex: '0 0 auto',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 116, height: 116, borderRadius: 58, backgroundColor: bg,
      }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.05 }}>{label}</div>
      </div>
    </div>
  );

  // ── ПРАКТИКА: гейміфікований челендж (темний фон) ──
  if (payload.kind === 'practice') {
    const pct = Math.round(payload.correct / payload.total * 100);
    const flair = flairForAccuracy(pct);
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          padding: '54px 64px', backgroundColor: '#231d16',
          backgroundImage: 'radial-gradient(700px 460px at 88% -10%, rgba(194,81,31,0.45) 0%, transparent 60%), radial-gradient(520px 520px at -8% 112%, rgba(194,81,31,0.22) 0%, transparent 55%)',
          fontFamily: ff, color: '#f3ece0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 26, color: '#e0793f' }}>CCA</div>
            <div style={{ height: 1, flex: 1, background: 'rgba(243,236,224,0.25)' }} />
            <div style={{ fontSize: 13, color: '#cbb9a3', letterSpacing: '0.14em', textTransform: 'uppercase' }}>челендж · cca.thevibe.works</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {nick ? <div style={{ fontSize: 28, color: '#cbb9a3', marginBottom: 6 }}>{nick} кидає виклик:</div> : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
              {seal('#c2511f', '#e0793f', flair.label)}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 96, fontWeight: 700, color: '#e0793f', lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 22, color: '#cbb9a3' }}>точність · {payload.correct}/{payload.total} правильних</div>
              </div>
            </div>
            <div style={{ fontSize: 30, color: '#f3ece0', marginTop: 24, fontWeight: 700 }}>
              {payload.scope ? `Практика: ${payload.scope}` : 'Практика CCA-F'} — а ти зможеш краще?
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#c2511f', color: '#fff', fontWeight: 700, fontSize: 16, padding: '9px 18px', borderRadius: 10 }}>Прийняти виклик →</div>
            <div style={{ fontSize: 16, color: '#cbb9a3' }}>cca.thevibe.works/trenazher</div>
          </div>
        </div>
      ),
      baseOpts,
    );
  }

  // ── ЕКЗАМЕН: грамота (paper) ──
  const tier = tierForScore(payload.score);
  const pass = payload.score >= 720;
  const accent = pass ? '#3f7d4e' : '#c2511f';
  const ring = pass ? '#5ca06b' : '#e0793f';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        padding: '56px 64px', backgroundColor: '#f3ece0',
        backgroundImage: 'radial-gradient(600px 400px at 90% -5%, #f7eede 0%, transparent 60%), radial-gradient(500px 500px at -5% 110%, #efe3cf 0%, transparent 55%)',
        fontFamily: ff,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 26, color: '#c2511f' }}>CCA</div>
          <div style={{ height: 1, flex: 1, background: '#d8ccba' }} />
          <div style={{ fontSize: 13, color: '#5e5346', letterSpacing: '0.12em', textTransform: 'uppercase' }}>cca.thevibe.works</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {nick ? <div style={{ fontSize: 28, color: '#5e5346', marginBottom: 6 }}>{nick} —</div> : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            {seal(accent, ring, tier.label)}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 92, fontWeight: 700, color: accent, lineHeight: 1 }}>{payload.score}</div>
              <div style={{ fontSize: 22, color: '#5e5346' }}>scaled score (100–1000)</div>
            </div>
          </div>
          <div style={{ fontSize: 28, color: '#231d16', marginTop: 24, fontWeight: 700 }}>
            {pass ? 'Прохідний результат на тренажері CCA-F' : 'Готуюсь до Claude Certified Architect'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#c2511f', color: '#fff', fontWeight: 700, fontSize: 15, padding: '8px 16px', borderRadius: 10 }}>Спробуй сам →</div>
            <div style={{ fontSize: 16, color: '#9a3f18' }}>cca.thevibe.works/trenazher</div>
          </div>
          <div style={{ fontSize: 13, color: '#8a7d6a' }}>{DISCLAIMER}</div>
        </div>
      </div>
    ),
    baseOpts,
  );
}
