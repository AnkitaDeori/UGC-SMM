'use client';
import { ReactNode, useEffect, useRef } from 'react';

export const grid = 'grid gap-4 sm:grid-cols-2';

export function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const r = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = r.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('animate-up'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={r} className={`reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

export function Item({ title, text, meta, children }: { title: string; text?: string; meta?: string; children?: ReactNode }) {
  return (
    <Reveal>
      <article className="item-card flex flex-col items-start gap-2 transition-transform duration-300 hover:-translate-y-1">
        {meta && <span className="font-mono text-xs text-ac">{meta}</span>}
        <h3 className="card-heading font-display text-ac">{title}</h3>
        {text && <p className="text-mu">{text}</p>}
        {children}
      </article>
    </Reveal>
  );
}

/** Left panel stays pinned while the right column scrolls (stacks on mobile). */
export function Pinned({ id, title, intro, children, panel = true }: { id: string; title: string; intro?: string; children: ReactNode; panel?: boolean }) {
  return (
    <section id={id} className={`${panel ? 'scroll-panel' : ''} mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)] md:gap-14`}>
      <div className={panel ? 'md:sticky md:top-32 md:self-start' : ''}>
        <Reveal>
          <h2 className="section-heading gradient-text font-display">{title}</h2>
          {intro && <p className="mt-4 max-w-[30ch] text-mu">{intro}</p>}
        </Reveal>
      </div>
      <div className="space-y-14">{children}</div>
    </section>
  );
}

export function Words({ list }: { list: string[] }) {
  return (
    <p className="flex flex-wrap gap-x-2 gap-y-2 font-display">
      {list.map((w) => (
        <span key={w} className="word-chip inline-block cursor-default transition hover:-rotate-3 hover:scale-105 hover:text-ac">{w}</span>
      ))}
    </p>
  );
}

export const Price = () => <p className="font-mono text-xs text-mu">Price ₹[10] · Deliverables [2] · Turnaround [5]</p>;
