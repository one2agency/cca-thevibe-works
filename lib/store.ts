/**
 * Сховище на Upstash Redis (підключається через Vercel marketplace).
 * Читає env: UPSTASH_REDIS_REST_URL/TOKEN або KV_REST_API_URL/TOKEN.
 *
 * Модель (KV/Redis):
 *  - cca:attempts  — ZSET (score=ts, member=JSON attempt)
 *  - cca:events    — ZSET (score=ts, member=JSON event)
 *  - cca:bot:*     — прості ключі (owner_chat_id тощо)
 *  - cca:dedup:*   — короткоживучі ключі для дедуплікації
 */

import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

function url() {
  return process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? '';
}
function token() {
  return process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? '';
}

export function storeReady(): boolean {
  return Boolean(url() && token());
}

export function redis(): Redis | null {
  if (!storeReady()) return null;
  if (!_redis) _redis = new Redis({ url: url(), token: token() });
  return _redis;
}

// ── Типи ──────────────────────────────────────────────────────────────────────

export interface AttemptRow {
  session_id: string;
  mode: 'exam' | 'practice';
  score: number;
  domain_breakdown: Record<number, { c: number; n: number }>;
  completed_at: number;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface EventRow {
  type: string;
  session_id?: string;
  ts: number;
  meta?: Record<string, unknown>;
}

// ── Дедуплікація (антибот-гігієна) ────────────────────────────────────────────
// Повертає true, якщо подія НЕ дубль (можна писати).
export async function notDuplicate(key: string, windowSec = 8): Promise<boolean> {
  const r = redis();
  if (!r) return true;
  const res = await r.set(`cca:dedup:${key}`, 1, { nx: true, ex: windowSec });
  return res === 'OK';
}

// ── Запис ─────────────────────────────────────────────────────────────────────

export async function logAttempt(a: AttemptRow): Promise<void> {
  const r = redis();
  if (!r) return;
  await r.zadd('cca:attempts', { score: a.completed_at, member: JSON.stringify(a) });
}

export async function logEvent(e: EventRow): Promise<void> {
  const r = redis();
  if (!r) return;
  await r.zadd('cca:events', { score: e.ts, member: JSON.stringify(e) });
}

// ── Читання (для статистики) ──────────────────────────────────────────────────

export async function getAttempts(sinceTs: number): Promise<AttemptRow[]> {
  const r = redis();
  if (!r) return [];
  const raw = await r.zrange<string[]>('cca:attempts', sinceTs, '+inf', { byScore: true });
  return raw.map(parseJson<AttemptRow>).filter(Boolean) as AttemptRow[];
}

export async function getEvents(sinceTs: number): Promise<EventRow[]> {
  const r = redis();
  if (!r) return [];
  const raw = await r.zrange<string[]>('cca:events', sinceTs, '+inf', { byScore: true });
  return raw.map(parseJson<EventRow>).filter(Boolean) as EventRow[];
}

function parseJson<T>(s: unknown): T | null {
  if (typeof s !== 'string') {
    // Upstash may already deserialize JSON
    return (s as T) ?? null;
  }
  try { return JSON.parse(s) as T; } catch { return null; }
}

// ── bot_meta ──────────────────────────────────────────────────────────────────

export async function botMetaGet(key: string): Promise<string | null> {
  const r = redis();
  if (!r) return null;
  const v = await r.get<string>(`cca:bot:${key}`);
  return v ?? null;
}

export async function botMetaSet(key: string, value: string): Promise<void> {
  const r = redis();
  if (!r) return;
  await r.set(`cca:bot:${key}`, value);
}

// ── Лічильники по питаннях (анонімні, для «найважчих питань») ──────────────────
export async function bumpQuestionStats(results: Array<{ id: string; correct: boolean }>): Promise<void> {
  const r = redis();
  if (!r) return;
  const p = r.pipeline();
  for (const x of results) {
    p.hincrby('cca:qshown', x.id, 1);
    if (!x.correct) p.hincrby('cca:qwrong', x.id, 1);
  }
  await p.exec().catch(() => {});
}

export interface QStat { id: string; shown: number; wrong: number; }
export async function getQuestionStats(): Promise<QStat[]> {
  const r = redis();
  if (!r) return [];
  const [shown, wrong] = await Promise.all([
    r.hgetall<Record<string, number>>('cca:qshown').catch(() => ({})),
    r.hgetall<Record<string, number>>('cca:qwrong').catch(() => ({})),
  ]);
  const s: Record<string, number> = shown ?? {};
  const w: Record<string, number> = wrong ?? {};
  return Object.keys(s).map(id => ({ id, shown: Number(s[id]) || 0, wrong: Number(w[id]) || 0 }));
}

// ── Лідерборд (лише повні екзамени; нік санітизований у API) ───────────────────
export interface LbEntry { nick: string; score: number; date: number; }
export async function addLeaderboard(nick: string, score: number): Promise<void> {
  const r = redis();
  if (!r) return;
  const member = JSON.stringify({ nick, score, date: Date.now() } as LbEntry);
  await r.zadd('cca:leaderboard', { score, member }).catch(() => {});
}

export async function getLeaderboard(limit = 20): Promise<LbEntry[]> {
  const r = redis();
  if (!r) return [];
  const raw = await r.zrange<string[]>('cca:leaderboard', 0, limit - 1, { rev: true }).catch(() => [] as string[]);
  return raw.map(m => { try { return typeof m === 'string' ? JSON.parse(m) : m; } catch { return null; } }).filter(Boolean) as LbEntry[];
}
