import type { Metadata } from 'next';
import Link from 'next/link';
import { DOMAINS, QB } from '@/lib/exam-bank';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'CCA Тренажер — підготовка до Claude Certified Architect Foundations',
  description: 'Тренажер для підготовки до сертифікації Claude Certified Architect Foundations: 96 питань, 5 доменів, режим екзамену і практики. Безкоштовно, українською.',
  alternates: { canonical: '/' },
  openGraph: {
    url: 'https://cca.thevibe.works/',
    images: [{ url: '/api/og?title=CCA+%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80&sub=%D0%9F%D1%96%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B0+%D0%B4%D0%BE+Claude+Certified+Architect+Foundations', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og?title=CCA+%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80'] },
};

export default function HomePage() {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Підготовка до Claude Certified Architect Foundations',
    description: 'Україномовний тренажер із 96 питаннями за 5 доменами екзамену CCA-F. Режими практики та повного екзамену.',
    provider: { '@type': 'Organization', name: 'theVibe.works', url: 'https://thevibe.works' },
    inLanguage: 'uk',
    educationalLevel: 'professional',
    url: 'https://cca.thevibe.works',
  };

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'theVibe.works',
    url: 'https://thevibe.works',
    sameAs: ['https://thevibe.works'],
  };

  return (
    <>
      <JsonLd data={courseSchema} />
      <JsonLd data={orgSchema} />

      <div className="hero">
        <div className="brandline">Anthropic · Certification</div>
        <h1>Тренажер для підготовки до<br /><span className="accentword">Claude Certified Architect</span> Foundations</h1>
        <p className="sub">
          Перший україномовний симулятор CCA-F: сценарні питання за п&apos;ятьма доменами,
          scaled score 100–1000, прохідний поріг 720. Відпрацюй формат ще до реального іспиту.
        </p>

        <div className="factrow">
          <div className="fact"><b>60</b><span>питань на спробу</span></div>
          <div className="fact"><b>120</b><span>хвилин, як на іспиті</span></div>
          <div className="fact"><b>720</b><span>прохідний поріг</span></div>
          <div className="fact"><b>{QB.length}</b><span>питань у банку</span></div>
        </div>

        <div style={{ marginTop: 28 }}>
          <Link href="/trenazher" className="btn accent" style={{ fontSize: 19, padding: '15px 28px' }}>
            Запустити тренажер →
          </Link>
        </div>

        <p className="muted" style={{ marginTop: 14, fontSize: 15 }}>
          Режим екзамену: 60 питань · 4 з 6 сценаріїв · 120 хвилин · поріг 720/1000
        </p>
      </div>

      {/* Domain cards */}
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>П&apos;ять доменів екзамену</h2>
        <p className="muted" style={{ marginBottom: 20, marginTop: 6 }}>
          Тренуйся за слабкими доменами або вивчи приклади питань з поясненнями.
        </p>
        <div className="domain-grid">
          {Object.entries(DOMAINS).map(([k, v]) => (
            <Link key={k} href={`/domeny/${v.slug}`} className="card domain-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="tag">D{k}</span>
                <span className="w">{v.w}%</span>
              </div>
              <h3>{v.nameUk}</h3>
              <p>{v.name}</p>
            </Link>
          ))}
          <Link href="/domeny" className="card domain-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
            <span style={{ fontFamily: 'var(--disp)', fontSize: 16, color: 'var(--accent)' }}>Усі домени →</span>
          </Link>
        </div>
      </section>

      {/* Prep guide CTA */}
      <section style={{ marginTop: 48 }}>
        <div className="card" style={{ padding: '30px 32px', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 22, marginBottom: 8 }}>Не знаєш, з чого почати?</h2>
            <p className="muted" style={{ margin: 0, maxWidth: '50ch' }}>
              Гайд «Як скласти CCA-F» — порядок доменів за вагами, скільки готуватись, як використовувати тренажер.
            </p>
          </div>
          <Link href="/pidgotovka" className="btn ghost">Гайд підготовки →</Link>
        </div>
      </section>

      {/* Scenarios teaser */}
      <section style={{ marginTop: 32 }}>
        <div className="card" style={{ padding: '22px 24px' }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>6 виробничих сценаріїв</h2>
          <p className="muted" style={{ fontSize: 15, margin: '0 0 14px' }}>
            Кожне питання прив&apos;язане до реального кейсу: Customer Support Agent, Code Generation, Multi-Agent Research та інші.
          </p>
          <Link href="/scenariyi" style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 14 }}>
            Переглянути всі сценарії →
          </Link>
        </div>
      </section>
    </>
  );
}
