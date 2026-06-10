import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

const emailSchema = z.string().trim().email().max(255);

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; locale?: string }) => ({
    email: emailSchema.parse(d.email),
    locale: d.locale ? z.string().max(8).parse(d.locale) : "en",
  }))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("newsletter_subs").insert({ email: data.email, locale: data.locale });
    if (error) throw new Error("Could not subscribe right now.");
    return { ok: true };
  });

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; email: string; department?: string; message: string }) => ({
    name: z.string().trim().min(1).max(120).parse(d.name),
    email: emailSchema.parse(d.email),
    department: d.department ? z.string().max(80).parse(d.department) : null,
    message: z.string().trim().min(5).max(4000).parse(d.message),
  }))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("contact_messages").insert(data);
    if (error) throw new Error("Could not send your message right now.");
    return { ok: true };
  });

export const submitMembership = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string; email: string; organisation?: string; country?: string; tier?: string; message?: string }) => ({
    name: z.string().trim().min(1).max(120).parse(d.name),
    email: emailSchema.parse(d.email),
    organisation: d.organisation ? z.string().max(160).parse(d.organisation) : null,
    country: d.country ? z.string().max(80).parse(d.country) : null,
    tier: d.tier ? z.string().max(40).parse(d.tier) : null,
    message: d.message ? z.string().max(4000).parse(d.message) : null,
  }))
  .handler(async ({ data }) => {
    const sb = await admin();
    const { error } = await sb.from("membership_enquiries").insert(data);
    if (error) throw new Error("Could not submit your enquiry right now.");
    return { ok: true };
  });