import type { ReactNode } from 'react';

function Svg({ size = 20, sw = 1.8, children }: { size?: number; sw?: number; children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
type P = { size?: number };
export const IconPen = ({ size }: P) => <Svg size={size}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></Svg>;
export const IconCalendar = ({ size }: P) => <Svg size={size}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /></Svg>;
export const IconGrid = ({ size }: P) => <Svg size={size}><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></Svg>;
export const IconSun = ({ size, sw = 1.9 }: P & { sw?: number }) => <Svg size={size} sw={sw}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></Svg>;
export const IconMoon = ({ size }: P) => <Svg size={size}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></Svg>;
export const IconRefresh = ({ size }: P) => <Svg size={size}><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 5v6h-6" /></Svg>;
export const IconDownload = ({ size = 18 }: P) => <Svg size={size} sw={1.9}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Svg>;
export const IconImage = ({ size = 18 }: P) => <Svg size={size}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="M20.5 16l-5-5-8 8.5" /></Svg>;
export const IconShare = ({ size = 18 }: P) => <Svg size={size}><path d="M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></Svg>;
export const IconArrow = ({ size }: P) => <Svg size={size} sw={1.9}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
export const IconChevron = ({ size, dir }: P & { dir: 'left' | 'right' }) => <Svg size={size}><path d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} /></Svg>;
export const IconPlus = ({ size = 18 }: P) => <Svg size={size} sw={2}><path d="M12 5v14M5 12h14" /></Svg>;
export const IconCheck = ({ size = 14 }: P) => <Svg size={size} sw={2.4}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
