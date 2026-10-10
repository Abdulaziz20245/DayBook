'use client';
import { useCallback, useEffect, useState } from 'react';
import { keyOf } from './dates';
import type { Entries } from './streak';

const ENTRIES = 'daybook:entries';
const SEEN = 'daybook:milestonesSeen';
const THEME = 'daybook:theme';
const EVT = 'daybook:change';

function read<T>(k: string, fallback: T): T {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVT));
}

/** Entries and today's date key. `ready` is false until the client has read storage. */
export function useJournal() {
  const [state, setState] = useState<{ ready: boolean; entries: Entries; today: string; seen: number[] }>(
    { ready: false, entries: {}, today: '', seen: [] },
  );
  const load = useCallback(() => {
    const raw = read<Entries>(ENTRIES, {});
    const entries: Entries = {};
    if (raw && typeof raw === 'object') for (const [k, v] of Object.entries(raw)) if (typeof v === 'string' && v.trim()) entries[k] = v;
    setState({ ready: true, entries, today: keyOf(new Date()), seen: read<number[]>(SEEN, []) });
  }, []);
  useEffect(() => {
    load();
    window.addEventListener(EVT, load);
    window.addEventListener('storage', load);
    return () => { window.removeEventListener(EVT, load); window.removeEventListener('storage', load); };
  }, [load]);
  return state;
}

export function saveEntry(date: string, text: string) {
  const entries = read<Entries>(ENTRIES, {});
  entries[date] = text;
  write(ENTRIES, entries);
}
export function markMilestoneSeen(n: number) {
  const seen = read<number[]>(SEEN, []);
  if (!seen.includes(n)) write(SEEN, [...seen, n]);
}

export type Theme = 'light' | 'dark';
export function setTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem(THEME, t); } catch { /* ignore */ }
}
export function currentTheme(): Theme {
  const d = document.documentElement.dataset.theme;
  if (d === 'dark' || d === 'light') return d;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
export const THEME_KEY = THEME;
