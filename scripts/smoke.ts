/**
 * Смоук-тести чистих функцій (без мережі/сховища).
 * Запуск: SHARE_SECRET=test npx tsx scripts/smoke.ts
 */
import { signBadge, verifyBadge, sanitizeNick, tierForScore } from '../lib/share';

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
  check('roundtrip зберігає score', ok?.score === 845);
  check('roundtrip зберігає nick', ok?.nick === 'Vitaliy');

  const tampered = tok.slice(0, -2) + (tok.endsWith('a') ? 'bb' : 'aa');
  const bad = await verifyBadge(tampered);
  check('підроблений підпис → null', bad === null);

  check('сміття → null', (await verifyBadge('garbage')) === null);

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

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main();
