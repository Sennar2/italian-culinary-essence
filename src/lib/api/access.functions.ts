/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function guard(userId: string) {
  const sb = await admin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

const ContentType = z.enum(["module", "news", "magazine_issue", "podcast", "event", "article"]);

/** Get the access matrix for a content type: rows of {id, label} + which tiers are allowed. */
export const getAccessMatrix = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content_type: string }) => z.object({ content_type: ContentType }).parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const map: Record<string, { table: string; label: string }> = {
      module: { table: "academy_modules", label: "title" },
      news: { table: "news", label: "title" },
      magazine_issue: { table: "magazine_issues", label: "title" },
      podcast: { table: "podcast_episodes", label: "title" },
      event: { table: "events", label: "title" },
      article: { table: "magazine_articles", label: "title" },
    };
    const cfg = map[data.content_type];
    const [{ data: items }, { data: tiers }, { data: rules }] = await Promise.all([
      sb.from(cfg.table as any).select(`id, ${cfg.label}`).order(cfg.label as any),
      sb.from("membership_tiers").select("id, name").eq("active", true).order("sort_order"),
      sb.from("content_access").select("content_id, tier_id").eq("content_type", data.content_type),
    ]);
    return {
      items: (items ?? []).map((r: any) => ({ id: r.id, label: r[cfg.label] })),
      tiers: tiers ?? [],
      rules: rules ?? [],
    };
  });

export const setAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { content_type: string; content_id: string; tier_id: string; allowed: boolean }) =>
    z.object({ content_type: ContentType, content_id: z.string().uuid(), tier_id: z.string().uuid(), allowed: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    if (data.allowed) {
      await sb.from("content_access").upsert(
        { content_type: data.content_type, content_id: data.content_id, tier_id: data.tier_id },
        { onConflict: "content_type,content_id,tier_id", ignoreDuplicates: true },
      );
    } else {
      await sb.from("content_access").delete()
        .eq("content_type", data.content_type).eq("content_id", data.content_id).eq("tier_id", data.tier_id);
    }
    return { ok: true };
  });