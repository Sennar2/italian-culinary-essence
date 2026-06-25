import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader } from "@/components/site/PageHeader";
import { listPublicPodcasts } from "@/lib/api/media-content.functions";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/podcasts")({
  head: () => ({
    meta: [
      { title: "Podcasts — ICC International" },
      { name: "description", content: "Conversations on Italian gastronomy, hospitality and craft from the ICC podcast." },
      { property: "og:title", content: "ICC Podcasts" },
      { property: "og:description", content: "Conversations on Italian gastronomy from around the world." },
    ],
    links: [{ rel: "canonical", href: "/podcasts" }],
  }),
  component: PodcastsPage,
});

function PodcastsPage() {
  const fn = useServerFn(listPublicPodcasts);
  const { data: eps = [] } = useQuery({ queryKey: ["public-podcasts"], queryFn: () => fn() });
  return (
    <>
      <PageHeader eyebrow="Podcasts" title="The ICC podcast" intro="Voices, masters and ideas shaping authentic Italian gastronomy worldwide." />
      <section className="container-icc py-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eps.map((e: any) => {
          const gated = e.visibility !== "public";
          return (
            <article key={e.id} className="flex flex-col border border-border bg-card overflow-hidden">
              {e.cover_url && <img src={e.cover_url} alt={e.title} className="aspect-[16/10] object-cover w-full" />}
              <div className="p-6 flex-1 flex flex-col">
                {e.episode_number && <p className="text-[11px] tracking-[0.22em] uppercase text-gold">Episode {e.episode_number}</p>}
                <h3 className="mt-2 font-display text-xl text-foreground">{e.title}</h3>
                {e.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{e.description}</p>}
                <div className="mt-5 flex gap-3 text-xs tracking-[0.2em] uppercase">
                  {gated ? (
                    <Link to="/auth" className="inline-flex items-center gap-2 text-forest hover:text-gold"><Lock className="h-3 w-3" /> Members only</Link>
                  ) : (
                    <>
                      {e.spotify_url && <a href={e.spotify_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">Spotify</a>}
                      {e.apple_url && <a href={e.apple_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">Apple</a>}
                      {e.youtube_url && <a href={e.youtube_url} target="_blank" rel="noopener noreferrer" className="text-forest hover:text-gold">YouTube</a>}
                    </>
                  )}
                </div>
                {!gated && e.audio_url && <audio controls src={e.audio_url} className="mt-4 w-full" />}
              </div>
            </article>
          );
        })}
        {eps.length === 0 && <p className="text-sm text-muted-foreground">New episodes coming soon.</p>}
      </section>
    </>
  );
}