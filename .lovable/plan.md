# Admin Dashboard — Expansion Plan

Today the admin only has Chapters CRUD + an Enquiries inbox. This plan turns `/admin` into a complete content management surface for the whole public site.

## 1. Dashboard home (`/admin`)
Replace the two-card placeholder with a real overview:
- Stat tiles: # chapters, # leadership, # upcoming events, # published news, # initiatives, # partners, # new enquiries (last 30 days), # newsletter subs.
- "Recent enquiries" panel (latest 5 across membership + contact, with type badge and timestamp).
- "Quick actions": New chapter / New news / New event / New leader.
- All numbers come from one new server fn `adminDashboardStats` (admin-gated).

## 2. New CRUD sections
Each follows the same pattern already used by `admin.chapters.tsx`: list table → side drawer/modal form → zod-validated server fn → toast + invalidate. Published/unpublished toggle + sort order on every entity.

| Route | Entity | Notable fields |
|---|---|---|
| `/admin/leadership` | `leadership` | name, role, chapter, bio, photo, sort_order, published |
| `/admin/events` | `events` | title, slug, starts_at, ends_at, city, country, chapter_id, cover, summary, body, registration_url, featured, published |
| `/admin/news` | `news` | title, slug, excerpt, body (textarea), cover, author, published_at, tags, featured, published |
| `/admin/initiatives` | `initiatives` | title, slug, summary, body, cover, sort_order, published |
| `/admin/partners` | `partners` | name, tier (enum), logo, website, sort_order, published |
| `/admin/academy` | `academy_items` | title, kind, cover, summary, url, sort_order, published |
| `/admin/testimonials` | `testimonials` | quote, author, role, location, photo, sort_order, published |
| `/admin/settings` | `site_settings` | key/value editor for global strings (hero copy, contact email, social links) |

The existing `/admin/enquiries` stays; add CSV export buttons per inbox and a "mark read" flag (new column).

## 3. Media uploads
Create a public `media` storage bucket (admin-only writes via service role). Add a reusable `<ImageUploader>` component used in every form (cover, photo, logo). Stores public URL on the row.

## 4. Admin shell upgrades
- Sidebar: grouped sections (Content / People / Inbox / Settings), collapsible on mobile (shadcn sidebar).
- Header: breadcrumb + current user email + sign out.
- Mobile: sidebar becomes a sheet.
- Empty states + skeleton loaders on every list.
- Toast feedback consistent (sonner).
- Confirm dialog for deletes (shadcn AlertDialog).

## 5. Server functions (technical)
New file `src/lib/api/admin-content.functions.ts` exposing per-entity:
`adminList<X>`, `adminSave<X>` (insert or update by id), `adminDelete<X>`, `adminTogglePublished<X>`. All use `requireSupabaseAuth` + `has_role('admin')` guard. Service-role client loaded inside handlers only.

New `adminDashboardStats` and `adminMarkEnquiryRead` server fns.

## 6. Migration
One migration:
- Add `read_at timestamptz` to `contact_messages` and `membership_enquiries`.
- Create `media` storage bucket (public read, admin write policy via `has_role`).
- No other schema changes — tables already exist.

## 7. Out of scope (kept for later)
Rich text editor (use plain textarea + markdown for now), audit log, role management UI, image cropping, scheduled publishing, bulk import, analytics charts.

## Build order
1. Migration + media bucket.
2. Sidebar shell + dashboard stats page.
3. Reusable `<AdminTable>`, `<AdminForm>`, `<ImageUploader>`, `<ConfirmDelete>` primitives.
4. CRUD routes in this order: leadership → news → events → initiatives → partners → academy → testimonials → settings.
5. Enquiries: read flag + CSV export.
6. Mobile QA at 390px.
