import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { ArrowRight, Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { WorldMap } from "@/components/site/WorldMap";
import { resolveImage } from "@/lib/chapter-images";
import { getChapters } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["chapters"], queryFn: () => getChapters() });

export const Route = createFileRoute("/chapters")({
  head: () => ({
    meta: [
      { title: "International Chapters — ICC International" },
      { name: "description", content: "ICC International is present in cities around the world through its chapters and partners." },
      { property: "og:title", content: "International Chapters — ICC International" },
      { property: "og:description", content: "ICC chapters around the world." },
      { property: "og:url", content: "/chapters" },
    ],
    links: [{ rel: "canonical", href: "/chapters" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: ChaptersPage,
});

function ChaptersPage() {
  const { data } = useSuspenseQuery(q);
  const regions = useMemo(() => Array.from(new Set(data.map((c) => c.region).filter(Boolean))) as string[], [data]);
  const [region, setRegion] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = data.filter((c) =>
    (region === "All" || c.region === region) &&
    (query === "" || `${c.city} ${c.country}`.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <PageHeader
        eyebrow="International Chapters"
        title="A worldwide network of Italian excellence"
        intro="From Rome to Sydney, ICC chapters anchor the Consortium in the cities where Italian gastronomy lives, teaches and travels."
      />

      <section className="bg-cream border-b border-border/60">
        <div className="container-icc py-14 md:py-16">
          <WorldMap chapters={data} />
        </div>
      </section>

      <section className="container-icc py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {["All", ...regions].map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 text-[11px] tracking-[0.22em] uppercase border transition-colors ${
                  region === r ? "border-forest bg-forest text-cream" : "border-border text-foreground hover:border-forest"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search city or country"
              className="pl-10 pr-4 py-3 bg-cream border border-border text-sm focus:outline-none focus:border-gold w-full md:w-80"
              aria-label="Search chapters"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const src = resolveImage(c.hero_image);
            return (
              <Link
                key={c.slug}
                to="/chapters/$slug"
                params={{ slug: c.slug }}
                className="group block border border-border bg-card overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-forest">
                  {src && <img src={src} alt={`${c.city}, ${c.country}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                </div>
                <div className="p-6">
                  <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{c.region}</p>
                  <h3 className="mt-2 font-display text-2xl text-foreground">{c.city}</h3>
                  <p className="text-sm text-muted-foreground">{c.country}</p>
                  {c.president && <p className="mt-4 text-xs text-muted-foreground">President — {c.president}</p>}
                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-forest group-hover:text-gold">
                    Visit chapter <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-16 text-muted-foreground">No chapters match your search.</p>
        )}
      </section>
    </>
  );
}