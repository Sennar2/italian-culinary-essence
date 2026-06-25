import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myNews } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/news")({ component: PortalNews });

function PortalNews() {
  const fn = useServerFn(myNews);
  const { data, isLoading } = useQuery({ queryKey: ["my-news"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const posts = (data as any)?.posts ?? [];
  return (
    <div>
      <p className="eyebrow">News</p>
      <h1 className="mt-2 font-display text-3xl">Member dispatches</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {posts.map((p: any) => (
          <article key={p.id} className="border border-border bg-card overflow-hidden">
            {p.cover_url && <img src={p.cover_url} alt={p.title} className="aspect-[16/9] object-cover w-full" />}
            <div className="p-5">
              {p.category && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{p.category}</p>}
              <h3 className="mt-1 font-display text-xl">{p.title}</h3>
              {p.publish_date && <p className="text-xs text-muted-foreground mt-1">{new Date(p.publish_date).toLocaleDateString("en-GB")}</p>}
              {p.excerpt && <p className="mt-3 text-sm text-muted-foreground">{p.excerpt}</p>}
            </div>
          </article>
        ))}
        {posts.length === 0 && <p className="text-sm text-muted-foreground">No member news available.</p>}
      </div>
    </div>
  );
}