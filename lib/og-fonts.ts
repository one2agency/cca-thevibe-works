/**
 * Спільний лоадер шрифтів для OG-картинок (next/og).
 * ВАЖЛИВО: Satori підтримує ttf/otf/woff, але НЕ woff2.
 * Тут TTF (Noto Sans, латиниця+кирилиця), забандлений через import.meta.url —
 * Vercel інлайнить асет, працює і на edge.
 */

export type OgFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' };

let _cache: OgFont[] | null = null;

export async function ogFonts(): Promise<OgFont[]> {
  if (_cache) return _cache;
  const [regular, bold] = await Promise.all([
    fetch(new URL('./fonts/NotoSans-Regular.ttf', import.meta.url)).then(r => r.arrayBuffer()),
    fetch(new URL('./fonts/NotoSans-Bold.ttf', import.meta.url)).then(r => r.arrayBuffer()),
  ]);
  _cache = [
    { name: 'Noto Sans', data: regular, weight: 400, style: 'normal' },
    { name: 'Noto Sans', data: bold, weight: 700, style: 'normal' },
  ];
  return _cache;
}

export const OG_FONT_FAMILY = 'Noto Sans';
