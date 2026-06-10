## ICC International — Plan

A premium, editorial, institution-grade website for the Italian Culinary Consortium International, plus a minimal admin CMS for the content most likely to change. Built mobile-first on the TanStack Start template already in the project.

### 1. Design system

Tailwind v4 tokens defined in `src/styles.css` (oklch equivalents of the brief's hex values):

- `--forest` `#0F3D2E` (primary), `--gold` `#B99A5D` (accent), `--cream` `#F8F6F2`, `--charcoal` `#222`, plus Italian flag accents `--it-green`, `--it-red`.
- Mapped to semantic tokens: `background = cream`, `foreground = charcoal`, `primary = forest`, `accent = gold`, plus `--ring` and shadcn variants. Dark mode keeps forest as background, gold as accent.
- Typography: **Cormorant Garamond** (display/headings) + **Inter** (body), loaded via `<link>` in `__root.tsx`, registered as `--font-display` / `--font-sans`.
- Reusable primitives: `<Eyebrow/>` (gold uppercase tracked label), `<SectionHeading/>` (large serif with Italian flag rule), `<GoldRule/>`, `<StatCounter/>` (intersection-observer count-up), `<ChapterCard/>`, `<InitiativeCard/>`, `<EditorialImage/>` (asymmetric framing with thin gold border arc, matching the reference).
- Motion: framer-motion (already a TanStack-compatible package) for fade/rise on scroll, parallax hero, sticky-nav transition. Respects `prefers-reduced-motion`.

### 2. Routes (file-based, TanStack)

All under `src/routes/`. Each has its own `head()` with title/description/og tags. The root `__root.tsx` gets a global `<SiteHeader/>` (sticky, transparent → cream-on-scroll, search/lang/socials, full mega-nav on desktop, slide-over drawer on mobile) and `<SiteFooter/>` (forest-green, ICC logo, quick links, newsletter, socials, Honeysuckles Design credit bottom).

Public routes:
- `/` index — hero, mission pillars, animated impact stats, interactive world map section, chapters carousel, initiatives, testimonials, newsletter
- `/about` — mission/vision/history/timeline/objectives
- `/chapters` — grid + filter + map
- `/chapters/$slug` — chapter detail (president, contact, local events)
- `/leadership` — editorial portrait cards
- `/academy` — courses/certifications/workshops sections (LMS-ready scaffolding)
- `/initiatives` — filterable category grid
- `/events` — upcoming/past/calendar tabs
- `/news` — editorial article grid + featured
- `/membership` — tier comparison + enquiry form
- `/partners` — logo wall + spotlights
- `/contact` — form, global offices, map embed, departments

Admin (minimal v1):
- `/auth` — Lovable Cloud email/password + Google sign-in
- `/_authenticated/admin` — dashboard shell (sidebar)
- `/_authenticated/admin/chapters` — CRUD
- `/_authenticated/admin/leadership` — CRUD
- `/_authenticated/admin/events` — CRUD
- `/_authenticated/admin/news` — CRUD
- `/_authenticated/admin/enquiries` — read newsletter signups + contact submissions

Role gating via `user_roles` table + `has_role()` security definer (admin/editor). Deferred to a later pass: full media library, SEO panel, analytics dashboard, multilingual UI, leadership/academy/initiatives admin polish, redirects manager.

### 3. Backend (Lovable Cloud)

Enabled now. One migration creates all tables with GRANTs + RLS:

```text
app_role (enum: admin, editor)
user_roles            -- (user_id, role); has_role() security definer
chapters              -- city, country, slug, president, email, phone, lat, lng, social, hero_image, featured
leadership            -- name, role, region, bio, portrait, socials, order
events                -- title, slug, starts_at, ends_at, location, city, cover, body, status (upcoming/past), registration_url
news                  -- title, slug, excerpt, body, cover, category, published_at, author
initiatives           -- title, slug, category, summary, body, cover
academy_items         -- title, type (course/cert/workshop/masterclass), summary, cover, cta_url
partners              -- name, logo_url, tier, url
testimonials          -- quote, name, role, country, portrait, video_url
membership_enquiries  -- name, email, tier, message, created_at
contact_messages      -- name, email, department, message, created_at
newsletter_subs       -- email, locale, created_at
site_settings         -- jsonb (hero copy, stats, social links, footer)
```

- Public reads (chapters/leadership/events/news/initiatives/academy/partners/testimonials/site_settings): server fn using `supabaseAdmin` with explicit column projection and `published = true` filters (no broad `anon` policies).
- Form submissions (newsletter, contact, membership): server fn with zod validation, rate-limit-friendly insert via `supabaseAdmin`.
- Admin CRUD: `createServerFn` + `requireSupabaseAuth` + `has_role(auth.uid(),'admin')` policies.
- Storage: `media` bucket (public) created via storage tool; used by admin uploaders for chapter/leadership/event imagery.

### 4. Imagery

Generated with the `generate_image` tool, stored in `src/assets/`:
- Hero pasta beauty shot (cinematic, matches the brief's reference)
- 9 chapter city photographs (NYC, London, Dubai, Singapore, Sydney, São Paulo, Toronto, Rome, Milan)
- 4 initiative covers, 3 leadership editorial portraits, 1 academy cover, 1 newsletter band image
- ICC seal/monogram SVG drawn in code (gold circular seal like reference)
- Dotted world map background SVG drawn in code

No background video in v1 (per your choice). Hero uses still image with subtle parallax + gold framing arc.

### 5. SEO & infra

- Per-route `head()` with unique title/description/og tags (no `og:image` on root).
- Server route `/sitemap.xml` listing all public routes + dynamic chapter/event/news slugs from DB.
- `public/robots.txt` with `Allow: /` (no Sitemap line until domain is set).
- JSON-LD Organization on root, Article on news detail, Event on event detail.
- Semantic HTML, single H1 per route, alt text on every image, `lang="en"`, `h-dvh` for full-height blocks, 44px tap targets, focus-visible rings, reduced-motion respected.

### 6. Out of scope for this build (called out so it's explicit)

Multilingual UI (architecture ready: `locale` columns + `useLocale` hook stub, but only English content), full media library UI, SEO admin panel, analytics dashboard, redirects manager, member portal, LMS, digital cards, donations, job board, mobile app. The data model and route structure are designed to accept these without restructuring.

### 7. Build order

1. Enable Lovable Cloud + run migration + create storage bucket.
2. Design system (tokens, fonts, primitives, header, footer).
3. Generate hero + key imagery in parallel.
4. Homepage end-to-end (hero → mission → stats → map → chapters → initiatives → testimonials → newsletter).
5. Remaining public routes with seeded content.
6. Auth + admin shell + 5 CRUD screens.
7. Sitemap, JSON-LD, accessibility sweep, mobile QA at 390px.
