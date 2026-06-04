import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Fetch Inter (has Cyrillic) from Google Fonts
async function loadFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  const url =
    weight === 700
      ? 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2'
      : 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyAIZhjp-Ek-_EeA.woff2';
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    return res.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'CCA Тренажер';
  const sub = searchParams.get('sub') ?? 'Підготовка до Claude Certified Architect Foundations';

  const [bold, regular] = await Promise.all([loadFont(700), loadFont(400)]);
  type FontDef = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };
  const fonts: FontDef[] = [];
  if (bold) fonts.push({ name: 'Inter', data: bold, weight: 700, style: 'normal' });
  if (regular) fonts.push({ name: 'Inter', data: regular, weight: 400, style: 'normal' });
  const fontFamily = fonts.length ? 'Inter' : 'sans-serif';

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
