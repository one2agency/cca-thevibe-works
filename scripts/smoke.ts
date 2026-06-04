/**
 * Смоук-тести чистих функцій (без мережі/сховища).
 * Запуск: SHARE_SECRET=test npx tsx scripts/smoke.ts
 */
import { signBadge, verifyBadge, sanitizeNick, tierForScore } from '../lib/share';
import { formatStatsMessage, type Stats } from '../lib/stats';

process.env.SHARE_SECRET = process.env.SHARE_SECRET || 'test-secret-for-smoke';

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name}`); }
}

async function main() {
  console.log('— HMAC підпис/верифікація —');
  const tok = await signBadge({ score: 845, tier: 'silver', nick: 'Vitaliy', ts: 1700000000000 });
  const ok = await verifyBadge(tok);
  check('roundtrip зберігає score', (ok as { score?: number })?.score === 845);
  check('roundtrip зберігає nick', ok?.nick === 'Vitaliy');

  const tampered = tok.slice(0, -2) + (tok.endsWith('a') ? 'bb' : 'aa');
  const bad = await verifyBadge(tampered);
  check('підроблений підпис → null', bad === null);

  check('сміття → null', (await verifyBadge('garbage')) === null);

  const ptok = await signBadge({ kind: 'practice', correct: 18, total: 20, scope: 'Домен 1', nick: 'Ola', ts: 1700000000000 });
  const pp = await verifyBadge(ptok);
  check('practice payload roundtrip', pp?.kind === 'practice' && (pp as { correct: number }).correct === 18);
  check('practice підроблений → null', (await verifyBadge(ptok.slice(0, -2) + 'zz')) === null);

  console.log('— Рівні —');
  check('960 → champion', tierForScore(965).key === 'champion');
  check('845 → silver', tierForScore(845).key === 'silver');
  check('720 → bronze', tierForScore(720).key === 'bronze');
  check('500 → prep', tierForScore(500).key === 'prep');

  console.log('— Санітизація ніку —');
  check('звичайний нік ок', sanitizeNick('Олег_2024').ok === true);
  check('порожній ок', sanitizeNick('').ok === true);
  check('посилання відхиляється', sanitizeNick('vasya t.me/spam').ok === false);
  check('HTML вирізається', !sanitizeNick('<b>hi</b>').value.includes('<'));
  check('нецензурщина відхиляється', sanitizeNick('fuck you').ok === false);
  check('довгий обрізається до 24', sanitizeNick('x'.repeat(50)).value.length <= 24);

  console.log('— Форматування /stats —');
  const sample: Stats = {
    period: '7', attempts: 12, exams: 8, practices: 4, avgExamScore: 812,
    tier: { champion: 1, gold: 2, silver: 3, bronze: 2, prep: 4 },
    topSources: [['linkedin.com', 5], ['прямий', 4], ['t.co', 3]],
    shareCreated: 6, shareClicked: 9,
    shareByChannel: { linkedin: 4, facebook: 2, x: 1, download: 2 },
    telegramClicked: 7, botUsers: 5, feedbacks: 2, jobApps: 1,
  };
  const msg = formatStatsMessage(sample);
  check('містить заголовок', msg.includes('Статистика'));
  check('період підставлено', msg.includes('останні 7 днів'));
  check('екзамени', msg.includes('екзамен): 8'));
  check('середній бал', msg.includes('812 / 1000'));
  check('розподіл рівнів', msg.includes('🏆1') && msg.includes('🥉2'));
  check('топ-джерело', msg.includes('linkedin.com: 5'));
  check('канали шерінгу', msg.includes('LinkedIn 4') && msg.includes('FB 2') && msg.includes('X 1'));
  check('бот: юзери/фідбек/заявки', msg.includes('користувачів: 5') && msg.includes('Фідбеків: 2') && msg.includes('кандидатів: 1'));
  check('порожні → 0', formatStatsMessage({ ...sample, exams: 0, shareByChannel: {} }).includes('екзамен): 0'));

  console.log('— Admin-auth (веб-логін) —');
  process.env.STATS_PASSWORD = 'test-password-123';
  const { createSession, verifySession, checkPassword } = await import('../lib/admin-auth');
  const sess = await createSession();
  check('валідна сесія верифікується', (await verifySession(sess)) === true);
  check('підроблена сесія → false', (await verifySession(sess.slice(0, -2) + 'zz')) === false);
  check('порожня сесія → false', (await verifySession(undefined)) === false);
  check('правильний пароль', checkPassword('test-password-123') === true);
  check('хибний пароль', checkPassword('wrong') === false);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main();
