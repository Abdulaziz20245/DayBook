'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MONTH_NAMES, monthKey } from '@/lib/dates';
import { parseKey } from '@/lib/dates';
import { art } from '@/lib/art';
import { downloadBlob, posterBlob, shareOrDownload } from '@/lib/export';
import { currentTheme, useJournal } from '@/lib/store';
import { ArtView } from './ArtView';
import { IconChevron, IconDownload, IconShare } from './Icons';

export function Gallery() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, entries, today } = useJournal();
  const [busy, setBusy] = useState<'dl' | 'share' | null>(null);

  if (!ready) return <div style={{ minHeight: 400 }} />;

  const t = parseKey(today);
  const curIdx = t.getFullYear() * 12 + t.getMonth();
  const first = Object.keys(entries).sort()[0];
  const minIdx = first ? parseKey(first).getFullYear() * 12 + parseKey(first).getMonth() : curIdx;

  const m = params.get('m');
  let idx = curIdx;
  if (m && /^\d{4}-\d{2}$/.test(m)) idx = Math.min(curIdx, Math.max(minIdx, Number(m.slice(0, 4)) * 12 + Number(m.slice(5)) - 1));
  const setIdx = (i: number) => router.replace(`/gallery?m=${monthKey(Math.floor(i / 12), i % 12)}`, { scroll: false });

  const months: number[] = [];
  for (let i = curIdx; i >= minIdx; i--) months.push(i);

  const cellsFor = (i: number) => {
    const y = Math.floor(i / 12), mo = i % 12;
    const off = (new Date(y, mo, 1).getDay() + 6) % 7;
    const days = new Date(y, mo + 1, 0).getDate();
    const cells: { k: string | null; text?: string; future: boolean }[] = Array.from({ length: off }, () => ({ k: null, future: false }));
    for (let d = 1; d <= days; d++) {
      const k = `${y}-${String(mo + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ k, text: entries[k], future: k > today });
    }
    return cells;
  };

  const y = Math.floor(idx / 12), mo = idx % 12;
  const cells = cellsFor(idx);
  const written = cells.filter(c => c.text).length;
  const label = `${written} ${written === 1 ? 'day' : 'days'} written${idx === curIdx ? ' so far' : ''}`;

  async function poster(kind: 'dl' | 'share') {
    setBusy(kind);
    try {
      const blob = await posterBlob(y, mo, entries, today, currentTheme() === 'dark');
      const name = `daybook-${monthKey(y, mo)}-poster.png`;
      if (kind === 'dl') downloadBlob(blob, name);
      else await shareOrDownload(blob, name, `My ${MONTH_NAMES[mo]} in Daybook`);
    } finally { setBusy(null); }
  }

  return (
    <div className="col" style={{ gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h1 className="title">Gallery</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="icon-btn ink" aria-label="Previous month" onClick={() => setIdx(idx - 1)} disabled={idx <= minIdx}><IconChevron dir="left" /></button>
          <span style={{ minWidth: 128, textAlign: 'center', fontSize: 15, fontWeight: 600 }}>{MONTH_NAMES[mo]} {y}</span>
          <button className="icon-btn ink" aria-label="Next month" onClick={() => setIdx(idx + 1)} disabled={idx >= curIdx}><IconChevron dir="right" /></button>
        </div>
      </div>
      <div className="row">
        <section className="col" style={{ flex: '999 1 520px', minWidth: 0, maxWidth: 680, gap: 16 }}>
          <div className="poster">
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
              <span className="poster-title">{MONTH_NAMES[mo]}</span>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)' }}>{y}</span>
            </div>
            <div className="mosaic" role="list" aria-label={`${MONTH_NAMES[mo]} ${y} mosaic`}>
              {cells.map((c, i) =>
                !c.k ? <div key={i} /> :
                c.text ? <ArtView key={i} dateKey={c.k} text={c.text} px={76} detail="thumb" /> :
                <div key={i} style={{ background: 'var(--surface-2)', opacity: c.future ? 0.45 : 1 }} />,
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, color: 'var(--muted)' }}>
              <span>{label}</span>
              <span className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>Daybook</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: '1 1 180px' }} disabled={!!busy} onClick={() => poster('dl')}><IconDownload /><span>Download poster</span></button>
            <button className="btn btn-secondary" style={{ flex: '1 1 120px' }} disabled={!!busy} onClick={() => poster('share')}><IconShare /><span>Share</span></button>
          </div>
        </section>
        <aside className="col" style={{ flex: '1 1 260px', minWidth: 0, gap: 10 }}>
          <span className="eyebrow">All months</span>
          {months.map(i => {
            const cs = cellsFor(i);
            const n = cs.filter(c => c.text).length;
            return (
              <button key={i} className={`month-btn${i === idx ? ' sel' : ''}`} aria-label={`Show ${MONTH_NAMES[i % 12]} poster`} onClick={() => setIdx(i)}>
                <div className="mini" aria-hidden="true">
                  {cs.map((c, j) => (
                    <div key={j} style={{ background: c.text ? art(c.k!, c.text, 8, 'flat').bg : c.k ? 'var(--surface-2)' : 'transparent', opacity: c.future ? 0.45 : 1 }} />
                  ))}
                </div>
                <div className="col" style={{ gap: 3 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{MONTH_NAMES[i % 12]}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{n} {n === 1 ? 'day' : 'days'} written{i === curIdx ? ' · in progress' : ''}</span>
                </div>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
