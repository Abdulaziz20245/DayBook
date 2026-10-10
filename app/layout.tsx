import type { Metadata, Viewport } from 'next';
import { Figtree, Newsreader } from 'next/font/google';
import { Shell } from '@/components/Shell';
import './globals.css';

const serif = Newsreader({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Figtree({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'Daybook',
  description: 'Write a few sentences about your day and watch it turn into a piece of art.',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [{ media: '(prefers-color-scheme: light)', color: '#F6F4F0' }, { media: '(prefers-color-scheme: dark)', color: '#121214' }],
};

const themeInit = `try{var t=localStorage.getItem('daybook:theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
