import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { submitMembership } from "@/lib/api/forms.functions";
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

const tiers = [
  { name: "Individual", price: "€120 / year", desc: "For enthusiasts and supporters of authentic Italian gastronomy.", perks: ["Member newsletter", "Invitations to local chapter events", "Digital membership card"] },
  { name: "Professional", price: "€280 / year", desc: "For chefs, sommeliers, educators and culinary professionals.", perks: ["All Individual benefits", "Access to academy masterclasses", "Listed in the Members Directory"] },
  { name: "Institutional", price: "On enquiry", desc: "For schools, academies, hotels and cultural institutions.", perks: ["Co-branded programmes", "Certification eligibility", "Annual summit delegation"] },
  { name: "Corporate", price: "On enquiry", desc: "For producers, importers and brands aligned with our values.", perks: ["Strategic partnership", "Brand co-presentation", "Access to global chapter network"] },
];

function MembershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Join the global community of Italian gastronomy"
        intro="Members of ICC International become part of an international network dedicated to the protection and promotion of authentic Italian culinary culture."
      />
      <section className="container-icc py-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t) => (
          <article key={t.name} className="flex flex-col border border-border bg-card p-8">
            <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{t.name}</p>
            <p className="mt-3 font-display text-2xl text-foreground">{t.price}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            <ul className="mt-6 space-y-2 text-sm text-foreground">
              {t.perks.map((p) => (
                <li key={p} className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5 shrink-0" />{p}</li>
              ))}
            </ul>
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
          <MembershipForm />
        </div>
      </section>
    </>
  );
}

function MembershipForm() {
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
        {tiers.map((t) => <option key={t.name} value={t.name} className="text-charcoal">{t.name}</option>)}
      </select>
      <textarea name="message" rows={4} placeholder="A short message (optional)" className={inputCls + " sm:col-span-2 resize-none"} aria-label="Message" />
      <button type="submit" disabled={loading} className="sm:col-span-2 bg-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-gold-soft disabled:opacity-60">
        {loading ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}