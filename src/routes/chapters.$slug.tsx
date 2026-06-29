import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import { Eyebrow, FlagRule } from "@/components/site/Eyebrow";
import { getChapter } from "@/lib/api/public-content.functions";
import { resolveImage } from "@/lib/chapter-images";

const chapterQuery = (slug: string) =>
  queryOptions({
    queryKey: ["chapter", slug],
    queryFn: () => getChapter({ data: { slug } }),
  });

export const Route = createFileRoute("/chapters/$slug")({
  head: ({ loaderData }: { loaderData?: { city: string; country: string; summary?: string | null; slug: string } }) => {
    const title = loaderData ? `${loaderData.city}, ${loaderData.country} — ICC Chapter` : "ICC Chapter";
    const fallbackDesc = loaderData
      ? `Discover the ${loaderData.city} chapter of the Italian Culinary Consortium International — leadership, events and authentic Italian culinary culture in ${loaderData.country}.`
      : "An international chapter of the Italian Culinary Consortium, safeguarding authentic Italian culinary culture worldwide.";
    return {
      meta: [
        { title },
        { name: "description", content: loaderData?.summary?.trim() || fallbackDesc },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData?.summary?.trim() || fallbackDesc },
        { property: "og:url", content: `/chapters/${loaderData?.slug ?? ""}` },
      ],
      links: [{ rel: "canonical", href: `/chapters/${loaderData?.slug ?? ""}` }],
    };
  },
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(chapterQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  component: ChapterDetail,
});

function ChapterDetail() {
  const params = Route.useParams();
  const { data: c } = useSuspenseQuery(chapterQuery(params.slug));
  if (!c) return null;
  const src = resolveImage(c.hero_image);
  return (
    <>
      <section className="relative bg-forest text-cream">
        <div className="container-icc py-14 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <Link to="/chapters" className="inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-cream/70 hover:text-gold">
              <ArrowLeft className="h-3.5 w-3.5" /> All chapters
            </Link>
            <Eyebrow className="mt-6">{c.region}</Eyebrow>
            <h1 className="mt-3 font-display text-5xl md:text-6xl text-cream">{c.city}</h1>
            <p className="mt-2 text-cream/70 text-lg">{c.country}</p>
            <FlagRule className="mt-6" />
            {c.summary && <p className="mt-8 text-cream/80 leading-relaxed max-w-xl">{c.summary}</p>}
          </div>
          {src && (
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={src} alt={`${c.city}, ${c.country}`} className="absolute inset-0 h-full w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <section className="container-icc py-16 md:py-24 grid gap-12 lg:grid-cols-2">
        <div>
          <Eyebrow>Chapter leadership</Eyebrow>
          <h2 className="mt-4 font-display text-3xl">{c.president ?? "Chapter President"}</h2>
          {c.president && <p className="text-muted-foreground mt-1">President</p>}
          {c.body && <p className="mt-6 text-muted-foreground leading-relaxed">{c.body}</p>}
        </div>
        <div className="bg-card border border-border p-8">
          <Eyebrow>Contact</Eyebrow>
          <ul className="mt-6 space-y-4 text-sm">
            {c.email && (
              <li className="flex gap-3 items-center">
                <Mail className="h-4 w-4 text-gold" />
                <a href={`mailto:${c.email}`} className="hover:text-forest">{c.email}</a>
              </li>
            )}
            {c.phone && (
              <li className="flex gap-3 items-center">
                <Phone className="h-4 w-4 text-gold" />
                <a href={`tel:${c.phone}`} className="hover:text-forest">{c.phone}</a>
              </li>
            )}
            <li className="flex gap-3 items-center">
              <MapPin className="h-4 w-4 text-gold" />
              <span>{c.city}, {c.country}</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}