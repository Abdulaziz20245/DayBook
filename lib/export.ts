import { art, type Art } from './art';
import { MONTH_NAMES, parseKey, shortDate } from './dates';

function linearGrad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, deg: number, stops: [number, string][]) {
  const a = (deg * Math.PI) / 180, dx = Math.sin(a), dy = -Math.cos(a);
  const len = Math.abs(w * dx) + Math.abs(h * dy);
  const cx = x + w / 2, cy = y + h / 2;
  const g = ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}
function radialGrad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, px: number, py: number, stops: [number, string][]) {
  const cx = x + w * px, cy = y + h * py;
  const r = Math.max(Math.hypot(cx - x, cy - y), Math.hypot(cx - x - w, cy - y), Math.hypot(cx - x, cy - y - h), Math.hypot(cx - x - w, cy - y - h));
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  return g;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Paint one art square (generated with px === size) onto a canvas. */
export function drawArt(ctx: CanvasRenderingContext2D, a: Art, x: number, y: number, S: number, radius: number) {
  ctx.save();
  roundRect(ctx, x, y, S, S, radius);
  ctx.clip();
  const P = a.colors, { x1, y1, x2, y2, ang } = a.g;
  ctx.fillStyle = linearGrad(ctx, x, y, S, S, ang, [[0, P[3]], [1, P[2] + '66']]);
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = radialGrad(ctx, x, y, S, S, x2 / 100, y2 / 100, [[0, P[1] + 'cc'], [0.62, P[1] + '00']]);
  ctx.fillRect(x, y, S, S);
  ctx.fillStyle = radialGrad(ctx, x, y, S, S, x1 / 100, y1 / 100, [[0, P[0] + 'd9'], [0.58, P[0] + '00']]);
  ctx.fillRect(x, y, S, S);

  for (const s of a.shapes) {
    const { kind, col, col2, l, t, w: wp, h: hp, rot, o, multiply } = s.raw;
    const w = (wp / 100) * S, h = (hp / 100) * S;
    ctx.save();
    ctx.globalAlpha = o;
    ctx.globalCompositeOperation = multiply ? 'multiply' : 'source-over';
    ctx.translate(x + (l / 100) * S, y + (t / 100) * S);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.translate(-w / 2, -h / 2);
    if (kind === 1) {
      const bw = Math.max(1.5, Math.round(S * 0.03 * 10) / 10);
      ctx.strokeStyle = col; ctx.lineWidth = bw;
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2 - bw / 2, h / 2 - bw / 2, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (kind === 2) {
      ctx.fillStyle = linearGrad(ctx, 0, 0, w, h, 180, [[0, col], [1, col2]]);
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h); ctx.ellipse(w / 2, h, w / 2, h, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    } else if (kind === 3) {
      ctx.fillStyle = col; roundRect(ctx, 0, 0, w, h, h / 2); ctx.fill();
    } else if (kind === 4) {
      ctx.filter = `blur(${Math.round(S * 0.05 * 10) / 10}px)`;
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = radialGrad(ctx, 0, 0, w, h, 0.3, 0.3, [[0, col2], [0.7, col]]);
      ctx.beginPath(); ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
}

async function fontsReady() {
  const body = getComputedStyle(document.body);
  const serif = body.getPropertyValue('--font-serif').trim() || 'Georgia, serif';
  const sans = body.getPropertyValue('--font-sans').trim() || 'system-ui, sans-serif';
  try {
    await Promise.all([document.fonts.load(`400 40px ${serif}`), document.fonts.load(`italic 400 40px ${serif}`), document.fonts.load(`600 20px ${sans}`)]);
  } catch { /* fall back to system fonts */ }
  return { serif, sans };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = text.replace(/\s+/g, ' ').trim().split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function toBlob(c: HTMLCanvasElement) {
  return new Promise<Blob>((res, rej) => c.toBlob(b => (b ? res(b) : rej(new Error('Could not create image'))), 'image/png'));
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** 1080 x 1350 card: art, date and the entry. */
export async function cardBlob(dateKey: string, text: string, dark: boolean) {
  const { serif, sans } = await fontsReady();
  const W = 1080, H = 1350, pad = 60, S = W - pad * 2;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = dark ? '#121214' : '#F6F4F0'; ctx.fillRect(0, 0, W, H);
  const a = art(dateKey, text, S, 'full');
  drawArt(ctx, a, pad, pad, S, 56);
  const ink = dark ? '#EEEAE4' : '#211F1C', muted = dark ? '#A9A49C' : '#5F5A53';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = muted; ctx.font = `600 26px ${sans}`;
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '2px';
  ctx.fillText(shortDate(parseKey(dateKey)) + '  ·  ' + a.label.toUpperCase(), pad, pad + S + 62);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.fillStyle = ink; ctx.font = `400 38px ${serif}`;
  const maxLines = 5;
  let lines = wrap(ctx, text, S);
  if (lines.length > maxLines) { lines = lines.slice(0, maxLines); lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
  lines.forEach((ln, i) => ctx.fillText(ln, pad, pad + S + 124 + i * 54));
  ctx.fillStyle = muted; ctx.font = `500 30px ${serif}`; ctx.textAlign = 'right';
  ctx.fillText('Daybook', W - pad, H - 44);
  return toBlob(c);
}

/** 1080 x 1080 art only. */
export async function imageBlob(dateKey: string, text: string) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
  const ctx = c.getContext('2d')!;
  drawArt(ctx, art(dateKey, text, 1080, 'full'), 0, 0, 1080, 0);
  return toBlob(c);
}

/** 1080 x 1350 monthly mosaic poster. */
export async function posterBlob(year: number, month: number, entries: Record<string, string>, todayKey: string, dark: boolean) {
  const { serif, sans } = await fontsReady();
  const W = 1080, H = 1350, pad = 72;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!;
  const bg = dark ? '#1B1B1F' : '#FFFFFF', ink = dark ? '#EEEAE4' : '#211F1C', muted = dark ? '#A9A49C' : '#5F5A53', rest = dark ? '#26262C' : '#EEEAE3';
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = ink; ctx.font = `italic 400 120px ${serif}`; ctx.textBaseline = 'alphabetic';
  ctx.fillText(MONTH_NAMES[month], pad, pad + 100);
  ctx.fillStyle = muted; ctx.font = `600 28px ${sans}`; ctx.textAlign = 'right';
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '3px';
  ctx.fillText(String(year), W - pad, pad + 100);
  (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.textAlign = 'left';
  const gap = 14, tile = (W - pad * 2 - gap * 6) / 7, top = pad + 170;
  const off = (new Date(year, month, 1).getDay() + 6) % 7, days = new Date(year, month + 1, 0).getDate();
  let written = 0;
  for (let d = 1; d <= days; d++) {
    const k = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const i = off + d - 1, x = pad + (i % 7) * (tile + gap), y = top + Math.floor(i / 7) * (tile + gap);
    const tx = entries[k];
    if (tx) { written++; drawArt(ctx, art(k, tx, tile, 'thumb'), x, y, tile, 18); }
    else { ctx.save(); ctx.globalAlpha = k > todayKey ? 0.45 : 1; ctx.fillStyle = rest; roundRect(ctx, x, y, tile, tile, 18); ctx.fill(); ctx.restore(); }
  }
  ctx.fillStyle = muted; ctx.font = `400 30px ${sans}`;
  ctx.fillText(`${written} days written`, pad, H - 64);
  ctx.fillStyle = ink; ctx.font = `500 36px ${serif}`; ctx.textAlign = 'right';
  ctx.fillText('Daybook', W - pad, H - 62);
  return toBlob(c);
}

/** Share a file with the Web Share API when possible, otherwise download it. */
export async function shareOrDownload(blob: Blob, name: string, text: string) {
  const file = new File([blob], name, { type: 'image/png' });
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], text }); return 'shared'; }
  } catch (e) { if ((e as Error).name === 'AbortError') return 'cancelled'; }
  downloadBlob(blob, name);
  return 'downloaded';
}
