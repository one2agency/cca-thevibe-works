import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { getAttempts, getLeaderboard, getQuestionStats, storeReady } from '@/lib/store';
import { QB, DOMAINS } from '@/lib/exam-bank';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Спільнота — статистика, лідерборд, найважчі питання CCA-F',
  description: 'Анонімна спільнотна статистика тренажера CCA-F: скільки пройдено екзаменів, середній бал, pass rate, лідерборд за нікнеймом і найскладніші питання.',
  alternates: { canonical: '/spilnota' },
  openGraph: { url: 'https://cca.thevibe.works/spilnota' },
};

const QMAP = new Map(QB.map(q => [q.id, q]));

export default async function CommunityPage() {
  if (!storeReady()) {
    return (
      <div className="page-wrap">
        <Breadcrumb items={[{ name: 'Спільнота', href: '/spilnota' }]} />
        <div className="page-header"><h1>Спільнота</h1><p>Статистика зʼявиться, щойно підключиться сховище.</p></div>
      </div>
    );
  }

  const [attempts, leaderboard, qstats] = await Promise.all([
    getAttempts(0), getLeaderboard(20), getQuestionStats(),
  ]);

  const exams = attempts.filter(a => a.mode === 'exam');
  const total = exams.length;
  const avg = total ? Math.round(exams.reduce((s, a) => s + a.score, 0) / total) : 0;
  const passed = exams.filter(a => a.score >= 720).length;
  const passRate = total ? Math.round(passed / total * 100) : 0;

  // Найважчі: wrong/shown, мінімальний поріг показів
  const MIN_SHOWN = 3;
  const hardest = qstats
    .filter(x => x.shown >= MIN_SHOWN)
    .map(x => ({ ...x, pct: Math.round(x.wrong / x.shown * 100) }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 8);

  const card: React.CSSProperties = { padding: '20px 24px' };
  const num: React.CSSProperties = { fontFamily: 'var(--disp)', fontSize: 40, fontWeight: 700, lineHeight: 1, color: 'var(--accent)' };

  return (
    <div className="page-wrap">
      <Breadcrumb items={[{ name: 'Спільнота', href: '/spilnota' }]} />
      <div className="page-header">
        <h1>Спільнота CCA-F</h1>
        <p>Анонімна статистика тренажера. Рахуються лише повні екзамени (60 питань) — без персональних даних.</p>
      </div>

      {/* Глобальні цифри */}
      <div className="resgrid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' }}>
        <div className="card" style={card}><div style={num}>{total}</div><div className="muted">всього екзаменів</div></div>
        <div className="card" style={card}><div style={num}>{avg || '—'}</div><div className="muted">середній бал / 1000</div></div>
        <div className="card" style={card}><div style={num}>{total ? `${passRate}%` : '—'}</div><div className="muted">pass rate (≥720)</div></div>
      </div>

      {/* Лідерборд */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>🏆 Топ результатів</h2>
        {leaderboard.length === 0 ? (
          <div className="card" style={{ padding: '20px 24px' }}>
            <p className="muted" style={{ margin: 0 }}>Поки порожньо. Пройди повний екзамен і додай свій нік у тренажері.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: '8px 0' }}>
            {leaderboard.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 22px', borderBottom: i < leaderboard.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 14, width: 28, color: 'var(--ink2)' }}>{i + 1}.</span>
                <span style={{ flex: 1, fontWeight: 500 }}>{i < 3 ? ['🥇', '🥈', '🥉'][i] + ' ' : ''}{e.nick}</span>
                <span style={{ fontFamily: 'var(--disp)', fontWeight: 700, color: e.score >= 720 ? 'var(--good)' : 'var(--ink)' }}>{e.score}</span>
                <span className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 12, width: 78, textAlign: 'right' }}>
                  {new Date(e.date).toLocaleDateString('uk-UA')}
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>Нікнейм добровільний і санітизований. До лідерборда йдуть лише повні екзамени.</p>
      </section>

      {/* Найважчі питання */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>🔥 Найважчі питання</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>Частка тих, хто відповів неправильно. Правильні відповіді тут не розкриваються — лише у розборі після екзамену.</p>
        {hardest.length === 0 ? (
          <div className="card" style={{ padding: '20px 24px' }}><p className="muted" style={{ margin: 0 }}>Замало даних — зʼявиться після кількох екзаменів.</p></div>
        ) : (
          hardest.map(h => {
            const q = QMAP.get(h.id);
            return (
              <div key={h.id} className="card" style={{ padding: '16px 22px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontFamily: 'var(--disp)', fontSize: 26, fontWeight: 700, color: 'var(--bad)', flex: '0 0 64px' }}>{h.pct}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    {q && <span className="tag">Домен {q.d} · {DOMAINS[q.d]?.nameUk}</span>}
                    {q && <span className="tag">Сценарій {q.s}</span>}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--ink2)' }}>{q ? q.q.slice(0, 130) + (q.q.length > 130 ? '…' : '') : h.id}</div>
                </div>
                <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{h.wrong}/{h.shown}</div>
              </div>
            );
          })
        )}
      </section>

      <div style={{ marginTop: 36, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href="/trenazher" className="btn accent">Пройти екзамен →</Link>
        <Link href="/domeny" className="btn ghost">Домени екзамену</Link>
      </div>
    </div>
  );
}
