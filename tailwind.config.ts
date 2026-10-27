import type { Config } from 'tailwindcss';
const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { bg: c('bg'), soft: c('soft'), ac: c('ac'), tx: c('tx'), mu: c('mu') },
      fontFamily: {
        display: ['var(--f-display)', 'sans-serif'],
        sans: ['var(--f-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--f-mono)', 'monospace'],
      },
      keyframes: {
        up: { from: { opacity: '0', transform: 'translateY(24px) scale(.97)' }, to: { opacity: '1' } },
        drop: { from: { opacity: '0', transform: 'translateY(-60px) rotate(-10deg)' } },
        wob: { '30%': { transform: 'translateY(-14px) rotate(-8deg)' }, '60%': { transform: 'translateY(2px) rotate(5deg)' } },
        float: { to: { translate: '0 -28px' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
        bob: { '50%': { transform: 'translateY(-7px)' } },
      },
      animation: {
        up: 'up .7s cubic-bezier(.2,.9,.3,1.2) both',
        drop: 'drop .8s cubic-bezier(.3,1.7,.5,1) both',
        wob: 'wob .5s',
        float: 'float 6s ease-in-out infinite alternate',
        marquee: 'marquee 40s linear infinite',
        bob: 'bob 1.6s ease-in-out infinite',
      },
    },
  },
} satisfies Config;
