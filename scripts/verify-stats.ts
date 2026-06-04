/**
 * Живий e2e тест getStats проти реального Upstash.
 * Seed → перевірка → cleanup (не лишає сміття у проді).
 * Запуск: npx tsx scripts/verify-stats.ts  (читає .env.local)
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
import { redis } from '../lib/store';
import { getStats } from '../lib/stats';

async function main() {
  const r = redis();
  if (!r) { console.error('❌ Сховище недоступне (немає KV env)'); process.exit(1); }

  const now = Date.now();
  const TAG = `__SMOKE_${now}__`;

  // Seed: 1 екзамен (бал 845 → silver), 1 практика, події
  const attemptExam = JSON.stringify({ session_id: TAG, mode: 'exam', score: 845, domain_breakdown: {}, completed_at: now, utm_source: 'smoketest.dev' });
  const attemptPrac = JSON.stringify({ session_id: TAG, mode: 'practice', score: 600, domain_breakdown: {}, completed_at: now });
  const evShare = JSON.stringify({ type: 'share_clicked', ts: now, session_id: TAG, meta: { channel: 'linkedin' } });
  const evBot1  = JSON.stringify({ type: 'bot_interaction', ts: now, session_id: TAG, meta: { uid: 111 } });
  const evBot2  = JSON.stringify({ type: 'bot_interaction', ts: now, session_id: TAG, meta: { uid: 222 } });
  const evFb    = JSON.stringify({ type: 'bot_feedback', ts: now, session_id: TAG, meta: { uid: 111 } });

  await r.zadd('cca:attempts', { score: now, member: attemptExam }, { score: now, member: attemptPrac });
  await r.zadd('cca:events',
    { score: now, member: evShare }, { score: now, member: evBot1 },
    { score: now, member: evBot2 }, { score: now, member: evFb });
  // скинути кеш
  await r.del('cca:statscache:7');

  const s = await getStats('7');
  let ok = true;
  const chk = (n: string, c: boolean) => { console.log(`  ${c ? '✅' : '❌'} ${n}`); ok = ok && c; };

  console.log('— getStats проти живого Upstash (seed→read) —');
  chk(`екзамени ≥ 1 (got ${s.exams})`, s.exams >= 1);
  chk(`практики ≥ 1 (got ${s.practices})`, s.practices >= 1);
  chk(`silver врахований (got ${s.tier.silver})`, s.tier.silver >= 1);
  chk(`share linkedin (got ${s.shareByChannel.linkedin ?? 0})`, (s.shareByChannel.linkedin ?? 0) >= 1);
  chk(`унікальних юзерів ≥ 2 (got ${s.botUsers})`, s.botUsers >= 2);
  chk(`фідбеків ≥ 1 (got ${s.feedbacks})`, s.feedbacks >= 1);
  chk(`джерело smoketest.dev у топі`, s.topSources.some(([src]) => src === 'smoketest.dev'));

  // Cleanup
  await r.zrem('cca:attempts', attemptExam, attemptPrac);
  await r.zrem('cca:events', evShare, evBot1, evBot2, evFb);
  await r.del('cca:statscache:7');
  console.log('  🧹 тестові дані прибрано');

  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
