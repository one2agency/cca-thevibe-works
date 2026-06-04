/**
 * Спільний лоадер шрифтів для OG-картинок (next/og, nodejs runtime).
 * Satori підтримує ttf/otf/woff, але НЕ woff2 — тут TTF (Noto Sans, латиниця+кирилиця).
 * Читаємо з диску через fs (nodejs); файли трасуються Vercel і входять у бандл функції.
 */
import { readFileSync } from 'node:fs';

export type OgFont = { name: string; data: Buffer; weight: 400 | 700; style: 'normal' };

let _cache: OgFont[] | null = null;

export function ogFonts(): OgFont[] {
  if (_cache) return _cache;
  const regular = readFileSync(new URL('./fonts/NotoSans-Regular.ttf', import.meta.url));
  const bold = readFileSync(new URL('./fonts/NotoSans-Bold.ttf', import.meta.url));
  _cache = [
    { name: 'Noto Sans', data: regular, weight: 400, style: 'normal' },
    { name: 'Noto Sans', data: bold, weight: 700, style: 'normal' },
  ];
  return _cache;
}

export const OG_FONT_FAMILY = 'Noto Sans';
