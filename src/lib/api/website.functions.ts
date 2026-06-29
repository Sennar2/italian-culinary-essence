/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
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

function publicClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    const missing = [
      ...(!SUPABASE_URL ? ["SUPABASE_URL"] : []),
      ...(!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []),
    ];
    throw new Error(`Missing public backend environment variable(s): ${missing.join(", ")}`);
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

/* ============================================================
 * STORAGE — image upload
 * ========================================================== */
export const adminUploadImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; content_type: string; data_base64: string; folder?: string }) =>
    z.object({
      filename: z.string().min(1).max(200),
      content_type: z.string().min(1).max(120),
      data_base64: z.string().min(8),
      folder: z.string().max(60).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const folder = (data.folder ?? "uploads").replace(/[^a-z0-9-_]/gi, "");
    const safeName = data.filename.replace(/[^a-z0-9._-]/gi, "_");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
    const bin = Buffer.from(data.data_base64, "base64");
    const { error: upErr } = await sb.storage.from("media").upload(path, bin, {
      contentType: data.content_type,
      upsert: false,
    });
    if (upErr) throw upErr;
    const { data: signed, error: sErr } = await sb.storage.from("media").createSignedUrl(path, SIGNED_URL_TTL);
    if (sErr) throw sErr;
    return { url: signed.signedUrl, path };
  });

export const adminDeleteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string }) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    await sb.storage.from("media").remove([data.path]);
    return { ok: true };
  });

/* ============================================================
 * GALLERY
 * ========================================================== */
const gallerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().max(160).nullable().optional(),
  caption: z.string().max(500).nullable().optional(),
  image_url: z.string().min(1).max(1500),
  sort_order: z.number().int().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const adminListGallery = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data, error } = await (sb as any).from("gallery_images").select("*").order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => gallerySchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const payload = { ...data } as any;
    const id = payload.id; delete payload.id;
    const tbl = (sb as any).from("gallery_images");
    const { error } = id ? await tbl.update(payload).eq("id", id) : await tbl.insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteGallery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await (sb as any).from("gallery_images").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ============================================================
 * BANNERS
 * ========================================================== */
const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  subtitle: z.string().max(400).nullable().optional(),
  event_date: z.string().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  cta_label: z.string().max(80).nullable().optional(),
  cta_url: z.string().max(800).nullable().optional(),
  image_url: z.string().max(1500).nullable().optional(),
  enabled: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const adminListBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data, error } = await (sb as any).from("banners").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => bannerSchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const payload = { ...data } as any;
    const id = payload.id; delete payload.id;
    const tbl = (sb as any).from("banners");
    const { error } = id ? await tbl.update(payload).eq("id", id) : await tbl.insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await (sb as any).from("banners").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ============================================================
 * NAV LINKS
 * ========================================================== */
const navSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1).max(120),
  url: z.string().min(1).max(800),
  location: z.enum(["header", "footer_quick", "footer_programme", "footer_legal", "footer_social"]),
  social_platform: z.string().max(40).nullable().optional(),
  sort_order: z.number().int().optional(),
  active: z.boolean().optional(),
  external: z.boolean().optional(),
  in_more_menu: z.boolean().optional(),
  is_cta: z.boolean().optional(),
});

export const adminListNav = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data, error } = await (sb as any).from("nav_links").select("*").order("location").order("sort_order");
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveNav = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => navSchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const payload = { ...data } as any;
    const id = payload.id; delete payload.id;
    const tbl = (sb as any).from("nav_links");
    const { error } = id ? await tbl.update(payload).eq("id", id) : await tbl.insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteNav = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await (sb as any).from("nav_links").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ============================================================
 * FEATURED IMAGES (page-keyed)
 * ========================================================== */
export const adminListFeatured = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data, error } = await (sb as any).from("featured_images").select("*").order("page_key");
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveFeatured = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { page_key: string; image_url: string | null; alt: string | null }) =>
    z.object({
      page_key: z.string().min(1).max(60),
      image_url: z.string().max(1500).nullable(),
      alt: z.string().max(300).nullable(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await (sb as any)
      .from("featured_images")
      .upsert({ page_key: data.page_key, image_url: data.image_url, alt: data.alt }, { onConflict: "page_key" });
    if (error) throw error;
    return { ok: true };
  });

/* ============================================================
 * PUBLIC READS (used by site)
 * ========================================================== */
export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("site_settings").select("data").eq("id", 1).maybeSingle();
  return (data?.data ?? {}) as Record<string, string>;
});

export const getActiveBanner = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await (sb as any).from("banners").select("*").eq("enabled", true).order("sort_order").limit(1);
  return (data?.[0] ?? null) as any;
});

export const getGallery = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await (sb as any).from("gallery_images").select("*").eq("published", true).order("sort_order").order("created_at", { ascending: false });
  return (data ?? []) as any[];
});

export const getNavLinks = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await (sb as any).from("nav_links").select("*").eq("active", true).order("location").order("sort_order");
  return (data ?? []) as any[];
});

export const getFeaturedImages = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await (sb as any).from("featured_images").select("page_key, image_url, alt");
  const map: Record<string, { image_url: string | null; alt: string | null }> = {};
  for (const r of (data ?? []) as any[]) map[r.page_key] = { image_url: r.image_url, alt: r.alt };
  return map;
});

export const getActiveChapters = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("chapters")
    .select("id, slug, city, country, region, president, email, contact_email, address, lat, lng, hero_image, summary, featured, active, sort_order")
    .eq("published", true)
    .order("sort_order");
  return ((data ?? []) as any[]).filter((c) => c.active !== false);
});