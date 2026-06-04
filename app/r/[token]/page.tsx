import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { verifyBadge, tierForScore, DISCLAIMER } from '@/lib/share';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const payload = await verifyBadge(token);
  if (!payload) return { title: 'Бейдж не знайдено', robots: { index: false, follow: false } };

  const tier = tierForScore(payload.score);
  const who = payload.nick ? `${payload.nick} — ` : '';
  const title = `${who}${payload.score}/1000 на тренажері CCA-F ${tier.emoji}`;
  const ogImg = `/api/og/${token}`;

  return {
    title,
    description: `${tier.label} · результат тренажера підготовки до Claude Certified Architect Foundations. Спробуй сам.`,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      url: `https://cca.thevibe.works/r/${token}`,
      images: [{ url: ogImg, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, images: [ogImg] },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = await verifyBadge(token);
  if (!payload) notFound();

  const tier = tierForScore(payload.score);
  const pass = payload.score >= 720;

  return (
    <div className="page-wrap" style={{ maxWidth: 640 }}>
      <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
        {payload.nick && (
          <div className="muted" style={{ fontSize: 18, marginBottom: 8 }}>{payload.nick}</div>
        )}
        <div style={{ fontSize: 80, lineHeight: 1, marginBottom: 8 }}>{tier.emoji}</div>
        <div style={{ fontFamily: 'var(--disp)', fontSize: 64, fontWeight: 700, color: pass ? 'var(--good)' : 'var(--accent)', lineHeight: 1 }}>
          {payload.score}
        </div>
        <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 14, marginTop: 6 }}>
          scaled score (100–1000) · {tier.label}
        </div>
        <div style={{ fontFamily: 'var(--disp)', fontSize: 22, marginTop: 18 }}>
          {pass ? 'Прохідний результат на тренажері CCA-F' : 'Готуюсь до Claude Certified Architect'}
        </div>

        <div style={{ marginTop: 28 }}>
          <Link href="/trenazher" className="btn accent" style={{ fontSize: 18, padding: '14px 26px' }}>
            🎯 Спробуй сам →
          </Link>
        </div>

        <p className="footnote" style={{ marginTop: 24 }}>{DISCLAIMER}</p>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link href="/" style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 14 }}>
          ← Що таке CCA Тренажер
        </Link>
      </div>
    </div>
  );
}
