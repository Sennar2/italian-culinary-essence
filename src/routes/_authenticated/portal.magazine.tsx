import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myMagazine } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/magazine")({ component: PortalMagazine });

function PortalMagazine() {
  const fn = useServerFn(myMagazine);
  const { data, isLoading } = useQuery({ queryKey: ["my-magazine"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const issues = (data as any)?.issues ?? [];
  return (
    <div>
      <p className="eyebrow">ICC Gusto</p>
      <h1 className="mt-2 font-display text-3xl">Magazine library</h1>
      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {issues.map((i: any) => (
          <article key={i.id} className="border border-border bg-card">
            {i.cover_url && <img src={i.cover_url} alt={i.title} className="aspect-[3/4] object-cover w-full" />}
            <div className="p-5">
              <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{i.issue_date ? new Date(i.issue_date).toLocaleDateString("en-GB", { year: "numeric", month: "long" }) : "Issue"}</p>
              <h3 className="mt-1 font-display text-xl">{i.title}</h3>
              {i.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-4">{i.description}</p>}
            </div>
          </article>
        ))}
        {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues available on your tier.</p>}
      </div>
    </div>
  );
}