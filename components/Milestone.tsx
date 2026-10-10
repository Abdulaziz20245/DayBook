'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOODS, hash } from '@/lib/art';
import { addDays, keyOf, parseKey } from '@/lib/dates';
import { markMilestoneSeen, useJournal } from '@/lib/store';
import { currentStreak, MILESTONES } from '@/lib/streak';
import { ArtView } from './ArtView';
import { IconCheck, IconShare } from './Icons';

const COPY: Record<number, [string, string]> = {
  7: ['A week of little moments.', 'Seven days in a row of noticing your life. That is a habit taking root, and it is worth a small celebration.'],
  30: ['A whole month of you.', 'Thirty days, thirty small pieces of art. Your gallery just finished its first full poster.'],
  100: ['One hundred days of noticing.', 'A hundred entries and a hundred colors. Thank you for showing up for yourself, one day at a time.'],
};
const PALETTES = Object.values(MOODS).map(m => m.c);

export function Milestone() {
  const { n: raw } = useParams<{ n: string }>();
  const N = Number(raw);
  const valid = (MILESTONES as readonly number[]).includes(N);
  const { ready, entries, today } = useJournal();
  const [size, setSize] = useState(270);
  const [shared, setShared] = useState('');

  useEffect(() => { if (valid) markMilestoneSeen(N); }, [valid, N]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const set = () => setSize(mq.matches ? 380 : 270);
    set(); mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, []);

  if (!valid) {
    return (
      <div className="col" style={{ gap: 14, alignItems: 'center', marginTop: 40, textAlign: 'center' }}>
        <h1 className="title">No milestone here</h1>
        <p className="muted" style={{ margin: 0 }}>Milestones live at 7, 30 and 100 days.</p>
        <Link href="/calendar" className="btn btn-primary">Back to calendar</Link>
      </div>
    );
  }
  if (!ready) return <div style={{ minHeight: 400 }} />;

  const ds = N === 7 ? Math.round(size * 0.19) : N === 30 ? Math.round(size * 0.085) : Math.round(size * 0.042);
  const R = size / 2 - ds / 2 - 3;
  // the last N days ending on the most recent day of the current streak (or today)
  const streak = currentStreak(entries, today);
  const lastDay = streak.list[0] ?? today;
  const dots = Array.from({ length: N }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const pos = { left: size / 2 + R * Math.cos(a) - ds / 2, top: size / 2 + R * Math.sin(a) - ds / 2, width: ds, height: ds };
    const k = keyOf(addDays(parseKey(lastDay), i - (N - 1)));
    const text = entries[k];
    if (N === 7 && text) return { pos, k, text, bg: '' };
    const p = PALETTES[hash('m' + i + '-' + N) % 5];
    return { pos, k, text: undefined, bg: `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 100%)` };
  });

  async function share() {
    const msg = `${N} days in a row on Daybook.`;
    try {
      if (navigator.share) { await navigator.share({ text: msg }); return; }
      await navigator.clipboard.writeText(msg);
      setShared('Copied');
    } catch { /* cancelled */ }
  }

  const numSize = Math.round(size * (N === 100 ? 0.26 : 0.3));
  return (
    <div className="ms-row">
      <div className="ms-ring" role="img" aria-label={`${N} days in a row`} style={{ width: size, height: size }}>
        <div style={{ position: 'absolute', inset: '6%', borderRadius: 999, background: 'radial-gradient(circle, var(--accent-soft) 0%, var(--bg) 72%)' }} />
        {dots.map((d, i) => d.text
          ? <ArtView key={i} dateKey={d.k} text={d.text} px={ds} detail="thumb" style={{ position: 'absolute', ...d.pos, borderRadius: 999, boxShadow: '0 0 0 2px var(--bg)' }} />
          : <div key={i} style={{ position: 'absolute', ...d.pos, borderRadius: 999, background: d.bg || 'var(--surface-2)', boxShadow: '0 0 0 2px var(--bg)' }} />)}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span className="serif" style={{ fontSize: numSize, lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>{N}</span>
          <span className="eyebrow">days in a row</span>
        </div>
      </div>
      <div className="ms-text">
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>Milestone</span>
        <h1>{COPY[N][0]}</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.55, color: 'var(--muted)', textWrap: 'pretty' }}>{COPY[N][1]}</p>
        <div className="ladder">
          {MILESTONES.map(v => {
            const done = N >= v, cur = N === v;
            return (
              <span key={v} style={{ background: done ? 'var(--accent-soft)' : 'transparent', color: done ? 'var(--accent-ink)' : 'var(--muted)', border: `1.5px solid ${cur ? 'var(--accent)' : done ? 'var(--accent-soft)' : 'var(--line)'}` }}>
                {done && <IconCheck />}{v} days
              </span>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', width: '100%', paddingTop: 6 }}>
          <Link href="/calendar" className="btn btn-primary" style={{ flex: '1 1 150px' }}>Keep going</Link>
          <button className="btn btn-secondary" style={{ flex: '1 1 150px' }} onClick={share}><IconShare /><span>{shared || 'Share milestone'}</span></button>
        </div>
      </div>
    </div>
  );
}
