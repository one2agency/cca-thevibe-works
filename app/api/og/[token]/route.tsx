import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { verifyBadge, tierForScore, flairForAccuracy, DISCLAIMER } from '@/lib/share';
import { ogFonts, OG_FONT_FAMILY } from '@/lib/og-fonts';

export const runtime = 'edge';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  const payload = await verifyBadge(token);
  if (!payload) return new Response('Not found', { status: 404 });

  const nick = (payload.nick || '').slice(0, 24);

  const fonts = await ogFonts();
  const ff = OG_FONT_FAMILY;

  const imgOpts = { width: 1200, height: 630, fonts, headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } } as const;

  // ── ПРАКТИКА: гейміфікований челендж (темний фон, «а ти?») ──
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
            <div style={{ fontWeight: 700, fontSize: 26, color: '#e0793f', letterSpacing: '-0.02em' }}>CCA</div>
            <div style={{ height: 1, flex: 1, background: 'rgba(243,236,224,0.25)' }} />
            <div style={{ fontSize: 13, color: '#cbb9a3', letterSpacing: '0.14em', textTransform: 'uppercase' }}>челендж · cca.thevibe.works</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            {nick ? <div style={{ fontSize: 28, color: '#cbb9a3', marginBottom: 4 }}>{nick} кидає виклик:</div> : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ fontSize: 104 }}>{flair.emoji}</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 92, fontWeight: 700, color: '#e0793f', lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 22, color: '#cbb9a3' }}>точність · {payload.correct}/{payload.total} правильних · {flair.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 30, color: '#f3ece0', marginTop: 22, fontWeight: 700 }}>
              {payload.scope ? `Практика: ${payload.scope}` : 'Практика CCA-F'} — а ти зможеш краще?
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#c2511f', color: '#fff', fontWeight: 700, fontSize: 16, padding: '9px 18px', borderRadius: 10 }}>Прийняти виклик →</div>
            <div style={{ fontSize: 16, color: '#cbb9a3' }}>cca.thevibe.works/trenazher</div>
          </div>
        </div>
      ),
      imgOpts,
    );
  }

  // ── ЕКЗАМЕН: грамота ──
  const tier = tierForScore(payload.score);
  const pass = payload.score >= 720;
  const accent = pass ? '#3f7d4e' : '#c2511f';

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        padding: '56px 64px', backgroundColor: '#f3ece0',
        backgroundImage: 'radial-gradient(600px 400px at 90% -5%, #f7eede 0%, transparent 60%), radial-gradient(500px 500px at -5% 110%, #efe3cf 0%, transparent 55%)',
        fontFamily: ff,
      }}>
        {/* top */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 26, color: '#c2511f', letterSpacing: '-0.02em' }}>CCA</div>
          <div style={{ height: 1, flex: 1, background: '#d8ccba' }} />
          <div style={{ fontSize: 13, color: '#5e5346', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            cca.thevibe.works
          </div>
        </div>

        {/* center */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
          {nick ? (
            <div style={{ fontSize: 28, color: '#5e5346', marginBottom: 6 }}>{nick} —</div>
          ) : null}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 96 }}>{tier.emoji}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 88, fontWeight: 700, color: accent, lineHeight: 1 }}>{payload.score}</div>
              <div style={{ fontSize: 22, color: '#5e5346' }}>scaled score · {tier.label}</div>
            </div>
          </div>
          <div style={{ fontSize: 26, color: '#231d16', marginTop: 20, fontWeight: 700 }}>
            {pass ? 'Прохідний результат на тренажері CCA-F' : 'Готуюсь до Claude Certified Architect'}
          </div>
        </div>

        {/* bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ background: '#c2511f', color: '#fff', fontWeight: 700, fontSize: 15, padding: '8px 16px', borderRadius: 10 }}>
              Спробуй сам →
            </div>
            <div style={{ fontSize: 16, color: '#9a3f18' }}>cca.thevibe.works/trenazher</div>
          </div>
          <div style={{ fontSize: 13, color: '#8a7d6a' }}>{DISCLAIMER}</div>
        </div>
      </div>
    ),
    {
      width: 1200, height: 630, fonts,
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
  );
}
