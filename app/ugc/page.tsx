import type { Metadata } from 'next';
import { ContactSection, Gallery, Item, Pinned, Price, grid } from '@/components';
import { packages, ugcServices } from '@/lib/data';

export const metadata: Metadata = { title: 'UGC' };

export default function UgcPage() {
  return (
    <>
      <header className="mx-auto max-w-6xl px-5 pb-12 pt-16">
        <p className="font-mono text-xs text-ac">UGC Studio / Selected concepts</p>
        <h1 className="page-title gradient-text mt-4 max-w-[22ch] font-display">Content that feels real. And makes people feel something.</h1>
        <p className="mt-6 max-w-[46ch] text-mu">Browse concept campaigns and uploaded creator-style photos and videos. Concept projects are clearly marked as spec work, not paid partnerships.</p>
      </header>
      <section id="gallery" className="py-12"><Gallery /></section>

      <Pinned id="kit" title="The UGC Starter Kit" intro="Pick what you need. Quantities and pricing are editable placeholders." panel={false}>
        <div className={grid}>
          {ugcServices.map((s) => (
            <Item key={s.title} title={s.title} text={s.text} meta={`Deliverable: ${s.deliverable} × [edit]`} />
          ))}
        </div>
        <h3 className="font-display text-3xl text-ac">Packages</h3>
        <div className={grid}>{packages.map((p) => <Item key={p} title={p}><Price /></Item>)}</div>
      </Pinned>

      <ContactSection />
    </>
  );
}
