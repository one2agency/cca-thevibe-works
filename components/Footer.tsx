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
          <Link href="/pro">Про автора</Link>
          <Link href="/trenazher">Тренажер</Link>
        </nav>
        <div className="f-copy">
          © 2025 · Розроблено{' '}
          <a href="https://thevibe.works" rel="follow">theVibe.works</a>
          {' '}· AI-автоматизація для бізнесу
        </div>
      </div>
    </footer>
  );
}
