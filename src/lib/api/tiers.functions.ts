/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

async function guard(sb: any, userId: string) {
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

const tierSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80),
  price_cents: z.number().int().nullable().optional(),
  currency: z.string().max(8).optional(),
  billing_frequency: z.enum(["monthly", "yearly", "one_off", "on_enquiry"]),
  description: z.string().max(2000).nullable().optional(),
  benefits: z.array(z.string()).optional(),
  access_level: z.number().int().optional(),
  payment_link: z.string().max(800).nullable().optional(),
  cta_label: z.string().max(80).nullable().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const listActiveTiers = createServerFn({ method: "GET" }).handler(async () => {
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.from("membership_tiers").select("*").eq("active", true).order("sort_order");
  if (error) throw error;
  return (data ?? []) as any[];
});

export const adminListTiers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { data, error } = await sb.from("membership_tiers").select("*").order("sort_order");
    if (error) throw error;
    return (data ?? []) as any[];
  });

export const adminSaveTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => tierSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const payload: any = { ...data };
    const id = payload.id; delete payload.id;
    const { error } = id
      ? await sb.from("membership_tiers").update(payload).eq("id", id)
      : await sb.from("membership_tiers").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    await guard(sb, context.userId);
    const { error } = await sb.from("membership_tiers").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });