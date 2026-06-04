import type { Metadata } from 'next';
import Link from 'next/link';
import { DOMAINS } from '@/lib/exam-bank';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'Як скласти CCA-F: план підготовки',
  description: 'Покроковий гайд підготовки до Claude Certified Architect Foundations: порядок доменів за вагами, скільки часу готуватись, як використовувати тренажер.',
  alternates: { canonical: '/pidgotovka' },
  openGraph: { url: 'https://cca.thevibe.works/pidgotovka' },
};

export default function PidgotovkaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Як скласти CCA-F: план підготовки',
    description: 'Покроковий гайд підготовки до іспиту Claude Certified Architect Foundations',
    educationalLevel: 'professional',
    inLanguage: 'uk',
    provider: { '@type': 'Organization', name: 'theVibe.works', url: 'https://thevibe.works' },
  };

  const domainOrder = [1, 3, 4, 2, 5]; // by weight desc

  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Підготовка', href: '/pidgotovka' }]} />
      <JsonLd data={schema} />

      <div className="page-header">
        <h1>Як скласти CCA-F: план підготовки</h1>
        <p>Практичний гайд від нуля до прохідного балу 720+</p>
      </div>

      <div className="prose">
        <h2>Скільки часу готуватись</h2>
        <p>
          Для розробника, що вже працює з Claude API, реалістичний термін — <strong>4–6 тижнів</strong> при 1–2 годинах на день.
          Якщо Claude Code чи agentic патерни — нові теми, закладай <strong>6–8 тижнів</strong>.
          Головне — не читати пасивно, а вирішувати питання тренажера і розбирати пояснення.
        </p>

        <h2>Порядок доменів (за вагами)</h2>
        <p>
          Починай із найважчих за вагою доменів — там найбільше питань на іспиті.
        </p>

        <div className="card" style={{ padding: '20px 24px', marginBottom: 24 }}>
          {domainOrder.map((k, i) => {
            const d = DOMAINS[k];
            return (
              <div key={k} className="domrow">
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, flex: '0 0 24px', color: 'var(--ink2)' }}>{i + 1}.</span>
                <span className="tag">D{k}</span>
                <Link href={`/domeny/${d.slug}`} style={{ flex: 1, minWidth: 120, fontSize: 15, color: 'var(--ink)' }}>
                  {d.nameUk}
                </Link>
                <div className="bar"><i style={{ width: `${d.w / 27 * 100}%` }} /></div>
                <b style={{ fontFamily: 'var(--mono)', fontSize: 14, flex: '0 0 42px', textAlign: 'right' }}>{d.w}%</b>
              </div>
            );
          })}
        </div>

        <h2>Тижневий план</h2>
        <h3>Тижні 1–2: Agentic Architecture (D1) та Claude Code (D3)</h3>
        <p>
          Прочитай офіційний Exam Guide і документацію Claude Agent SDK. Запускай тренажер у режимі практики
          по домену D1 щодня по 15–20 питань. Розбирай кожну помилку — читай пояснення, не просто дивись правильну відповідь.
        </p>
        <ul>
          <li>Фокус D1: agentic loops, hooks, multi-agent координація, паралельність</li>
          <li>Фокус D3: CLAUDE.md, plan mode, slash-команди, CI/CD інтеграція</li>
        </ul>

        <h3>Тижні 3–4: Prompt Engineering (D4) та Tool Design (D2)</h3>
        <p>
          D4 і D2 тісно пов&apos;язані — хороший опис інструмента це і tool design, і prompt engineering.
          Практикуйся по 20 питань на домен, чергуй D4 і D2.
        </p>
        <ul>
          <li>Фокус D4: few-shot, tool_use + JSON-схема, retry з фідбеком, Batches API</li>
          <li>Фокус D2: описи інструментів, MCP-конфігурація, structured errors</li>
        </ul>

        <h3>Тиждень 5: Context Management (D5) + симуляція екзамену</h3>
        <p>
          Завершуй вивчення D5 і проводь повну симуляцію екзамену (60 питань, таймер 120 хв) кожен другий день.
          Аналізуй результати — визначай, який домен лишається слабким, повертайся до нього.
        </p>

        <h3>Тиждень 6: Повторення + фінальні симуляції</h3>
        <p>
          Три повних симуляції в умовах, наближених до реальних: тихе місце, без перерв, таймер.
          Ціль — стабільно 720+ балів.
        </p>

        <h2>Як використовувати тренажер</h2>
        <ul>
          <li>
            <strong>Режим практики за доменом</strong> — ідеальний для цілеспрямованого вивчення.
            Обирай домен, 20–40 питань, одразу бач пояснення після кожної відповіді.
          </li>
          <li>
            <strong>Режим екзамену</strong> — для симуляції реального іспиту. 60 питань, таймер, без підказок.
            Роби коли відчуваєш готовність.
          </li>
          <li>
            <strong>Розбір після екзамену</strong> — обов&apos;язково переглядай усі питання, де помилився.
            Пояснення написані для розуміння, а не просто «правильна відповідь — A».
          </li>
        </ul>

        <h2>Поради по таймінгу</h2>
        <ul>
          <li>120 хвилин на 60 питань = 2 хвилини на питання. Це комфортний темп.</li>
          <li>Позначай сумнівні питання (зірочка в тренажері) і повертайся в кінці.</li>
          <li>Не застрягай на одному питанні більше 3 хвилин.</li>
          <li>Перші 10 хвилин — прочитай описи сценаріїв, щоб орієнтуватись у контексті.</li>
        </ul>

        <p style={{ marginTop: 32, padding: '16px 20px', background: 'var(--paper2)', borderRadius: 12, fontSize: 15 }}>
          Якщо хочеш перейти від підготовки до реальних проєктів —
          впровадженням AI-агентів і автоматизацією бізнес-процесів займається{' '}
          <a href="https://thevibe.works/solutions/ai-konsultant" rel="follow">theVibe.works</a>.
        </p>

        <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/trenazher" className="btn accent">Запустити тренажер →</Link>
          <Link href="/domeny" className="btn ghost">Домени екзамену</Link>
          <Link href="/format" className="btn ghost">Формат іспиту</Link>
        </div>
      </div>
    </div>
  );
}
