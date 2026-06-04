/**
 * Аналіз/лінт банку питань.
 * Запуск: npx tsx scripts/audit-bank.ts          (звіт)
 *         npx tsx scripts/audit-bank.ts --lint    (exit 1 при порушеннях)
 */
import { QB } from '../lib/exam-bank';

const LINT = process.argv.includes('--lint');

// Регекс літерних посилань: (A) (B) (C) (D), (B, C), кирилиця (А)(Б)(В)(Г),
// "варіант A", "відповідь B"
const LETTER_REF = /\(([A-DА-Г])(\s*[,/]\s*[A-DА-Г])*\)|\b(варіант|відповідь|опція|пункт)\s+[A-DА-Г]\b/u;

interface Finding { id: string; issues: string[]; }
const findings: Finding[] = [];

let letterRefCount = 0;
let longestCorrectCount = 0;
const longestCorrect: string[] = [];
const tooLong: string[] = [];

for (const q of QB) {
  const issues: string[] = [];

  // структура
  if (!Array.isArray(q.opts) || q.opts.length !== 4) issues.push(`opts != 4 (${q.opts?.length})`);
  if (typeof q.a !== 'number' || q.a < 0 || q.a > 3) issues.push(`a поза 0–3 (${q.a})`);
  if (!q.ex || !q.ex.trim()) issues.push('порожнє ex');
  if (q.d < 1 || q.d > 5) issues.push(`d поза 1–5 (${q.d})`);
  if (q.s < 1 || q.s > 6) issues.push(`s поза 1–6 (${q.s})`);

  // літерні посилання в ex
  if (q.ex && LETTER_REF.test(q.ex)) {
    issues.push('ex містить літерне посилання');
    letterRefCount++;
  }

  // перекіс довжини
  if (Array.isArray(q.opts) && q.opts.length === 4) {
    const lens = q.opts.map(o => o.length);
    const correctLen = lens[q.a];
    const maxLen = Math.max(...lens);
    const others = lens.filter((_, i) => i !== q.a);
    const avgOthers = others.reduce((a, b) => a + b, 0) / others.length;

    if (correctLen === maxLen && lens.filter(l => l === maxLen).length === 1) {
      longestCorrectCount++;
      longestCorrect.push(q.id);
    }
    if (correctLen > avgOthers * 1.5) {
      issues.push(`правильний у ${(correctLen / avgOthers).toFixed(2)}× довший за сер. дистрактор`);
      tooLong.push(q.id);
    }
  }

  if (issues.length) findings.push({ id: q.id, issues });
}

// дублікати id
const ids = QB.map(q => q.id);
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);

const total = QB.length;
const pctLongest = (longestCorrectCount / total * 100);

console.log(`\n=== АУДИТ БАНКУ (${total} питань) ===\n`);
console.log(`Літерних посилань у ex:       ${letterRefCount} (${(letterRefCount/total*100).toFixed(0)}%)`);
console.log(`Правильна = найдовша:         ${longestCorrectCount} (${pctLongest.toFixed(1)}%)  [випадково ≈25%]`);
console.log(`Правильна >1.5× сер.дистрактор: ${tooLong.length}`);
console.log(`Дублікати id:                 ${dupIds.length ? dupIds.join(', ') : 'немає'}`);

if (!LINT) {
  console.log(`\n--- Питання з літерними посиланнями ---`);
  console.log(findings.filter(f => f.issues.some(i => i.includes('літерне'))).map(f => f.id).join(', ') || 'немає');
  console.log(`\n--- Правильна = найдовша ---`);
  console.log(longestCorrect.join(', ') || 'немає');
  console.log(`\n--- Правильна значно довша (>1.5×) ---`);
  console.log(tooLong.join(', ') || 'немає');
}

if (LINT) {
  const errors: string[] = [];
  if (letterRefCount > 0) errors.push(`${letterRefCount} ex з літерними посиланнями`);
  if (pctLongest > 30) errors.push(`перекіс довжини: ${pctLongest.toFixed(1)}% (поріг 30%)`);
  if (tooLong.length > 0) errors.push(`${tooLong.length} питань де правильна >1.5× дистракторів`);
  if (dupIds.length) errors.push(`дублікати id: ${dupIds.join(', ')}`);
  const structural = findings.filter(f => f.issues.some(i => !i.includes('літерне') && !i.includes('довший')));
  if (structural.length) errors.push(`структурні: ${structural.map(f => `${f.id}(${f.issues.join(';')})`).join(', ')}`);

  if (errors.length) {
    console.error(`\n❌ ЛІНТ ПРОВАЛЕНО:\n  - ${errors.join('\n  - ')}\n`);
    process.exit(1);
  }
  console.log(`\n✅ Лінт банку: чисто\n`);
}
