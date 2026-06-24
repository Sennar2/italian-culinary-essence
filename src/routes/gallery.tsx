import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getGallery } from "@/lib/api/website.functions";
import { PageHeader } from "@/components/site/PageHeader";

const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => getGallery(),
});

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Italian Culinary Consortium" },
      { name: "description", content: "Images from ICC events, programmes and chapters worldwide." },
      { property: "og:title", content: "Gallery — Italian Culinary Consortium" },
      { property: "og:description", content: "Images from ICC events and chapters worldwide." },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(galleryQuery),
  component: GalleryPage,
  errorComponent: ({ error }) => <div className="container-icc py-20" role="alert">{error.message}</div>,
  notFoundComponent: () => <div className="container-icc py-20">Not found.</div>,
});

function GalleryPage() {
  const { data } = useSuspenseQuery(galleryQuery);
  const items = data as { id: string; image_url: string; title?: string | null; caption?: string | null; featured?: boolean }[];
  return (
    <>
      <PageHeader eyebrow="Gallery" title="Moments from the Consortium" intro="A visual journey through ICC's events, masterclasses and chapters." />
      <section className="bg-cream">
        <div className="container-icc py-12 md:py-16">
          {items.length === 0 ? (
            <p className="text-muted-foreground">Gallery images will appear here once added from the admin portal.</p>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {items.map((g) => (
                <figure key={g.id} className={`group relative overflow-hidden bg-forest/5 ${g.featured ? "aspect-[4/5] sm:col-span-2 sm:row-span-2 sm:aspect-square" : "aspect-square"}`}>
                  <img src={g.image_url} alt={g.title ?? g.caption ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {(g.title || g.caption) && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/95 to-transparent p-4 text-cream">
                      {g.title && <p className="font-display text-base">{g.title}</p>}
                      {g.caption && <p className="text-[10px] tracking-[0.18em] uppercase text-cream/80 mt-1">{g.caption}</p>}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}