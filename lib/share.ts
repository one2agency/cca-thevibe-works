/**
 * Stateless шерінг-бейдж: payload → HMAC-підпис (SHARE_SECRET) → токен.
 * Працює і на Edge, і на Node (Web Crypto).
 */

// Екзамен-грамота
export interface BadgePayload {
  kind?: 'exam';
  score: number;       // scaled 100..1000
  tier: string;        // ключ рівня
  nick: string;        // санітизований нік (може бути '')
  ts: number;          // unix ms
}

// Практика-челендж (гейміфікований; БЕЗ scaled/прохідний)
export interface PracticePayload {
  kind: 'practice';
  correct: number;
  total: number;
  scope: string;       // що тренував: домен/сценарій (санітизований лейбл)
  nick: string;
  ts: number;
}

export type AnyPayload = BadgePayload | PracticePayload;

// Гейміфікований «рівень» за точністю практики (інший від медалей екзамену)
export interface Flair { emoji: string; label: string; min: number; }
export const FLAIRS: Flair[] = [
  { emoji: '🔥', label: 'Вогонь',  min: 90 },
  { emoji: '🎯', label: 'Влучно',  min: 75 },
  { emoji: '💪', label: 'Прогрес', min: 50 },
  { emoji: '📚', label: 'Вчуся',   min: 0  },
];
export function flairForAccuracy(pct: number): Flair {
  return FLAIRS.find(f => pct >= f.min) ?? FLAIRS[FLAIRS.length - 1];
}

// ── Рівні ─────────────────────────────────────────────────────────────────────

export interface Tier { key: string; emoji: string; label: string; min: number; }

export const TIERS: Tier[] = [
  { key: 'champion', emoji: '🏆', label: 'Майстер',    min: 960 },
  { key: 'gold',     emoji: '🥇', label: 'Золото',     min: 900 },
  { key: 'silver',   emoji: '🥈', label: 'Срібло',     min: 800 },
  { key: 'bronze',   emoji: '🥉', label: 'Прохідний',  min: 720 },
  { key: 'prep',     emoji: '📚', label: 'Готуюсь',    min: 0   },
];

export function tierForScore(score: number): Tier {
  return TIERS.find(t => score >= t.min) ?? TIERS[TIERS.length - 1];
}

// ── Санітизація нікнейму ──────────────────────────────────────────────────────
// stateless → видалити пізніше не можна, тож чистимо суворо на вході.

const PROFANITY = [
  // укр/рос
  'бляд', 'сук', 'хуй', 'хуї', 'пизд', 'єбан', 'ебан', 'єбать', 'ебать', 'гандон', 'гондон',
  'мудак', 'довбойоб', 'підар', 'пидор', 'пидар', 'залуп', 'манда', 'курва', 'выеб', 'виєб',
  // англ
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'asshole', 'nigger', 'faggot', 'whore',
];

export interface NickResult { ok: boolean; value: string; error?: string; }

export function sanitizeNick(raw: unknown): NickResult {
  if (raw == null || raw === '') return { ok: true, value: '' };
  if (typeof raw !== 'string') return { ok: false, value: '', error: 'Невалідний нік' };

  let s = raw.trim();
  // прибрати керівні символи
  s = s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\ufeff]/g, '');
  // прибрати HTML/кутові дужки
  s = s.replace(/[<>]/g, '');
  // прибрати URL/посилання
  if (/https?:\/\/|www\.|t\.me\/|@[a-z0-9_]{3,}|\.(com|net|ua|org|io)\b/i.test(s)) {
    return { ok: false, value: '', error: 'Нік не може містити посилань' };
  }
  // ліміт довжини
  if (s.length > 24) s = s.slice(0, 24);
  // фільтр нецензурщини
  const low = s.toLowerCase();
  if (PROFANITY.some(w => low.includes(w))) {
    return { ok: false, value: '', error: 'Нік містить недопустимі слова' };
  }
  return { ok: true, value: s };
}

// ── HMAC підпис ───────────────────────────────────────────────────────────────

function b64url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return b64url(sig);
}

function secret(): string {
  return process.env.SHARE_SECRET ?? '';
}

/** payload → "base64url(payload).sig" */
export async function signBadge(payload: AnyPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const data = b64url(new TextEncoder().encode(json));
  const sig = await hmac(data, secret());
  return `${data}.${sig}`;
}

/** Верифікація токена; null якщо підпис невалідний. */
export async function verifyBadge(token: string): Promise<AnyPayload | null> {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(data, secret());
  // constant-time-ish порівняння
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const json = new TextDecoder().decode(b64urlDecode(data));
    const p = JSON.parse(json) as AnyPayload;
    if (typeof p.ts !== 'number') return null;
    if (p.kind === 'practice') {
      if (typeof p.correct !== 'number' || typeof p.total !== 'number') return null;
    } else {
      if (typeof (p as BadgePayload).score !== 'number') return null;
    }
    return p;
  } catch {
    return null;
  }
}

export const DISCLAIMER = 'Практичний результат тренажера · не офіційна сертифікація Anthropic';
