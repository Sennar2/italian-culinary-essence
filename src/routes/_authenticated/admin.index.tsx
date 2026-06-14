import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminDashboardStats } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const STATS: { key: keyof Counts; label: string; to?: string }[] = [
  { key: "chapters", label: "Chapters", to: "/admin/chapters" },
  { key: "leadership", label: "Leadership", to: "/admin/leadership" },
  { key: "upcoming_events", label: "Upcoming events", to: "/admin/events" },
  { key: "news", label: "Published news", to: "/admin/news" },
  { key: "initiatives", label: "Initiatives", to: "/admin/initiatives" },
  { key: "partners", label: "Partners", to: "/admin/partners" },
  { key: "academy", label: "Academy items", to: "/admin/academy" },
  { key: "testimonials", label: "Testimonials", to: "/admin/testimonials" },
  { key: "newsletter", label: "Newsletter subs", to: "/admin/enquiries" },
  { key: "contact_30d", label: "Contact (30d)", to: "/admin/enquiries" },
  { key: "membership_30d", label: "Membership (30d)", to: "/admin/enquiries" },
];

type Counts = {
  chapters: number; leadership: number; upcoming_events: number; news: number;
  initiatives: number; partners: number; academy: number; testimonials: number;
  newsletter: number; contact_30d: number; membership_30d: number;
};

function AdminDashboard() {
  const fn = useServerFn(adminDashboardStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: () => fn() });

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Dashboard</p>
        <h1 className="mt-2 font-display text-3xl">Welcome to the Consortium admin</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          A live view of the public website. Use the sidebar to manage every section.
        </p>
      </div>

      <section className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <Link
            key={s.key}
            to={(s.to ?? "/admin") as never}
            className="block border border-border bg-card p-5 hover:border-gold transition-colors"
          >
            <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-display text-3xl text-forest">
              {isLoading ? "—" : (data?.counts[s.key] ?? 0)}
            </p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecentPanel
          title="Latest membership enquiries"
          to="/admin/enquiries"
          rows={(data?.recentMember ?? []).map((r) => ({
            primary: r.name as string,
            secondary: [(r.tier as string) ?? "—", (r.country as string) ?? ""].filter(Boolean).join(" · "),
            email: r.email as string,
            ts: r.created_at as string,
          }))}
          isLoading={isLoading}
        />
        <RecentPanel
          title="Latest contact messages"
          to="/admin/enquiries"
          rows={(data?.recentContact ?? []).map((r) => ({
            primary: r.name as string,
            secondary: ((r.message as string) ?? "").slice(0, 80),
            email: r.email as string,
            ts: r.created_at as string,
          }))}
          isLoading={isLoading}
        />
      </section>

      <section>
        <p className="eyebrow mb-3">Quick actions</p>
        <div className="flex flex-wrap gap-2 text-[11px] tracking-[0.22em] uppercase">
          <Link to="/admin/chapters" className="bg-forest text-cream px-4 py-2 hover:bg-forest-deep">+ Chapter</Link>
          <Link to="/admin/news" className="bg-forest text-cream px-4 py-2 hover:bg-forest-deep">+ News</Link>
          <Link to="/admin/events" className="bg-forest text-cream px-4 py-2 hover:bg-forest-deep">+ Event</Link>
          <Link to="/admin/leadership" className="bg-forest text-cream px-4 py-2 hover:bg-forest-deep">+ Leader</Link>
        </div>
      </section>
    </div>
  );
}

function RecentPanel({
  title, to, rows, isLoading,
}: {
  title: string; to: string; isLoading: boolean;
  rows: { primary: string; secondary: string; email: string; ts: string }[];
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <Link to={to as never} className="text-xs text-muted-foreground hover:text-gold">View all →</Link>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {isLoading && <li className="py-3 text-sm text-muted-foreground">Loading…</li>}
        {!isLoading && rows.length === 0 && <li className="py-3 text-sm text-muted-foreground">No entries yet.</li>}
        {rows.map((r, i) => (
          <li key={i} className="py-3 text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium">{r.primary}</p>
              <span className="text-[11px] text-muted-foreground">{new Date(r.ts).toLocaleDateString()}</span>
            </div>
            <p className="text-muted-foreground text-xs mt-0.5">{r.secondary}</p>
            <p className="text-[11px] text-muted-foreground/70">{r.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}