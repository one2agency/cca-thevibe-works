import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вхід',
  robots: { index: false, follow: false },
};

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="page-wrap" style={{ maxWidth: 420 }}>
      <div className="card" style={{ padding: '32px 28px' }}>
        <h1 style={{ fontSize: 24, marginBottom: 6 }}>Статистика — вхід</h1>
        <p className="muted" style={{ fontSize: 14, marginTop: 0, marginBottom: 18 }}>
          Введи пароль адміністратора. Основний шлях до статистики — команда <code>/stats</code> у Telegram-боті.
        </p>
        <form method="POST" action="/api/admin/login">
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            autoComplete="current-password"
            required
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--line)', background: 'var(--card)', fontFamily: 'var(--serif)', fontSize: 15, marginBottom: 12 }}
          />
          {e && <p style={{ color: 'var(--bad)', fontSize: 14, margin: '0 0 12px' }}>
            {e === 'rate' ? 'Забагато спроб. Спробуй за кілька хвилин.' : 'Невірний пароль.'}
          </p>}
          <button type="submit" className="btn accent" style={{ width: '100%', justifyContent: 'center' }}>Увійти →</button>
        </form>
      </div>
    </div>
  );
}
