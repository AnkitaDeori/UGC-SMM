import type { Metadata } from 'next';
import { CaseStudies, ContactSection, Item, Pinned, Posters, Price, grid } from '@/components';
import { cases, smmServices, tiers } from '@/lib/data';

export const metadata: Metadata = { title: 'Social media management' };

export default function SmmPage() {
  return (
    <>
      <header className="mx-auto max-w-6xl px-5 pb-12 pt-16">
        <p className="font-mono text-xs text-ac">Social media / Strategy + creative</p>
        <h1 className="page-title gradient-text mt-4 max-w-[22ch] font-display">Your brand has a story. Let’s make people stop and listen.</h1>
        <p className="mt-6 max-w-[46ch] text-mu">Creative content, thoughtful planning, and a social presence that feels unmistakably yours.</p>
      </header>

      <Pinned id="services" title="What I can do" intro="Seven areas, mixed and matched to your goals." panel={false}>
        <div className={grid}>{smmServices.map((s) => <Item key={s.title} {...s} />)}</div>
      </Pinned>
      <Pinned id="projects" title="Concept projects" intro="Fictional brands, made to show process. No clients, no results claimed." panel={false}>
        <CaseStudies items={cases} />
      </Pinned>
      <Pinned id="posters" title="Poster gallery" intro="Tap a poster to enlarge it." panel={false}>
        <Posters />
      </Pinned>
      <Pinned id="kit" title="The Social Media Starter Kit" intro="Everything your brand needs to begin showing up online with more clarity and consistency." panel={false}>
        <div className={grid}>
          {tiers.map((t) => (
            <Item key={t.name} title={t.name}>
              <ul className="list-disc space-y-1 pl-5 text-sm text-mu">{t.items.map((i) => <li key={i}>{i}</li>)}</ul>
              <Price />
            </Item>
          ))}
        </div>
        <p className="font-mono text-xs text-mu">Final scope is customised to your brand’s goals. Not every service is in every tier.</p>
      </Pinned>

      <ContactSection />
    </>
  );
}
