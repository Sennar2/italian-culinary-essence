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

/* ====================== MODULES ====================== */
const moduleSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(120),
  category: z.string().max(80).nullable().optional(),
  description: z.string().max(4000).nullable().optional(),
  cover_url: z.string().max(1500).nullable().optional(),
  duration_minutes: z.number().int().nullable().optional(),
  certificate_eligible: z.boolean().optional(),
  passing_score: z.number().int().nullable().optional(),
  published: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const adminListModules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data } = await sb.from("academy_modules").select("*").order("sort_order");
    return data ?? [];
  });

export const adminSaveModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => moduleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const payload: any = { ...data }; const id = payload.id; delete payload.id;
    const { error } = id ? await sb.from("academy_modules").update(payload).eq("id", id) : await sb.from("academy_modules").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteModule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await sb.from("academy_modules").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ====================== LESSONS ====================== */
const lessonSchema = z.object({
  id: z.string().uuid().optional(),
  module_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  sort_order: z.number().int().optional(),
  kind: z.enum(["video", "pdf", "scorm", "text"]),
  video_url: z.string().max(1500).nullable().optional(),
  pdf_url: z.string().max(1500).nullable().optional(),
  scorm_package_path: z.string().max(1500).nullable().optional(),
  scorm_launch_url: z.string().max(1500).nullable().optional(),
  body: z.string().max(20000).nullable().optional(),
});

export const adminListLessons = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { module_id: string }) => z.object({ module_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { data: rows } = await sb.from("academy_lessons").select("*").eq("module_id", data.module_id).order("sort_order");
    return rows ?? [];
  });

export const adminSaveLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => lessonSchema.parse(d))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const payload: any = { ...data }; const id = payload.id; delete payload.id;
    const { error } = id ? await sb.from("academy_lessons").update(payload).eq("id", id) : await sb.from("academy_lessons").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => ({ id: z.string().uuid().parse(d.id) }))
  .handler(async ({ data, context }) => {
    await guard(context.userId);
    const sb = await admin();
    const { error } = await sb.from("academy_lessons").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/* ====================== PROGRESS (member-facing) ====================== */
const progressSchema = z.object({
  module_id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  score: z.number().nullable().optional(),
  scorm_suspend_data: z.string().max(64000).nullable().optional(),
});

export const saveLessonProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => progressSchema.parse(d))
  .handler(async ({ data, context }) => {
    const sb = await admin();
    const { data: m } = await sb.from("members").select("id").eq("user_id", context.userId).maybeSingle();
    if (!m) throw new Error("Member not found");
    const completed_at = data.status === "completed" ? new Date().toISOString() : null;
    const { error } = await sb.from("member_course_progress").upsert(
      { member_id: m.id, ...data, completed_at },
      { onConflict: "member_id,lesson_id" },
    );
    if (error) throw error;
    // Issue certificate if all lessons in module are completed and module is certificate_eligible
    if (data.status === "completed") {
      const { data: mod } = await sb.from("academy_modules").select("certificate_eligible,title").eq("id", data.module_id).maybeSingle();
      if (mod?.certificate_eligible) {
        const { data: lessons } = await sb.from("academy_lessons").select("id").eq("module_id", data.module_id);
        const { data: done } = await sb.from("member_course_progress").select("lesson_id").eq("member_id", m.id).eq("module_id", data.module_id).eq("status", "completed");
        const lessonIds = new Set((lessons ?? []).map((l) => l.id));
        const doneIds = new Set((done ?? []).map((d) => d.lesson_id));
        const allDone = lessonIds.size > 0 && Array.from(lessonIds).every((id) => doneIds.has(id));
        if (allDone) {
          const certNumber = `ICC-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          await sb.from("certificates").upsert(
            { member_id: m.id, module_id: data.module_id, certificate_number: certNumber },
            { onConflict: "member_id,module_id", ignoreDuplicates: true },
          );
        }
      }
    }
    return { ok: true };
  });