# Website recreation prompt

Copy and reuse the prompt below to build this website in a new project.

---

## Prompt

Act as a senior frontend engineer and product designer. Build a polished, responsive creative portfolio website for **Ankita Deori**, an independent creative working in content creation, user-generated content (UGC), and social media management.

Deliver a complete, working website—not just a mockup. Use the project requirements below as the source of truth. Keep content editable, avoid inventing clients, testimonials, performance metrics, or paid partnerships, and clearly label fictional concept work.

### Technology

- Use **Next.js App Router**, **React**, **TypeScript**, and **Tailwind CSS**.
- Use reusable, typed components and keep portfolio content in a data module.
- Use the fonts **Archivo Black** for display headings, **DM Sans** for body copy, and **Space Mono** for small labels and interface details. Load these from Google Fonts at runtime; do not make production builds depend on downloading fonts during compilation.
- Add page metadata, semantic HTML, keyboard-accessible controls, visible focus styles, and reduced-motion support.
- The site should build successfully with the package scripts for development, type checking, and production builds.

### Visual identity

Create a clean, modern, editorial design that feels expressive and fun rather than like a generic template. Use generous whitespace, carefully controlled display typography, layered soft gradients, a few playful organic shapes, and small surprising details. Make both light and dark themes feel intentionally designed—not merely color-inverted.

Use this theme palette:

- Light background: cool lavender-white `rgb(250 247 255)`.
- Light surface: white `rgb(255 255 255)`.
- Light accent: saturated violet `rgb(119 67 220)`.
- Light primary text: deep plum `rgb(34 27 49)`.
- Light muted text: soft plum-gray `rgb(103 94 120)`.
- Light gradient glows: rose `rgb(255 137 170)`, apricot `rgb(255 196 106)`, and aqua `rgb(126 213 224)`.
- Dark background: inky violet `rgb(17 15 27)`.
- Dark surface: muted violet `rgb(34 29 49)`.
- Dark accent: light lavender `rgb(198 157 255)`.
- Dark primary text: `rgb(248 244 255)`.
- Dark muted text: `rgb(184 174 204)`.
- Dark gradient glows: bright plum `rgb(179 115 230)`, rose `rgb(255 156 171)`, and aqua `rgb(75 190 205)`.

Use layered radial and linear gradients over the page background, hero, section panels, cards, and contact form. Use gradient text selectively for the main hero title and section headings; maintain sufficient contrast in both themes. Display headings should be bold but controlled: hero title approximately `clamp(1.5rem, 7.2vw, 6.2rem)`, inner page titles around `clamp(2.25rem, 5.1vw, 4.6rem)` with a wide enough measure to avoid awkward excessive wrapping, and section titles around `clamp(1.85rem, 3.8vw, 3.7rem)`. Avoid headings so large that they dominate or clip the viewport.

Use a sticky top navigation with a translucent gradient-aware background and backdrop blur. Links should have a restrained animated underline. Give cards thin accent-tinted borders, subtle surface gradients, rounded corners, compact content-fit padding, and a gentle hover lift/glow. Add a few distinctive decorative touches (organic gradient orbs, a fine hero outline, an expressive arrow, or a tiny accent mark) without clutter. Do **not** use infinite card animations. Keep cards only as large as their content needs.

### Global layout and interactions

- Create a shared site header, main content area, and footer.
- Include a keyboard-accessible “Skip to content” link.
- The header contains the “AD.” home/brand link, navigation links for About, UGC, and SMM, a “Let’s talk” link to the contact section, a light/dark theme toggle, a sound toggle, and a compact mobile menu.
- Use the saved theme if present; otherwise start from the operating-system color-scheme preference. Avoid a visible theme flash on initial load.
- Persist the theme choice in local storage. Keep interface sounds off by default and persist the sound choice for the current session only.
- Add optional, quiet synthesized interface blips for link and button clicks when sound is enabled; gracefully handle browsers where audio is unavailable.
- Respect `prefers-reduced-motion`: remove decorative animations and transitions and keep all content readable.
- Do not add a “Scroll to” section navigation bar.
- **About uses normal document scrolling.** It must not use sticky stacked panels.
- **UGC and SMM use normal document scrolling on every screen size**, with smooth scrolling for in-page navigation. Do not pin or stack their sections.
- Keep the contact section and footer in normal, non-sticky document flow on every page. Style them seamlessly with the page background; avoid enclosing the whole contact form or footer in a separate gradient box.
- Add smooth scrolling where appropriate, but disable it for reduced-motion preferences.

### Routes and page content

The root route `/` redirects to `/about`. Provide `/about`, `/ugc`, and `/smm`.

#### About (`/about`)

1. **Hero**
   - A viewport-height, centered hero with soft floating circular shapes.
   - Eyebrow: “Independent creative • Content • Social”.
   - Centered, two-line main heading: “Ankita’s Creative” on the first line and “Portfolio” on the second. Keep the decorative sticker/orbs behind and clear of the heading.
   - Supporting copy: “I turn ideas into content people want to stop scrolling for.”
   - Primary links: “Explore my work” to `/ugc` and “Let’s collaborate” to `#contact`.
   - Keep those two CTA labels smaller than the headline (around 16–18px).
   - Availability note: “● Open for projects (edit availability here)”.
   - A subtle “scroll ↓” hint.
   - Add a gentle pointer tilt/parallax only on fine-pointer devices, and disable it for reduced motion.
2. **Marquee and story**
   - A decorative, horizontally moving text strip with “CONTENT ✦ UGC ✦ SOCIAL ✦ STORYTELLING ✦ BEAUTY ✦ FASHION ✦”.
   - Heading: “Curious mind. Creative instinct. Digital everything.”
   - Intro: “Hi, I’m Ankita — a creative exploring the intersection of content, beauty, fashion, storytelling, and digital culture. I enjoy turning everyday ideas into visuals and stories that connect with people.”
   - Follow-up: “I work across UGC-style content and social media management, combining creative experimentation, audience awareness, and AI-powered tools to bring ideas to life.”
   - Link: “Say hello” to `#contact`.
   - A portrait area with alt text “Portrait of Ankita Deori”. If no photo is configured, render an intentional placeholder that explains how to set `PORTRAIT_SRC`.
3. **What I do**
   - Present three compact cards, not an animated carousel:
     - Content creation — “Visuals and stories built around ideas worth sharing.”
     - UGC — “Creator-style videos and photos that feel real, made for brands.”
     - Social media management — “Planning, creating and shaping a consistent online presence.”
   - List creative interests: Beauty, Skincare, Fashion, Lifestyle, Storytelling, Digital creativity.
   - List tools/workflow: Canva, CapCut, Adobe Express, AI tools, Add yours.
   - Place interests and tools/workflow side by side on larger screens, with compact text and a stacked layout on mobile.
4. Contact form and footer as described below.

#### UGC (`/ugc`)

1. **Intro**
   - Eyebrow: “UGC Studio / Selected concepts”.
   - Heading: “Content that feels real. And makes people feel something.”
   - Copy: “Browse concept campaigns and uploaded creator-style photos and videos. Concept projects are clearly marked as spec work, not paid partnerships.”
2. **Two distinct horizontal media rails**
   - Build a “Videos” rail and a separate “Photos” rail. Every media holder uses the same fixed aspect ratio and consistent responsive width.
   - Support touch scrolling, horizontal scroll snapping, keyboard-accessible controls, and previous/next buttons.
   - Video uploads use playable video controls. Photo uploads use informative alt text.
   - Start with empty video and photo galleries; do not include demo media.
3. **UGC admin upload**
   - Add a discreet “Admin” control that expands an admin panel; never expose upload controls as an unauthenticated public action.
   - Integrate **Supabase Auth email magic links** and **Supabase Storage**.
   - Read project URL and anon/publishable key from `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Read the configured admin email from `NEXT_PUBLIC_SUPABASE_ADMIN_EMAIL`.
   - The SMM poster gallery starts empty and stores poster category, brand, headline, details, and colors in an RLS-protected `portfolio_posters` table. Let the signed-in configured admin add, edit, and delete posters in the page UI. Public visitors can read posters.
   - Show “Add videos” and “Add photos” controls only to the configured signed-in admin, with a prominent per-item delete control on uploaded media.
   - Accept appropriate image/video MIME types, enforce a clear upload-size limit (100 MB), collect a title and optional details with each upload, surface errors, and refresh the public gallery after successful upload.
   - Show the saved title and details beneath each uploaded item. Let the configured admin edit those details and delete individual uploaded media files after confirmation.
   - Do not put a service-role key, password, or other secret in client code.
   - Enforce authorization with Supabase Storage row-level security policies. Public visitors may read media; only the configured admin may upload, edit, or delete. A hidden UI control is not a substitute for server-side/storage authorization.
   - Document in a setup guide how to create/configure the Supabase project, set environment variables, allow local and production redirect URLs, configure the admin email, create the bucket, and run the storage-policy SQL.
   - If credentials are not configured, show a clear configuration message in the admin panel.
4. **UGC Starter Kit**
   - Heading: “The UGC Starter Kit”.
   - Intro: “Pick what you need. Quantities and pricing are editable placeholders.”
   - Use a clean, compact grid of cards for:
     - Product photography — Styled stills of your product. Deliverable: Photo set.
     - UGC-style reels — Vertical videos with a creator’s voice. Deliverable: Reel.
     - Unboxing videos — Honest first-impression footage. Deliverable: Video.
     - Product demonstrations — Show how it works, simply. Deliverable: Video.
     - Testimonial-style videos — Scripted around your real feedback. Deliverable: Video.
     - Aesthetic lifestyle content — Mood-led photos and clips. Deliverable: Photo + clip set.
     - Hook & concept development — Opening lines and ideas that earn attention. Deliverable: Concept doc.
     - Short-form editing — Cuts, captions and sound for your footage. Deliverable: Edited video.
   - Do not add inquiry links inside service or package cards; use the page-level CTA to link to `#contact`.
   - Add three compact package cards: The Mini Edit, The Content Drop, The Full Campaign.
   - Pricing should remain clearly editable placeholder copy, not look like a published quote.
5. Contact and footer, styled seamlessly with the page background.

#### Social media management (`/smm`)

1. **Intro**
   - Eyebrow: “Social media / Strategy + creative”.
   - Heading: “Your brand has a story. Let’s make people stop and listen.”
   - Copy: “Creative content, thoughtful planning, and a social presence that feels unmistakably yours.”
2. **Services**
   - Heading: “What I can do”; intro: “Seven areas, mixed and matched to your goals.”
   - Use compact content-fit cards:
     - Social media strategy — Content pillars, audience and competitor research, brand voice.
     - Content planning — Monthly calendars, posting schedules, campaign planning.
     - Content creation — Reels, carousels, static posts, Stories and promo creatives.
     - Visual identity — Feed aesthetics, design consistency, brand templates.
     - Copywriting — Captions, hooks, calls to action, storytelling.
     - Community support — Response guidelines, engagement ideas, community content.
     - Performance reporting — Basic insights tracking, summaries, recommendations from available analytics.
3. **Concept projects**
   - Heading: “Concept projects”; intro: “Fictional brands, made to show process. No clients, no results claimed.”
   - Create case-study cards with a native accessible dialog/modal:
     - Glow Theory (Skincare & beauty): challenge “Make a product-education feed feel premium and friendly.” Direction “Cream, red and blush; calm editorial product shots.” Deliverables “Instagram grid, Reel covers, education carousel, Stories, campaign poster”.
     - Sunday Studio (Fashion & lifestyle): challenge “Give a slow-fashion label a recognisable weekly rhythm.” Direction “Warm neutrals, bold type, clean editorial layouts.” Deliverables “Moodboard, styling carousel, poster, Reel cover system”.
     - Earth & Ritual (Natural wellness): challenge “Explain simple rituals without sounding clinical.” Direction “Earthy textures, minimal layouts, organic shapes.” Deliverables “Educational carousel, storytelling posts, campaign creative, calendar sample”.
   - Clearly state “Concept project · spec work for a fictional brand” and “No client, no results claimed.” Do not invent client outcomes.
4. **Poster gallery**
   - Start with an empty gallery; do not include dummy poster samples.
   - Use a Supabase `portfolio_posters` table with public read access and row-level security restricting insert, update, and delete to the configured admin.
   - Let the signed-in admin create, edit, and delete posters in the page UI. Each poster form captures category, brand, headline, supporting details, background color, and text/accent color.
   - Render saved poster content as responsive, varied-height editorial cards. Opening a poster shows an accessible dialog; allow closing via its close button, Escape, or clicking the backdrop.
5. **Social Media Starter Kit**
   - Heading: “The Social Media Starter Kit”.
   - Intro: “Everything your brand needs to begin showing up online with more clarity and consistency.”
   - Use compact content-fit tier cards, with editable placeholder pricing:
     - The Brand Basics: Profile and content audit; Basic visual direction; Content pillar suggestions; Starter content calendar.
     - The Content System: Monthly content planning; Reel and carousel concepts; Static post and Story creatives; Caption and hook writing.
     - The Creative Partner: Ongoing content planning; Content creation and creative direction; Publishing support, if agreed; Monthly performance summary.
   - Add: “Final scope is customised to your brand’s goals. Not every service is in every tier.”
6. Contact and footer, styled seamlessly with the page background.

### Contact form

- Render a compact, two-column section on larger screens and a single column on mobile. Keep form width restrained (about 24rem maximum).
- Heading: “Have a project in mind? Let’s make it real.”
- Explain that it is a demo and messages are not sent until a form service is connected.
- Fields: name, email, project type (UGC, Social media management, Content creation, Other), optional budget (Not sure yet, Starter, Mid, Large), and project description.
- Validate required name, valid email, and at least 10 characters in project details. Associate accessible error messages with their fields and announce overall status.
- Do not claim the message was sent. Show a clear demo/not-sent status unless a real form backend is configured.

### Footer

- Display “Ankita Deori” and “Creative content with a clear point of view.”
- Include editable Instagram, LinkedIn, and email links; clearly mark any unset links as placeholders during development.
- Show “© 2026 Ankita Deori” and a “Back to top” button.
- The footer always uses normal document flow, never the sticky panel effect.

### Quality and acceptance criteria

- All three routes render without runtime or TypeScript errors.
- The root route redirects to `/about`.
- About scrolls as a regular document on all screen sizes.
- UGC and SMM use normal document scrolling with smooth in-page navigation.
- Contact and footer are never pinned.
- Mobile pages use normal vertical scrolling; media rails scroll horizontally without causing page-width overflow.
- Both UGC media rails use consistently sized media frames and display only the correct media type.
- Authenticated, configured admin can upload videos and photos; unauthorized users cannot upload even if they bypass the UI. Missing Supabase configuration produces a clear setup message.
- Theme, menu, modal, media rail, form, and admin controls are keyboard accessible with visible focus indicators.
- Reduced-motion preferences are respected.
- Run type checking and a production build before declaring the implementation complete.
