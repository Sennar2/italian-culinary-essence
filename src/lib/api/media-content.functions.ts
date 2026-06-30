/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

async function guard(sb: any, userId: string) {
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}
function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/* ====================== MAGAZINE ISSUES ====================== */
const issueSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  cover_url: z.string().max(1500).nullable().optional(),
  issue_date: z.string().nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  public_preview: z.boolean().optional(),
  published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const listPublicIssues = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("magazine_issues").select("id,title,slug,cover_url,issue_date,summary,public_preview")
    .eq("published", true).order("issue_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
});

export const adminListIssues = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { data, error } = await sb.from("magazine_issues").select("*").order("issue_date", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => issueSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const payload: any = { ...data }; const id = payload.id; delete payload.id;
    const { error } = id ? await sb.from("magazine_issues").update(payload).eq("id", id) : await sb.from("magazine_issues").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { error } = await sb.from("magazine_issues").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ====================== MAGAZINE ARTICLES ====================== */
const articleSchema = z.object({
  id: z.string().uuid().optional(),
  issue_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  author: z.string().max(160).nullable().optional(),
  body: z.string().max(50000).nullable().optional(),
  cover_url: z.string().max(1500).nullable().optional(),
  sort_order: z.number().int().optional(),
  published: z.boolean().optional(),
});

export const adminListArticles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { issue_id: string }) => z.object({ issue_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { data: rows } = await sb.from("magazine_articles").select("*").eq("issue_id", data.issue_id).order("sort_order");
    return rows ?? [];
  });

export const adminSaveArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => articleSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const payload: any = { ...data }; const id = payload.id; delete payload.id;
    const { error } = id ? await sb.from("magazine_articles").update(payload).eq("id", id) : await sb.from("magazine_articles").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { error } = await sb.from("magazine_articles").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ====================== PODCASTS ====================== */
const podSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  episode_number: z.number().int().nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  audio_url: z.string().max(1500).nullable().optional(),
  cover_url: z.string().max(1500).nullable().optional(),
  spotify_url: z.string().max(800).nullable().optional(),
  apple_url: z.string().max(800).nullable().optional(),
  youtube_url: z.string().max(800).nullable().optional(),
  category: z.string().max(80).nullable().optional(),
  publish_date: z.string().nullable().optional(),
  visibility: z.enum(["public", "members", "tier"]).optional(),
  published: z.boolean().optional(),
});

export const listPublicPodcasts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("podcast_episodes")
    .select("id,title,slug,episode_number,description,cover_url,spotify_url,apple_url,youtube_url,category,publish_date,visibility,audio_url")
    .eq("published", true).order("publish_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as any[];
});

export const adminListPodcasts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { data } = await sb.from("podcast_episodes").select("*").order("publish_date", { ascending: false });
    return data ?? [];
  });

export const adminSavePodcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => podSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const payload: any = { ...data }; const id = payload.id; delete payload.id;
    const { error } = id ? await sb.from("podcast_episodes").update(payload).eq("id", id) : await sb.from("podcast_episodes").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeletePodcast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { error } = await sb.from("podcast_episodes").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });