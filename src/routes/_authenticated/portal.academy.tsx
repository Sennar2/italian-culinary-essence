import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myAcademy } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/academy")({
  component: AcademyIndex,
});

function AcademyIndex() {
  const fn = useServerFn(myAcademy);
  const { data, isLoading } = useQuery({ queryKey: ["my-academy"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const mods = (data as any)?.modules ?? [];
  const prog = ((data as any)?.progress ?? []) as { module_id: string; status: string }[];
  const completedSet = new Set(prog.filter((p) => p.status === "completed").map((p) => p.module_id));
  return (
    <div>
      <p className="eyebrow">Academy</p>
      <h1 className="mt-2 font-display text-3xl">Your courses</h1>
      <p className="mt-2 text-sm text-muted-foreground">Modules included in your membership tier.</p>
      {mods.length === 0 && <p className="mt-8 text-sm text-muted-foreground border border-dashed border-border p-6">No modules currently available on your tier.</p>}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mods.map((m: any) => (
          <Link key={m.id} to={`/portal/academy/${m.slug}` as never} className="flex flex-col border border-border bg-card overflow-hidden hover:border-gold">
            {m.cover_url && <img src={m.cover_url} alt={m.title} className="aspect-[16/10] object-cover w-full" />}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between">
                {m.category && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{m.category}</p>}
                {completedSet.has(m.id) && <span className="text-[10px] tracking-[0.2em] uppercase text-forest">Completed</span>}
              </div>
              <h3 className="mt-2 font-display text-xl text-foreground">{m.title}</h3>
              {m.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 flex-1">{m.description}</p>}
              <div className="mt-4 text-xs text-muted-foreground">
                {m.duration_minutes ? `${m.duration_minutes} min` : "Self-paced"}
                {m.certificate_eligible && <span className="ml-2 text-gold">· Certificate</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}