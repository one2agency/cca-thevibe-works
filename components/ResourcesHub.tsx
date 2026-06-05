import Link from 'next/link';

interface Res { title: string; desc: string; href: string; external?: boolean; }

const RESOURCES: Res[] = [
  { title: 'Anthropic Academy', desc: 'Безкоштовні базові курси Claude (повний шлях Architect — для партнерів)', href: 'https://anthropic.skilljar.com', external: true },
  { title: 'Exam Guide — переклад', desc: 'Повний переклад офіційного гіда українською', href: '/exam-guide' },
  { title: 'Як отримати доступ', desc: 'Шлях до іспиту: Academy, CPN, реєстрація', href: '/dostup' },
  { title: 'Anthropic Cookbook', desc: 'Практичні приклади й рецепти роботи з Claude', href: 'https://github.com/anthropics/anthropic-cookbook', external: true },
  { title: 'Документація Claude API', desc: 'tool use, structured output, Batches API', href: 'https://docs.anthropic.com/', external: true },
  { title: 'Claude Code — докз', desc: 'CLAUDE.md, slash-команди, plan mode, CI', href: 'https://docs.anthropic.com/en/docs/claude-code', external: true },
  { title: 'Model Context Protocol (MCP)', desc: 'Специфікація та сервери MCP', href: 'https://modelcontextprotocol.io/', external: true },
  { title: 'Claude Agent SDK', desc: 'Агентні цикли, субагенти, hooks', href: 'https://docs.anthropic.com/', external: true },
];

export default function ResourcesHub() {
  return (
    <div className="domain-grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))' }}>
      {RESOURCES.map(r => (
        r.external ? (
          <a key={r.title} href={r.href} target="_blank" rel="noopener" className="card domain-card">
            <h3 style={{ fontSize: 16 }}>{r.title} ↗</h3>
            <p style={{ fontSize: 13, marginTop: 6 }}>{r.desc}</p>
          </a>
        ) : (
          <Link key={r.title} href={r.href} className="card domain-card">
            <h3 style={{ fontSize: 16 }}>{r.title} →</h3>
            <p style={{ fontSize: 13, marginTop: 6 }}>{r.desc}</p>
          </Link>
        )
      ))}
    </div>
  );
}
