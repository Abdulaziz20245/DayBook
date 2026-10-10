'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MOODS, moodOf } from '@/lib/art';
import { addDays, keyOf, parseKey } from '@/lib/dates';
import { saveEntry, useJournal } from '@/lib/store';
import { currentStreak } from '@/lib/streak';
import { ArtView } from './ArtView';
import { IconRefresh, IconSun } from './Icons';

const PROMPTS = [
  'What made you smile today?',
  'What is one small thing you noticed today?',
  'Who made your day a little lighter?',
  'What would you like to remember about today?',
  'What are you looking forward to tomorrow?',
];
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function Today() {
  const router = useRouter();
  const { ready, entries, today } = useJournal();
  const [text, setText] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [promptOffset, setPromptOffset] = useState(0);

  // fill the box with today's entry once, after storage has been read
  useEffect(() => {
    if (ready && !loaded) { setText(entries[today] ?? ''); setLoaded(true); }
  }, [ready, loaded, entries, today]);

  const saved = !!entries[today];
  const typed = text.trim();
  const streak = ready ? currentStreak(entries, today) : null;

  const promptIdx = useMemo(() => {
    if (!today) return 0;
    const d = parseKey(today);
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000) + promptOffset;
  }, [today, promptOffset]);
  const prompt = PROMPTS[((promptIdx % PROMPTS.length) + PROMPTS.length) % PROMPTS.length];

  const week = useMemo(() => {
    if (!today) return [];
    const t = parseKey(today);
    const monday = addDays(t, -((t.getDay() + 6) % 7));
    return LETTERS.map((letter, i) => {
      const k = keyOf(addDays(monday, i));
      return { letter, k, isToday: k === today, text: entries[k] };
    });
  }, [today, entries]);

  const mood = typed && today ? MOODS[moodOf(typed, today)] : null;
  const wc = typed ? typed.split(/\s+/).length : 0;
  const count = streak?.count ?? 0;
  const note = saved ? 'Today’s page is done. See you tomorrow.' : count === 0 ? 'Every streak starts with one small entry.' : `Write today and it becomes ${count + 1}.`;

  function save() {
    if (!typed || !today) return;
    saveEntry(today, typed);
    router.push('/day/today');
  }

  return (
    <div className="row">
      <section className="today-main">
        <div className="col" style={{ gap: 10 }}>
          <span className="eyebrow">Today’s prompt</span>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <label htmlFor="entry" className="prompt">{prompt}</label>
            <button className="icon-btn" aria-label="Try another prompt" onClick={() => setPromptOffset(o => o + 1)}><IconRefresh /></button>
          </div>
        </div>
        <div className="entry-box">
          <textarea id="entry" value={text} onChange={e => setText(e.target.value)} placeholder="A few sentences is plenty…" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
              <div className="dots" aria-hidden="true">
                {(mood ? mood.c.slice(0, 4) : ['var(--line-2)', 'var(--line)', 'var(--line-2)', 'var(--line)']).map((c, i) => <span key={i} style={{ background: c }} />)}
              </div>
              <span aria-live="polite">{mood ? `Feels ${mood.label.charAt(0).toLowerCase()}${mood.label.slice(1)}` : 'Your colors appear as you write'}</span>
            </div>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{wc ? `${wc} ${wc === 1 ? 'word' : 'words'}` : ''}</span>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={!typed || !ready} style={{ opacity: typed ? 1 : 0.55 }}>
          <IconSun /><span>{saved ? 'Update today’s art' : 'Save & reveal today’s art'}</span>
        </button>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>Saved only in this browser. No account needed.</p>
      </section>

      <aside className="today-aside">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, flex: 'none', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconSun size={24} />
            </div>
            <div className="col" style={{ gap: 4, flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="streak-num">{count}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>day streak</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{ready ? note : ' '}</span>
            </div>
          </div>
          <div className="week">
            {week.map((w, i) => (
              <div key={i}>
                {w.text ? (
                  <ArtView dateKey={w.k} text={w.text} px={36} detail="thumb" className="week-dot" />
                ) : w.isToday ? (
                  <div className="week-dot" style={{ border: '2px dashed var(--accent)' }} />
                ) : (
                  <div className="week-dot" style={{ background: 'var(--surface-2)' }} />
                )}
                <span style={{ fontSize: 12, fontWeight: w.isToday ? 700 : 500, color: w.isToday ? 'var(--accent-ink)' : 'var(--muted)' }}>{w.letter}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
