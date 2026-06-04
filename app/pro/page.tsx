import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Про автора тренажера — Віталій Цимбалюк',
  description: 'Про автора CCA-тренажера: Віталій Цимбалюк, співзасновник SEO-агенції One2.agency, розвиває theVibe.works — бренд AI-автоматизації бізнес-процесів.',
  alternates: { canonical: '/pro' },
  openGraph: { url: 'https://cca.thevibe.works/pro' },
};

const LINKEDIN_URL = 'https://www.linkedin.com/in/%D0%B2%D1%96%D1%82%D0%B0%D0%BB%D1%96%D0%B9-%D1%86%D0%B8%D0%BC%D0%B1%D0%B0%D0%BB%D1%8E%D0%BA-82ab4126/';
const FACEBOOK_URL = 'https://www.facebook.com/vitaliy.tsymbalyuk';

export default function ProPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Про автора', href: '/pro' }]} />

      <div className="page-header">
        <h1>Про цей тренажер</h1>
        <p>Хто зробив і навіщо</p>
      </div>

      <div className="card" style={{ padding: '32px 36px', maxWidth: 680 }}>
        {/* Шапка з фото + соцмережами */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {/* TODO: замінити .svg-заглушку на справжнє фото /images/vitaliy-tsymbalyuk.jpg */}
          <img
            src="/images/vitaliy-tsymbalyuk.svg"
            alt="Віталій Цимбалюк"
            width={104}
            height={104}
            style={{ width: 104, height: 104, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--line)', flex: '0 0 auto' }}
          />
          <div>
            <div style={{ fontFamily: 'var(--disp)', fontSize: 24, fontWeight: 700 }}>Віталій Цимбалюк</div>
            <div className="muted" style={{ fontSize: 14, marginBottom: 10 }}>
              Співзасновник One2.agency · theVibe.works
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener" aria-label="LinkedIn"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, background: '#0a66c2', color: '#fff' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
                </svg>
              </a>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener" aria-label="Facebook"
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 9, background: '#1877f2', color: '#fff' }}>
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.03 4.39 11.03 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="prose">
          <h2 style={{ marginTop: 0 }}>Хто я</h2>
          <p>
            Мене звати <strong>Віталій Цимбалюк</strong>. Я співзасновник SEO-агенції{' '}
            <a href="https://one2.agency" target="_blank" rel="noopener">One2.agency</a>.
            Розвиваю агенцію <a href="https://thevibe.works" rel="follow"><strong>theVibe.works</strong></a>{' '}
            — окремий бренд для AI-автоматизації бізнес-процесів.
          </p>

          <h2>Чому зробив цей тренажер</h2>
          <p>
            Коли я сам готувався до CCA-F, україномовних матеріалів не було взагалі.
            Довелось вчитись виключно на англомовній документації і самостійно придуманих практичних задачах.
          </p>
          <p>
            Я вирішив зробити інструмент, якого мені не вистачало: справжній симулятор із
            scenario-based питаннями українською, поясненнями чому конкретна відповідь правильна,
            і режимом повного екзамену.
          </p>
          <p>
            Тренажер не є офіційним матеріалом Anthropic — це навчальний інструмент,
            створений на основі публічного Exam Guide і документації.
          </p>

          <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <a href="https://thevibe.works" className="btn accent" rel="follow">
              theVibe.works →
            </a>
            <Link href="/trenazher" className="btn ghost">Запустити тренажер</Link>
          </div>

          <div style={{ marginTop: 28, borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>Зв&apos;язок і підтримка</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://t.me/ClaudeCA_ua_bot?start=job"
                target="_blank"
                rel="noopener"
                className="btn ghost"
                style={{ fontSize: 15 }}
              >
                🚀 Хочу працювати з AI
              </a>
              <a
                href="https://t.me/ClaudeCA_ua_bot?start=feedback"
                target="_blank"
                rel="noopener"
                className="btn ghost"
                style={{ fontSize: 15 }}
              >
                💬 Написати фідбек
              </a>
              <a
                href="https://send.monobank.ua/jar/9uKqdVDC2W"
                target="_blank"
                rel="noopener"
                className="btn ghost"
                style={{ fontSize: 15 }}
              >
                💛 Підтримати проєкт
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
