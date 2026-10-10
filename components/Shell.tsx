'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { longDate } from '@/lib/dates';
import { currentStreak } from '@/lib/streak';
import { currentTheme, setTheme, useJournal, type Theme } from '@/lib/store';
import { IconCalendar, IconGrid, IconMoon, IconPen, IconSun } from './Icons';

const TABS = [
  { href: '/', label: 'Today', icon: <IconPen /> },
  { href: '/calendar', label: 'Calendar', icon: <IconCalendar /> },
  { href: '/gallery', label: 'Gallery', icon: <IconGrid /> },
];

function activeTab(path: string) {
  if (path.startsWith('/calendar')) return '/calendar';
  if (path.startsWith('/gallery')) return '/gallery';
  return '/';
}

function ThemeToggle() {
  const [theme, set] = useState<Theme | null>(null);
  useEffect(() => { set(currentTheme()); }, []);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      className="icon-btn"
      aria-label={theme ? `Switch to ${next} theme` : 'Switch theme'}
      onClick={() => { setTheme(next); set(next); }}
    >
      {theme === 'dark' ? <IconSun /> : <IconMoon />}
    </button>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const active = activeTab(path);
  const { ready, entries, today } = useJournal();
  const streak = ready ? currentStreak(entries, today).count : 0;
  const dateLabel = ready ? longDate(new Date()) : '';

  return (
    <div className="shell">
      <header className="top">
        <div className="top-brand">
          <span className="wordmark">Daybook</span>
          <span className="top-date">{dateLabel}</span>
        </div>
        <nav aria-label="Main" className="top-nav">
          {TABS.map(t => (
            <Link key={t.href} href={t.href} className={`top-tab${active === t.href ? ' on' : ''}`} aria-current={active === t.href ? 'page' : undefined}>
              {t.icon}<span>{t.label}</span>
            </Link>
          ))}
        </nav>
        <div className="top-right">
          <div className="chip chip-accent"><IconSun size={18} /><span>{streak}-day streak</span></div>
          <ThemeToggle />
        </div>
      </header>

      <main className="main">
        <div className="mob-head">
          <span className="wordmark">Daybook</span>
          <span className="mob-right">
            <span className="mob-date">{dateLabel}</span>
            <ThemeToggle />
          </span>
        </div>
        {children}
      </main>

      <nav aria-label="Main" className="tabbar">
        {TABS.map(t => (
          <Link key={t.href} href={t.href} className={`tab${active === t.href ? ' on' : ''}`} aria-current={active === t.href ? 'page' : undefined}>
            <span className="tab-pill">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
