import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/site/PageHeader";
import { getLeadership } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["leadership"], queryFn: () => getLeadership() });

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership — ICC International" },
      { name: "description", content: "The Executive Board and Regional Directors of the Italian Culinary Consortium International." },
      { property: "og:title", content: "Leadership — ICC International" },
      { property: "og:description", content: "The Executive Board and Regional Directors of the Consortium." },
      { property: "og:url", content: "/leadership" },
    ],
    links: [{ rel: "canonical", href: "/leadership" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: LeadershipPage,
});

function LeadershipPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title="Executive Board &amp; Regional Directors"
        intro="The Consortium is led by an international board of chefs, scholars, hospitality leaders and educators."
      />
      <section className="container-icc py-16 md:py-24 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <article key={p.slug} className="border border-border bg-card overflow-hidden">
            <div className="relative aspect-[4/5] bg-forest/10">
              <div className="absolute inset-0 flex items-center justify-center text-gold/80 font-display text-6xl">
                {p.name.split(" ").map(n => n[0]).slice(0,2).join("")}
              </div>
            </div>
            <div className="p-6">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{p.role}</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">{p.name}</h3>
              {p.country && <p className="text-sm text-muted-foreground mt-1">{p.country}</p>}
              {p.bio && <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{p.bio}</p>}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}