import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myEvents } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/events")({ component: PortalEvents });

function PortalEvents() {
  const fn = useServerFn(myEvents);
  const { data, isLoading } = useQuery({ queryKey: ["my-events"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const events = (data as any)?.events ?? [];
  return (
    <div>
      <p className="eyebrow">Events</p>
      <h1 className="mt-2 font-display text-3xl">Upcoming gatherings</h1>
      <ul className="mt-8 divide-y divide-border border border-border bg-card">
        {events.map((e: any) => (
          <li key={e.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              {e.category && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{e.category}</p>}
              <h3 className="mt-1 font-display text-xl">{e.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {e.starts_at && new Date(e.starts_at).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}
                {e.city ? ` · ${e.city}` : ""}{e.country ? `, ${e.country}` : ""}
              </p>
              {e.description && <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{e.description}</p>}
            </div>
            {e.booking_url && (
              <a href={e.booking_url} target="_blank" rel="noopener noreferrer" className="bg-forest text-cream px-5 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">Book / RSVP</a>
            )}
          </li>
        ))}
        {events.length === 0 && <li className="p-6 text-sm text-muted-foreground">No upcoming events available on your tier.</li>}
      </ul>
    </div>
  );
}