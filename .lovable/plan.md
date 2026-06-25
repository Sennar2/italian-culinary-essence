
# ICC Full Membership Platform — Build Plan

Build everything in one pass: public website upgrades, member portal, full academy with SCORM runtime, magazine, podcasts, and a vastly expanded admin CMS. Visual style stays as-is (cream/forest/gold, serif headings, tricolore accents).

---

## 1. Database (one migration)

**New tables** (all in `public`, all with GRANTs + RLS):

- `membership_tiers` — name, slug, price_cents, currency, billing_frequency (`monthly|yearly|one_off|on_enquiry`), description, benefits (text[]), access_level, payment_link, cta_label, featured, active, sort_order
- `members` — `user_id` (FK auth.users, unique), full_name, email, phone, country, city, profession, company, tier_id, status (`pending|active|suspended|expired`), join_date, renewal_date, payment_status, payment_reference, internal_notes
- `magazine_issues` — title, slug, cover_url, issue_date, summary, public_preview, published, sort_order
- `magazine_articles` — issue_id, title, slug, author, body, cover_url, sort_order, published
- `podcast_episodes` — title, slug, episode_number, description, audio_url, cover_url, spotify_url, apple_url, youtube_url, category, publish_date, visibility (`public|members|tier`), published
- `academy_modules` — title, slug, category, description, cover_url, duration_minutes, certificate_eligible, passing_score, published, sort_order  *(separate from existing `academy_items` which becomes the public showcase)*
- `academy_lessons` — module_id, title, sort_order, kind (`video|pdf|scorm|text`), video_url, pdf_url, scorm_package_path, scorm_launch_url, body
- `member_course_progress` — member_id, module_id, lesson_id, status, score, scorm_suspend_data, completed_at
- `certificates` — member_id, module_id, issued_at, certificate_number, pdf_url (nullable placeholder)
- `content_access` — generic gating: `content_type` (`module|news|magazine_issue|podcast|event|article`), `content_id`, `tier_id`. No rows for a content_id = all active members; rows = restricted to those tiers.

**Existing tables extended:**
- `news` add `visibility`
- `events` add `visibility`, `booking_url`, `sponsors text[]`
- `app_role` enum adds `'member'`

**Storage buckets** (via tool):
- `media` already exists (public)
- `scorm` (private) — unzipped SCORM packages
- `magazine` (private) — magazine assets
- `certificates` (private) — future PDFs

**RLS pattern:**
- Admin (`has_role(uid,'admin')`) → full access on every table.
- Self-scoped (`members`, `member_course_progress`, `certificates`) → `auth.uid()` only.
- Public reads (`membership_tiers` active, public news/magazine/podcasts) → narrow `TO anon, authenticated` SELECT.
- Tier-gated content fetched via server fns that join `content_access` + member tier, never raw client.

---

## 2. Auth & roles

- Public signup at `/auth` creates an `auth.users` row + matching `members` row with `status='pending'` via `handle_new_member()` trigger.
- `user_roles`: `admin`, `member`. Admin assigns `member` when activating.
- Two protected subtrees:
  - `_authenticated/admin/*` — admin only (existing)
  - `_authenticated/portal/*` — any signed-in user; pages show a "Pending activation" CTA if `status≠active`

---

## 3. Public website additions

- `/membership` rebuilt from `membership_tiers`. Each card: price, frequency, benefits, "Join now" → `payment_link` in new tab when present, else `/auth?intent=join&tier=<slug>`.
- New `/podcasts` + `/magazine` public routes (preview only for gated items, "Members only" overlay otherwise).
- News/events extended with visibility chips.
- Hero/banner/gallery/footer/nav remain admin-editable as today.

---

## 4. Member Portal (`/portal`)

Routes under `_authenticated/portal/`:

- `index.tsx` — Dashboard: welcome, tier badge, renewal, latest 3 podcasts/news, upcoming events, course progress, quick links.
- `membership.tsx` — status, tier, benefits, renewal/payment link.
- `academy.tsx` + `academy.$slug.tsx` — modules the member's tier can access; module page = lesson list, progress bar, player area, Mark Complete.
- `news.tsx`, `magazine.tsx`, `magazine.$slug.tsx`, `podcasts.tsx`, `events.tsx`, `profile.tsx`.

All reads go through `portal.functions.ts` server fns guarded by `requireSupabaseAuth` + a `requireActiveMember()` helper enforcing `content_access`.

---

## 5. Academy + SCORM runtime

- **Upload**: admin uploads SCORM `.zip` in the lesson editor (≤ 50MB). Server fn `uploadScormPackage` (admin only) stores to the `scorm` bucket, unzips server-side with `fflate` (pure-JS, Worker-safe) into `scorm/<module>/<lesson>/`, detects `index.html` / `imsmanifest.xml` launch path, saves the relative path.
- **Launch URL alternative**: paste an external launch URL instead.
- **Player**: `<iframe>` to a signed URL for `index.html`. The iframe includes a small `scorm-api.html` wrapper that exposes `window.API` (SCORM 1.2) + `window.API_1484_11` (2004 core verbs) and forwards `LMSSetValue`/`Commit`/`LMSFinish` to the parent via `postMessage`. Parent batches and calls `saveScormProgress` server fn → writes `member_course_progress` (status, score, suspend_data).
- **Completion + certificate**: when all certificate-eligible lessons in a module are complete, `issueCertificateIfEligible` inserts a `certificates` row with a generated number. PDF generation deferred (`pdf_url` null; portal shows "Certificate issued — PDF coming soon").
- Scope: SCORM 1.2 core verbs (`cmi.core.lesson_status`, `cmi.core.score.raw`, `cmi.suspend_data`); 2004 sequencing not implemented. Single-SCO packages assumed.

---

## 6. Admin CMS expansion

New routes under `_authenticated/admin/`:

- `members.tsx` + `members.$id.tsx` — list/edit, change tier, status, notes, view progress + certificates, "Send reset link" via `supabaseAdmin.auth.admin.generateLink`.
- `tiers.tsx` — `CrudShell`.
- `access.tsx` — matrix UI (rows = content items, cols = tiers; checkboxes write `content_access`).
- `academy-modules.tsx` + `academy-modules.$id.tsx` — module + nested lessons editor with SCORM uploader.
- `magazine.tsx` + `magazine.$id.tsx` — issues + articles.
- `podcasts.tsx` — CRUD with audio URL/upload + platform links + visibility.
- `events.tsx` — extend existing with visibility, booking_url, sponsors.

Sidebar regrouped: **Overview / Members / Content (News, Magazine, Podcasts, Events) / Academy (Modules, Certificates) / Access Control / Website / System**.

---

## 7. Server functions

New `src/lib/api/` modules (all client-safe; `client.server` imported only inside handlers):

- `members.functions.ts` — `getMyMember`, `updateMyProfile`, admin `listMembers`, `saveMember`, `setMemberTier`, `setMemberStatus`, `sendMemberResetLink`
- `tiers.functions.ts` — admin CRUD + public `listActiveTiers`
- `portal.functions.ts` — `myDashboard`, `myAcademy`, `myModule(slug)`, `myMagazine`, `myPodcasts`, `myNews`, `myEvents`
- `academy-admin.functions.ts` — module/lesson CRUD, `uploadScormPackage`, signed URL minting
- `scorm.functions.ts` — `getScormLaunchUrl`, `saveScormProgress`, `markLessonComplete`, `issueCertificateIfEligible`
- `magazine.functions.ts`, `podcasts.functions.ts` — admin CRUD + public lists
- `access.functions.ts` — admin matrix read/write

---

## 8. Build order

1. Migration (tables + GRANTs + RLS + role enum + `handle_new_member` trigger) and storage buckets.
2. Auth flow update (signup → pending member; `/auth?intent=join` carries tier).
3. Public `/membership`, `/podcasts`, `/magazine` rewires.
4. Member portal shell + dashboard + membership + profile.
5. Academy module + lesson editor in admin.
6. SCORM upload + unzip + iframe runtime + progress save.
7. Magazine + podcasts admin + portal views.
8. Members admin (list, edit, tier change, reset link).
9. Access-control matrix.
10. Mobile QA at 390px + admin desktop pass.

---

## 9. Out of scope (deferred, called out so nothing is hidden)

- Real Stripe/PayPal checkout — `payment_link` is an external URL pasted in admin.
- Generated certificate PDFs — record created, PDF not rendered.
- SCORM 2004 sequencing, multi-SCO packages.
- Email delivery beyond Supabase auth/reset emails.
- i18n.

## 10. Risks

- SCORM packages vary. The runtime targets standard Articulate/iSpring/Captivate SCORM 1.2 exports; exotic packages may need per-vendor tweaks.
- Worker CPU/time limits → SCORM upload capped at 50MB; documented in the uploader.
- Very large surface area — plan on 1–2 polish turns after initial build.
