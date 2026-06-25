import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { submitMembership } from "@/lib/api/forms.functions";
import { listActiveTiers } from "@/lib/api/tiers.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/membership")({
  head: () => ({
    meta: [
      { title: "Membership — ICC International" },
      { name: "description", content: "Individual, professional, institutional and corporate membership of the Italian Culinary Consortium International." },
      { property: "og:title", content: "Membership — ICC International" },
      { property: "og:description", content: "Join the global community safeguarding Italian gastronomy." },
      { property: "og:url", content: "/membership" },
    ],
    links: [{ rel: "canonical", href: "/membership" }],
  }),
  component: MembershipPage,
});

function formatPrice(t: { price_cents: number | null; currency: string | null; billing_frequency: string }) {
  if (!t.price_cents) return "On enquiry";
  const amt = (t.price_cents / 100).toLocaleString("en-GB", { maximumFractionDigits: 0 });
  const cur = t.currency === "EUR" ? "€" : t.currency === "USD" ? "$" : t.currency === "GBP" ? "£" : `${t.currency} `;
  const freq = t.billing_frequency === "yearly" ? "/ year" : t.billing_frequency === "monthly" ? "/ month" : "";
  return `${cur}${amt} ${freq}`.trim();
}

function MembershipPage() {
  const listFn = useServerFn(listActiveTiers);
  const { data: tiers = [] } = useQuery({ queryKey: ["active-tiers"], queryFn: () => listFn() });
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Join the global community of Italian gastronomy"
        intro="Members of ICC International become part of an international network dedicated to the protection and promotion of authentic Italian culinary culture."
      />
      <section className="container-icc py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((t: any) => (
          <article key={t.id} className={`relative flex flex-col border bg-card p-8 ${t.featured ? "border-gold ring-1 ring-gold/30" : "border-border"}`}>
            {t.featured && <span className="absolute -top-3 left-6 bg-gold text-forest px-3 py-1 text-[10px] tracking-[0.2em] uppercase">Most popular</span>}
            <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{t.name}</p>
            <p className="mt-3 font-display text-3xl text-foreground">{formatPrice(t)}</p>
            {t.description && <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>}
            <ul className="mt-6 space-y-2 text-sm text-foreground flex-1">
              {(t.benefits ?? []).map((p: string) => (
                <li key={p} className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />{p}</li>
              ))}
            </ul>
            <div className="mt-8">
              {t.payment_link ? (
                <a href={t.payment_link} target="_blank" rel="noopener noreferrer"
                  className="block text-center bg-forest text-cream py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
                  {t.cta_label || "Join now"}
                </a>
              ) : (
                <Link to="/auth" search={{ intent: "join", tier: t.slug } as never}
                  className="block text-center bg-forest text-cream py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
                  {t.cta_label || "Join now"}
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>
      <section className="bg-forest text-cream">
        <div className="container-icc py-16 md:py-20 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-gold">Enquire</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-cream">Begin your membership</h2>
            <p className="mt-4 text-cream/75 max-w-md">
              Tell us a little about yourself and we will be in touch with the right path into the Consortium.
            </p>
          </div>
          <MembershipForm tiers={tiers} />
        </div>
      </section>
    </>
  );
}

function MembershipForm({ tiers }: { tiers: any[] }) {
  const submit = useServerFn(submitMembership);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await submit({ data: {
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        organisation: String(fd.get("organisation") ?? "") || undefined,
        country: String(fd.get("country") ?? "") || undefined,
        tier: String(fd.get("tier") ?? "") || undefined,
        message: String(fd.get("message") ?? "") || undefined,
      } });
      toast.success("Thank you — we will be in touch.");
      (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send enquiry.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-transparent border border-cream/30 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold";
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <input name="name" required placeholder="Full name *" className={inputCls} aria-label="Full name" />
      <input name="email" type="email" required placeholder="Email *" className={inputCls} aria-label="Email" />
      <input name="organisation" placeholder="Organisation" className={inputCls} aria-label="Organisation" />
      <input name="country" placeholder="Country" className={inputCls} aria-label="Country" />
      <select name="tier" className={inputCls + " sm:col-span-2"} defaultValue="" aria-label="Tier">
        <option value="" disabled className="text-charcoal">Select a tier</option>
        {tiers.map((t) => <option key={t.id} value={t.name} className="text-charcoal">{t.name}</option>)}
      </select>
      <textarea name="message" rows={4} placeholder="A short message (optional)" className={inputCls + " sm:col-span-2 resize-none"} aria-label="Message" />
      <button type="submit" disabled={loading} className="sm:col-span-2 bg-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-gold-soft disabled:opacity-60">
        {loading ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}