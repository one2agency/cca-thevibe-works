/** SM-2-подібне інтервальне повторення для флешкарток. */

export const DAY = 86400_000;

export interface CardState { ease: number; interval: number; due: number; reps: number; }
export type Grade = 'hard' | 'med' | 'easy';

export function review(prev: CardState | undefined, grade: Grade, now: number): CardState {
  const s: CardState = prev ?? { ease: 2.5, interval: 0, due: now, reps: 0 };
  let { ease, interval } = s;
  if (grade === 'hard') {
    ease = Math.max(1.3, ease - 0.2);
    interval = 0; // скоро знову (цієї ж сесії)
  } else if (grade === 'med') {
    interval = interval < 1 ? 1 : Math.round(interval * ease);
  } else {
    ease = ease + 0.1;
    interval = interval < 1 ? 2 : Math.round(interval * ease * 1.4);
  }
  return { ease, interval, due: now + interval * DAY, reps: s.reps + 1 };
}
