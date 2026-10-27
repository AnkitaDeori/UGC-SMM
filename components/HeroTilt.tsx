'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

const TITLE_LINES = ['Ankita’s Creative', 'Portfolio'];
const orbs = [
  { d: -22, c: 'h-56 w-56 right-[5%] bottom-[8%]' },
  { d: 30, c: 'h-24 w-24 right-[16%] top-[14%]' },
  { d: -34, c: 'h-16 w-16 left-[14%] bottom-[14%]' },
];

export default function HeroTilt({ panel = true }: { panel?: boolean }) {
  const hero = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = hero.current, t = tilt.current;
    if (!h || !t) return;
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const par = h.querySelectorAll<HTMLElement>('[data-d]');
    let raf = 0, x = 0, y = 0;
    const paint = () => {
      raf = 0;
      t.style.transform = `rotateY(${x * 9}deg) rotateX(${-y * 7}deg)`;
      par.forEach((p) => { p.style.transform = `translate(${x * Number(p.dataset.d)}px,${y * Number(p.dataset.d)}px)`; });
    };
    const move = (e: PointerEvent) => {
      const r = h.getBoundingClientRect();
      x = ((e.clientX - r.left) / r.width) * 2 - 1;
      y = ((e.clientY - r.top) / r.height) * 2 - 1;
      t.style.transition = 'transform .08s linear';
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => { x = y = 0; t.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1)'; paint(); };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerleave', leave);
    return () => { h.removeEventListener('pointermove', move); h.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, []);

  let n = 0;
  return (
    <section ref={hero} className={`${panel ? 'scroll-panel' : ''} hero-shell relative grid min-h-[calc(100svh-4rem)] place-items-center overflow-x-hidden px-5 py-10 text-center [perspective:1100px]`}>
      <span aria-hidden className="hero-spark animate-float">✳</span>
      {orbs.map((o) => (
        <div key={o.d} data-d={o.d} aria-hidden className={`hero-orb absolute ${o.c}`}>
          <div className="h-full w-full animate-float rounded-full bg-ac/10" />
        </div>
      ))}
      <div ref={tilt} className="hero-content relative [transform-style:preserve-3d]">
        <p className="hero-kicker font-mono text-xs text-mu">Independent creative&nbsp; ✦ &nbsp;Content&nbsp; ✦ &nbsp;Social</p>
        <h1 aria-label={TITLE_LINES.join(' ')} className="hero-title mt-4 font-display">
          {TITLE_LINES.map((line) => (
            <span key={line} aria-hidden className="hero-title-line block whitespace-nowrap">
              {line.split(' ').map((word) => (
                <span key={word} className="inline-block whitespace-nowrap">
                  {[...word].map((ch) => (
                    <span key={`${word}-${n}`} className="inline-block animate-drop hover:animate-wob" style={{ animationDelay: `${n++ * 45}ms` }}>{ch}</span>
                  ))}{' '}
                </span>
              ))}
            </span>
          ))}
        </h1>
        <p className="mx-auto my-6 max-w-[34ch] text-xl">I turn ideas into content people want to stop scrolling for.</p>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
          <Link href="/ugc" className="cta text-base md:text-lg">Explore my work</Link>
          <a href="#contact" className="cta text-base md:text-lg">Let’s collaborate</a>
        </div>
        <p className="mt-6 font-mono text-xs text-mu">● Open for projects (edit availability here)</p>
      </div>
      <p className="absolute inset-x-0 bottom-4 animate-bob font-mono text-xs text-mu">scroll ↓</p>
    </section>
  );
}
