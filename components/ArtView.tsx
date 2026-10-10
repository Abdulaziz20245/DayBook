import type { CSSProperties } from 'react';
import { art, type Detail } from '@/lib/art';

interface Props {
  dateKey: string;
  text: string;
  /** nominal pixel size the art is generated for (affects ring width and blur) */
  px: number;
  detail?: Detail;
  className?: string;
  style?: CSSProperties;
  label?: string;
  children?: React.ReactNode;
}

/** Generated art as absolutely positioned divs inside a square. Size it with CSS. */
export function ArtView({ dateKey, text, px, detail = 'full', className, style, label, children }: Props) {
  const a = art(dateKey, text, px, detail);
  return (
    <div
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ position: 'relative', overflow: 'hidden', background: a.bg, ...style }}
    >
      {a.shapes.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', left: s.left, top: s.top, width: s.width, height: s.height, borderRadius: s.borderRadius,
            background: s.background, border: s.border, opacity: s.opacity, transform: s.transform, filter: s.filter,
            mixBlendMode: s.mixBlendMode as CSSProperties['mixBlendMode'], boxSizing: 'border-box',
          }}
        />
      ))}
      {children}
    </div>
  );
}
