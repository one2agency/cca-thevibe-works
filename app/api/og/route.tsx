import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ogFonts, OG_FONT_FAMILY } from '@/lib/og-fonts';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'CCA Тренажер';
  const sub = searchParams.get('sub') ?? 'Підготовка до Claude Certified Architect Foundations';

  const fonts = await ogFonts();
  const fontFamily = OG_FONT_FAMILY;

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
