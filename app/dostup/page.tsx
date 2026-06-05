import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';
import ResourcesHub from '@/components/ResourcesHub';

export const metadata: Metadata = {
  title: 'Як отримати доступ до іспиту Claude Certified Architect Foundations',
  description: 'Покроково: як отримати доступ до сертифікаційного іспиту CCA-F — через Claude Partner Network та Anthropic Academy, параметри іспиту, вартість, реєстрація. Українською.',
  alternates: { canonical: '/dostup' },
  openGraph: { url: 'https://cca.thevibe.works/dostup' },
};

export default function DostupPage() {
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Як отримати доступ до іспиту Claude Certified Architect Foundations',
    description: 'Покроковий гайд доступу до сертифікації CCA-F українською мовою.',
    inLanguage: 'uk',
    author: { '@type': 'Organization', name: 'theVibe.works', url: 'https://thevibe.works' },
    publisher: { '@type': 'Organization', name: 'theVibe.works', url: 'https://thevibe.works' },
    mainEntityOfPage: 'https://cca.thevibe.works/dostup',
  };

  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Як отримати доступ', href: '/dostup' }]} />
      <JsonLd data={articleSchema} />

      <div className="page-header">
        <h1>Як отримати доступ до іспиту CCA-F</h1>
        <p>Покроково: що це за сертифікація, як отримати доступ і скласти іспит</p>
      </div>

      <div className="prose">
        <h2>Що це за сертифікація</h2>
        <p>
          <strong>Claude Certified Architect — Foundations (CCA-F)</strong> — це базовий рівень сертифікації Anthropic
          для практиків, які проєктують і впроваджують промислові рішення на Claude. Іспит валідує практичне
          судження щодо архітектури, конфігурації та компромісів: agentic-системи, Claude Code, Claude API,
          Model Context Protocol (MCP).
        </p>
        <p>
          Рівень — <strong>Foundations (~301)</strong>, орієнтований на solution-архітекторів із практичним досвідом
          (зазвичай 6+ місяців роботи з Claude API, Agent SDK, Claude Code та MCP).
        </p>

        <h2>Шлях доступу</h2>
        <p>
          <strong>Anthropic Academy</strong> (<a href="https://anthropic.skilljar.com" target="_blank" rel="noopener">anthropic.skilljar.com</a>) —
          це безкоштовна навчальна платформа з базовими курсами по Claude. Окремого «курсу Архітектора» там немає —
          це <strong>сукупність усіх курсів</strong>, а повний доступ до сертифікаційного шляху Architect відкритий
          <strong>лише компаніям</strong>, які стали або планують стати офіційними партнерами Anthropic.
        </p>
        <p>Загальна послідовність доступу до іспиту:</p>
        <ol>
          <li><strong>Базові курси — безкоштовно.</strong> Реєструйся на Anthropic Academy й проходь відкриті курси по Claude.</li>
          <li><strong>Claude Partner Network (CPN).</strong> Повний шлях Architect доступний через партнерську програму — компанія стає (або планує стати) офіційним партнером.</li>
          <li><strong>Learning Path + форма завершення.</strong> Проходження сертифікаційного шляху командою та заповнення форми завершення.</li>
          <li><strong>Валідація Anthropic.</strong> Anthropic підтверджує право на складання.</li>
          <li><strong>Реєстрація на іспит.</strong> Після валідації — реєстрація на сесію (оплата $99 за спробу).</li>
        </ol>
        <p className="muted" style={{ fontSize: 14 }}>
          ⓘ Точні умови доступу визначає Anthropic і вони можуть змінюватись. Якщо твоя компанія не в CPN — почни з
          безкоштовних курсів Academy, а щодо сертифікації звернись до свого Anthropic-контакту чи партнера.
        </p>

        <h2>Параметри іспиту</h2>
        <table>
          <tbody>
            <tr><td><strong>Питань</strong></td><td>60 (scenario-based, multiple choice)</td></tr>
            <tr><td><strong>Час</strong></td><td>120 хвилин</td></tr>
            <tr><td><strong>Бал</strong></td><td>scaled score 100–1000</td></tr>
            <tr><td><strong>Прохідний поріг</strong></td><td>720</td></tr>
            <tr><td><strong>Вартість</strong></td><td>$99 <strong>за кожну спробу</strong> (перескладання — ще $99)</td></tr>
            <tr><td><strong>Мова</strong></td><td>англійська</td></tr>
            <tr><td><strong>Формат</strong></td><td>online-proctored або тест-центр</td></tr>
          </tbody>
        </table>
        <p style={{ padding: '14px 18px', background: 'var(--paper2)', borderRadius: 12, fontSize: 15 }}>
          💡 Оскільки <strong>кожна спроба коштує $99</strong>, провалений іспит — це ще $99. Тому має сенс
          відпрацювати формат заздалегідь у <Link href="/trenazher">безкоштовному тренажері</Link> і скласти з першого разу.
        </p>
        <p>
          Детальніше про формат і розподіл доменів — на сторінці{' '}
          <Link href="/format">Формат екзамену</Link>, а як готуватись —{' '}
          <Link href="/pidgotovka">План підготовки</Link>.
        </p>

        <h2>Чесні дисклеймери</h2>
        <ul>
          <li>Цей сайт і тренажер — <strong>неофіційний</strong> навчальний матеріал, не пов&apos;язаний з Anthropic.</li>
          <li>Право на складання та умови доступу визначає <strong>виключно Anthropic</strong>.</li>
          <li>Інформація тут — на основі загальнодоступних джерел і може застаріти; звіряйся з офіційними ресурсами.</li>
        </ul>
      </div>

      {/* Хаб ресурсів (Задача 6) */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Офіційні ресурси</h2>
        <p className="muted" style={{ marginBottom: 20, marginTop: 6 }}>Куровані лінки на офіційні матеріали Anthropic.</p>
        <ResourcesHub />
      </section>

      <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/trenazher" className="btn accent">Запустити тренажер →</Link>
        <Link href="/pidgotovka" className="btn ghost">План підготовки</Link>
        <Link href="/format" className="btn ghost">Формат іспиту</Link>
      </div>
    </div>
  );
}
