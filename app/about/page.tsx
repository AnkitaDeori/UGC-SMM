import type { Metadata } from 'next';
import { ContactSection, HeroTilt, Item, Pinned, Reveal, Words } from '@/components';
import { PORTRAIT_SRC, interests, tools, whatIDo } from '@/lib/data';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <>
      <HeroTilt panel={false} />

      <section id="story" className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-12 md:grid-cols-[1.1fr_.9fr] md:py-16">
        <div aria-hidden className="col-span-full overflow-hidden whitespace-nowrap py-4 font-display text-2xl text-ac/70">
          <div className="inline-block animate-marquee">{'CONTENT ✦ UGC ✦ SOCIAL ✦ STORYTELLING ✦ BEAUTY ✦ FASHION ✦ '.repeat(8)}</div>
        </div>
        <Reveal>
          <h2 className="section-heading about-section-heading gradient-text font-display">Curious mind. Creative instinct. Digital everything.</h2>
          <p className="mt-5 max-w-[52ch] text-sm">Hi, I’m Ankita — a creative exploring the intersection of content, beauty, fashion, storytelling, and digital culture. I enjoy turning everyday ideas into visuals and stories that connect with people.</p>
          <p className="mt-4 max-w-[52ch] text-mu text-sm">I work across UGC-style content and social media management, combining creative experimentation, audience awareness, and AI-powered tools to bring ideas to life.</p>
          <a href="#contact" className="cta mt-8">Say hello</a>
        </Reveal>
        <Reveal delay={150}>
          <div className="relative mx-auto grid aspect-[4/5] w-full max-w-sm rotate-2 place-items-center overflow-hidden rounded-[2rem] bg-soft p-6 text-center shadow-2xl shadow-ac/15 transition-transform duration-500 ease-[cubic-bezier(.3,1.5,.5,1)] hover:rotate-0">
            <span className="absolute left-5 top-5 font-mono text-xs text-ac">The creative behind the screen</span>
            {PORTRAIT_SRC
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={PORTRAIT_SRC} alt="Portrait of Ankita Deori" className="h-full w-full object-cover" />
              : <span className="font-mono text-xs text-mu">Portrait placeholder.<br />Set PORTRAIT_SRC in lib/data.ts<br />to Ankita’s real photo.</span>}
          </div>
        </Reveal>
      </section>

      <Pinned id="what" title="What I do" intro="Three ways I work, and what keeps me curious." panel={false} titleClassName="about-section-heading">
        <div className="grid gap-4 sm:grid-cols-2">{whatIDo.map((service) => <Item key={service.title} {...service} />)}</div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3"><h3 className="font-mono text-xs text-ac">Creative interests</h3><Words list={interests} /></div>
          <div className="space-y-3"><h3 className="font-mono text-xs text-ac">Tools and workflow</h3><Words list={tools} /></div>
        </div>
      </Pinned>

      <ContactSection />
    </>
  );
}
