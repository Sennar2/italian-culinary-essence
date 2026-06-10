import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { getNews } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["news"], queryFn: () => getNews() });

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News & Media — ICC International" },
      { name: "description", content: "Articles, press releases, interviews and publications from ICC International." },
      { property: "og:title", content: "News & Media — ICC International" },
      { property: "og:description", content: "Editorial and press from ICC International." },
      { property: "og:url", content: "/news" },
    ],
    links: [{ rel: "canonical", href: "/news" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: NewsPage,
});

function NewsPage() {
  const { data } = useSuspenseQuery(q);
  const [featured, ...rest] = data;
  return (
    <>
      <PageHeader
        eyebrow="News & Media"
        title="From the Consortium and its chapters"
        intro="The editorial desk of the Consortium publishes news, interviews, press releases and publications from the international network."
      />
      <section className="container-icc py-16 md:py-20">
        {featured && (
          <article className="grid gap-10 lg:grid-cols-[1.3fr_1fr] border-b border-border pb-16 mb-16">
            <div className="relative aspect-[16/10] bg-forest/10 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gold/40 font-display text-7xl">ICC</div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{featured.category} · Featured</p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl text-foreground">{featured.title}</h2>
              {featured.excerpt && <p className="mt-4 text-muted-foreground leading-relaxed">{featured.excerpt}</p>}
              <p className="mt-5 text-xs text-muted-foreground">{featured.author} · {new Date(featured.published_at ?? "").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-forest">
                Read more <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        )}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((n) => (
            <article key={n.slug} className="border-t border-border pt-6">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{n.category}</p>
              <h3 className="mt-2 font-display text-xl text-foreground">{n.title}</h3>
              {n.excerpt && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{n.excerpt}</p>}
              <p className="mt-4 text-xs text-muted-foreground">{n.author} · {new Date(n.published_at ?? "").toLocaleDateString("en-GB")}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}