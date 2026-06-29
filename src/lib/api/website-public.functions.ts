/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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