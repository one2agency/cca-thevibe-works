import type { Metadata } from 'next';
import { storeReady, notDuplicate } from '@/lib/store';
import { getStats, PERIOD_LABEL, type Period } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Статистика',
  robots: { index: false, follow: false },
};

export default async function StatsPage({ searchParams }: { searchParams: Promise<{ secret?: string; period?: string }> }) {
  const sp = await searchParams;
  const STATS_SECRET = process.env.STATS_SECRET ?? '';
  const provided = sp.secret ?? '';

  if (!STATS_SECRET) return <Locked msg="STATS_SECRET не налаштований на сервері." />;

  // rate-limit перевірки секрета
  if (provided) {
    await notDuplicate(`stats-auth:${provided.slice(0, 8)}`, 2).catch(() => true);
  }
  if (provided !== STATS_SECRET) {
    return <Locked msg={provided ? 'Невірний секрет.' : 'Додай ?secret=... до URL.'} />;
  }
  if (!storeReady()) {
    return <Locked msg="Сховище ще не підключене (Upstash)." />;
  }

  const period: Period = sp.period === '7' || sp.period === '30' || sp.period === 'all' ? sp.period : '7';
  const s = await getStats(period);

  const card: React.CSSProperties = { padding: '18px 22px' };
  const num: React.CSSProperties = { fontFamily: 'var(--disp)', fontSize: 34, fontWeight: 700, lineHeight: 1 };
  const sh = s.shareByChannel;

  const tierRows: Array<[string, number]> = [
    ['🏆 960+', s.tier.champion], ['🥇 900+', s.tier.gold], ['🥈 800+', s.tier.silver],
    ['🥉 720+', s.tier.bronze], ['📚 <720', s.tier.prep],
  ];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h1>Статистика CCA Тренажера</h1>
        <p>Власна аналітика · {PERIOD_LABEL[period]} · read-only</p>
      </div>

      <div className="opts-inline" style={{ marginBottom: 20 }}>
        {(['7', '30', 'all'] as const).map(p => (
          <a key={p} href={`?secret=${encodeURIComponent(provided)}&period=${p}`} className={`chip${period === p ? ' on' : ''}`}>
            {p === 'all' ? 'Увесь час' : `${p} днів`}
          </a>
        ))}
      </div>

      <div className="resgrid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <div className="card" style={card}><div style={num}>{s.exams}</div><div className="muted">екзаменів</div></div>
        <div className="card" style={card}><div style={num}>{s.practices}</div><div className="muted">практик</div></div>
        <div className="card" style={card}><div style={num}>{s.avgExamScore || '—'}</div><div className="muted">сер. бал (екз.)</div></div>
        <div className="card" style={card}><div style={num}>{s.botUsers}</div><div className="muted">юзерів бота</div></div>
      </div>

      <div className="resgrid" style={{ marginTop: 16 }}>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Розподіл по рівнях</h3>
          {tierRows.map(([t, n]) => <Row key={t} label={t} value={n} total={s.attempts} />)}
        </div>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Топ-джерела трафіку</h3>
          {s.topSources.map(([src, n]) => <Row key={src} label={src} value={n} total={s.attempts} />)}
          {!s.topSources.length && <p className="muted">Поки немає даних</p>}
        </div>
      </div>

      <div className="resgrid" style={{ marginTop: 16 }}>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Шерінг по каналах</h3>
          {Object.entries(sh).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
            <Row key={c} label={c} value={n} total={s.shareClicked || 1} />
          ))}
          {!s.shareClicked && <p className="muted">Поки немає кліків</p>}
        </div>
        <div className="card" style={card}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Воронка та бот</h3>
          <Row label="Завершили тест" value={s.exams + s.practices} total={(s.exams + s.practices) || 1} />
          <Row label="Створили бейдж" value={s.shareCreated} total={(s.exams + s.practices) || 1} />
          <Row label="Клікнули шер" value={s.shareClicked} total={(s.exams + s.practices) || 1} />
          <div className="muted" style={{ fontSize: 13, marginTop: 10 }}>
            TG-кліків: {s.telegramClicked} · фідбеків: {s.feedbacks} · заявок: {s.jobApps}
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
