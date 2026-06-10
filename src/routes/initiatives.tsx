import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ChefHat, Shield, Globe2, Sprout, Archive, Repeat } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { getInitiatives } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["initiatives"], queryFn: () => getInitiatives() });

export const Route = createFileRoute("/initiatives")({
  head: () => ({
    meta: [
      { title: "Initiatives — ICC International" },
      { name: "description", content: "Education, certification, advocacy, sustainability and cultural preservation programmes from ICC International." },
      { property: "og:title", content: "Initiatives — ICC International" },
      { property: "og:description", content: "Programmes from ICC International." },
      { property: "og:url", content: "/initiatives" },
    ],
    links: [{ rel: "canonical", href: "/initiatives" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: InitiativesPage,
});

const iconFor = (cat: string) => {
  switch (cat) {
    case "Education": return ChefHat;
    case "Certification": return Shield;
    case "Advocacy": return Globe2;
    case "Sustainability": return Sprout;
    case "Cultural Preservation": return Archive;
    case "International Exchange": return Repeat;
    default: return Globe2;
  }
};

function InitiativesPage() {
  const { data } = useSuspenseQuery(q);
  const cats = useMemo(() => Array.from(new Set(data.map((i) => i.category))), [data]);
  const [cat, setCat] = useState<string>("All");
  const filtered = cat === "All" ? data : data.filter((i) => i.category === cat);
  return (
    <>
      <PageHeader
        eyebrow="Initiatives"
        title="Programmes that shape the future of Italian gastronomy"
        intro="From education to advocacy, our programmes work across continents to safeguard, share and renew authentic Italian culinary culture."
      />
      <section className="container-icc py-12">
        <div className="flex flex-wrap gap-2">
          {["All", ...cats].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 text-[11px] tracking-[0.22em] uppercase border transition-colors ${
                cat === c ? "border-forest bg-forest text-cream" : "border-border hover:border-forest"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>
      <section className="container-icc pb-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i) => {
          const Icon = iconFor(i.category);
          return (
            <article key={i.slug} className="border border-border bg-card p-8">
              <Icon strokeWidth={1.2} className="h-10 w-10 text-gold" />
              <p className="mt-5 text-[11px] tracking-[0.22em] uppercase text-gold">{i.category}</p>
              <h3 className="mt-2 font-display text-2xl">{i.title}</h3>
              {i.summary && <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{i.summary}</p>}
            </article>
          );
        })}
      </section>
    </>
  );
}