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

export const getChapters = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("chapters")
    .select("id, slug, city, country, region, president, email, lat, lng, hero_image, summary, featured, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getChapter = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("chapters")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return row;
  });

export const getLeadership = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("leadership")
    .select("id, slug, name, role, region, country, bio, portrait, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getInitiatives = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("initiatives")
    .select("id, slug, title, category, summary, cover, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("events")
    .select("id, slug, title, excerpt, city, country, starts_at, status, featured")
    .eq("published", true)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getNews = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("news")
    .select("id, slug, title, excerpt, cover, category, author, published_at, featured")
    .eq("published", true)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
});

export const getAcademy = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("academy_items")
    .select("id, slug, title, item_type, summary, cover, cta_url, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getPartners = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("partners")
    .select("id, name, logo_url, url, tier, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});

export const getTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("testimonials")
    .select("id, quote, name, role, country, portrait, video_url, sort_order")
    .eq("published", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});