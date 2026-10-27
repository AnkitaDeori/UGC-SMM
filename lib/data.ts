export const PORTRAIT_SRC = ''; // set to a real photo URL or /public path

export interface Service { title: string; text: string }
export interface CaseStudy { name: string; cat: string; challenge: string; direction: string; deliverables: string }
export interface Poster { kind: string; brand: string; line: string; bg: string; fg: string; details?: string }
export interface Tier { name: string; items: string[] }

export const whatIDo: Service[] = [
  { title: 'Content creation', text: 'Visuals and stories built around ideas worth sharing.' },
  { title: 'UGC', text: 'Creator-style videos and photos that feel real, made for brands.' },
  { title: 'Social media management', text: 'Planning, creating and shaping a consistent online presence.' },
];
export const interests = ['Beauty', 'Skincare', 'Fashion', 'Lifestyle', 'Storytelling', 'Digital creativity'];
export const tools = ['Canva', 'CapCut', 'Adobe Express', 'AI tools', 'Add yours'];

export const ugcServices: (Service & { deliverable: string })[] = [
  { title: 'Product photography', text: 'Styled stills of your product.', deliverable: 'Photo set' },
  { title: 'UGC-style reels', text: 'Vertical videos with a creator’s voice.', deliverable: 'Reel' },
  { title: 'Unboxing videos', text: 'Honest first-impression footage.', deliverable: 'Video' },
  { title: 'Product demonstrations', text: 'Show how it works, simply.', deliverable: 'Video' },
  { title: 'Testimonial-style videos', text: 'Scripted around your real feedback.', deliverable: 'Video' },
  { title: 'Aesthetic lifestyle content', text: 'Mood-led photos and clips.', deliverable: 'Photo + clip set' },
  { title: 'Hook & concept development', text: 'Opening lines and ideas that earn attention.', deliverable: 'Concept doc' },
  { title: 'Short-form editing', text: 'Cuts, captions and sound for your footage.', deliverable: 'Edited video' },
];
export const packages = ['The Mini Edit', 'The Content Drop', 'The Full Campaign'];

export const smmServices: Service[] = [
  { title: 'Social media strategy', text: 'Content pillars, audience and competitor research, brand voice.' },
  { title: 'Content planning', text: 'Monthly calendars, posting schedules, campaign planning.' },
  { title: 'Content creation', text: 'Reels, carousels, static posts, Stories and promo creatives.' },
  { title: 'Visual identity', text: 'Feed aesthetics, design consistency, brand templates.' },
  { title: 'Copywriting', text: 'Captions, hooks, calls to action, storytelling.' },
  { title: 'Community support', text: 'Response guidelines, engagement ideas, community content.' },
  { title: 'Performance reporting', text: 'Basic insights tracking, summaries, recommendations from available analytics.' },
];
export const cases: CaseStudy[] = [
  { name: 'Glow Theory', cat: 'Skincare & beauty', challenge: 'Make a product-education feed feel premium and friendly.', direction: 'Cream, red and blush; calm editorial product shots.', deliverables: 'Instagram grid, Reel covers, education carousel, Stories, campaign poster' },
  { name: 'Sunday Studio', cat: 'Fashion & lifestyle', challenge: 'Give a slow-fashion label a recognisable weekly rhythm.', direction: 'Warm neutrals, bold type, clean editorial layouts.', deliverables: 'Moodboard, styling carousel, poster, Reel cover system' },
  { name: 'Earth & Ritual', cat: 'Natural wellness', challenge: 'Explain simple rituals without sounding clinical.', direction: 'Earthy textures, minimal layouts, organic shapes.', deliverables: 'Educational carousel, storytelling posts, campaign creative, calendar sample' },
];
export const tiers: Tier[] = [
  { name: 'The Brand Basics', items: ['Profile and content audit', 'Basic visual direction', 'Content pillar suggestions', 'Starter content calendar'] },
  { name: 'The Content System', items: ['Monthly content planning', 'Reel and carousel concepts', 'Static post and Story creatives', 'Caption and hook writing'] },
  { name: 'The Creative Partner', items: ['Ongoing content planning', 'Content creation and creative direction', 'Publishing support, if agreed', 'Monthly performance summary'] },
];
