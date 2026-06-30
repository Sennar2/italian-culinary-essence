/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function requireAdminRole(sb: any, userId: string) {
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}

async function guard(sb: any, userId: string) {
  if (!(await requireAdminRole(sb, userId))) throw new Error("Forbidden");
}

// ---------- Generic CRUD factory ----------
type Table =
  | "leadership" | "events" | "news" | "initiatives"
  | "partners" | "academy_items" | "testimonials";

function buildList(table: Table, orderBy: string, ascending = true) {
  return createServerFn({ method: "GET" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
      const sb = context.supabase;
      await guard(sb, context.userId);
      const { data, error } = await (sb as any).from(table).select("*").order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []) as any[];
    });
}

function buildSave(table: Table, schema: z.ZodType<Record<string, unknown> & { id?: string }>) {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: unknown) => schema.parse(d))
    .handler(async ({ data, context }) => {
      const sb = context.supabase;
      await guard(sb, context.userId);
      const payload = { ...(data as Record<string, unknown>) };
      const id = payload.id as string | undefined;
      delete payload.id;
      const tbl = (sb as any).from(table);
      if (id) {
        const { error } = await tbl.update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await tbl.insert(payload);
        if (error) throw error;
      }
      return { ok: true };
    });
}

function buildDelete(table: Table) {
  return createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
    .handler(async ({ data, context }) => {
      const sb = context.supabase;
      await guard(sb, context.userId);
      const { error } = await (sb as any).from(table).delete().eq("id", data.id);
      if (error) throw error;
      return { ok: true };
    });
}

const nstr = z.string().nullable().optional();
const num = z.number().nullable().optional();
const bool = z.boolean().optional();
const int = z.number().int().optional();
const idOpt = z.string().uuid().optional();

// ---------- Schemas ----------
const leadershipSchema = z.object({
  id: idOpt, slug: z.string().min(1), name: z.string().min(1), role: z.string().min(1),
  region: nstr, country: nstr, bio: nstr, portrait: nstr, sort_order: int, published: bool,
});
const eventsSchema = z.object({
  id: idOpt, slug: z.string().min(1), title: z.string().min(1),
  excerpt: nstr, body: nstr, cover: nstr, city: nstr, country: nstr,
  starts_at: nstr, ends_at: nstr, registration_url: nstr,
  status: z.string().optional(), featured: bool, published: bool,
});
const newsSchema = z.object({
  id: idOpt, slug: z.string().min(1), title: z.string().min(1),
  excerpt: nstr, body: nstr, cover: nstr, category: nstr, author: nstr,
  published_at: nstr, featured: bool, published: bool,
});
const initiativesSchema = z.object({
  id: idOpt, slug: z.string().min(1), title: z.string().min(1), category: z.string().min(1),
  summary: nstr, body: nstr, cover: nstr, sort_order: int, published: bool,
});
const partnersSchema = z.object({
  id: idOpt, name: z.string().min(1), logo_url: nstr, url: nstr, tier: nstr,
  sort_order: int, published: bool,
});
const academySchema = z.object({
  id: idOpt, slug: z.string().min(1), title: z.string().min(1), item_type: z.string().min(1),
  summary: nstr, body: nstr, cover: nstr, cta_url: nstr, sort_order: int, published: bool,
});
const testimonialsSchema = z.object({
  id: idOpt, quote: z.string().min(1), name: z.string().min(1),
  role: nstr, country: nstr, portrait: nstr, video_url: nstr, sort_order: int, published: bool,
});

// ---------- Exports ----------
export const adminListLeadership = buildList("leadership", "sort_order");
export const adminSaveLeadership = buildSave("leadership", leadershipSchema);
export const adminDeleteLeadership = buildDelete("leadership");

export const adminListEvents = buildList("events", "starts_at", false);
export const adminSaveEvents = buildSave("events", eventsSchema);
export const adminDeleteEvents = buildDelete("events");

export const adminListNews = buildList("news", "published_at", false);
export const adminSaveNews = buildSave("news", newsSchema);
export const adminDeleteNews = buildDelete("news");

export const adminListInitiatives = buildList("initiatives", "sort_order");
export const adminSaveInitiatives = buildSave("initiatives", initiativesSchema);
export const adminDeleteInitiatives = buildDelete("initiatives");

export const adminListPartners = buildList("partners", "sort_order");
export const adminSavePartners = buildSave("partners", partnersSchema);
export const adminDeletePartners = buildDelete("partners");

export const adminListAcademy = buildList("academy_items", "sort_order");
export const adminSaveAcademy = buildSave("academy_items", academySchema);
export const adminDeleteAcademy = buildDelete("academy_items");

export const adminListTestimonials = buildList("testimonials", "sort_order");
export const adminSaveTestimonials = buildSave("testimonials", testimonialsSchema);
export const adminDeleteTestimonials = buildDelete("testimonials");

// ---------- Dashboard stats ----------
export const adminDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const head = { count: "exact" as const, head: true };
    const nowIso = new Date().toISOString();
    const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const [ch, ld, ev, nw, ini, pt, ac, ts, nl, cm, me, recentContact, recentMember] = await Promise.all([
      sb.from("chapters").select("*", head),
      sb.from("leadership").select("*", head),
      sb.from("events").select("*", head).gte("starts_at", nowIso),
      sb.from("news").select("*", head).eq("published", true),
      sb.from("initiatives").select("*", head),
      sb.from("partners").select("*", head),
      sb.from("academy_items").select("*", head),
      sb.from("testimonials").select("*", head),
      sb.from("newsletter_subs").select("*", head),
      sb.from("contact_messages").select("*", head).gte("created_at", monthAgo),
      sb.from("membership_enquiries").select("*", head).gte("created_at", monthAgo),
      sb.from("contact_messages").select("id,name,email,created_at,message").order("created_at", { ascending: false }).limit(3),
      sb.from("membership_enquiries").select("id,name,email,created_at,tier,country").order("created_at", { ascending: false }).limit(3),
    ]);
    return {
      counts: {
        chapters: ch.count ?? 0, leadership: ld.count ?? 0, upcoming_events: ev.count ?? 0,
        news: nw.count ?? 0, initiatives: ini.count ?? 0, partners: pt.count ?? 0,
        academy: ac.count ?? 0, testimonials: ts.count ?? 0, newsletter: nl.count ?? 0,
        contact_30d: cm.count ?? 0, membership_30d: me.count ?? 0,
      },
      recentContact: recentContact.data ?? [],
      recentMember: recentMember.data ?? [],
    };
  });

// ---------- Site settings (singleton row id=1) ----------
export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { data, error } = await sb.from("site_settings").select("data").eq("id", 1).maybeSingle();
    if (error) throw error;
    return (data?.data ?? {}) as any;
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { data: Record<string, unknown> }) => z.object({ data: z.record(z.string(), z.unknown()) }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { error } = await sb.from("site_settings").upsert({ id: 1, data: data.data as any });
    if (error) throw error;
    return { ok: true };
  });