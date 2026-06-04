'use client';

import { useState, useEffect, useCallback } from 'react';
import { DOMAINS, SCEN, QB, PASS_SCALED, EXAM_DURATION_SEC, TOTAL_EXAM_QUESTIONS } from '@/lib/exam-bank';
import type { Question } from '@/lib/exam-bank';
import ShareBadge from './ShareBadge';
import { track, getAttribution } from '@/lib/analytics';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = 'home' | 'config' | 'run' | 'review' | 'results';
type Mode = 'exam' | 'practice';
type ScopeType = 'all' | 'domain' | 'scenario';
interface Scope { type: ScopeType; val?: number; }

interface PreparedQ extends Question {
  opts: string[];   // shuffled
  correct: number;  // remapped index
}

interface RunState {
  mode: Mode;
  questions: PreparedQ[];
  i: number;
  answers: Record<number, number>;
  marked: Record<number, boolean>;
  locked: Record<number, boolean>;
  endTime: number;
}

interface ResultData {
  correct: number;
  total: number;
  scaled: number;
  pass: boolean;
  byDom: Record<number, { c: number; n: number }>;
  questions: PreparedQ[];
  answers: Record<number, number>;
  practice: boolean;
}

// Що зберігаємо в localStorage (без питань — вони важкі)
interface SavedResult {
  date: string;       // ISO date
  scaled: number;
  pass: boolean;
  correct: number;
  total: number;
  practice: boolean;
  byDom: Record<number, { c: number; n: number }>;
}

const LS_KEY = 'cca_history';
const MAX_HISTORY = 10;

function loadHistory(): SavedResult[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch { return []; }
}

function saveToHistory(r: ResultData) {
  const entry: SavedResult = {
    date: new Date().toISOString(),
    scaled: r.scaled,
    pass: r.pass,
    correct: r.correct,
    total: r.total,
    practice: r.practice,
    byDom: r.byDom,
  };
  const prev = loadHistory();
  const next = [entry, ...prev].slice(0, MAX_HISTORY);
  localStorage.setItem(LS_KEY, JSON.stringify(next));
}

// Агрегує слабкі домени по всій історії
function calcWeakDomains(history: SavedResult[]): { domainId: number; pct: number }[] {
  const agg: Record<number, { c: number; n: number }> = {};
  for (const r of history) {
    for (const [k, v] of Object.entries(r.byDom)) {
      const d = +k;
      agg[d] = agg[d] || { c: 0, n: 0 };
      agg[d].c += v.c;
      agg[d].n += v.n;
    }
  }
  return Object.entries(agg)
    .map(([k, v]) => ({ domainId: +k, pct: Math.round(v.c / v.n * 100) }))
    .filter(x => x.pct < 70)
    .sort((a, b) => a.pct - b.pct);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LETTERS = ['A', 'B', 'C', 'D'];

function prepQ(q: Question): PreparedQ {
  const idx = shuffle([0, 1, 2, 3]);
  const opts = idx.map(i => q.opts[i]);
  const correct = idx.indexOf(q.a);
  return { ...q, opts, correct };
}

function buildExam(): PreparedQ[] {
  const scs = shuffle([1, 2, 3, 4, 5, 6]).slice(0, 4);
  let qs: Question[] = [];
  scs.forEach(sc => {
    const pool = QB.filter(q => q.s === sc);
    qs = qs.concat(shuffle(pool).slice(0, 15));
  });
  return shuffle(qs).slice(0, TOTAL_EXAM_QUESTIONS).map(prepQ);
}

function buildPractice(scope: Scope, count: number): PreparedQ[] {
  let pool = QB.slice();
  if (scope.type === 'domain' && scope.val) pool = QB.filter(q => q.d === scope.val);
  if (scope.type === 'scenario' && scope.val) pool = QB.filter(q => q.s === scope.val);
  pool = shuffle(pool);
  if (count && count < pool.length) pool = pool.slice(0, count);
  return pool.map(prepQ);
}

function formatTime(secs: number): string {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function calcResult(run: RunState, practice: boolean): ResultData {
  let correct = 0;
  const byDom: Record<number, { c: number; n: number }> = {};
  run.questions.forEach((q, i) => {
    const ok = run.answers[i] === q.correct;
    if (ok) correct++;
    byDom[q.d] = byDom[q.d] || { c: 0, n: 0 };
    byDom[q.d].n++;
    if (ok) byDom[q.d].c++;
  });
  const total = run.questions.length;
  const scaled = Math.round(100 + (correct / total) * 900);
  return { correct, total, scaled, pass: scaled >= PASS_SCALED, byDom, questions: run.questions, answers: run.answers, practice };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  defaultDomain?: number;
  defaultScenario?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExamSimulator({ defaultDomain, defaultScenario }: Props) {
  const [screen, setScreen] = useState<Screen>('home');
  const [scope, setScope] = useState<Scope>({ type: 'all' });
  const [practiceCount, setPracticeCount] = useState(20);
  const [run, setRun] = useState<RunState | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SEC);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'blank'>('all');
  const [history, setHistory] = useState<SavedResult[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Auto-start if URL params given
  useEffect(() => {
    if (defaultDomain) {
      const s: Scope = { type: 'domain', val: defaultDomain };
      const qs = buildPractice(s, 20);
      if (qs.length) {
        setRun({ mode: 'practice', questions: qs, i: 0, answers: {}, marked: {}, locked: {}, endTime: 0 });
        setScreen('run');
      }
    } else if (defaultScenario) {
      const s: Scope = { type: 'scenario', val: defaultScenario };
      const qs = buildPractice(s, 20);
      if (qs.length) {
        setRun({ mode: 'practice', questions: qs, i: 0, answers: {}, marked: {}, locked: {}, endTime: 0 });
        setScreen('run');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer
  useEffect(() => {
    if (screen !== 'run' || !run || run.mode !== 'exam') return;
    setTimeLeft(Math.max(0, Math.round((run.endTime - Date.now()) / 1000)));
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [screen, run?.endTime, run?.mode]);

  // Auto-finish when time runs out
  useEffect(() => {
    if (timeLeft === 0 && screen === 'run' && run?.mode === 'exam') {
      doFinishExam();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const reportCompletion = useCallback((r: ResultData) => {
    const attr = getAttribution();
    track('exam_completed', {
      mode: r.practice ? 'practice' : 'exam',
      score: r.scaled,
      tier: r.scaled >= 960 ? 'champion' : r.scaled >= 900 ? 'gold' : r.scaled >= 800 ? 'silver' : r.scaled >= 720 ? 'bronze' : 'prep',
      domain_breakdown: r.byDom,
      ...attr,
    });
  }, []);

  const doFinishExam = useCallback(() => {
    if (!run) return;
    const r = calcResult(run, false);
    saveToHistory(r);
    setHistory(loadHistory());
    setResult(r);
    setScreen('results');
    reportCompletion(r);
  }, [run, reportCompletion]);

  const doFinishPractice = useCallback(() => {
    if (!run) return;
    const r = calcResult(run, true);
    saveToHistory(r);
    setHistory(loadHistory());
    setResult(r);
    setScreen('results');
    reportCompletion(r);
  }, [run, reportCompletion]);

  // ── Home ───────────────────────────────────────────────────────────────────

  if (screen === 'home') {
    const last = history[0] ?? null;
    const weakDomains = calcWeakDomains(history);

    const domRows = Object.entries(DOMAINS).map(([k, v]) => (
      <div className="domrow" key={k}>
        <span className="tag" style={{ flex: '0 0 auto' }}>D{k}</span>
        <span style={{ flex: 1, minWidth: 120, fontSize: 15 }}>{v.name}</span>
        <div className="bar"><i style={{ width: `${v.w / 27 * 100}%` }} /></div>
        <b style={{ fontFamily: 'var(--mono)', fontSize: 14, flex: '0 0 42px', textAlign: 'right' }}>{v.w}%</b>
      </div>
    ));

    return (
      <div className="hero">
        <div className="brandline">Anthropic · Certification</div>
        <h1>Claude Certified Architect<br /><span className="accentword">Foundations</span> — симулятор</h1>
        <p className="sub">Тренажер, що імітує реальний екзамен: сценарні питання за п&apos;ятьма доменами, формат «одна правильна з чотирьох», scaled score 100–1000 із прохідним балом {PASS_SCALED}.</p>

        <div className="factrow">
          <div className="fact"><b>60</b><span>питань на спробу</span></div>
          <div className="fact"><b>120</b><span>хвилин у режимі екзамену</span></div>
          <div className="fact"><b>4&nbsp;/&nbsp;6</b><span>сценаріїв випадково</span></div>
          <div className="fact"><b>{QB.length}</b><span>питань у банку</span></div>
        </div>

        {/* ── Прогрес із localStorage ── */}
        {last && (
          <div className="card" style={{ padding: '18px 22px', marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink2)', marginBottom: 4 }}>
                {last.practice ? 'Остання практика' : 'Останній екзамен'} · {new Date(last.date).toLocaleDateString('uk-UA')}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontFamily: 'var(--disp)', fontSize: 36, fontWeight: 700, color: last.pass ? 'var(--good)' : 'var(--bad)' }}>{last.scaled}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--ink2)' }}>/ 1000 · {last.correct}/{last.total} правильних</span>
              </div>
              <div style={{ fontSize: 13, color: last.pass ? 'var(--good)' : 'var(--bad)', marginTop: 2 }}>
                {last.pass ? '✓ Прохідний' : '✗ Нижче порогу 720'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {history.length > 1 && (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink2)', alignSelf: 'center' }}>
                  {history.filter(h => h.pass).length} / {history.length} спроб прохідних
                </div>
              )}
              <button className="btn ghost" style={{ fontSize: 13, padding: '7px 13px' }}
                onClick={() => { if (confirm('Очистити всю історію результатів?')) { localStorage.removeItem(LS_KEY); setHistory([]); } }}>
                Очистити
              </button>
            </div>
          </div>
        )}

        {/* ── Слабкі домени ── */}
        {weakDomains.length > 0 && (
          <div className="card" style={{ padding: '16px 22px', marginTop: 12, borderLeft: '4px solid var(--accent)' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>
              Слабкі домени (нижче 70% по всій історії)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {weakDomains.map(({ domainId, pct }) => (
                <button
                  key={domainId}
                  className="chip"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  onClick={() => {
                    setScope({ type: 'domain', val: domainId });
                    setPracticeCount(20);
                    setScreen('config');
                  }}
                >
                  D{domainId} · {DOMAINS[domainId].name.split(' ')[0]}… · <strong>{pct}%</strong>
                </button>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 8 }}>
              Натисни на домен — одразу відкриється практика по ньому
            </div>
          </div>
        )}

        <div className="modegrid">
          <div className="card mode" onClick={startExam} style={{ cursor: 'pointer' }}>
            <div className="ic">⏱</div>
            <h3>Режим екзамену</h3>
            <p>60 питань, таймер 120 хв, без підказок. Результат і розбір — у кінці. Найближче до реального іспиту.</p>
            <span className="btn accent">Почати екзамен →</span>
          </div>
          <div className="card mode" onClick={() => setScreen('config')} style={{ cursor: 'pointer' }}>
            <div className="ic">✎</div>
            <h3>Режим практики</h3>
            <p>Відповідь і пояснення одразу після кожного питання. Можна фільтрувати за доменом чи сценарієм і обрати кількість.</p>
            <span className="btn">Налаштувати практику →</span>
          </div>
        </div>

        <div className="card domlist" style={{ padding: '22px 24px', marginTop: 26 }}>
          <h3 style={{ fontSize: 18, marginBottom: 8 }}>Розподіл за доменами (ваги екзамену)</h3>
          {domRows}
        </div>

        <p className="footnote">Питання й пояснення створено на основі офіційного Exam Guide (домени, task statements, сценарії). Це навчальний тренажер, а не офіційні питання Anthropic. Scaled score — наближена лінійна модель (100 + частка правильних × 900); прохідний — {PASS_SCALED}.</p>
      </div>
    );
  }

  // ── Practice Config ────────────────────────────────────────────────────────

  if (screen === 'config') {
    const poolSize = () => {
      if (scope.type === 'domain') return QB.filter(q => q.d === scope.val).length;
      if (scope.type === 'scenario') return QB.filter(q => q.s === scope.val).length;
      return QB.length;
    };
    const ps = poolSize();
    const shown = (!practiceCount || practiceCount > ps) ? ps : practiceCount;

    return (
      <div>
        <button className="btn ghost" onClick={() => setScreen('home')} style={{ marginBottom: 22 }}>← Назад</button>
        <h1 style={{ fontSize: 34, marginBottom: 6 }}>Налаштування практики</h1>
        <p className="muted" style={{ marginTop: 0 }}>Обери, з чого тренуватись і скільки питань. Пояснення з&apos;являтиметься одразу після відповіді.</p>

        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Охоплення</h3>
          <div className="opts-inline">
            <button className={`chip${scope.type === 'all' ? ' on accent' : ''}`} onClick={() => setScope({ type: 'all' })}>
              Усі домени та сценарії
            </button>
          </div>

          <h3 style={{ fontSize: 15, margin: '18px 0 6px', color: 'var(--ink2)' }}>…або за доменом</h3>
          <div className="opts-inline">
            {Object.entries(DOMAINS).map(([k, v]) => (
              <button
                key={k}
                className={`chip${scope.type === 'domain' && scope.val === +k ? ' on' : ''}`}
                onClick={() => setScope({ type: 'domain', val: +k })}
              >
                D{k} · {v.name.split(' ')[0]}…
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: 15, margin: '18px 0 6px', color: 'var(--ink2)' }}>…або за сценарієм</h3>
          <div className="opts-inline">
            {Object.entries(SCEN).map(([k, v]) => (
              <button
                key={k}
                className={`chip${scope.type === 'scenario' && scope.val === +k ? ' on' : ''}`}
                onClick={() => setScope({ type: 'scenario', val: +k })}
              >
                S{k} · {v.t.split(' ').slice(0, 2).join(' ')}…
              </button>
            ))}
          </div>

          <h3 style={{ fontSize: 16, margin: '24px 0 10px' }}>Кількість питань</h3>
          <div className="opts-inline">
            {[10, 20, 40, 0].map(c => (
              <button
                key={c}
                className={`chip${practiceCount === c ? ' on' : ''}`}
                onClick={() => setPracticeCount(c)}
              >
                {c === 0 ? 'Усі доступні' : c}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 14 }}>У вибірці: {ps} питань · буде показано {shown}.</p>

          <div style={{ marginTop: 18 }}>
            <button className="btn accent" onClick={startPractice}>Почати практику →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Run ────────────────────────────────────────────────────────────────────

  if (screen === 'run' && run) {
    const q = run.questions[run.i];
    const total = run.questions.length;
    const answered = Object.keys(run.answers).length;
    const isExam = run.mode === 'exam';
    const locked = !isExam && run.locked[run.i];
    const chosen = run.answers[run.i];
    const sc = SCEN[q.s];

    const timerCls = isExam
      ? `timer${timeLeft <= 60 ? ' crit' : timeLeft <= 300 ? ' warn' : ''}`
      : 'timer';

    const practiceScore = () =>
      Object.keys(run.locked).reduce((n, k) => n + (run.answers[+k] === run.questions[+k].correct ? 1 : 0), 0);

    return (
      <div>
        {/* Top bar */}
        <div className="topbar">
          <div className="inner">
            {isExam ? (
              <>
                <span className="tag">Екзамен</span>
                <div className={timerCls}>{formatTime(timeLeft)}</div>
                <div className="progresswrap">
                  <div className="pbar"><i style={{ width: `${answered / total * 100}%` }} /></div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>Відповідей: {answered}/{total}</div>
                </div>
                <button className="btn accent" style={{ padding: '9px 18px', fontSize: 15 }} onClick={() => setScreen('review')}>
                  Завершити
                </button>
              </>
            ) : (
              <>
                <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 14 }}
                  onClick={() => { if (confirm('Вийти з практики? Прогрес не збережеться.')) setScreen('home'); }}>
                  ← Вихід
                </button>
                <span className="tag">Практика</span>
                <div className="progresswrap">
                  <div className="pbar"><i style={{ width: `${(run.i + 1) / total * 100}%` }} /></div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>
                    Питання {run.i + 1} з {total} · правильних: {practiceScore()}/{Object.keys(run.locked).length}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Scenario */}
        <div className="scenario">
          <span className="tag">Сценарій {q.s} · Домен {q.d}</span>
          <div style={{ fontFamily: 'var(--disp)', fontWeight: 600, fontSize: 17, marginTop: 4 }}>{sc.t}</div>
          <p>{sc.p}</p>
        </div>

        {/* Question card */}
        <div className="card qcard">
          <div className="qmeta"><span className="qnum">№ {run.i + 1} / {total}</span></div>
          <div className="qtext">{q.q}</div>
          <div className="answers">
            {q.opts.map((o, i) => {
              let cls = 'ans';
              if (locked) {
                cls += ' locked';
                if (i === q.correct) cls += ' correct';
                else if (i === chosen) cls += ' wrong';
              } else if (i === chosen) {
                cls += ' sel';
              }
              return (
                <div
                  key={i}
                  className={cls}
                  onClick={() => {
                    if (locked) return;
                    setRun(r => r ? { ...r, answers: { ...r.answers, [r.i]: i } } : null);
                  }}
                >
                  <div className="key">{LETTERS[i]}</div>
                  <div className="txt">{o}</div>
                </div>
              );
            })}
          </div>

          {locked && (
            <div className={`explain${chosen === q.correct ? '' : ' bad'}`}>
              <div className="lbl">{chosen === q.correct ? 'Правильно' : `Правильна відповідь: ${LETTERS[q.correct]}`}</div>
              <p>{q.ex}</p>
            </div>
          )}

          {/* Nav */}
          <div className="navrow">
            <button className="btn ghost" disabled={run.i === 0}
              onClick={() => setRun(r => r ? { ...r, i: r.i - 1 } : null)}>
              ← Назад
            </button>

            {isExam && (
              <button
                className={`markbtn${run.marked[run.i] ? ' on' : ''}`}
                onClick={() => setRun(r => r ? { ...r, marked: { ...r.marked, [r.i]: !r.marked[r.i] } } : null)}
              >
                {run.marked[run.i] ? '★ Позначено' : '☆ Позначити'}
              </button>
            )}

            {isExam ? (
              <button className="btn" onClick={() => {
                if (run.i === total - 1) setScreen('review');
                else setRun(r => r ? { ...r, i: r.i + 1 } : null);
              }}>
                {run.i === total - 1 ? 'До огляду →' : 'Далі →'}
              </button>
            ) : locked ? (
              <button className="btn" onClick={() => {
                if (run.i === total - 1) doFinishPractice();
                else setRun(r => r ? { ...r, i: r.i + 1 } : null);
              }}>
                {run.i === total - 1 ? 'Підсумок →' : 'Далі →'}
              </button>
            ) : (
              <button className="btn accent" disabled={chosen == null}
                onClick={() => setRun(r => r ? { ...r, locked: { ...r.locked, [r.i]: true } } : null)}>
                Перевірити
              </button>
            )}
          </div>

          {/* Palette for exam */}
          {isExam && (
            <div className="card palette">
              {run.questions.map((_, j) => {
                let cls = 'pdot';
                if (run.answers[j] != null) cls += ' answered';
                if (j === run.i) cls += ' current';
                if (run.marked[j]) cls += ' marked';
                return (
                  <button key={j} className={cls} onClick={() => setRun(r => r ? { ...r, i: j } : null)}>
                    {j + 1}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Review (exam before submit) ────────────────────────────────────────────

  if (screen === 'review' && run) {
    const total = run.questions.length;
    const answered = Object.keys(run.answers).length;
    const blank = total - answered;
    return (
      <div>
        <h1 style={{ fontSize: 32 }}>Огляд перед завершенням</h1>
        <p className="muted">Можна повернутись до будь-якого питання. Без відповіді: <b>{blank}</b> (рахуються як неправильні).</p>
        <div className="card palette" style={{ marginTop: 18 }}>
          {run.questions.map((_, j) => {
            let cls = 'pdot';
            if (run.answers[j] != null) cls += ' answered';
            if (run.marked[j]) cls += ' marked';
            return (
              <button key={j} className={cls} onClick={() => { setRun(r => r ? { ...r, i: j } : null); setScreen('run'); }}>
                {j + 1}
              </button>
            );
          })}
        </div>
        <div className="navrow" style={{ marginTop: 24 }}>
          <button className="btn ghost" onClick={() => setScreen('run')}>← Повернутись до питань</button>
          <button className="btn accent" onClick={() => { if (confirm('Завершити екзамен?')) doFinishExam(); }}>
            Завершити екзамен та показати результат
          </button>
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (screen === 'results' && result) {
    const pct = Math.round(result.correct / result.total * 100);
    const C = 2 * Math.PI * 80;
    const off = C * (1 - result.correct / result.total);
    const ringColor = result.practice ? 'var(--accent)' : result.pass ? 'var(--good)' : 'var(--bad)';

    const filteredQs = result.questions.map((q, i) => ({ q, i, chosen: result.answers[i], ok: result.answers[i] === q.correct }))
      .filter(x => reviewFilter === 'all' ? true : reviewFilter === 'wrong' ? !x.ok : x.chosen == null);

    return (
      <div>
        <div className="card scorehero">
          <div className="brandline">{result.practice ? 'Підсумок практики' : 'Результат екзамену'}</div>
          <div className="ring">
            <svg viewBox="0 0 180 180" width="190" height="190">
              <circle cx="90" cy="90" r="80" fill="none" stroke="#e3d6c0" strokeWidth="13" />
              <circle cx="90" cy="90" r="80" fill="none" stroke={ringColor} strokeWidth="13" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={off} transform="rotate(-90 90 90)" />
              <text x="90" y="84" textAnchor="middle" fontFamily="var(--disp)" fontSize="40" fontWeight="600" fill="var(--ink)">{pct}%</text>
              <text x="90" y="108" textAnchor="middle" fontFamily="var(--mono)" fontSize="13" fill="var(--ink2)">{result.correct}/{result.total}</text>
            </svg>
          </div>
          {result.practice ? (
            <>
              <div className="scaled">{result.correct}<span style={{ fontSize: 28, color: 'var(--ink2)' }}>/{result.total}</span></div>
              <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>правильних відповідей</div>
              <div className="muted" style={{ fontSize: 14, marginTop: 8, maxWidth: '46ch', marginInline: 'auto' }}>
                Це практика на {result.total} {result.total === 1 ? 'питання' : result.total < 5 ? 'питання' : 'питань'} — бал «прохідний/720» рахується лише в режимі повного екзамену (60 питань).
              </div>
            </>
          ) : (
            <>
              <div className="scaled">{result.scaled}</div>
              <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>scaled score (100–1000)</div>
              <div className={`verdict ${result.pass ? 'pass' : 'fail'}`}>
                {result.pass ? `✓ Прохідний (≥ ${PASS_SCALED})` : `✗ Нижче порогу ${PASS_SCALED}`}
              </div>
            </>
          )}
        </div>

        <div className="resgrid">
          <div className="card minicard">
            <h3>Точність за доменами</h3>
            {Object.entries(result.byDom).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => {
              const p = Math.round(v.c / v.n * 100);
              return (
                <div key={k}>
                  <div className="dscore">
                    <span className="tag" style={{ flex: '0 0 auto' }}>D{k}</span>
                    <div className="bar">
                      <i style={{ width: `${p}%`, background: p >= 70 ? 'linear-gradient(90deg,var(--good),#5ca06b)' : 'linear-gradient(90deg,var(--accent),#e0793f)' }} />
                    </div>
                    <span className="n">{v.c}/{v.n} · {p}%</span>
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, margin: '-7px 0 12px 6px' }}>{DOMAINS[+k].name}</div>
                </div>
              );
            })}
          </div>
          <div className="card minicard">
            <h3>Що далі</h3>
            <p style={{ fontSize: 15, marginTop: 0 }}>Зверни увагу на домени з результатом нижче 70% — це найслабші зони.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <button className="btn" onClick={() => setReviewFilter('all')}>Розбір усіх питань ↓</button>
              <button className="btn ghost" onClick={() => { if (result.practice) setScreen('config'); else startExam(); }}>
                {result.practice ? 'Нова практика' : 'Новий екзамен'}
              </button>
              <button className="btn ghost" onClick={() => setScreen('home')}>На головну</button>
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 4, paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a
                  href="https://t.me/ClaudeCA_ua_bot?start=feedback"
                  target="_blank"
                  rel="noopener"
                  className="btn ghost"
                  style={{ fontSize: 14, textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => track('telegram_clicked', { source: 'results_feedback' })}
                >
                  💬 Залишити фідбек
                </a>
                <a
                  href="https://t.me/ClaudeCA_ua_bot?start=job"
                  target="_blank"
                  rel="noopener"
                  className="btn ghost"
                  style={{ fontSize: 14, textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => track('telegram_clicked', { source: 'results_job' })}
                >
                  🚀 Хочу працювати з AI
                </a>
                <a
                  href="https://send.monobank.ua/jar/9uKqdVDC2W"
                  target="_blank"
                  rel="noopener"
                  className="btn ghost"
                  style={{ fontSize: 14, textAlign: 'center', justifyContent: 'center' }}
                >
                  💛 Підтримати проєкт
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Бейдж — лише за повним екзаменом (не за короткою практикою) */}
        {!result.practice && <ShareBadge score={result.scaled} pass={result.pass} />}

        {/* Answer review */}
        <div style={{ marginTop: 32 }}>
          <div className="reviewfilter">
            {(['all', 'wrong', 'blank'] as const).map(f => (
              <button key={f} className={`chip${reviewFilter === f ? ' on' : ''}`} onClick={() => setReviewFilter(f)}>
                {f === 'all' ? `Усі (${result.total})` : f === 'wrong' ? 'Лише помилки' : 'Без відповіді'}
              </button>
            ))}
          </div>
          {filteredQs.length === 0
            ? <p className="muted">Нічого немає в цьому фільтрі 🎉</p>
            : filteredQs.map(({ q, i, chosen, ok }) => (
              <div key={i} className="card qcard" style={{ marginTop: 16 }}>
                <div className="qmeta">
                  {chosen == null
                    ? <span className="tag" style={{ background: '#e9ddc8' }}>Без відповіді</span>
                    : ok
                      ? <span className="tag" style={{ background: 'var(--goodbg)', color: 'var(--good)' }}>Правильно</span>
                      : <span className="tag" style={{ background: 'var(--badbg)', color: 'var(--bad)' }}>Помилка</span>
                  }
                  <span className="tag">Сценарій {q.s} · Домен {q.d}</span>
                  <span className="qnum">№ {i + 1}</span>
                </div>
                <div className="qtext" style={{ fontSize: 18 }}>{q.q}</div>
                <div className="answers">
                  {q.opts.map((o, j) => {
                    let cls = 'ans locked';
                    if (j === q.correct) cls += ' correct';
                    else if (j === chosen) cls += ' wrong';
                    return (
                      <div key={j} className={cls}>
                        <div className="key">{LETTERS[j]}</div>
                        <div className="txt">{o}</div>
                      </div>
                    );
                  })}
                </div>
                <div className={`explain${ok ? '' : ' bad'}`}>
                  <div className="lbl">Пояснення</div>
                  <p>{q.ex}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  return null;

  // ── Actions ────────────────────────────────────────────────────────────────

  function startExam() {
    const qs = buildExam();
    setRun({ mode: 'exam', questions: qs, i: 0, answers: {}, marked: {}, locked: {}, endTime: Date.now() + EXAM_DURATION_SEC * 1000 });
    setTimeLeft(EXAM_DURATION_SEC);
    setScreen('run');
  }

  function startPractice() {
    const qs = buildPractice(scope, practiceCount);
    if (!qs.length) return;
    setRun({ mode: 'practice', questions: qs, i: 0, answers: {}, marked: {}, locked: {}, endTime: 0 });
    setScreen('run');
  }
}
