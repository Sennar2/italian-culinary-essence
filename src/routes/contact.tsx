import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, MapPin } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { submitContact } from "@/lib/api/forms.functions";
import { getSiteSettings } from "@/lib/api/website-public.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ICC International" },
      { name: "description", content: "Contact ICC International — our headquarters in Rome and our chapters around the world." },
      { property: "og:title", content: "Contact — ICC International" },
      { property: "og:description", content: "Get in touch with ICC International." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const setFn = useServerFn(getSiteSettings);
  const { data: s } = useQuery({ queryKey: ["site-settings"], queryFn: () => setFn() });
  const hasAny = !!(s?.contact_email || s?.press_email || s?.contact_phone || s?.contact_address || s?.head_office);
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Speak with the Consortium"
        intro="Reach our headquarters or any of our international chapters. For specific enquiries, please choose a department below."
      />
      <section className="container-icc py-16 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-8">
          {hasAny ? (
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">Headquarters</p>
              {s?.head_office && <h2 className="mt-2 font-display text-2xl">{s.head_office}</h2>}
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {s?.contact_address && (
                  <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <span>{s.contact_address}</span></li>
                )}
                {s?.contact_email && (
                  <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <a href={`mailto:${s.contact_email}`} className="hover:text-forest">{s.contact_email}</a></li>
                )}
                {s?.contact_phone && (
                  <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <a href={`tel:${s.contact_phone.replace(/\s+/g, "")}`} className="hover:text-forest">{s.contact_phone}</a></li>
                )}
              </ul>
            </div>
          ) : (
            <div className="border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">Contact details will appear here once added in the admin portal.</p>
            </div>
          )}
          {s?.press_email && (
            <div>
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">Press</p>
              <p className="mt-2 text-sm"><a href={`mailto:${s.press_email}`} className="hover:text-forest">{s.press_email}</a></p>
            </div>
          )}
        </div>
        <ContactForm />
      </section>
    </>
  );
}

function ContactForm() {
  const submit = useServerFn(submitContact);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({ data: {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        department: String(fd.get("department") ?? "") || undefined,
        message: String(fd.get("message") ?? ""),
      } });
      toast.success("Thank you — your message has been sent.");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setLoading(false);
    }
  }

  const cls = "w-full bg-cream border border-border px-4 py-3 text-sm focus:outline-none focus:border-gold";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 border border-border bg-card p-8">
      <input name="name" required placeholder="Full name *" className={cls} aria-label="Full name" />
      <input name="email" type="email" required placeholder="Email *" className={cls} aria-label="Email" />
      <select name="department" defaultValue="" className={cls + " sm:col-span-2"} aria-label="Department">
        <option value="" disabled>Department</option>
        <option>General</option><option>Membership</option><option>Academy</option><option>Press</option><option>Partnerships</option>
      </select>
      <textarea name="message" required rows={5} placeholder="Your message *" className={cls + " sm:col-span-2 resize-none"} aria-label="Message" />
      <button type="submit" disabled={loading} className="sm:col-span-2 bg-forest text-cream px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest-deep disabled:opacity-60">
        {loading ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}