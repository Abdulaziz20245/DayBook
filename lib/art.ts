export const MOODS = {
  bright:     { label: 'Bright & warm', c: ['#FF8A5B','#FFC857','#FF5E78','#FFF1DC'], words: ['smil','happ','laugh','fun','sun','great','love','joy','glad','best','delicious','bun','yum','beautiful'] },
  calm:       { label: 'Calm & clear',  c: ['#2EC4B6','#3A86FF','#9FE3DC','#E6F6F4'], words: ['calm','quiet','walk','sea','rain','peace','slow','tea','coffee','rest','breath','garden','park','water','morning','bird','window'] },
  reflective: { label: 'Thoughtful',    c: ['#6C63FF','#B497F5','#2E2A72','#ECE8FF'], words: ['think','thought','wonder','book','learn','rememb','maybe','night','wrote','write','idea','list','decid'] },
  tender:     { label: 'Soft & tender', c: ['#F497B6','#FFB4A2','#D9667E','#FFEDEF'], words: ['mom','dad','famil','hug','grate','thank','kind','home','baby','sister','brother','friend','cozy','called'] },
  lively:     { label: 'Lively',        c: ['#FF4D6D','#FF9F1C','#7B2CBF','#FFE8D6'], words: ['run','danc','music','gym','busy','excit','won','trip','city','energ','game','concert','amazing','loud'] },
  heavy:      { label: 'Heavy, and that’s okay', c: ['#5C6B8A','#9DB0D3','#2F3A55','#E6EBF3'], words: ['tired','sad','hard','long','stress','sick','lonel','worr','rough','grey','gray','cold','alone','anxi'] },
} as const;
export type Mood = keyof typeof MOODS;

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

export interface Shape {
  left: string; top: string; width: string; height: string;
  borderRadius: string; background: string; border: string;
  opacity: number; filter: string; mixBlendMode: string; transform: string;
  // raw values, used by the canvas renderer (never affect the rng order)
  raw: { kind: number; col: string; col2: string; l: number; t: number; w: number; h: number; rot: number; o: number; multiply: boolean };
}

export function art(key: string, text: string, px: number, detail: Detail) {
  const mood = moodOf(text, key), P = MOODS[mood].c, r = rng(hash(key + '|' + text));
  const q = (n: number) => Math.round(n * 10) / 10;
  const x1 = q(12 + r() * 40), y1 = q(10 + r() * 40), x2 = q(50 + r() * 40), y2 = q(50 + r() * 40), ang = Math.floor(r() * 360);
  const bg = `radial-gradient(circle at ${x1}% ${y1}%, ${P[0]}d9 0%, ${P[0]}00 58%), radial-gradient(circle at ${x2}% ${y2}%, ${P[1]}cc 0%, ${P[1]}00 62%), linear-gradient(${ang}deg, ${P[3]} 0%, ${P[2]}66 100%)`;
  const n = detail === 'full' ? 7 : detail === 'thumb' ? 3 : 0;
  const shapes: Shape[] = [];
  for (let i = 0; i < n; i++) {
    const kind = Math.floor(r() * 5), col = P[Math.floor(r() * 3)], col2 = P[Math.floor(r() * 3)];
    let w = detail === 'full' ? 18 + r() * 40 : 34 + r() * 34, h = w, rad = '50%', bgc: string = col, bd = 'none', fl = 'none', o = q(0.55 + r() * 0.4);
    const rot = Math.floor(r() * 360), mb = r() < 0.35 ? 'multiply' : 'normal';
    if (kind === 1) { bgc = 'transparent'; bd = `${Math.max(1.5, q(px * 0.03))}px solid ${col}`; }
    else if (kind === 2) { h = w / 2; rad = '999px 999px 0 0'; bgc = `linear-gradient(180deg, ${col} 0%, ${col2} 100%)`; }
    else if (kind === 3) { h = w / 3.2; rad = '999px'; }
    else if (kind === 4) { w *= 1.2; h = w; fl = `blur(${q(px * 0.05)}px)`; o = q(0.6 + r() * 0.3); }
    else { bgc = `radial-gradient(circle at 30% 30%, ${col2} 0%, ${col} 70%)`; }
    const l = q(10 + r() * 80), t = q(10 + r() * 80);
    shapes.push({ left: `${l}%`, top: `${t}%`, width: `${q(w)}%`, height: `${q(h)}%`,
      borderRadius: rad, background: bgc, border: bd, opacity: o, filter: fl, mixBlendMode: mb,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      raw: { kind, col, col2, l, t, w: q(w), h: q(h), rot, o, multiply: mb === 'multiply' } });
  }
  return { bg, shapes, mood, label: MOODS[mood].label, colors: P as readonly string[], g: { x1, y1, x2, y2, ang } };
}
export type Art = ReturnType<typeof art>;
