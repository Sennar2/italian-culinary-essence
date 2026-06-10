import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Eyebrow, FlagRule } from "@/components/site/Eyebrow";
import heroPasta from "@/assets/hero-pasta.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About ICC International — Italian Culinary Consortium" },
      { name: "description", content: "Mission, vision, history and global objectives of the Italian Culinary Consortium International." },
      { property: "og:title", content: "About ICC International" },
      { property: "og:description", content: "Mission, vision, history and global objectives of the Consortium." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About ICC" title="A global institution for authentic Italian cuisine" intro="Founded to protect, promote and connect the world of Italian gastronomy. The Consortium operates as a politically and commercially independent body, governed by its international chapters and led by its Executive Board." />

      <section className="container-icc py-16 md:py-24 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow>Our Mission</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            Safeguarding the truth of Italian gastronomy
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            The Consortium exists to defend the cultural integrity of Italian cuisine — its regional identities, products and craft — and to ensure that authentic Italian gastronomy is recognised, taught and respected across the globe.
          </p>
        </div>
        <div>
          <Eyebrow>Our Vision</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-4xl">
            One global voice for Italian culinary culture
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            A future in which institutions, chefs, educators and producers around the world share a common standard of authenticity — and where the public, in every country, can trust the Italian name.
          </p>
        </div>
      </section>

      <section className="bg-forest text-cream">
        <div className="container-icc py-16 md:py-24">
          <Eyebrow>History &amp; Timeline</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-cream">A short history</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { y: "2018", t: "Foundation", d: "The Consortium is founded in Rome by chefs, scholars and producers." },
              { y: "2020", t: "First chapters", d: "Chapters open in London, New York and Milan." },
              { y: "2023", t: "Global expansion", d: "The network grows to five continents." },
              { y: "2026", t: "Certification launch", d: "The Consortium unveils a unified certification of authenticity." },
            ].map((s) => (
              <li key={s.y} className="relative border-l border-gold/40 pl-6">
                <span className="absolute -left-[5px] top-1 inline-block h-2.5 w-2.5 rounded-full bg-gold" />
                <p className="font-display text-3xl text-gold">{s.y}</p>
                <p className="mt-2 text-[12px] tracking-[0.22em] uppercase">{s.t}</p>
                <p className="mt-2 text-sm text-cream/75 leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-icc py-16 md:py-24 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <Eyebrow>Global Objectives</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl">Our work, in five lines</h2>
          <ul className="mt-10 space-y-5 text-muted-foreground">
            {[
              "Promote authentic Italian cuisine across cultures and continents.",
              "Protect the Italian name from imitation and misrepresentation.",
              "Connect institutions, chefs, educators and producers in a single network.",
              "Sustain the producers, communities and traditions that hold the cuisine together.",
              "Educate the next generation through certified academy programmes.",
            ].map((line, i) => (
              <li key={i} className="flex gap-4">
                <span className="font-display text-xl text-gold leading-none">0{i + 1}</span>
                <span className="leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>
          <Link to="/initiatives" className="mt-10 inline-flex items-center gap-3 border border-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold transition-colors">
            Explore initiatives <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src={heroPasta} alt="Authentic Italian cuisine" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </section>
    </>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-cream border-b border-border/60">
      <div className="container-icc py-14 md:py-20 max-w-4xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-[1.05]">{title}</h1>
        {intro && <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">{intro}</p>}
        <FlagRule className="mt-8" />
      </div>
    </section>
  );
}