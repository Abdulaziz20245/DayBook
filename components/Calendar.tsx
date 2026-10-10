'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MOODS, moodOf } from '@/lib/art';
import { keyOf, longDate, MONTH_NAMES, parseKey } from '@/lib/dates';
import { useJournal } from '@/lib/store';
import { currentStreak, longestStreak } from '@/lib/streak';
import { ArtView } from './ArtView';
import { IconChevron, IconPlus, IconSun } from './Icons';

const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const FULL = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function Calendar() {
  const { ready, entries, today } = useJournal();
  const [ym, setYm] = useState<{ y: number; m: number } | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const bounds = useMemo(() => {
    if (!today) return null;
    const t = parseKey(today);
    const first = Object.keys(entries).sort()[0];
    const f = first ? parseKey(first) : t;
    return { minIdx: f.getFullYear() * 12 + f.getMonth(), maxIdx: t.getFullYear() * 12 + t.getMonth() };
  }, [entries, today]);

  if (!ready || !bounds) return <div style={{ minHeight: 400 }} />;

  const t = parseKey(today);
  const cur = ym ?? { y: t.getFullYear(), m: t.getMonth() };
  const idx = cur.y * 12 + cur.m;
  const go = (delta: number) => { const n = Math.min(bounds.maxIdx, Math.max(bounds.minIdx, idx + delta)); setYm({ y: Math.floor(n / 12), m: n % 12 }); };

  const streak = currentStreak(entries, today);
  const longest = longestStreak(entries);
  const off = (new Date(cur.y, cur.m, 1).getDay() + 6) % 7;
  const days = new Date(cur.y, cur.m + 1, 0).getDate();
  const keys = Array.from({ length: days }, (_, i) => keyOf(new Date(cur.y, cur.m, i + 1)));
  const count = keys.filter(k => entries[k]).length;

  const selKey = sel ?? (entries[today] ? today : keys.includes(today) ? today : keys[keys.length - 1]);
  const selText = entries[selKey];
  const selIsToday = selKey === today;

  return (
    <div className="row">
      <section className="cal-main">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1 className="title">{MONTH_NAMES[cur.m]} {cur.y}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn ink" aria-label="Previous month" onClick={() => go(-1)} disabled={idx <= bounds.minIdx}><IconChevron dir="left" /></button>
            <button className="icon-btn ink" aria-label="Next month" onClick={() => go(1)} disabled={idx >= bounds.maxIdx}><IconChevron dir="right" /></button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <span className="chip chip-accent" style={{ gap: 6, paddingLeft: 9 }}><IconSun size={16} />{streak.count}-day streak</span>
          <span className="chip">Longest {longest} {longest === 1 ? 'day' : 'days'}</span>
          <span className="chip">{count} {count === 1 ? 'entry' : 'entries'}</span>
        </div>
        <div className="cal-grid">
          {LETTERS.map((l, i) => <span key={i} className="dow"><span className="hide-desk">{l}</span><span className="hide-mob">{FULL[i]}</span></span>)}
          {Array.from({ length: off }, (_, i) => <div key={`b${i}`} />)}
          {keys.map((k, i) => {
            const text = entries[k];
            const isT = k === today, future = k > today, picked = k === selKey;
            const label = longDate(parseKey(k)) + (text ? '' : future ? '' : ', rest day');
            const ring = picked ? '2px solid var(--ink)' : streak.days.has(k) ? '2px solid var(--accent)' : 'none';
            return (
              <div key={k} className="cal-cell">
                {text ? (
                  <button className="cal-tile" aria-label={label} aria-pressed={picked} onClick={() => setSel(k)} style={{ padding: 0, outline: ring, outlineOffset: 2 }}>
                    <ArtView dateKey={k} text={text} px={92} detail="thumb" style={{ position: 'absolute', inset: 0, borderRadius: 'var(--cell-r)' }} />
                  </button>
                ) : isT ? (
                  <Link href="/" className="cal-tile" aria-label="Write today’s entry" style={{ border: '2px dashed var(--accent)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconPlus /></Link>
                ) : future ? (
                  <div className="cal-tile" style={{ background: 'var(--surface-2)', opacity: 0.5, cursor: 'default' }} />
                ) : (
                  <button className="cal-tile" aria-label={label} aria-pressed={picked} onClick={() => setSel(k)} style={{ border: `1.5px dashed ${picked ? 'var(--ink)' : 'var(--line-2)'}` }} />
                )}
                <span className="cal-num" style={{ fontWeight: isT || picked ? 700 : 500, color: isT ? 'var(--accent-ink)' : future ? 'var(--faint)' : 'var(--muted)' }}>{i + 1}</span>
              </div>
            );
          })}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>Dashed squares are rest days. Nothing to catch up on.</p>
      </section>

      <aside className="cal-side">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {selText ? (
              <ArtView dateKey={selKey} text={selText} px={96} style={{ width: 'var(--sel-art)', height: 'var(--sel-art)', flex: 'none', borderRadius: 18 }} />
            ) : (
              <div style={{ width: 'var(--sel-art)', height: 'var(--sel-art)', flex: 'none', borderRadius: 18, border: '1.5px dashed var(--line-2)' }} />
            )}
            <div className="col" style={{ gap: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{longDate(parseKey(selKey))}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{selText ? MOODS[moodOf(selText, selKey)].label : selIsToday ? 'Not written yet' : 'Rest day'}</span>
            </div>
          </div>
          <p className="serif" style={{ margin: 0, fontSize: 17, lineHeight: 1.5, color: selText ? 'var(--ink)' : 'var(--muted)' }}>
            {selText ?? (selIsToday ? 'Today’s page is still open. A sentence or two is plenty.' : 'Nothing to make up. The next page is always waiting.')}
          </p>
          {selText && <Link href={`/day/${selKey}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-ink)' }}>Open this day →</Link>}
        </div>
      </aside>
    </div>
  );
}
