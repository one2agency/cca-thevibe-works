import { Suspense } from 'react';
import type { Metadata } from 'next';
import ExamSimulator from '@/components/ExamSimulator';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Тренажер CCA — симулятор екзамену Claude Certified Architect',
  description: 'Інтерактивний симулятор іспиту CCA-F: режим екзамену (60 питань, 120 хв) та режим практики за доменами і сценаріями. Scaled score 100–1000.',
  alternates: { canonical: '/trenazher' },
  openGraph: {
    url: 'https://cca.thevibe.works/trenazher',
    images: [{ url: '/api/og?title=%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80+CCA-F&sub=60+%D0%BF%D0%B8%D1%82%D0%B0%D0%BD%D1%8C+%C2%B7+120+%D1%85%D0%B2+%C2%B7+%D0%BF%D0%BE%D1%80%D1%96%D0%B3+720', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/api/og?title=%D0%A2%D1%80%D0%B5%D0%BD%D0%B0%D0%B6%D0%B5%D1%80+CCA-F'] },
};

interface SearchParams { domain?: string; scenario?: string; }

export default async function TrenazherPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const defaultDomain = sp.domain ? parseInt(sp.domain, 10) : undefined;
  const defaultScenario = sp.scenario ? parseInt(sp.scenario, 10) : undefined;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: 'CCA Foundations — тренажер',
    description: 'Симулятор екзамену Claude Certified Architect Foundations українською мовою',
    educationalLevel: 'professional',
    inLanguage: 'uk',
    provider: {
      '@type': 'Organization',
      name: 'theVibe.works',
      url: 'https://thevibe.works',
    },
  };

  return (
    <>
      <JsonLd data={schema} />
      <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--mono)' }}>Завантаження…</div>}>
        <ExamSimulator defaultDomain={defaultDomain} defaultScenario={defaultScenario} />
      </Suspense>
    </>
  );
}
