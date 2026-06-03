import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Про автора тренажера — Віталій, CCA',
  description: 'Про автора CCA-тренажера: Віталій, Claude Certified Architect, засновник One2.agency, розвиває theVibe.works як бренд AI-автоматизації.',
  alternates: { canonical: '/pro' },
  openGraph: { url: 'https://cca.thevibe.works/pro' },
};

export default function ProPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Про автора', href: '/pro' }]} />

      <div className="page-header">
        <h1>Про цей тренажер</h1>
        <p>Хто зробив і навіщо</p>
      </div>

      <div className="card" style={{ padding: '32px 36px', maxWidth: 680 }}>
        <div className="prose">
          <h2 style={{ marginTop: 0 }}>Хто я</h2>
          <p>
            Мене звати <strong>Віталій</strong>. Я Claude Certified Architect і співзасновник{' '}
            <a href="mailto:tv@one2.agency">One2.agency</a>.
            Розвиваю <a href="https://thevibe.works" rel="follow"><strong>theVibe.works</strong></a>{' '}
            — окремий бренд для AI-автоматизації бізнес-процесів.
          </p>

          <h2>Чому зробив цей тренажер</h2>
          <p>
            Коли я сам готувався до CCA-F, україномовних матеріалів не було взагалі.
            Довелось вчитись виключно на англомовній документації і самостійно придуманих практичних задачах.
          </p>
          <p>
            Після складання іспиту я вирішив зробити інструмент, якого мені не вистачало:
            справжній симулятор із scenario-based питаннями українською, поясненнями чому
            конкретна відповідь правильна, і режимом повного екзамену.
          </p>
          <p>
            Тренажер не є офіційним матеріалом Anthropic — це навчальний інструмент,
            створений на основі публічного Exam Guide і документації.
          </p>

          <h2>Що ще робимо</h2>
          <p>
            На <a href="https://thevibe.works" rel="follow">theVibe.works</a> ми будуємо
            AI-агентів і автоматизуємо бізнес-процеси для компаній. Якщо тебе цікавить
            практичне впровадження AI — заходь.
          </p>

          <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://thevibe.works" className="btn accent" rel="follow">
              theVibe.works →
            </a>
            <Link href="/trenazher" className="btn ghost">Запустити тренажер</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
