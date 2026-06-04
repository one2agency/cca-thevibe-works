import Link from 'next/link';

export default function Header() {
  return (
    <header className="site-header">
      <div className="inner">
        <Link href="/" className="site-logo">CCA</Link>
        <nav className="site-nav">
          <Link href="/format">Формат</Link>
          <Link href="/domeny">Домени</Link>
          <Link href="/scenariyi">Сценарії</Link>
          <Link href="/pidgotovka">Підготовка</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/spilnota">Спільнота</Link>
          <Link href="/exam-guide">Гід PDF</Link>
          <Link href="/trenazher" className="cta">Тренажер →</Link>
        </nav>
      </div>
    </header>
  );
}
