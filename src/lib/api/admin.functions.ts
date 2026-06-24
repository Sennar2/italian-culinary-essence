import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function requireAdminRole(userId: string) {
  const sb = await admin();
  const { data, error } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw error;
  return !!data;
}

export const meIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return { isAdmin: await requireAdminRole(context.userId) };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { count } = await sb.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin");
    if ((count ?? 0) > 0) return { granted: false, reason: "An admin already exists." };
    const { error } = await sb.from("user_roles").insert({ user_id: context.userId, role: "admin" });
    if (error) throw error;
    return { granted: true };
  });

// --- CHAPTERS CRUD ---
const chapterSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(80),
  city: z.string().min(1).max(120),
  country: z.string().min(1).max(120),
  region: z.string().max(80).nullable().optional(),
  president: z.string().max(160).nullable().optional(),
  email: z.string().email().max(160).nullable().optional(),
  contact_email: z.string().email().max(160).nullable().optional(),
  address: z.string().max(400).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
  hero_image: z.string().max(1500).nullable().optional(),
  summary: z.string().max(2000).nullable().optional(),
  featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
  published: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const adminListChapters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await requireAdminRole(context.userId))) throw new Error("Forbidden");
    const sb = await admin();
    const { data, error } = await sb.from("chapters").select("*").order("sort_order");
    if (error) throw error;
    return data ?? [];
  });

export const adminSaveChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof chapterSchema>) => chapterSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (!(await requireAdminRole(context.userId))) throw new Error("Forbidden");
    const sb = await admin();
    if (data.id) {
      const { error } = await sb.from("chapters").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("chapters").insert(data);
      if (error) throw error;
    }
    return { ok: true };
  });

export const adminDeleteChapter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    if (!(await requireAdminRole(context.userId))) throw new Error("Forbidden");
    const sb = await admin();
    const { error } = await sb.from("chapters").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// --- ENQUIRIES (read only) ---
export const adminListEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    if (!(await requireAdminRole(context.userId))) throw new Error("Forbidden");
    const sb = await admin();
    const [n, c, m] = await Promise.all([
      sb.from("newsletter_subs").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("membership_enquiries").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    return {
      newsletter: n.data ?? [],
      contact: c.data ?? [],
      membership: m.data ?? [],
    };
  });