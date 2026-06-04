import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="inner">
        <div>
          <div className="f-brand">CCA Тренажер</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 4 }}>
            Підготовка до Claude Certified Architect Foundations
          </div>
        </div>
        <nav className="f-links">
          <Link href="/">Головна</Link>
          <Link href="/format">Формат</Link>
          <Link href="/domeny">Домени</Link>
          <Link href="/scenariyi">Сценарії</Link>
          <Link href="/pidgotovka">Підготовка</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/spilnota">Спільнота</Link>
          <Link href="/pro">Про автора</Link>
          <Link href="/trenazher">Тренажер</Link>
          <Link href="/privacy">Приватність</Link>
        </nav>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <a
            href="https://t.me/ClaudeCA_ua_bot?start=feedback"
            target="_blank"
            rel="noopener"
            style={{ fontSize: 13, color: 'var(--ink2)', textDecoration: 'none', display: 'inline-flex', gap: 5, alignItems: 'center' }}
          >
            💬 Залишити фідбек
          </a>
          <span style={{ color: 'var(--line)' }}>·</span>
          <a
            href="https://send.monobank.ua/jar/9uKqdVDC2W"
            target="_blank"
            rel="noopener"
            style={{ fontSize: 13, color: 'var(--ink2)', textDecoration: 'none' }}
          >
            💛 Підтримати
          </a>
          <span style={{ color: 'var(--line)' }}>·</span>
          <a
            href="https://t.me/ClaudeCA_ua_bot"
            target="_blank"
            rel="noopener"
            style={{ fontSize: 13, color: 'var(--ink2)', textDecoration: 'none' }}
          >
            🤖 @ClaudeCA_ua_bot
          </a>
        </div>
        <div className="f-copy" style={{ marginTop: 12 }}>
          © {new Date().getFullYear()} · Розроблено{' '}
          <a href="https://thevibe.works" rel="follow">theVibe.works</a>
          {' '}· AI-автоматизація для бізнесу
        </div>
      </div>
    </footer>
  );
}
