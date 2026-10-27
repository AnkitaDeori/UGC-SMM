'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { blip, loadSound, setSound } from '@/lib/sound';

const links = [{ href: '/about', label: 'About' }, { href: '/ugc', label: 'UGC' }, { href: '/smm', label: 'SMM' }];

export default function Navbar() {
  const path = usePathname();
  const [snd, setSnd] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSnd(loadSound());
    const h = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('a,button')) blip(440); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);

  const toggleSound = () => { setSound(!snd); setSnd(!snd); blip(660); };
  const t = 'ulink font-mono text-xs text-mu hover:text-ac';

  return (
    <header className="site-nav sticky top-0 z-40 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-5 px-5">
        <Link href="/about" aria-label="Ankita Deori, home" className="gradient-text mr-auto font-display text-2xl">AD.</Link>
        <div id="menu" className={`${open ? 'flex' : 'hidden'} absolute inset-x-0 top-16 flex-col gap-4 bg-bg px-5 pb-6 md:static md:flex md:flex-row md:items-center md:gap-6 md:bg-transparent md:p-0`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined} className="ulink font-mono text-sm">{l.label}</Link>
          ))}
          <a href="#contact" className="ulink font-mono text-sm text-ac">Let’s talk</a>
        </div>
        <button type="button" onClick={toggleSound} aria-pressed={snd} aria-label={`Interface sounds ${snd ? 'on' : 'off'}`} className={t}>{snd ? 'Sound on' : 'Sound off'}</button>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu" className={`${t} md:hidden`}>Menu</button>
      </nav>
    </header>
  );
}
