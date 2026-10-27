import type { ReactNode } from 'react';
import Reveal from './Reveal';

export default function Pinned({ id, title, intro, children, panel = true, titleClassName = '' }: { id: string; title: string; intro?: string; children: ReactNode; panel?: boolean; titleClassName?: string }) {
  return (
    <section id={id} className={`${panel ? 'scroll-panel' : ''} mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[minmax(0,.8fr)_minmax(0,1.6fr)] md:gap-14`}>
      <div className={panel ? 'md:sticky md:top-32 md:self-start' : ''}>
        <Reveal>
          <h2 className={`section-heading gradient-text font-display ${titleClassName}`}>{title}</h2>
          {intro && <p className="mt-4 max-w-[30ch] text-mu">{intro}</p>}
        </Reveal>
      </div>
      <div className="space-y-14">{children}</div>
    </section>
  );
}
