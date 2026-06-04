/**
 * Сесія адмінки: підписана httpOnly-кука (без секрета в URL).
 * Підпис HMAC на основі STATS_PASSWORD (зміна пароля інвалідовує всі сесії).
 */
import { redis } from './store';

export const ADMIN_COOKIE = 'cca_admin';
const SESSION_TTL_SEC = 30 * 24 * 60 * 60; // 30 днів

function password(): string {
  return process.env.STATS_PASSWORD ?? '';
}

function b64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode('sess:' + password()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Створити токен сесії (exp.signature). */
export async function createSession(): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_SEC * 1000);
  const sig = await hmac(exp);
  return `${exp}.${sig}`;
}

/** Перевірити токен сесії. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token || !password()) return false;
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(exp);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  return Number(exp) > Date.now();
}

/** Constant-time-ish перевірка пароля. */
export function checkPassword(given: string): boolean {
  const pw = password();
  if (!pw || given.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i++) diff |= given.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}

/** Rate-limit спроб логіну за «відбитком» (IP). Повертає true, якщо ще можна. */
export async function loginAllowed(fingerprint: string, max = 8, windowSec = 300): Promise<boolean> {
  const r = redis();
  if (!r) return true;
  const key = `cca:adminlogin:${fingerprint}`;
  const n = await r.incr(key).catch(() => 0);
  if (n === 1) await r.expire(key, windowSec).catch(() => {});
  return n <= max;
}

export const SESSION_MAX_AGE = SESSION_TTL_SEC;
