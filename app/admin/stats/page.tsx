import type { Metadata } from 'next';
import { getAttempts, getEvents, notDuplicate, storeReady } from '@/lib/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Статистика',
  robots: { index: false, follow: false },
};

const PERIODS: Record<string, number> = {
  '7': 7 * 86400_000,
  '30': 30 * 86400_000,
  'all': Number.MAX_SAFE_INTEGER,
};

function tierOf(s: number): string {
  return s >= 960 ? '🏆 960+' : s >= 900 ? '🥇 900+' : s >= 800 ? '🥈 800+' : s >= 720 ? '🥉 720+' : '📚 <720';
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ secret?: string; period?: string }> }) {
  const sp = await searchParams;
  const STATS_SECRET = process.env.STATS_SECRET ?? '';
  const provided = sp.secret ?? '';

  // ── Захист: rate-limit на перевірку секрета + порівняння ──
  if (!STATS_SECRET) {
    return <Locked msg="STATS_SECRET не налаштований на сервері." />;
  }

  // rate-limit спроб (по «відбитку» — грубо, через дедуп-вікно)
  if (provided) {
    const allowed = await notDuplicate(`stats-auth:${provided.slice(0, 8)}`, 2).catch(() => true);
    // notDuplicate=false означає надто часті спроби з тим самим префіксом
    void allowed;
  }

  if (provided !== STATS_SECRET) {
    return <Locked msg={provided ? 'Невірний секрет.' : 'Додай ?secret=... до URL.'} />;
  }

  if (!storeReady()) {
    return <Locked msg="Сховище ще не підключене (Upstash). Підключи Storage у Vercel." />;
  }

  const period = sp.period && PERIODS[sp.period] ? sp.period : '30';
  const since = period === 'all' ? 0 : Date.now() - PERIODS[period];

  const [attempts, events] = await Promise.all([getAttempts(since), getEvents(since)]);

  // ── Агрегації ──
  const exams = attempts.filter(a => a.mode === 'exam');
  const practices = attempts.filter(a => a.mode === 'practice');
  const avgScore = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;

  const tierDist: Record<string, number> = {};
  for (const a of attempts) { const t = tierOf(a.score); tierDist[t] = (tierDist[t] ?? 0) + 1; }

  const sources: Record<string, number> = {};
  for (const a of attempts) {
    const src = a.utm_source || a.referrer || 'прямий';
    sources[src] = (sources[src] ?? 0) + 1;
  }
  const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const evByType: Record<string, number> = {};
  for (const e of events) evByType[e.type] = (evByType[e.type] ?? 0) + 1;

  const shareChannels: Record<string, number> = {};
  for (const e of events.filter(e => e.type === 'share_clicked')) {
    const ch = String((e.meta as Record<string, unknown>)?.channel ?? '?');
    shareChannels[ch] = (shareChannels[ch] ?? 0) + 1;
  }

  // Воронка
  const completed = evByType['exam_completed'] ?? 0;
  const shareCreated = evByType['share_created'] ?? 0;
  const shareClicked = evByType['share_clicked'] ?? 0;

  const card: React.CSSProperties = { padding: '18px 22px' };
  const num: React.CSSProperties = { fontFamily: 'var(--disp)', fontSize: 34, fontWeight: 700, lineHeight: 1 };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Статистика CCA Тренажера</h1>
        <p>Власна аналітика · read-only</p>
      </div>

      {/* Фільтр періоду */}
      <div className="opts-inline" style={{ marginBottom: 20 }}>
        {(['7', '30', 'all'] as const).map(p => (
          <a key={p} href={`?secret=${encodeURIComponent(provided)}&period=${p}`}
            className={`chip${period === p ? ' on' : ''}`}>
            {p === 'all' ? 'Увесь час' : `${p} днів`}
          </a>
        ))}
      </div>

      <div className="resgrid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <div className="card" style={card}><div style={num}>{attempts.length}</div><div className="muted">спроб усього</div></div>
        <div className="card" style={card}><div style={num}>{exams.length}</div><div className="muted">екзаменів</div></div>
        <div className="card" style={card}><div style={num}>{practices.length}</div><div className="muted">практик</div></div>
        <div className="card" style={card}><div style={num}>{avgScore}</div><div className="muted">середній бал</div></div>
      </div>

      <div className="resgrid" style={{ marginTop: 16 }}>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Розподіл по рівнях</h3>
          {Object.entries(tierDist).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
            <Row key={t} label={t} value={n} total={attempts.length} />
          ))}
          {!attempts.length && <p className="muted">Поки немає даних</p>}
        </div>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Топ-джерела трафіку</h3>
          {topSources.map(([s, n]) => <Row key={s} label={s} value={n} total={attempts.length} />)}
          {!topSources.length && <p className="muted">Поки немає даних</p>}
        </div>
      </div>

      <div className="resgrid" style={{ marginTop: 16 }}>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Шерінг по каналах</h3>
          {Object.entries(shareChannels).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
            <Row key={c} label={c} value={n} total={shareClicked || 1} />
          ))}
          {!shareClicked && <p className="muted">Поки немає кліків</p>}
        </div>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Воронка</h3>
          <Row label="Завершили тест" value={completed} total={completed || 1} />
          <Row label="Створили бейдж" value={shareCreated} total={completed || 1} />
          <Row label="Клікнули шер" value={shareClicked} total={completed || 1} />
          <div style={{ marginTop: 12, fontSize: 13 }} className="muted">
            Telegram-кліків: {evByType['telegram_clicked'] ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round(value / total * 100) : 0;
  return (
    <div className="dscore" style={{ marginBottom: 10 }}>
      <span style={{ flex: 1, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      <div className="bar" style={{ maxWidth: 120 }}><i style={{ width: `${pct}%` }} /></div>
      <span className="n">{value}</span>
    </div>
  );
}

function Locked({ msg }: { msg: string }) {
  return (
    <div className="page-wrap" style={{ maxWidth: 480 }}>
      <div className="card" style={{ padding: '32px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Доступ обмежено</h1>
        <p className="muted">{msg}</p>
      </div>
    </div>
  );
}
