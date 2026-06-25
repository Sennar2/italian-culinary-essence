import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { myPodcasts } from "@/lib/api/portal.functions";

export const Route = createFileRoute("/_authenticated/portal/podcasts")({ component: PortalPodcasts });

function PortalPodcasts() {
  const fn = useServerFn(myPodcasts);
  const { data, isLoading } = useQuery({ queryKey: ["my-podcasts"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const eps = (data as any)?.episodes ?? [];
  return (
    <div>
      <p className="eyebrow">Podcasts</p>
      <h1 className="mt-2 font-display text-3xl">Member podcast library</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {eps.map((e: any) => (
          <article key={e.id} className="border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              {e.cover_url && <img src={e.cover_url} alt={e.title} className="w-24 h-24 object-cover" />}
              <div className="flex-1">
                {e.episode_number && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">Episode {e.episode_number}</p>}
                <h3 className="mt-1 font-display text-lg">{e.title}</h3>
                {e.publish_date && <p className="text-xs text-muted-foreground">{new Date(e.publish_date).toLocaleDateString("en-GB")}</p>}
              </div>
            </div>
            {e.description && <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>}
            {e.audio_url && <audio controls src={e.audio_url} className="mt-4 w-full" />}
            <div className="mt-3 flex gap-3 text-xs tracking-[0.2em] uppercase">
              {e.spotify_url && <a href={e.spotify_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">Spotify</a>}
              {e.apple_url && <a href={e.apple_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">Apple</a>}
              {e.youtube_url && <a href={e.youtube_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">YouTube</a>}
            </div>
          </article>
        ))}
        {eps.length === 0 && <p className="text-sm text-muted-foreground">No episodes available on your tier.</p>}
      </div>
    </div>
  );
}