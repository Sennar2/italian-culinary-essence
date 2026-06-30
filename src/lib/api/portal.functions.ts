/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function loadMemberAndAccess(sb: any, userId: string) {
  const { data: member } = await sb
    .from("members")
    .select("id, status, tier_id, full_name, email, membership_tiers(name, slug, billing_frequency, access_level)")
    .eq("user_id", userId)
    .maybeSingle();
  return { sb, member };
}

/** Filter a list of content rows based on a content_access table allowlist. */
async function filterByAccess<T extends { id: string }>(
  sb: any, items: T[], contentType: string, tierId: string | null,
): Promise<T[]> {
  if (items.length === 0) return [];
  const ids = items.map((i) => i.id);
  const { data: rules } = await sb.from("content_access").select("content_id, tier_id").eq("content_type", contentType).in("content_id", ids);
  const restricted = new Set<string>((rules ?? []).map((r: any) => r.content_id as string));
  const allowedFor = new Map<string, Set<string>>();
  for (const r of rules ?? []) {
    const set = allowedFor.get(r.content_id as string) ?? new Set<string>();
    set.add(r.tier_id as string);
    allowedFor.set(r.content_id as string, set);
  }
  return items.filter((i) => {
    if (!restricted.has(i.id)) return true;
    return tierId ? allowedFor.get(i.id)!.has(tierId) : false;
  });
}

export const myDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    if (!member) return { member: null };
    const tierId = (member.tier_id as string | null) ?? null;
    const [{ data: news }, { data: pods }, { data: events }, { data: mods }, { data: certs }] = await Promise.all([
      sb.from("news").select("id,title,slug,excerpt,cover,published_at").eq("published", true).order("published_at", { ascending: false }).limit(10),
      sb.from("podcast_episodes").select("id,title,slug,cover_url,publish_date").eq("published", true).order("publish_date", { ascending: false }).limit(10),
      sb.from("events").select("id,title,slug,starts_at,city,country").eq("published", true).gte("starts_at", new Date().toISOString()).order("starts_at").limit(6),
      sb.from("academy_modules").select("id,title,slug,category,duration_minutes,cover_url").eq("published", true).order("sort_order").limit(8),
      sb.from("certificates").select("id,module_id,issued_at,certificate_number,academy_modules(title)").eq("member_id", member.id),
    ]);
    const [fNews, fPods, fEvents, fMods] = await Promise.all([
      filterByAccess(sb, news ?? [], "news", tierId),
      filterByAccess(sb, pods ?? [], "podcast", tierId),
      filterByAccess(sb, events ?? [], "event", tierId),
      filterByAccess(sb, mods ?? [], "module", tierId),
    ]);
    return {
      member,
      news: fNews.slice(0, 3),
      podcasts: fPods.slice(0, 3),
      events: fEvents.slice(0, 4),
      modules: fMods.slice(0, 4),
      certificates: certs ?? [],
    };
  });

export const myAcademy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: mods } = await sb.from("academy_modules").select("*").eq("published", true).order("sort_order");
    const filtered = await filterByAccess(sb, mods ?? [], "module", tierId);
    // Attach progress
    let progress: any[] = [];
    if (member) {
      const { data } = await sb.from("member_course_progress").select("module_id,status").eq("member_id", member.id);
      progress = data ?? [];
    }
    return { member, modules: filtered, progress };
  });

export const myModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: mod } = await sb.from("academy_modules").select("*").eq("slug", data.slug).maybeSingle();
    if (!mod) throw new Error("Module not found");
    // Access check
    const filtered = await filterByAccess(sb, [mod], "module", tierId);
    if (filtered.length === 0) throw new Error("This module is not available on your current tier.");
    const { data: lessons } = await sb.from("academy_lessons").select("*").eq("module_id", mod.id).order("sort_order");
    let progress: any[] = [];
    if (member) {
      const { data: p } = await sb.from("member_course_progress").select("lesson_id,status,score,completed_at,scorm_suspend_data")
        .eq("member_id", member.id).eq("module_id", mod.id);
      progress = p ?? [];
    }
    return { member, module: mod, lessons: lessons ?? [], progress };
  });

export const myMagazine = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: issues } = await sb.from("magazine_issues").select("*").eq("published", true).order("issue_date", { ascending: false });
    const filtered = await filterByAccess(sb, issues ?? [], "magazine_issue", tierId);
    return { member, issues: filtered };
  });

export const myIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: issue } = await sb.from("magazine_issues").select("*").eq("slug", data.slug).maybeSingle();
    if (!issue) throw new Error("Not found");
    const filtered = await filterByAccess(sb, [issue], "magazine_issue", tierId);
    if (filtered.length === 0) throw new Error("This issue is not available on your current tier.");
    const { data: articles } = await sb.from("magazine_articles").select("*").eq("issue_id", issue.id).eq("published", true).order("sort_order");
    return { member, issue, articles: articles ?? [] };
  });

export const myPodcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: eps } = await sb.from("podcast_episodes").select("*").eq("published", true).order("publish_date", { ascending: false });
    const filtered = await filterByAccess(sb, eps ?? [], "podcast", tierId);
    return { member, episodes: filtered };
  });

export const myNews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: rows } = await sb.from("news").select("*").eq("published", true).order("published_at", { ascending: false });
    const filtered = await filterByAccess(sb, rows ?? [], "news", tierId);
    return { member, news: filtered };
  });

export const myEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { member } = await loadMemberAndAccess(sb, context.userId);
    const tierId = (member?.tier_id as string | null) ?? null;
    const { data: rows } = await sb.from("events").select("*").eq("published", true).order("starts_at");
    const filtered = await filterByAccess(sb, rows ?? [], "event", tierId);
    return { member, events: filtered };
  });