## Goal

Make the entire ICC public website editable from the admin portal. Replace all hardcoded copy, images, contact details, nav, footer, and map data with admin-managed content. Keep the existing visual design (cream/forest/gold, serif type, tricolore accents) untouched.

## 1. Storage + database

**New storage bucket**: `media` (public read, admin-only write). Used for every uploaded image (hero, banner, gallery, featured, chapter covers, partner logos, leadership portraits, news/event covers, academy covers).

**Schema migration** — new tables (all with admin-only write policies, public-read where the public site reads them):

- `gallery_images` — title, caption, image_url, sort_order, featured, published
- `nav_links` — label, url, sort_order, active, external, location ('header' | 'footer_quick' | 'footer_programme' | 'footer_legal'), social_platform (for footer socials)
- `banners` — title, subtitle, event_date (timestamptz), location, cta_label, cta_url, image_url, enabled, sort_order (supports future multi-banner; v1 renders the first enabled)
- `featured_images` — page_key (unique: home, about, academy, events, membership, news, partners, leadership, chapters, contact), image_url, alt
- `page_content` — page_key + section_key composite unique, title, subtitle, body, image_url (extensible per-page strings)

**Extend `site_settings`** keys (already a flexible key/value table):
- `hero_eyebrow`, `hero_title`, `hero_subtitle`, `hero_image`, `hero_background_image`
- `hero_cta_primary_label`, `hero_cta_primary_url`, `hero_cta_secondary_label`, `hero_cta_secondary_url`
- `footer_description`, `footer_copyright`, `contact_address`, `contact_phone`, `contact_email`, `press_email`
- `instagram_url`, `linkedin_url`, `youtube_url`, `facebook_url`, `x_url`
- `credit_label` = "Website designed & developed by Honeysuckles Design", `credit_url` = "https://honeysucklesdesign.uk"

**Seed defaults** (migration, not fake data):
- `hero_title` = "Italian Culinary Consortium", `hero_subtitle` = "Celebrating Italian Excellence Worldwide"
- `footer_description` = same tagline
- `footer_copyright` = "© {year} Italian Culinary Consortium"
- Clear the placeholder Rome address and `+39 06 1234 567` from any seeded rows
- `featured_images` rows for all 10 page keys with NULL image_url (fallback art used until admin uploads)

**Chapters** — table already exists with city/country/lat/lng/president/hero_image. Add columns: `address` (text, nullable), `contact_email`, `active` (boolean, default true). Public map filters `active = true`.

## 2. Admin portal — "Website Settings" hub

New route `/admin/website` with a tabbed shell. Each tab is its own sub-route so deep links work:

```
/admin/website/hero        — Hero copy, CTAs, hero image, background image (with ImageUploader)
/admin/website/banner      — Banner list + edit (enable toggle, image optional)
/admin/website/gallery     — Drag-to-reorder grid, upload, caption, featured toggle, delete
/admin/website/featured    — One row per page_key with ImageUploader + alt text
/admin/website/chapters    — Existing chapters CRUD extended with address/contact_email/active
/admin/website/nav         — Header + footer link groups, reorderable
/admin/website/footer      — Footer description, copyright, social URLs, contact block
/admin/website/contact     — Contact + press emails, head office address, phone
```

Existing `/admin/{chapters,leadership,events,news,initiatives,academy,partners,testimonials,settings,enquiries}` stay; the sidebar gets a new "Website" group linking to the eight tabs above. The standalone `/admin/settings` remains as the raw key/value editor for power users.

**New reusable components**:
- `ImageUploader` — drag/drop or click, uploads to `media` bucket via a server fn that calls `supabaseAdmin.storage`, returns public URL, supports clear/remove.
- `SortableList` — lightweight up/down arrows (no extra dep) to set `sort_order` on gallery, nav, banners.

## 3. Public site rewiring

Replace every hardcoded string/image used by the public site with admin data. New `public-content.functions.ts` reads expand to include: `getHero`, `getBanner`, `getGallery`, `getFeaturedImage(pageKey)`, `getNavLinks(location)`, `getFooterContent`, `getActiveChapters`. All are unauthenticated server fns using the publishable server client + narrow `TO anon` SELECT policies.

Routes updated:
- `src/routes/index.tsx` — hero pulls from settings + uploaded images (fallbacks: existing `hero-pasta.jpg` + cream wash). Banner renders above-the-fold if enabled. Gallery section added to homepage.
- `src/components/site/SiteHeader.tsx` — nav from `nav_links` where location='header' and active=true, ordered by sort_order. Fallback = current static array.
- `src/components/site/SiteFooter.tsx` — description, link columns, socials, contact block, copyright, Honeysuckles credit all from admin. Removes the hardcoded `Via di Villa Emiliani, Roma` / `+39 06 1234 567` lines.
- `src/components/site/WorldMap.tsx` — accepts active chapters only; the page already passes chapters in.
- `src/routes/{about,academy,events,membership,news,partners}.tsx` — header art reads `featured_images` by page_key, falls back to existing imported asset.
- New `/gallery` route + homepage gallery teaser.

## 4. Fallback policy

When admin content is missing: render the existing static copy/imagery already in the repo (hero title, page eyebrows, current page heroes). Never invent statistics, locations, phone numbers, testimonials, or addresses. Empty contact field → hide that line entirely. Empty banner → render nothing. Empty gallery → hide section.

## 5. Out of scope (v1)

- Rich text editor (textareas with markdown only)
- Image cropping / multi-size variants
- Scheduled publishing
- Drag-and-drop reorder (use up/down buttons)
- i18n / multi-language
- Per-article featured images for news/events beyond the existing `cover` field already in those tables

## 6. Build order

1. Migration: new tables, chapter columns, site_settings seed cleanup, `media` bucket + RLS.
2. `ImageUploader` + storage upload server fn.
3. `/admin/website/*` tabs, sidebar grouping.
4. Public reads (`public-content.functions.ts` additions) + rewire `SiteHeader`, `SiteFooter`, `index.tsx` hero/banner/gallery, page featured images, WorldMap active filter.
5. New `/gallery` route.
6. Mobile QA at 390px, verify fallbacks when DB rows are empty.

## Technical notes

- All admin mutations: `createServerFn` + `requireSupabaseAuth` + `has_role(uid,'admin')` guard, same pattern as existing `admin-content.functions.ts`.
- Image uploads: server fn accepts base64 + filename, writes via `supabaseAdmin.storage.from('media').upload(...)`, returns public URL stored as plain text in the consuming row.
- Public reads: server publishable client (anon key, no session) — not `supabaseAdmin` — to avoid the `Expected 3 parts in JWT` Data API failure.
- Nav/footer link tables share a single `nav_links` table discriminated by `location` to keep the admin UI uniform.
- `featured_images.page_key` is unique → upsert pattern in the admin form.
