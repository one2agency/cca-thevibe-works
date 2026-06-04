import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DOMAINS, DOMAIN_SLUGS, getQuestionsByDomain } from '@/lib/exam-bank';
import Breadcrumb from '@/components/Breadcrumb';
import JsonLd from '@/components/JsonLd';

const LETTERS = ['A', 'B', 'C', 'D'];

const DOMAIN_FAQ: Record<number, { q: string; a: string }[]> = {
  1: [
    { q: 'Що найчастіше перевіряють у домені Agentic Architecture?', a: 'Головні теми: правильне завершення agentic loop (за stop_reason, а не за наявністю тексту), programmatic enforcement бізнес-правил через hooks замість prompt-based підходів, явна передача контексту субагентам і паралельний запуск через кілька Task-викликів в одній відповіді.' },
    { q: 'Які anti-patterns критичні для Домену 1?', a: 'Три найнебезпечніші: (1) завершення loop за лімітом ітерацій замість stop_reason «end_turn»; (2) очікування, що субагенти успадкують контекст автоматично — вони ізольовані; (3) пряма комунікація між субагентами замість hub-and-spoke через coordinator.' },
    { q: 'Чому programmatic hooks кращі за prompt-інструкції для бізнес-правил?', a: 'Prompt-інструкції ймовірнісні — вони мають ненульовий шанс порушення навіть при чіткому формулюванні. PreToolUse/PostToolUse hooks — детерміновані: вони перехоплюють виклики незалежно від поведінки моделі.' },
  ],
  2: [
    { q: 'Що найчастіше перевіряють у домені Tool Design & MCP?', a: 'Якість опису інструментів (деталі формату входу, межі, edge cases), конфігурація MCP по scope (project .mcp.json vs user ~/.claude.json), structured error responses з errorCategory і isRetryable, та принцип мінімальних привілеїв.' },
    { q: 'Які anti-patterns критичні для Домену 2?', a: 'Два найпоширеніші: (1) однаковий рядок помилки для всіх типів збоїв — агент не може прийняти правильне рішення про ретрай; (2) занадто великий набір інструментів (15+) — деградує якість вибору. Оптимум — 4–6 цільових інструментів.' },
    { q: 'Чому MCP resources важливіші за exploratory tool calls?', a: 'MCP resources виставляють каталоги доступних даних наперед, дозволяючи агенту побачити структуру без реальних дорогих викликів. Це знижує latency і кількість токенів на «розвідку».' },
  ],
  3: [
    { q: 'Що найчастіше перевіряють у домені Claude Code?', a: 'Ієрархія CLAUDE.md (user vs project scope і відмінності), коли використовувати plan mode vs direct execution, як slash-команди та Explore subagent ізолюють контекст, та -p прапорець для неінтерактивного CI-режиму.' },
    { q: 'Які anti-patterns критичні для Домену 3?', a: 'Два ключові: (1) командні інструкції у ~/.claude/CLAUDE.md — вони не потрапляють у version control і недоступні колегам; (2) один гігантський CLAUDE.md замість модульних файлів у .claude/rules/ — важко підтримувати і читати.' },
    { q: 'Коли використовувати plan mode замість direct execution?', a: 'Plan mode — для масштабних змін із кількома валідними підходами (рефакторинг, міграція бібліотеки, архітектурні рішення). Direct execution — для добре окреслених змін з чітким scope (fix одного файлу за stack trace).' },
  ],
  4: [
    { q: 'Що найчастіше перевіряють у домені Prompt Engineering?', a: 'Три головні теми: few-shot приклади як найефективніший спосіб передати формат виводу; tool_use з JSON-схемою як єдиний надійний спосіб отримати схема-compliant вивід; retry з контекстом помилки валідації (а не сліпий повтор).' },
    { q: 'Які anti-patterns критичні для Домену 4?', a: 'Розмиті інструкції («будь консервативним», «не вигадуй») не працюють — потрібні конкретні категоріальні критерії. Required поля в схемі, яких може не бути в джерелі, призводять до фабрикації — треба nullable. Batches API не підходить для блокуючих воркфлоу.' },
    { q: 'Коли Batches API — правильний вибір?', a: 'Batches API (50% економія) підходить для асинхронних воркфлоу без жорстких latency-вимог: нічні звіти, масова обробка документів, аналіз tech debt. Не підходить для блокуючих pre-merge checks і будь-яких воркфлоу з multi-turn tool calling.' },
  ],
  5: [
    { q: 'Що найчастіше перевіряють у домені Context Management?', a: 'Обрізання verbose виводів інструментів до релевантних полів, persistent fact blocks для збереження точних даних поза сумаризованою історією, structured error propagation із типом збою і isRetryable, та розрізнення access failure від валідного empty result.' },
    { q: 'Які anti-patterns критичні для Домену 5?', a: 'Два найнебезпечніші: (1) мовчазне придушення помилок (порожній success при збої) — coordinator не може прийняти правильне рішення; (2) агресивна сумаризація без persistent fact blocks — модель «забуває» точні суми, дати, номери.' },
    { q: 'Як правильно організувати progressive summarization?', a: 'Ключовий принцип: транзакційні факти (числа, дати, ідентифікатори, обіцянки) зберігати в окремому persistent блоці поза сумаризованою історією. Цей блок додається в кожен промпт незмінним, а сумаризується лише «м\'який» контекст.' },
  ],
};

const DOMAIN_INFO: Record<number, { desc: string; topics: string[]; antiPatterns: string[] }> = {
  1: {
    desc: 'Домен охоплює проєктування agentic систем: від базового agentic loop до складних multi-agent архітектур із coordinator і subagent\'ами. Ключова ідея — детермінований контроль важливіший за prompt-based підходи.',
    topics: ['Agentic loop (stop_reason: tool_use / end_turn)', 'Coordinator-subagent (hub-and-spoke)', 'Паралельний запуск субагентів (кілька Task в одній відповіді)', 'PreToolUse / PostToolUse hooks', 'Programmatic enforcement бізнес-правил', 'Декомпозиція задач (prompt chaining vs dynamic)', 'fork_session та --resume', 'Управління ізольованим контекстом субагентів'],
    antiPatterns: ['Завершення циклу за наявністю тексту замість stop_reason', 'Фіксований ліміт ітерацій як основний механізм зупинки', 'Пряма комунікація між субагентами (без coordinator)', 'Очікування успадкування контексту субагентами автоматично'],
  },
  2: {
    desc: 'Домен охоплює правильне проєктування інструментів і підключення MCP-серверів. Хороший опис інструмента — це основний механізм, за яким LLM обирає правильний інструмент.',
    topics: ['Детальні описи інструментів (формати входу, edge cases, межі)', 'MCP: project-scoped (.mcp.json) vs user-scoped (~/.claude.json)', 'Built-in tools: Read, Write, Edit, Bash, Grep, Glob', 'Структуровані помилки (errorCategory, isRetryable)', 'tool_choice: auto / any / specific', 'MCP resources для оглядовості даних', 'Принцип найменших привілеїв для інструментів субагентів', 'Community vs кастомні MCP-сервери'],
    antiPatterns: ['Занадто загальні описи інструментів', 'Однаковий рядок помилки для всіх типів збоїв', 'Надання агенту 15+ інструментів одночасно', 'Порожній "success" при фактичному збої'],
  },
  3: {
    desc: 'Домен охоплює конфігурацію та воркфлоу Claude Code: від CLAUDE.md до CI/CD інтеграції. Розуміння різниці між user-scope і project-scope критичне для командної роботи.',
    topics: ['CLAUDE.md ієрархія (project vs ~/.claude)', '.claude/commands/ для slash-команд', 'Plan mode vs direct execution', 'Explore subagent для ізоляції discovery', 'context: fork у frontmatter skills', '/compact для стиснення контексту', '--resume <session-name> та fork_session', 'Прапорець -p для неінтерактивного CI-режиму', 'CLAUDE.md в CI для передачі стандартів'],
    antiPatterns: ['Зберігання командних інструкцій у user-level CLAUDE.md', 'Один гігантський CLAUDE.md замість модульних файлів', 'Direct execution для архітектурних/багатофайлових задач', 'Парсинг тексту відповіді замість структурованих механізмів'],
  },
  4: {
    desc: 'Домен охоплює техніки промптингу та отримання структурованого виводу. Конкретні, категоріальні критерії завжди кращі за розмиті інструкції типу "будь точним".',
    topics: ['Few-shot приклади для консистентного формату', 'tool_use з JSON-схемою для гарантованого виводу', 'Optional/nullable поля замість required (щоб не фабрикувати)', 'Retry з фідбеком валідації (помилки + оригінал)', 'tool_choice: any / specific для пайплайнів', 'Message Batches API (50% економія, до 24 год)', 'Категоріальні критерії замість «будь консервативним»', 'Enum + "other" + "unclear" для розширюваних категорій'],
    antiPatterns: ['Загальні інструкції «не вигадуй» замість nullable полів', 'Retry без контексту помилки', 'tool_choice: auto коли потрібен tool_choice: any', 'Використання Batches API для блокуючих воркфлоу'],
  },
  5: {
    desc: 'Домен охоплює управління контекстним вікном та надійність агентних систем. Основна ідея — явне збереження важливих даних важливіше за покладання на пам\'ять моделі.',
    topics: ['Обрізання verbose виводів інструментів до релевантних полів', 'Progressive summarization + persistent fact blocks', 'Scratchpad-файли для збереження знахідок у довгих сесіях', 'Структурований error propagation до coordinator\'а', 'Розрізнення access failure від валідного empty result', 'Структуровані виводи субагентів замість verbose reasoning', 'Темпоральні мітки в даних для уникнення хибних суперечностей', 'Маршрутизація на human review при неоднозначності'],
    antiPatterns: ['Мовчазне придушення помилок (порожній success при збої)', 'Агресивна сумаризація числових/дат даних', 'Завершення всього воркфлоу при першому збої субагента', 'Покладання на confidence модель без калібрування'],
  },
};

export async function generateStaticParams() {
  return Object.values(DOMAINS).map(d => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const domainId = DOMAIN_SLUGS[slug];
  if (!domainId) return {};
  const d = DOMAINS[domainId];
  const ogTitle = encodeURIComponent(`Домен ${domainId}: ${d.nameUk}`);
  const ogSub = encodeURIComponent(`${d.w}% екзамену CCA-F · приклади питань`);
  const ogImg = `/api/og?title=${ogTitle}&sub=${ogSub}`;
  return {
    title: `${d.nameUk} — Домен ${domainId} (${d.w}%) | CCA-F`,
    description: `Ключові концепції, теми та приклади питань з домену ${domainId} екзамену CCA-F: ${d.name}. Вага — ${d.w}%.`,
    alternates: { canonical: `/domeny/${slug}` },
    openGraph: { url: `https://cca.thevibe.works/domeny/${slug}`, images: [{ url: ogImg, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', images: [ogImg] },
  };
}

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const domainId = DOMAIN_SLUGS[slug];
  if (!domainId) notFound();

  const domain = DOMAINS[domainId];
  const info = DOMAIN_INFO[domainId];
  const faqItems = DOMAIN_FAQ[domainId] ?? [];
  const allQs = getQuestionsByDomain(domainId);
  const sampleQs = allQs.slice(0, 8);

  const faqSchema = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  } : null;

  const quizSchema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: `${domain.nameUk} — приклади питань CCA-F`,
    educationalLevel: 'professional',
    inLanguage: 'uk',
    hasPart: sampleQs.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.opts[q.a],
        comment: q.ex,
      },
      suggestedAnswer: q.opts.map((o, i) => ({
        '@type': 'Answer',
        text: o,
        ...(i === q.a ? {} : { comment: 'Неправильна відповідь' }),
      })),
    })),
  };

  return (
    <div className="page-wrap">
      <Breadcrumb items={[
        { name: 'Домени', href: '/domeny' },
        { name: domain.nameUk, href: `/domeny/${slug}` },
      ]} />
      <JsonLd data={quizSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <div className="page-header">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <span className="tag">Домен {domainId}</span>
          <span className="tag" style={{ background: 'var(--accent)', color: '#fff', fontFamily: 'var(--mono)' }}>{domain.w}%</span>
        </div>
        <h1>{domain.nameUk}</h1>
        <p>{domain.name}</p>
      </div>

      <div className="prose">
        <p style={{ fontSize: 17 }}>{info.desc}</p>

        <h2>Ключові теми</h2>
        <ul>
          {info.topics.map((t, i) => <li key={i}>{t}</li>)}
        </ul>

        <h2>Типові anti-patterns</h2>
        <ul>
          {info.antiPatterns.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>

      {/* Static sample questions */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Приклади питань — Домен {domainId}</h2>
        <p className="muted" style={{ marginBottom: 20, fontSize: 15 }}>
          {allQs.length} питань у банку для цього домену · показано {sampleQs.length}
        </p>

        {sampleQs.map((q, qi) => (
          <div key={q.id} className="card q-static" style={{ marginBottom: 16 }}>
            <div className="qmeta" style={{ marginBottom: 10 }}>
              <span className="tag">Домен {q.d}</span>
              <span className="tag">Сценарій {q.s}</span>
              <span className="qnum">{qi + 1} / {sampleQs.length}</span>
            </div>
            <h3 className="q-text">{q.q}</h3>
            {q.opts.map((o, i) => (
              <div key={i} className={`opt${i === q.a ? ' correct' : ''}`}>
                <span className="k">{LETTERS[i]}</span>
                <span>{o}</span>
              </div>
            ))}
            <div className="q-ex">
              <strong>✓ Правильна відповідь: {LETTERS[q.a]}</strong> — {q.ex}
            </div>
          </div>
        ))}
      </section>

      {/* Mini-FAQ */}
      {faqItems.length > 0 && (
        <section style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 22, marginBottom: 20 }}>Часті питання про Домен {domainId}</h2>
          {faqItems.map((item, i) => (
            <div key={i} className="faq-item">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </section>
      )}

      <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href={`/trenazher?domain=${domainId}`} className="btn accent">
          Більше питань у тренажері →
        </Link>
        <Link href="/domeny" className="btn ghost">← Усі домени</Link>
      </div>
    </div>
  );
}
