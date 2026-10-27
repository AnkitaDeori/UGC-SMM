import type { ReactNode } from 'react';
import Reveal from './Reveal';

export default function Item({ title, text, meta, children }: { title: string; text?: string; meta?: string; children?: ReactNode }) {
  return (
    <Reveal>
      <article className="item-card flex flex-col items-start gap-2 transition-transform duration-300 hover:-translate-y-1">
        {meta && <span className="font-mono text-xs text-ac">{meta}</span>}
        <h3 className="card-heading font-display text-ac">{title}</h3>
        {text && <p className="text-mu text-sm">{text}</p>}
        {children}
      </article>
    </Reveal>
  );
}
