import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { getEvents } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["events"], queryFn: () => getEvents() });

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — ICC International" },
      { name: "description", content: "Summits, galas, masterclasses and academy weeks from ICC International around the world." },
      { property: "og:title", content: "Events — ICC International" },
      { property: "og:description", content: "ICC International events around the world." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: EventsPage,
});

function fmt(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function EventsPage() {
  const { data } = useSuspenseQuery(q);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const events = data.filter((e) => e.status === tab);
  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="A calendar of authentic Italian gastronomy"
        intro="From the global summit in Rome to chapter galas around the world, the Consortium gathers a living community around Italian gastronomy."
      />
      <section className="container-icc py-10">
        <div className="inline-flex border border-border">
          {(["upcoming","past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-[11px] tracking-[0.22em] uppercase ${tab === t ? "bg-forest text-cream" : "hover:bg-secondary"}`}
            >
              {t} Events
            </button>
          ))}
        </div>
      </section>
      <section className="container-icc pb-20 grid gap-6 md:grid-cols-2">
        {events.map((e) => (
          <article key={e.slug} className="group border border-border bg-card p-8 flex flex-col">
            <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{e.status}</p>
            <h3 className="mt-2 font-display text-2xl md:text-3xl">{e.title}</h3>
            {e.excerpt && <p className="mt-3 text-muted-foreground">{e.excerpt}</p>}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-muted-foreground border-t border-border pt-5">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gold" /> {fmt(e.starts_at)}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> {e.city}, {e.country}</div>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-forest group-hover:text-gold">
              Programme & registration <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </article>
        ))}
        {events.length === 0 && <p className="text-muted-foreground">No {tab} events at the moment.</p>}
      </section>
    </>
  );
}