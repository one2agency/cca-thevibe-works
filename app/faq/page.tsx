import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'FAQ — Часті питання про CCA Foundations',
  description: 'Відповіді на часті запитання про іспит Claude Certified Architect Foundations: хто може складати, вартість, мова, система балів, підготовка.',
  alternates: { canonical: '/faq' },
  openGraph: { url: 'https://cca.thevibe.works/faq' },
};

const FAQ_ITEMS = [
  {
    q: 'Хто може скласти CCA-F?',
    a: 'Будь-який розробник, архітектор або технічний спеціаліст, що працює з Claude API або Claude Code. Офіційних вимог до досвіду немає, але практичний досвід побудови AI-систем — суттєва перевага.',
  },
  {
    q: 'Якою мовою проводиться екзамен?',
    a: 'Офіційний іспит від Anthropic — англійською мовою. Цей тренажер є україномовним навчальним інструментом для підготовки, а не офіційним матеріалом від Anthropic.',
  },
  {
    q: 'Скільки коштує іспит?',
    a: 'Актуальну вартість реєстрації дивись на офіційному сайті Anthropic (anthropic.com). Ціни можуть змінюватись.',
  },
  {
    q: 'Скільки спроб дозволено?',
    a: 'Уточни на офіційному сайті Anthropic — умови повторного складання можуть змінюватись. Зазвичай є витримка між спробами.',
  },
  {
    q: 'Чим CCA-F відрізняється від інших рівнів сертифікації?',
    a: 'Foundations — базовий рівень сертифікації Claude Certified Architect. Він фокусується на практичному застосуванні: побудові agentic систем, конфігурації Claude Code, prompt engineering і управлінні контекстом. Вищі рівні (якщо існують) охоплюють глибшу архітектурну та оптимізаційну експертизу.',
  },
  {
    q: 'Як нараховуються бали?',
    a: 'Результат — scaled score від 100 до 1000. Це не відсоток правильних відповідей, а масштабована оцінка, що враховує складність конкретної версії іспиту. Прохідний поріг — 720 балів. У тренажері використовується спрощена лінійна модель для наближення.',
  },
  {
    q: 'Скільки часу потрібно на підготовку?',
    a: 'Для розробника з досвідом роботи з Claude API — 4–6 тижнів при 1–2 годинах на день. Без досвіду — 6–8 тижнів. Детальний план: дивись Гайд підготовки.',
  },
  {
    q: 'Що означає «scenario-based» формат?',
    a: 'Кожне питання прив\'язане до конкретного виробничого сценарію (Customer Support Agent, Code Generation тощо). Ти читаєш опис системи, а потім вирішуєш архітектурну або операційну задачу в її контексті. Це не абстрактна теорія — треба застосовувати знання в реалістичному контексті.',
  },
  {
    q: 'Чи є офіційні матеріали для підготовки від Anthropic?',
    a: 'Anthropic публікує Exam Guide із описом доменів, task statements і форматом іспиту. Основна документація Claude API, Claude Code і Agent SDK — безкоштовна на docs.anthropic.com.',
  },
  {
    q: 'Навіщо цей тренажер, якщо є офіційна документація?',
    a: 'Документація пояснює «що і як». Тренажер дає практику в умовах іспиту: scenario-based питання, таймер, аналіз помилок. Комбінація читання документації і вирішення питань у тренажері — найефективніший підхід.',
  },
  {
    q: 'Чи є в тренажері реальні питання з іспиту?',
    a: 'Ні. Всі питання і пояснення створені на основі офіційного Exam Guide і загальнодоступної документації. Це навчальний матеріал, а не витік з реального іспиту.',
  },
  {
    q: 'Де знаходяться всі домени і теми?',
    a: 'На сторінці Домени є опис кожного з 5 доменів із прикладами питань і поясненнями.',
  },
];

export default function FaqPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'FAQ', href: '/faq' }]} />
      <JsonLd data={faqSchema} />

      <div className="page-header">
        <h1>Часті питання про CCA Foundations</h1>
        <p>Відповіді на найпоширеніші запитання про іспит і підготовку</p>
      </div>

      <div style={{ marginTop: 8 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="faq-item">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '22px 24px', marginTop: 40 }}>
        <p style={{ margin: '0 0 14px', fontWeight: 500 }}>Ще не знайшов відповідь? Перевір офіційні матеріали:</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/pidgotovka" className="btn ghost">Гайд підготовки</Link>
          <Link href="/format" className="btn ghost">Формат іспиту</Link>
          <Link href="/trenazher" className="btn accent">Запустити тренажер →</Link>
        </div>
      </div>
    </div>
  );
}
