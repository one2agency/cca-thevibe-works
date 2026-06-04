'use client';

import { useState, useMemo } from 'react';
import { DOMAINS, SCEN, QB } from '@/lib/exam-bank';
import type { Question } from '@/lib/exam-bank';
import { review, type CardState } from '@/lib/srs';

const LETTERS = ['A', 'B', 'C', 'D'];
const LS_KEY = 'cca_flashcards';

type Store = Record<string, CardState>;

function loadStore(): Store {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveStore(s: Store) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

type Scope = { type: 'all' | 'domain' | 'scenario'; val?: number };

export default function Flashcards({ onExit }: { onExit: () => void }) {
  const [scope, setScope] = useState<Scope>({ type: 'all' });
  const [started, setStarted] = useState(false);
  const [store, setStore] = useState<Store>(() => loadStore());
  const [deck, setDeck] = useState<Question[]>([]);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const pool = useMemo(() => {
    if (scope.type === 'domain' && scope.val) return QB.filter(q => q.d === scope.val);
    if (scope.type === 'scenario' && scope.val) return QB.filter(q => q.s === scope.val);
    return QB;
  }, [scope]);

  const dueCount = useMemo(() => {
    const now = Date.now();
    return pool.filter(q => (store[q.id]?.due ?? 0) <= now).length;
  }, [pool, store]);

  function start() {
    const now = Date.now();
    // картки «на повторення» (due<=now) першими, далі за зростанням due
    const sorted = [...pool].sort((a, b) => (store[a.id]?.due ?? 0) - (store[b.id]?.due ?? 0));
    void now;
    setDeck(sorted);
    setPos(0);
    setRevealed(false);
    setDoneCount(0);
    setStarted(true);
  }

  function grade(g: 'hard' | 'med' | 'easy') {
    const card = deck[pos];
    const now = Date.now();
    const next = { ...store, [card.id]: review(store[card.id], g, now) };
    setStore(next);
    saveStore(next);
    setDoneCount(c => c + 1);
    // якщо «важко» — повернути картку в кінець поточної колоди для повтору цієї сесії
    if (g === 'hard') {
      setDeck(d => [...d.slice(0, pos), ...d.slice(pos + 1), card]);
      setRevealed(false);
      // pos лишається — наступна картка зайняла це місце
      if (pos >= deck.length - 1) setPos(0);
      return;
    }
    setRevealed(false);
    setPos(p => p + 1);
  }

  // ── Конфіг ──
  if (!started) {
    return (
      <div>
        <button className="btn ghost" onClick={onExit} style={{ marginBottom: 22 }}>← Назад</button>
        <h1 style={{ fontSize: 34, marginBottom: 6 }}>Флешкартки</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Інтервальне повторення: оцінюй себе «Легко / Норм / Важко» — складні картки повертатимуться частіше.
          Без таймера, без впливу на статистику. Прогрес зберігається у твоєму браузері.
        </p>
        <div className="card" style={{ padding: 24, marginTop: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 10 }}>Охоплення</h3>
          <div className="opts-inline">
            <button className={`chip${scope.type === 'all' ? ' on accent' : ''}`} onClick={() => setScope({ type: 'all' })}>Усі домени та сценарії</button>
          </div>
          <h3 style={{ fontSize: 15, margin: '18px 0 6px', color: 'var(--ink2)' }}>…або за доменом</h3>
          <div className="opts-inline">
            {Object.entries(DOMAINS).map(([k, v]) => (
              <button key={k} className={`chip${scope.type === 'domain' && scope.val === +k ? ' on' : ''}`} onClick={() => setScope({ type: 'domain', val: +k })}>
                D{k} · {v.name.split(' ')[0]}…
              </button>
            ))}
          </div>
          <h3 style={{ fontSize: 15, margin: '18px 0 6px', color: 'var(--ink2)' }}>…або за сценарієм</h3>
          <div className="opts-inline">
            {Object.entries(SCEN).map(([k, v]) => (
              <button key={k} className={`chip${scope.type === 'scenario' && scope.val === +k ? ' on' : ''}`} onClick={() => setScope({ type: 'scenario', val: +k })}>
                S{k} · {v.t.split(' ').slice(0, 2).join(' ')}…
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 14, marginTop: 14 }}>
            У вибірці: {pool.length} карток · на повторення зараз: <b>{dueCount}</b>.
          </p>
          <div style={{ marginTop: 8 }}>
            <button className="btn accent" onClick={start}>Почати →</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Картка ──
  const card = deck[pos % deck.length];
  if (!card) {
    return (
      <div className="card scorehero">
        <div className="brandline">Флешкартки</div>
        <div style={{ fontSize: 56, margin: '10px 0' }}>🎉</div>
        <div style={{ fontFamily: 'var(--disp)', fontSize: 26 }}>Колоду пройдено</div>
        <p className="muted" style={{ marginTop: 8 }}>Опрацьовано карток: {doneCount}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn" onClick={start}>Ще раз</button>
          <button className="btn ghost" onClick={() => setStarted(false)}>Змінити охоплення</button>
          <button className="btn ghost" onClick={onExit}>На головну</button>
        </div>
      </div>
    );
  }
  const sc = SCEN[card.s];

  return (
    <div>
      <div className="topbar">
        <div className="inner">
          <button className="btn ghost" style={{ padding: '8px 16px', fontSize: 14 }} onClick={() => setStarted(false)}>← Вихід</button>
          <span className="tag">Флешкартки</span>
          <div className="progresswrap">
            <div className="pbar"><i style={{ width: `${Math.min(100, doneCount / Math.max(1, deck.length) * 100)}%` }} /></div>
            <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>Опрацьовано: {doneCount} · у колоді: {deck.length}</div>
          </div>
        </div>
      </div>

      <div className="scenario">
        <span className="tag">Сценарій {card.s} · Домен {card.d}</span>
        <div style={{ fontFamily: 'var(--disp)', fontWeight: 600, fontSize: 17, marginTop: 4 }}>{sc.t}</div>
        <p>{sc.p}</p>
      </div>

      <div className="card qcard">
        <div className="qtext">{card.q}</div>

        {!revealed ? (
          <div style={{ marginTop: 8 }}>
            <button className="btn accent" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setRevealed(true)}>
              Показати відповідь
            </button>
          </div>
        ) : (
          <>
            <div className="answers">
              {card.opts.map((o, i) => (
                <div key={i} className={`ans locked${i === card.a ? ' correct' : ''}`}>
                  <div className="key">{LETTERS[i]}</div>
                  <div className="txt">{o}</div>
                </div>
              ))}
            </div>
            <div className="explain">
              <div className="lbl">Пояснення</div>
              <p>{card.ex}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
              <button className="btn ghost" style={{ justifyContent: 'center', borderColor: 'var(--bad)', color: 'var(--bad)' }} onClick={() => grade('hard')}>😖 Важко</button>
              <button className="btn ghost" style={{ justifyContent: 'center' }} onClick={() => grade('med')}>🙂 Норм</button>
              <button className="btn ghost" style={{ justifyContent: 'center', borderColor: 'var(--good)', color: 'var(--good)' }} onClick={() => grade('easy')}>😎 Легко</button>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 10, textAlign: 'center' }}>
              «Важко» — скоро знову · «Норм» — середній інтервал · «Легко» — довший інтервал
            </div>
          </>
        )}
      </div>
    </div>
  );
}
