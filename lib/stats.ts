/**
 * Єдине джерело розрахунків статистики — використовують і /admin/stats, і /stats у боті.
 * Агрегує attempts + events зі сховища, обмежує періодом, кешує на 120с.
 */
import { getAttempts, getEvents, redis } from './store';

export type Period = '7' | '30' | 'all';

export const PERIOD_MS: Record<Period, number> = {
  '7': 7 * 86400_000,
  '30': 30 * 86400_000,
  'all': Number.MAX_SAFE_INTEGER,
};

export const PERIOD_LABEL: Record<Period, string> = {
  '7': 'останні 7 днів',
  '30': 'останні 30 днів',
  'all': 'увесь час',
};

export interface Stats {
  period: Period;
  attempts: number;
  exams: number;
  practices: number;
  avgExamScore: number;
  tier: { champion: number; gold: number; silver: number; bronze: number; prep: number };
  topSources: Array<[string, number]>;
  shareCreated: number;
  shareClicked: number;
  shareByChannel: Record<string, number>;
  telegramClicked: number;
  botUsers: number;
  feedbacks: number;
  jobApps: number;
}

function tierKey(s: number): keyof Stats['tier'] {
  return s >= 960 ? 'champion' : s >= 900 ? 'gold' : s >= 800 ? 'silver' : s >= 720 ? 'bronze' : 'prep';
}

export async function getStats(period: Period): Promise<Stats> {
  // кеш 120с
  const r = redis();
  const cacheKey = `cca:statscache:${period}`;
  if (r) {
    const cached = await r.get<Stats>(cacheKey).catch(() => null);
    if (cached) return cached;
  }

  const since = period === 'all' ? 0 : Date.now() - PERIOD_MS[period];
  const [attempts, events] = await Promise.all([getAttempts(since), getEvents(since)]);

  const exams = attempts.filter(a => a.mode === 'exam');
  const practices = attempts.filter(a => a.mode === 'practice');
  const avgExamScore = exams.length ? Math.round(exams.reduce((s, a) => s + a.score, 0) / exams.length) : 0;

  const tier = { champion: 0, gold: 0, silver: 0, bronze: 0, prep: 0 };
  for (const a of attempts) tier[tierKey(a.score)]++;

  const sources: Record<string, number> = {};
  for (const a of attempts) {
    const src = a.utm_source || a.referrer || 'прямий';
    sources[src] = (sources[src] ?? 0) + 1;
  }
  const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const byType: Record<string, number> = {};
  for (const e of events) byType[e.type] = (byType[e.type] ?? 0) + 1;

  const shareByChannel: Record<string, number> = {};
  for (const e of events.filter(e => e.type === 'share_clicked')) {
    const ch = String((e.meta as Record<string, unknown>)?.channel ?? '?');
    shareByChannel[ch] = (shareByChannel[ch] ?? 0) + 1;
  }

  // унікальні користувачі бота — distinct uid серед bot_interaction
  const botUserSet = new Set<string>();
  for (const e of events.filter(e => e.type === 'bot_interaction')) {
    const uid = String((e.meta as Record<string, unknown>)?.uid ?? e.session_id ?? '');
    if (uid) botUserSet.add(uid);
  }

  const stats: Stats = {
    period,
    attempts: attempts.length,
    exams: exams.length,
    practices: practices.length,
    avgExamScore,
    tier,
    topSources,
    shareCreated: byType['share_created'] ?? 0,
    shareClicked: byType['share_clicked'] ?? 0,
    shareByChannel,
    telegramClicked: byType['telegram_clicked'] ?? 0,
    botUsers: botUserSet.size,
    feedbacks: byType['bot_feedback'] ?? 0,
    jobApps: byType['bot_job'] ?? 0,
  };

  if (r) await r.set(cacheKey, stats, { ex: 120 }).catch(() => {});
  return stats;
}

// Текстове повідомлення для Telegram (HTML)
export function formatStatsMessage(s: Stats): string {
  const sh = s.shareByChannel;
  const n = (v: number) => (v ? String(v) : '0');
  const sources = s.topSources.length
    ? s.topSources.map(([src, c]) => `• ${src}: ${c}`).join('\n')
    : '• —';

  return `📊 <b>Статистика</b> · ${PERIOD_LABEL[s.period]}

🎓 <b>Тести</b>
• Пройдено (екзамен): ${n(s.exams)}
• Пройдено (практика): ${n(s.practices)}
• Середній бал (екзамен): ${s.avgExamScore || '—'} / 1000
• Розподіл: 🏆${s.tier.champion} 🥇${s.tier.gold} 🥈${s.tier.silver} 🥉${s.tier.bronze} &lt;720:${s.tier.prep}

🔗 <b>Трафік (топ-5)</b>
${sources}

💛 <b>Залученість</b>
• Кліків «поділитися»: ${n(s.shareClicked)} (LinkedIn ${n(sh.linkedin)} · FB ${n(sh.facebook)} · X ${n(sh.x)} · завантажень ${n(sh.download)})
• Створено бейджів: ${n(s.shareCreated)}
• Кліків на Telegram-бот: ${n(s.telegramClicked)}

🤖 <b>Бот</b>
• Унікальних користувачів: ${n(s.botUsers)}
• Фідбеків: ${n(s.feedbacks)}
• Заявок кандидатів: ${n(s.jobApps)}`;
}
