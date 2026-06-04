import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ogFonts, OG_FONT_FAMILY } from '@/lib/og-fonts';
import { verifyBadge, tierForScore, flairForAccuracy, DISCLAIMER } from '@/lib/share';

export const runtime = 'nodejs';

const IMMUTABLE = { 'Cache-Control': 'public, max-age=31536000, immutable' };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const fonts = ogFonts();
  const fontFamily = OG_FONT_FAMILY;

  // ── Бейдж/челендж за підписаним токеном ──
  if (token) {
    const badge = await renderBadge(token, fonts, fontFamily);
    if (badge) return badge;
    // невалідний токен → впаде на дефолтну картку нижче
  }

  const title = searchParams.get('title') ?? 'CCA Тренажер';
  const sub = searchParams.get('sub') ?? 'Підготовка до Claude Certified Architect Foundations';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '56px 64px',
          backgroundColor: '#f3ece0',
          backgroundImage:
            'radial-gradient(600px 400px at 90% -5%, #f7eede 0%, transparent 60%), radial-gradient(500px 500px at -5% 110%, #efe3cf 0%, transparent 55%)',
          fontFamily,
        }}
      >
        {/* Top accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 'auto' }}>
          <div
            style={{
              fontFamily,
              fontWeight: 700,
              fontSize: 26,
              color: '#c2511f',
              letterSpacing: '-0.02em',
            }}
          >
            CCA
          </div>
          <div
            style={{
              height: 1,
              flex: 1,
              background: '#d8ccba',
            }}
          />
          <div
            style={{
              fontFamily,
              fontSize: 13,
              color: '#5e5346',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            cca.thevibe.works
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontFamily,
            fontWeight: 700,
            fontSize: title.length > 40 ? 42 : 52,
            color: '#231d16',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily,
            fontWeight: 400,
            fontSize: 22,
            color: '#5e5346',
            lineHeight: 1.4,
            marginBottom: 36,
          }}
        >
          {sub}
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              background: '#c2511f',
              color: '#fff',
              fontFamily,
              fontWeight: 700,
              fontSize: 15,
              padding: '8px 18px',
              borderRadius: 10,
              letterSpacing: '0.02em',
            }}
          >
            Тренажер CCA-F
          </div>
          <div style={{ fontSize: 15, color: '#9a3f18', fontFamily }}>
            96 питань · 5 доменів · Безкоштовно
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}

// ── Рендер бейджа/челенджу за токеном ──
type OgFontArr = Awaited<ReturnType<typeof ogFonts>>;

async function renderBadge(token: string, fonts: OgFontArr, ff: string): Promise<Response | null> {
  const payload = await verifyBadge(token);
  if (!payload) return null;

  const nick = (payload.nick || '').slice(0, 24);
  const opts = { width: 1200, height: 630, fonts, headers: IMMUTABLE };

  const seal = (bg: string, ring: string, label: string) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 132, height: 132, borderRadius: 66, backgroundColor: ring }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 116, height: 116, borderRadius: 58, backgroundColor: bg }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{label}</div>
      </div>
    </div>
  );

  if (payload.kind === 'practice') {
    const pct = Math.round(payload.correct / payload.total * 100);
    const flair = flairForAccuracy(pct);
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '54px 64px', backgroundColor: '#231d16', fontFamily: ff, color: '#f3ece0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 26, color: '#e0793f' }}>CCA</div>
            <div style={{ height: 1, flex: 1, background: 'rgba(243,236,224,0.25)' }} />
            <div style={{ fontSize: 13, color: '#cbb9a3' }}>ЧЕЛЕНДЖ · cca.thevibe.works</div>
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
      opts,
    );
  }

  const tier = tierForScore(payload.score);
  const pass = payload.score >= 720;
  const accent = pass ? '#3f7d4e' : '#c2511f';
  const ring = pass ? '#5ca06b' : '#e0793f';
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '56px 64px', backgroundColor: '#f3ece0', fontFamily: ff }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 26, color: '#c2511f' }}>CCA</div>
          <div style={{ height: 1, flex: 1, background: '#d8ccba' }} />
          <div style={{ fontSize: 13, color: '#5e5346' }}>cca.thevibe.works</div>
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
    opts,
  );
}
