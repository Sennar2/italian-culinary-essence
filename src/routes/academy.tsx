import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Award, Users, PlaySquare } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { getAcademy } from "@/lib/api/public-content.functions";

const q = queryOptions({ queryKey: ["academy"], queryFn: () => getAcademy() });

export const Route = createFileRoute("/academy")({
  head: () => ({
    meta: [
      { title: "ICC Academy — Italian Culinary Consortium" },
      { name: "description", content: "Courses, certifications, workshops and masterclasses from the Italian Culinary Consortium International." },
      { property: "og:title", content: "ICC Academy" },
      { property: "og:description", content: "Education, certification and masterclasses from ICC International." },
      { property: "og:url", content: "/academy" },
    ],
    links: [{ rel: "canonical", href: "/academy" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: AcademyPage,
});

const iconFor = (type: string) => {
  if (type === "Course") return BookOpen;
  if (type === "Certification") return Award;
  if (type === "Webinar") return PlaySquare;
  return Users;
};

function AcademyPage() {
  const { data } = useSuspenseQuery(q);
  return (
    <>
      <PageHeader
        eyebrow="ICC Academy"
        title="Education at the heart of authenticity"
        intro="Through accredited courses, certifications and masterclasses, the ICC Academy trains the next generation of custodians of Italian gastronomy."
      />
      <section className="container-icc py-16 md:py-24 grid gap-8 md:grid-cols-2">
        {data.map((item) => {
          const Icon = iconFor(item.item_type);
          return (
            <article key={item.slug} className="group flex gap-6 border border-border bg-card p-8">
              <Icon strokeWidth={1.2} className="h-10 w-10 text-gold shrink-0" />
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-gold">{item.item_type}</p>
                <h3 className="mt-2 font-display text-2xl">{item.title}</h3>
                {item.summary && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.summary}</p>}
                <Link to="/contact" className="mt-5 inline-flex items-center gap-2 text-[11px] tracking-[0.22em] uppercase text-forest hover:text-gold">
                  Enquire <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </>
  );
}