import { addDays, keyOf, parseKey } from './dates';

export type Entries = Record<string, string>;
export const MILESTONES = [7, 30, 100] as const;

/** Consecutive days with an entry, going back from today. If today is empty the streak
 *  is counted from yesterday so it stays alive until midnight. */
export function currentStreak(entries: Entries, todayKey: string) {
  let d = parseKey(todayKey);
  if (!entries[todayKey]) d = addDays(d, -1);
  const days: string[] = [];
  while (entries[keyOf(d)]) { days.push(keyOf(d)); d = addDays(d, -1); }
  return { count: days.length, days: new Set(days), list: days };
}

export function longestStreak(entries: Entries) {
  const keys = Object.keys(entries).filter(k => entries[k]).sort();
  let best = 0, run = 0, prev: Date | null = null;
  for (const k of keys) {
    const d = parseKey(k);
    run = prev && keyOf(addDays(prev, 1)) === k ? run + 1 : 1;
    if (run > best) best = run;
    prev = d;
  }
  return best;
}
