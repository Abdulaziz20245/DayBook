# Daybook: build handoff for Claude Code

Build this design as a Next.js (App Router, TypeScript) app deployed on Vercel.
`design/Main.dc.html` is the clickable prototype source. It holds every screen's markup, inline styles, and the art and streak logic in its `<script>` block.
`design/Style.dc.html` is the spec sheet. Treat both as the visual reference. This file is the spec.

## Stack and constraints
- Next.js App Router, TypeScript, plain CSS Modules or Tailwind (your choice). Don't add a UI kit.
- No accounts and no backend. Entries go in `localStorage` under `daybook:entries` as `{ "YYYY-MM-DD": "text" }`.
  Wrap every read and write in try/catch and render fine when storage is empty.
- Art is generated in code and never stored. Recompute it from (date, text).
- Theme: follow `prefers-color-scheme`, with a manual toggle saved in localStorage.
- Mobile first. Mobile layout uses a bottom tab bar. At ≥ 900px, switch to the desktop layout with a top header and two columns (see the prototype's `isDesk` branches).

## Routes
| Route | Screen |
|---|---|
| `/` | Today: prompt, entry box, streak card, Save |
| `/day/[date]` | Art reveal: art card, mood chip, entry, Download card / Save image, milestone link |
| `/calendar` | Streak calendar: month grid of art thumbnails, rest days, current streak ring, selected-day panel |
| `/gallery` | Month mosaic poster plus month list. `?m=2026-09` selects a month |
| `/milestone/[n]` | Celebration for 7, 30 and 100 days |

After Save, go to `/day/today`. If the new streak equals 7, 30 or 100, show the milestone card there.

## Design tokens
| token | light | dark | use |
|---|---|---|---|
| bg | #F6F4F0 | #121214 | page ground |
| surface | #FFFFFF | #1B1B1F | cards, writing box |
| surface-2 | #EEEAE3 | #26262C | secondary buttons, rest tiles |
| ink | #211F1C | #EEEAE4 | text, primary button bg |
| muted | #5F5A53 | #A9A49C | secondary text |
| faint | #8C867D | #77726B | future dates (decorative) |
| line | #E2DDD5 | #2F2F36 | borders |
| line-2 | #C9C2B7 | #4A4A53 | dashed rest-day outlines |
| accent | #B5531B | #F2A36B | streak ring, today marker |
| accent-ink | #8F3F10 | #F7BE93 | text on accent-soft |
| accent-soft | #FBE5D2 | #3B2719 | streak chips, glow |
| on-ink | #FAF8F5 | #141416 | text on primary button |

Fonts (next/font/google): **Newsreader** (opsz, 400/500, italic 400) for prompts, entries, numerals and the poster title. **Figtree** (400–700) for all UI.
- Prompt: Newsreader 400, 30px mobile / 46px desktop, lh 1.15, letter-spacing −0.01em
- Entry: Newsreader 400, 18 / 21px, lh 1.55
- Buttons: Figtree 600, 15–16px. Eyebrow: Figtree 600, 12px, uppercase, 0.08em
- Radii: tiles 7–16px, cards 24px, art 28px, buttons and chips 999px
- Touch targets ≥ 44px. Primary buttons 52–56px tall
- Reveal animation: opacity 0→1 over 900ms ease. Scale 0.94→1 over 1100ms cubic-bezier(.2,.8,.2,1). Blur 14px→0 over 900ms. Reduced motion: fade only.

## Art generator (port exactly)
Put this in `lib/art.ts`. Render it with absolutely positioned divs in a square, as in the prototype. Use `<canvas>` (or html-to-image) for "Download card" (1080×1350 with date + entry) and "Save image" (1080×1080).

```ts
export const MOODS = {
  bright:     { label: 'Bright & warm', c: ['#FF8A5B','#FFC857','#FF5E78','#FFF1DC'], words: ['smil','happ','laugh','fun','sun','great','love','joy','glad','best','delicious','bun','yum','beautiful'] },
  calm:       { label: 'Calm & clear',  c: ['#2EC4B6','#3A86FF','#9FE3DC','#E6F6F4'], words: ['calm','quiet','walk','sea','rain','peace','slow','tea','coffee','rest','breath','garden','park','water','morning','bird','window'] },
  reflective: { label: 'Thoughtful',    c: ['#6C63FF','#B497F5','#2E2A72','#ECE8FF'], words: ['think','thought','wonder','book','learn','rememb','maybe','night','wrote','write','idea','list','decid'] },
  tender:     { label: 'Soft & tender', c: ['#F497B6','#FFB4A2','#D9667E','#FFEDEF'], words: ['mom','dad','famil','hug','grate','thank','kind','home','baby','sister','brother','friend','cozy','called'] },
  lively:     { label: 'Lively',        c: ['#FF4D6D','#FF9F1C','#7B2CBF','#FFE8D6'], words: ['run','danc','music','gym','busy','excit','won','trip','city','energ','game','concert','amazing','loud'] },
  heavy:      { label: 'Heavy, and that’s okay', c: ['#5C6B8A','#9DB0D3','#2F3A55','#E6EBF3'], words: ['tired','sad','hard','long','stress','sick','lonel','worr','rough','grey','gray','cold','alone','anxi'] },
} as const;
type Mood = keyof typeof MOODS;

export function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
export function rng(seed: number) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function moodOf(text: string, key: string): Mood {
  const w = text.toLowerCase().match(/[a-z]+/g) ?? [];
  let best: Mood | null = null, bs = 0;
  (Object.keys(MOODS) as Mood[]).forEach(k => {
    let s = 0; w.forEach(x => MOODS[k].words.forEach(y => { if (x.startsWith(y)) s++; }));
    if (s > bs) { bs = s; best = k; }
  });
  if (!best) { const f: Mood[] = ['calm','bright','reflective','tender','lively']; best = f[hash(key || text || 'x') % f.length]; }
  return best;
}

export type Detail = 'full' | 'thumb' | 'flat'; // 7 shapes / 3 shapes / background only
export function art(key: string, text: string, px: number, detail: Detail) {
  const mood = moodOf(text, key), P = MOODS[mood].c, r = rng(hash(key + '|' + text));
  const q = (n: number) => Math.round(n * 10) / 10;
  const x1 = q(12 + r() * 40), y1 = q(10 + r() * 40), x2 = q(50 + r() * 40), y2 = q(50 + r() * 40), ang = Math.floor(r() * 360);
  const bg = `radial-gradient(circle at ${x1}% ${y1}%, ${P[0]}d9 0%, ${P[0]}00 58%), radial-gradient(circle at ${x2}% ${y2}%, ${P[1]}cc 0%, ${P[1]}00 62%), linear-gradient(${ang}deg, ${P[3]} 0%, ${P[2]}66 100%)`;
  const n = detail === 'full' ? 7 : detail === 'thumb' ? 3 : 0;
  const shapes = [];
  for (let i = 0; i < n; i++) {
    const kind = Math.floor(r() * 5), col = P[Math.floor(r() * 3)], col2 = P[Math.floor(r() * 3)];
    let w = detail === 'full' ? 18 + r() * 40 : 34 + r() * 34, h = w, rad = '50%', bgc = col, bd = 'none', fl = 'none', o = q(0.55 + r() * 0.4);
    const rot = Math.floor(r() * 360), mb = r() < 0.35 ? 'multiply' : 'normal';
    if (kind === 1) { bgc = 'transparent'; bd = `${Math.max(1.5, q(px * 0.03))}px solid ${col}`; }
    else if (kind === 2) { h = w / 2; rad = '999px 999px 0 0'; bgc = `linear-gradient(180deg, ${col} 0%, ${col2} 100%)`; }
    else if (kind === 3) { h = w / 3.2; rad = '999px'; }
    else if (kind === 4) { w *= 1.2; h = w; fl = `blur(${q(px * 0.05)}px)`; o = q(0.6 + r() * 0.3); }
    else { bgc = `radial-gradient(circle at 30% 30%, ${col2} 0%, ${col} 70%)`; }
    shapes.push({ left: `${q(10 + r() * 80)}%`, top: `${q(10 + r() * 80)}%`, width: `${q(w)}%`, height: `${q(h)}%`,
      borderRadius: rad, background: bgc, border: bd, opacity: o, filter: fl, mixBlendMode: mb,
      transform: `translate(-50%, -50%) rotate(${rot}deg)` });
  }
  return { bg, shapes, mood, label: MOODS[mood].label, colors: P };
}
```
Keep the order of `r()` calls exactly as above, or the same entry will produce different art.

## Streak rules
- Current streak: count consecutive days with an entry, going back from today. If today has no entry yet, start from yesterday, so the streak stays alive until midnight.
- Longest streak: the longest run across all entries.
- Milestones: 7, 30, 100. Show each once (store `daybook:milestonesSeen`).
- Tone: never guilt. Missed days are "rest days" with a dashed outline. Copy is in the prototype.

## Screen details (from the prototype)
- **Today:** eyebrow "Today’s prompt". A prompt rotates daily through a list, with a refresh button for another. Textarea placeholder: "A few sentences is plenty…". A live mood row (4 palette dots + "Feels calm & clear", plus word count). Save button: "Save & reveal today’s art" (or "Update today’s art" once saved). Note below: "Saved only in this browser. No account needed." The streak card has the big number, "day streak", a hint line and a Mon–Sun row of 36px art dots (today = dashed accent ring).
- **Reveal:** square art card with a 28px radius and a soft shadow, plus date and wordmark pills along the bottom. A mood chip, the entry in Newsreader, two buttons, and the milestone card (accent-soft bg, accent border).
- **Calendar:** Monday-first 7-column grid. Each day has an art tile, a dashed rest day, an accent dashed "+" for today if not written, or a faint future tile. The streak days get a 2px accent outline (offset 2px); the selected day gets an ink outline. The side panel shows the selected entry. Chips: streak, longest, entries count.
- **Gallery:** poster card with the month in Newsreader italic and the year, then a 7-column art mosaic (gap tiles in surface-2, future at 45% opacity), plus "N days written" and the wordmark. Buttons: Download poster and Share. A month list with mini mosaics.
- **Milestone:** N art or color dots on a ring around a big numeral with "days in a row", plus a radial accent-soft glow behind. The headline and body change per milestone. A 7 · 30 · 100 ladder of chips. Buttons: Keep going (to the calendar) and Share milestone.

## Accessibility
Use real `<button>`, `<label for>` and `<a>` elements. Give icon buttons an `aria-label` and the art `role="img"` with an aria-label that names the date and mood. Text contrast must be at least 4.5:1, and the tokens above already meet it.
