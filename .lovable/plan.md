
## 1. Real logo everywhere

- Download the SVG you linked and upload it as a Lovable Asset (`src/assets/icc-logo.svg.asset.json`).
- Rewrite `src/components/site/Logo.tsx` to render that asset as an `<img>`, with `variant="dark"|"light"` controlling a CSS filter (light = invert/brighten) so it works on cream and on forest green.
- Replace every fake "ICC" mark in: `SiteHeader`, `SiteFooter`, Hero badge (homepage), Admin sidebar (`admin.tsx`), Portal sidebar, mobile menu. No more SVG circles with "ICC" text.

## 2. Header redesign

Rewrite `src/components/site/SiteHeader.tsx`:

- Single row, fixed height (72px desktop / 64px mobile), `grid-cols-[auto_1fr_auto]`, logo left, nav centered, CTA right, all `items-center`.
- Logo container `shrink-0`, max-height 48px, never cropped.
- Desktop primary nav = max 4 links + a **More** dropdown (Radix `DropdownMenu`).
- Move utility row (EN / search / socials) into the More dropdown footer instead of a separate top bar — eliminates the second row that's pushing things around and causing overflow.
- `Become a Member` CTA stays right; on screens < `lg` it collapses into the mobile sheet.
- Mobile: logo left, hamburger right, full Sheet menu with every link + CTA + socials.
- Add `overflow-x-hidden` to `<body>` via `styles.css` to kill page-level sideways scroll.

## 3. Admin-controlled nav

Extend `nav_links` table with two booleans: `in_more_menu` (default false) and `is_cta` (default false). Migration adds the columns.

Update `admin.website.nav.tsx` CrudShell fields to expose:
- Label, URL, Location (header / footer_*), Sort order, Active, External, **Show in More menu**, **Render as CTA button**.

Header reads `nav_links` where `location='header' AND active`, splits into:
- CTA (if `is_cta`)
- More-menu items (`in_more_menu`)
- Primary nav (the rest, capped to first 4 by sort_order, overflow auto-pushed into More).

Seed migration sets the 4 primary (About, Academy, Events, Membership) and the 7 More items you listed.

## 4. Contact details from admin only

- `SiteFooter` and `src/routes/contact.tsx` already read `site_settings` — audit every hardcoded fallback (Rome address, +39 number, info@/press@ examples) and **remove them**. Render each field only when present (`{settings.contact_email && …}`); no placeholder text.
- Ensure `admin.website.contact.tsx` writes to the same keys: `contact_email`, `press_email`, `contact_phone`, `contact_address`, `head_office`, plus social URLs already in `admin.settings`.
- Contact form: send to `settings.contact_email` (server fn); falls back to silently storing in `contact_messages` if no email set.
- Footer social icons sourced from `nav_links` (location `footer_social`) OR `site_settings.*_url`, hide if both empty.

## 6 + 7. Real interactive map (Leaflet)

- `bun add leaflet react-leaflet @types/leaflet`. Tailwind v4: `@import "leaflet/dist/leaflet.css";` at top of `src/styles.css`.
- New `src/components/site/ChaptersMap.tsx`: client-only `<MapContainer>` (loaded via `ClientOnly` wrapper to avoid SSR `window` errors) with OSM tiles, custom gold/forest marker (CSS-styled `divIcon`, no broken default-marker images), `Popup` showing chapter name, city, country, lead, email.
- Source data via existing `getChapters` server fn, filtered to `published=true AND lat IS NOT NULL`.
- Empty state: centered "Chapters coming soon" card on a muted forest tile background.
- Homepage section rewritten: eyebrow "Global Network", H2 "ICC Around the World", subtitle as specified, the live map, then CTA button "Explore Chapters" → `/chapters`.
- `/chapters` page uses the same `ChaptersMap` at the top, list/grid below.
- Delete the dotted decorative `WorldMap.tsx` from public usage (keep file or delete — I'll delete).

## 8. Admin Chapters

`admin.chapters.tsx` already exists. Audit and ensure CrudShell fields include: name, slug, city, country, address, lat, lng, email, lead/president, hero_image (ImageUploader), published toggle. Add any missing fields. No schema change needed — `chapters` table has all columns.

## 9. Layout / overflow fixes

- Global: `html, body { overflow-x: hidden; max-width: 100vw; }` in `styles.css`.
- Audit `.container-icc`, hero, world map section, chapters grid, footer for any element wider than `100vw` (the current header utility bar + 11 nav links is the main culprit — fixed by §2).
- Add `min-w-0` to flex children that hold text in header/footer; `shrink-0` on logo and CTA.

## Technical notes (for the agent)

- DB migration: `ALTER TABLE nav_links ADD COLUMN in_more_menu boolean NOT NULL DEFAULT false, ADD COLUMN is_cta boolean NOT NULL DEFAULT false;` + seed the 11 header rows (delete existing header rows first, reinsert clean set).
- Leaflet must be dynamically imported / wrapped in a `ClientOnly` because the package touches `window` at import time. Use `lazy()` + `<Suspense>` or a small `if (typeof window === 'undefined') return null` wrapper component.
- Logo asset: `curl` the SVG URL → `lovable-assets create --file /tmp/icc-logo.svg --filename icc-logo.svg > src/assets/icc-logo.svg.asset.json`.
- Brand palette, typography and tricolore details remain untouched.

## Out of scope

- No new pages, no copy rewrites beyond the homepage map section, no leadership/news/events changes.
