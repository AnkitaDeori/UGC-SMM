'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { blip, loadSound, setSound } from '@/lib/sound';

const links = [{ href: '/about', label: 'About' }, { href: '/ugc', label: 'UGC' }, { href: '/smm', label: 'SMM' }];

export default function Navbar() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  const [snd, setSnd] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
    setSnd(loadSound());
    const h = (e: MouseEvent) => { if ((e.target as HTMLElement).closest('a,button')) blip(440); };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);
  useEffect(() => { setOpen(false); }, [path]);

  const toggleTheme = () => {
    const t = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch { /* ignore */ }
    setDark(!dark);
  };
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
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} className={t}>{dark ? 'Light' : 'Dark'}</button>
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="menu" className={`${t} md:hidden`}>Menu</button>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-12 pt-16">
      <p className="font-display text-5xl text-ac md:text-7xl">Ankita Deori</p>
      <p className="mt-3 max-w-[36ch] text-mu">Creative content with a clear point of view.</p>
      <p className="mt-6 flex flex-wrap gap-x-6 font-mono text-sm">
        <a className="ulink" href="https://www.instagram.com/ankitheexplorer_/">Instagram</a>
        <a className="ulink" href="https://www.linkedin.com/in/ankitadeori/">LinkedIn</a>
        <a className="ulink" href="mailto:deoriankita2004@gmail.com">deoriankita2004@gmail.com</a>
      </p>
      <div className="mt-10 flex items-center justify-between font-mono text-xs text-mu">
        <span>© 2026 Ankita Deori</span>
        <button type="button" className="ulink" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button>
      </div>
    </footer>
  );
}
