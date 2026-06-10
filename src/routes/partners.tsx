import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/site/PageHeader";
import { getPartners } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["partners"], queryFn: () => getPartners() });

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Partners — ICC International" },
      { name: "description", content: "Institutional, cultural, academic and industry partners of ICC International." },
      { property: "og:title", content: "Partners — ICC International" },
      { property: "og:description", content: "Our institutional, cultural, academic and industry partners." },
      { property: "og:url", content: "/partners" },
    ],
    links: [{ rel: "canonical", href: "/partners" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: PartnersPage,
});

function PartnersPage() {
  const { data } = useSuspenseQuery(q);
  const byTier = data.reduce<Record<string, typeof data>>((acc, p) => {
    const t = p.tier ?? "Partner";
    acc[t] = acc[t] || [];
    acc[t].push(p);
    return acc;
  }, {});
  return (
    <>
      <PageHeader
        eyebrow="Partners"
        title="The institutions that stand beside us"
        intro="The Consortium works alongside cultural institutions, academies and industry bodies that share our commitment to authenticity."
      />
      <section className="container-icc py-16 md:py-20 space-y-14">
        {Object.entries(byTier).map(([tier, list]) => (
          <div key={tier}>
            <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{tier}</p>
            <div className="mt-6 grid gap-px bg-border grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {list.map((p) => (
                <div key={p.name} className="bg-card flex items-center justify-center p-10 min-h-[140px]">
                  <p className="font-display text-lg text-foreground text-center leading-tight">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}