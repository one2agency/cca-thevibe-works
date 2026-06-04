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

  // DIAGNOSTIC minimal
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3ece0', fontFamily: ff }}>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#c2511f' }}>{payload.kind === 'practice' ? 'CHALLENGE TEST' : 'BADGE TEST'}</div>
      </div>
    ),
    opts,
  );
}
