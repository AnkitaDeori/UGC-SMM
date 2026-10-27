import type { Poster } from '@/lib/data';

export default function PosterArt({ poster, minHeight }: { poster: Poster; minHeight: string }) {
  return (
    <div className="flex flex-col justify-between gap-8 rounded-2xl p-6 font-display" style={{ background: poster.bg, color: poster.fg, minHeight }}>
      <span className="font-mono text-[11px]">{poster.brand || 'Brand'} · {poster.kind || 'Poster'}</span>
      <b className="text-3xl font-normal leading-none">{poster.line}</b>
      <div className="flex items-end justify-between gap-3">
        <span className="max-w-[24ch] font-sans text-sm">{poster.details}</span>
        <i className="block h-12 w-12 shrink-0 rounded-full" style={{ background: poster.fg }} />
      </div>
    </div>
  );
}
