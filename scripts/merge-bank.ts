/**
 * Детерміноване злиття: оригінальні id/s/d/a/q + нові opts/ex з .bank-fix/*.json
 * → новий lib/exam-bank.ts (структура файла зберігається; міняються лише opts і ex).
 * Запуск: npx tsx scripts/merge-bank.ts
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { QB } from '../lib/exam-bank';

const FILE = 'lib/exam-bank.ts';
const DIR = '.bank-fix';

interface Fix { id: string; opts: string[]; ex: string; concern?: string }

// Зібрати фікси з усіх батч-файлів; patch.json накладається ОСТАННІМ (override)
const fixes = new Map<string, Fix>();
const concerns: Array<{ id: string; concern: string }> = [];
const skipped: string[] = [];

function loadFile(f: string) {
  const data = JSON.parse(readFileSync(`${DIR}/${f}`, 'utf8'));
  for (const q of data.questions ?? []) {
    if (!q.id) continue;
    if (!Array.isArray(q.opts) || q.opts.length !== 4 || !q.ex || !q.ex.trim()) {
      skipped.push(q.id);   // порожній/невалідний — лишимо оригінал (або patch перекриє)
      continue;
    }
    fixes.set(q.id, q);
    if (q.concern && q.concern.trim()) concerns.push({ id: q.id, concern: q.concern.trim() });
  }
}

// порядок накладання: основні батчі → patch.json → patch2/*.json (останнє слово)
const EXCLUDE = new Set(['batches.json', 'concerns.json', 'patch.json', 'patch2-batches.json']);
const files = readdirSync(DIR).filter(f => f.endsWith('.json') && !EXCLUDE.has(f));
for (const f of files) loadFile(f);
if (readdirSync(DIR).includes('patch.json')) loadFile('patch.json');
// patch2 (вирівнювання довжини) — окрема тека
function loadDir(sub: string) {
  try {
    for (const f of readdirSync(`${DIR}/${sub}`)) {
      if (!f.endsWith('.json')) continue;
      const data = JSON.parse(readFileSync(`${DIR}/${sub}/${f}`, 'utf8'));
      for (const q of data.questions ?? []) {
        if (q.id && Array.isArray(q.opts) && q.opts.length === 4 && q.ex?.trim()) fixes.set(q.id, q);
      }
    }
  } catch { /* немає теки — ок */ }
}
loadDir('patch2');  // вирівнювання довжини
loadDir('patch3');  // балансування рангу (частину shortest → longest)

if (skipped.length) console.warn(`⚠️  Порожні записи (перекрито patch або лишено оригінал): ${[...new Set(skipped)].join(', ')}`);

// Перевірка покриття
const missing = QB.filter(q => !fixes.has(q.id)).map(q => q.id);
if (missing.length) {
  console.warn(`⚠️  Без фіксу (лишаю оригінал): ${missing.join(', ')}`);
}

// Згенерувати нові записи в оригінальному порядку
const J = (s: string) => JSON.stringify(s);
const entries = QB.map(q => {
  const fix = fixes.get(q.id);
  const opts = fix ? fix.opts : q.opts;
  const ex = fix ? fix.ex : q.ex;
  return `  {id:${J(q.id)},s:${q.s},d:${q.d},q:${J(q.q)},opts:[${opts.map(J).join(',')}],a:${q.a},ex:${J(ex)}},`;
});

// Сплайс у файл
const text = readFileSync(FILE, 'utf8');
const startMarker = 'export const QB: Question[] = [';
const endMarker = 'export function getQuestionsByDomain';
const headEnd = text.indexOf(startMarker) + startMarker.length;
const tailStart = text.indexOf(endMarker);
if (headEnd < startMarker.length || tailStart < 0) throw new Error('Не знайдено межі QB у файлі');

const out = text.slice(0, headEnd) + '\n' + entries.join('\n') + '\n];\n\n' + text.slice(tailStart);
writeFileSync(FILE, out, 'utf8');

console.log(`✅ Злито ${fixes.size} фіксів у ${QB.length} питань.`);
console.log(`   Сумнівів (concerns): ${concerns.length}`);
writeFileSync(`${DIR}/concerns.json`, JSON.stringify(concerns, null, 2));
