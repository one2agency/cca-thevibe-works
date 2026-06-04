import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { verifyBadge, tierForScore, DISCLAIMER } from '@/lib/share';

export const runtime = 'edge';

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  const url = weight === 700
    ? 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2'
    : 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyAIZhjp-Ek-_EeA.woff2';
  try {
    const r = await fetch(url, { next: { revalidate: 86400 } });
    return r.ok ? r.arrayBuffer() : null;
  } catch { return null; }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  const payload = await verifyBadge(token);
  if (!payload) return new Response('Not found', { status: 404 });

  const tier = tierForScore(payload.score);
  const pass = payload.score >= 720;
  const nick = (payload.nick || '').slice(0, 24);

  const [bold, regular] = await Promise.all([loadFont(700), loadFont(400)]);
  type FontDef = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };
  const fonts: FontDef[] = [];
  if (bold) fonts.push({ name: 'Inter', data: bold, weight: 700, style: 'normal' });
  if (regular) fonts.push({ name: 'Inter', data: regular, weight: 400, style: 'normal' });
  const ff = fonts.length ? 'Inter' : 'sans-serif';

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
