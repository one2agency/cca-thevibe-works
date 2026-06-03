import type { Metadata } from 'next';
import Link from 'next/link';
import { DOMAINS } from '@/lib/exam-bank';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Домени екзамену CCA-F — 5 тематичних областей',
  description: 'Огляд п\'яти доменів іспиту Claude Certified Architect Foundations: ваги, ключові теми, приклади питань для кожного домену.',
  alternates: { canonical: '/domeny' },
  openGraph: { url: 'https://cca.thevibe.works/domeny' },
};

const DOMAIN_DESCRIPTIONS: Record<number, string> = {
  1: 'Проєктування agentic loops, coordinator-subagent патерни, паралельний запуск агентів, хуки для програмного контролю.',
  2: 'Опис інструментів, MCP-конфігурація (project vs user scope), built-in tools, структуровані помилки, tool_choice.',
  3: 'Ієрархія CLAUDE.md, plan mode vs direct execution, slash-команди, Explore subagent, CI/CD інтеграція.',
  4: 'Few-shot приклади, tool_use для JSON-схем, retry з фідбеком валідації, Batches API, категоріальні критерії.',
  5: 'Обрізання виводу інструментів, progressive summarization, persistent fact blocks, error propagation у multi-agent.',
};

export default function DomenyPage() {
  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Домени', href: '/domeny' }]} />

      <div className="page-header">
        <h1>П&apos;ять доменів екзамену CCA-F</h1>
        <p>Кожен домен охоплює певну область знань. Вивчи приклади питань і тренуйся цілеспрямовано.</p>
      </div>

      <div className="domain-grid">
        {Object.entries(DOMAINS).map(([k, v]) => (
          <Link key={k} href={`/domeny/${v.slug}`} className="card domain-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span className="tag">D{k} · {v.w}%</span>
              <div className="bar" style={{ maxWidth: 80 }}>
                <i style={{ width: `${v.w / 27 * 100}%` }} />
              </div>
            </div>
            <h3>{v.nameUk}</h3>
            <p style={{ fontSize: 13, marginTop: 6, marginBottom: 0 }}>{DOMAIN_DESCRIPTIONS[+k]}</p>
          </Link>
        ))}
      </div>

      <div className="card" style={{ padding: '22px 24px', marginTop: 32 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>Як готуватись за доменами</h2>
        <div className="prose">
          <ul>
            <li><strong>D1 (27%)</strong> — найвагоміший домен. Починай з нього: agentic loops, hooks, декомпозиція задач.</li>
            <li><strong>D3 та D4 (по 20%)</strong> — Claude Code workflows і prompt engineering. Вчи паралельно.</li>
            <li><strong>D2 (18%)</strong> — tool design і MCP. Зверни увагу на описи інструментів і scope конфігурації.</li>
            <li><strong>D5 (15%)</strong> — context management. Найменший за вагою, але критичний для надійності.</li>
          </ul>
          <p>
            <Link href="/pidgotovka">Детальний гайд підготовки →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
