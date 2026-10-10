export function keyOf(d: Date) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
export function parseKey(k: string) {
  const p = k.split('-').map(Number);
  return new Date(p[0], p[1] - 1, p[2]);
}
export function isKey(k: string) { return /^\d{4}-\d{2}-\d{2}$/.test(k); }
export function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function longDate(d: Date) { return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`; }
export function shortDate(d: Date) { return `${d.getDate()} ${MONTH_NAMES[d.getMonth()].slice(0, 3).toUpperCase()} ${d.getFullYear()}`; }
export function monthKey(y: number, m: number) { return `${y}-${String(m + 1).padStart(2, '0')}`; }
