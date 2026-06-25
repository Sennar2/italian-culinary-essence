/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
async function isAdmin(userId: string) {
  const sb = await admin();
  const { data } = await sb.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  return !!data;
}
async function guard(userId: string) { if (!(await isAdmin(userId))) throw new Error("Forbidden"); }

/** Current member's record (auto-created by trigger). */
export const getMyMember = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = await admin();
    const { data, error } = await sb
      .from("members")
      .select("*, membership_tiers(name, slug, billing_frequency, payment_link, benefits)")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      // Defensive: create if trigger missed (e.g. older user)
      const { data: u } = await sb.auth.admin.getUserById(context.userId);
      await sb.from("members").insert({ user_id: context.userId, email: u.user?.email ?? null, status: "pending" });
      const { data: again } = await sb.from("members").select("*, membership_tiers(name, slug, billing_frequency, payment_link, benefits)").eq("user_id", context.userId).maybeSingle();
      return again;
    }
    return data;
  });

const profileSchema = z.object({
  full_name: z.string().max(160).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  country: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  profession: z.string().max(160).nullable().optional(),
  company: z.string().max(160).nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const { error } = await sb.from("members").update(data).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

/** Admin: list members. */
export const adminListMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data, error } = await sb
      .from("members")
      .select("*, membership_tiers(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as any[];
  });

const memberSaveSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().max(160).nullable().optional(),
  phone: z.string().max(40).nullable().optional(),
  country: z.string().max(120).nullable().optional(),
  city: z.string().max(120).nullable().optional(),
  profession: z.string().max(160).nullable().optional(),
  company: z.string().max(160).nullable().optional(),
  tier_id: z.string().uuid().nullable().optional(),
  status: z.enum(["pending", "active", "suspended", "expired"]).optional(),
  renewal_date: z.string().nullable().optional(),
  payment_status: z.string().max(80).nullable().optional(),
  payment_reference: z.string().max(200).nullable().optional(),
  internal_notes: z.string().max(4000).nullable().optional(),
});

export const adminSaveMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => memberSaveSchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { id, ...patch } = data;
    const { error } = await sb.from("members").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const adminSendMemberReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string }) => z.object({ email: z.string().email() }).parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await sb.auth.admin.generateLink({ type: "recovery", email: data.email });
    if (error) throw error;
    return { ok: true };
  });

export const adminMemberProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { member_id: string }) => z.object({ member_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const [{ data: progress }, { data: certs }] = await Promise.all([
      sb.from("member_course_progress").select("*, academy_modules(title), academy_lessons(title)").eq("member_id", data.member_id),
      sb.from("certificates").select("*, academy_modules(title)").eq("member_id", data.member_id),
    ]);
    return { progress: progress ?? [], certificates: certs ?? [] };
  });