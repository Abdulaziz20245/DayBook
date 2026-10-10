'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOODS, moodOf } from '@/lib/art';
import { isKey, longDate, parseKey, shortDate } from '@/lib/dates';
import { cardBlob, downloadBlob, imageBlob } from '@/lib/export';
import { currentTheme, useJournal } from '@/lib/store';
import { currentStreak, MILESTONES } from '@/lib/streak';
import { ArtView } from './ArtView';
import { IconArrow, IconDownload, IconImage, IconSun } from './Icons';

export function Day() {
  const params = useParams<{ date: string }>();
  const router = useRouter();
  const { ready, entries, today, seen } = useJournal();
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState<{ card?: boolean; img?: boolean }>({});

  const raw = params.date;
  const key = raw === 'today' ? today : raw;
  const valid = raw === 'today' || isKey(raw);
  const text = ready && valid ? entries[key] : undefined;

  useEffect(() => {
    if (!text) return;
    const id = setTimeout(() => setShown(true), 80);
    return () => clearTimeout(id);
  }, [text]);

  if (!ready) return <div style={{ minHeight: 400 }} />;

  if (!valid || !text) {
    const isToday = key === today;
    return (
      <div className="col" style={{ gap: 14, maxWidth: 520, margin: '40px auto 0', textAlign: 'center', alignItems: 'center' }}>
        <h1 className="title">{valid ? longDate(parseKey(key)) : 'Page not found'}</h1>
        <p className="muted" style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>
          {!valid ? 'That date doesn’t look right.' : isToday ? 'Today’s page is still open. A sentence or two is plenty.' : 'Nothing to make up. The next page is always waiting.'}
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>{isToday ? 'Write today’s entry' : 'Back to today'}</Link>
      </div>
    );
  }

  const d = parseKey(key);
  const mood = MOODS[moodOf(text, key)];
  const isToday = key === today;
  const streak = currentStreak(entries, today).count;
  const msHit = isToday && (MILESTONES as readonly number[]).includes(streak) && !seen.includes(streak);

  async function onCard() {
    const blob = await cardBlob(key, text!, currentTheme() === 'dark');
    downloadBlob(blob, `daybook-${key}-card.png`);
    setDone(s => ({ ...s, card: true }));
  }
  async function onImage() {
    const blob = await imageBlob(key, text!);
    downloadBlob(blob, `daybook-${key}.png`);
    setDone(s => ({ ...s, img: true }));
  }

  return (
    <div className="reveal-row">
      <div className="reveal-art-wrap">
        <ArtView
          dateKey={key} text={text} px={560}
          className={`reveal-art${shown ? ' in' : ''}`}
          label={`Abstract art for ${longDate(d)}, mood: ${mood.label}`}
        >
          <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="art-pill">{shortDate(d)}</span>
            <span className="art-pill serif" style={{ padding: '4px 11px', fontSize: 15, letterSpacing: 0 }}>Daybook</span>
          </div>
        </ArtView>
      </div>
      <div className="col" style={{ flex: '1 1 320px', minWidth: 0, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="eyebrow">{isToday ? 'Today’s art' : longDate(d)}</span>
          <span className="mood-chip">
            <span className="dots" aria-hidden="true">{mood.c.slice(0, 3).map(c => <span key={c} style={{ background: c }} />)}</span>
            <span>{mood.label}</span>
          </span>
        </div>
        <p className="entry-read">{text}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ flex: '1 1 160px' }} onClick={onCard}><IconDownload /><span>{done.card ? 'Card downloaded' : 'Download card'}</span></button>
          <button className="btn btn-secondary" style={{ flex: '1 1 140px' }} onClick={onImage}><IconImage /><span>{done.img ? 'Image saved' : 'Save image'}</span></button>
        </div>
        {isToday && (
          <button className="btn btn-secondary" onClick={() => router.push('/')} style={{ alignSelf: 'flex-start', height: 44 }}>Edit today’s entry</button>
        )}
        {msHit && (
          <Link href={`/milestone/${streak}`} className="ms-card">
            <IconSun size={26} />
            <span className="col" style={{ gap: 2, flex: 1 }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{streak} days in a row</span>
              <span style={{ fontSize: 13 }}>Open your little celebration</span>
            </span>
            <IconArrow />
          </Link>
        )}
      </div>
    </div>
  );
}
