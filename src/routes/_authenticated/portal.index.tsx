import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myDashboard } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalDashboard,
});

function PortalDashboard() {
  const fn = useServerFn(myDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["portal-dashboard"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const d: any = data;
  const tier = d?.member?.membership_tiers?.name;
  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-2 font-display text-3xl">{d?.member?.full_name || "Welcome to ICC International"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tier ? `${tier} member` : "Your membership is being processed."}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Courses available" value={d?.modules?.length ?? 0} />
        <Tile label="Certificates" value={d?.certificates?.length ?? 0} />
        <Tile label="Upcoming events" value={d?.events?.length ?? 0} />
        <Tile label="Podcast episodes" value={d?.podcasts?.length ?? 0} />
      </div>

      <Section title="Continue learning" link="/portal/academy" linkLabel="All academy">
        {(d?.modules ?? []).length === 0 && <Empty>No academy content available on your tier yet.</Empty>}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(d?.modules ?? []).map((m: any) => (
            <Link key={m.id} to={`/portal/academy/${m.slug}`} className="border border-border bg-card p-5 hover:border-gold">
              {m.category && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{m.category}</p>}
              <h3 className="mt-1 font-display text-lg">{m.title}</h3>
              {m.duration_minutes && <p className="mt-2 text-xs text-muted-foreground">{m.duration_minutes} min</p>}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Latest podcasts" link="/portal/podcasts" linkLabel="All episodes">
        {(d?.podcasts ?? []).length === 0 ? <Empty>No podcast episodes yet.</Empty> : (
          <ul className="divide-y divide-border border border-border bg-card">
            {d.podcasts.map((p: any) => (
              <li key={p.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{p.title}</p>
                  {p.publish_date && <p className="text-xs text-muted-foreground">{new Date(p.publish_date).toLocaleDateString("en-GB")}</p>}
                </div>
                <Link to="/portal/podcasts" className="text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold">Listen</Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Upcoming events" link="/portal/events" linkLabel="All events">
        {(d?.events ?? []).length === 0 ? <Empty>No upcoming events.</Empty> : (
          <ul className="divide-y divide-border border border-border bg-card">
            {d.events.map((e: any) => (
              <li key={e.id} className="p-4">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.starts_at && new Date(e.starts_at).toLocaleDateString("en-GB")}{e.city ? ` · ${e.city}` : ""}{e.country ? `, ${e.country}` : ""}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Latest news" link="/portal/news" linkLabel="All news">
        {(d?.news ?? []).length === 0 ? <Empty>No news posts yet.</Empty> : (
          <ul className="divide-y divide-border border border-border bg-card">
            {d.news.map((n: any) => (
              <li key={n.id} className="p-4">
                <p className="font-medium">{n.title}</p>
                {n.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.excerpt}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </div>
  );
}
function Section({ title, link, linkLabel, children }: { title: string; link: string; linkLabel: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-2xl">{title}</h2>
        <Link to={link as never} className="text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold">{linkLabel}</Link>
      </div>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground border border-dashed border-border bg-card p-6">{children}</p>;
}