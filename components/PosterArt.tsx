import type { Poster } from '@/lib/data';

export default function PosterArt({ poster, minHeight, imageUrl, large = false }: { poster: Poster; minHeight: string; imageUrl?: string | null; large?: boolean }) {
  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={`${poster.brand} ${poster.kind} poster`} className={`w-full rounded-2xl bg-soft object-contain ${large ? 'max-h-[70vh]' : 'max-h-96'}`} />;
  }

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
