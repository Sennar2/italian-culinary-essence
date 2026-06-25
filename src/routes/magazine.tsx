import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/site/PageHeader";
import { listPublicIssues } from "@/lib/api/media-content.functions";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/magazine")({
  head: () => ({
    meta: [
      { title: "ICC Gusto — The Magazine" },
      { name: "description", content: "ICC Gusto: the magazine of authentic Italian gastronomy." },
      { property: "og:title", content: "ICC Gusto Magazine" },
      { property: "og:description", content: "Stories, voices and craft from the Italian table." },
    ],
    links: [{ rel: "canonical", href: "/magazine" }],
  }),
  component: MagazinePage,
});

function MagazinePage() {
  const fn = useServerFn(listPublicIssues);
  const { data: issues = [] } = useQuery({ queryKey: ["public-issues"], queryFn: () => fn() });
  return (
    <>
      <PageHeader eyebrow="ICC Gusto" title="The magazine of authentic Italian gastronomy" intro="Long-form journalism, interviews and dispatches from the Italian table — quarterly." />
      <section className="container-icc py-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {issues.map((i: any) => (
          <article key={i.id} className="flex flex-col border border-border bg-card overflow-hidden">
            {i.cover_url ? (
              <img src={i.cover_url} alt={i.title} className="aspect-[3/4] object-cover w-full" />
            ) : (
              <div className="aspect-[3/4] bg-forest/10 flex items-center justify-center text-forest/40 font-display text-2xl">ICC Gusto</div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{i.issue_date ? new Date(i.issue_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Issue"}</p>
              <h3 className="mt-2 font-display text-2xl text-foreground">{i.title}</h3>
              {i.summary && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{i.summary}</p>}
              <div className="mt-5">
                {i.public_preview ? (
                  <span className="text-[11px] tracking-[0.22em] uppercase text-forest">Preview available</span>
                ) : (
                  <Link to="/auth" className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold"><Lock className="h-3 w-3" /> Members only</Link>
                )}
              </div>
            </div>
          </article>
        ))}
        {issues.length === 0 && <p className="text-sm text-muted-foreground">The first issue of ICC Gusto is in preparation.</p>}
      </section>
    </>
  );
}