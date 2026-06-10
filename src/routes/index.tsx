import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ChefHat, Shield, Globe2, Sprout } from "lucide-react";
import { Eyebrow, FlagRule } from "@/components/site/Eyebrow";
import { StatCounter } from "@/components/site/StatCounter";
import { WorldMap } from "@/components/site/WorldMap";
import { resolveImage } from "@/lib/chapter-images";
import {
  getChapters,
  getInitiatives,
  getTestimonials,
} from "@/lib/api/public-content.functions";
import heroPasta from "@/assets/hero-pasta.jpg";
import initiativesChef from "@/assets/initiatives-chef.jpg";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: async () => {
    const [chapters, initiatives, testimonials] = await Promise.all([
      getChapters(),
      getInitiatives(),
      getTestimonials(),
    ]);
    return { chapters, initiatives, testimonials };
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICC International — Safeguarding the Authenticity of Italian Cuisine" },
      { name: "description", content: "The Italian Culinary Consortium International promotes, protects and connects authentic Italian culinary culture across the globe." },
      { property: "og:title", content: "ICC International — Italian Culinary Consortium" },
      { property: "og:description", content: "Safeguarding the authenticity of Italian cuisine worldwide." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  return (
    <>
      <Hero />
      <Mission />
      <Impact />
      <MapSection chapters={data.chapters} />
      <Chapters chapters={data.chapters} />
      <Initiatives initiatives={data.initiatives} />
      <Testimonials testimonials={data.testimonials} />
      <CtaBand />
    </>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-icc grid items-center gap-10 lg:gap-16 py-10 md:py-16 lg:py-20 lg:grid-cols-[1.05fr_1.2fr]">
        <div className="relative order-2 lg:order-1">
          <p className="font-display text-3xl text-gold/90">2026</p>
          <FlagRule className="mt-4" />
          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[64px]">
            Safeguarding the Authenticity of Italian Cuisine{" "}
            <em className="italic text-forest">Worldwide</em>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-[17px] leading-relaxed text-muted-foreground">
            The Italian Culinary Consortium International promotes, protects and values
            authentic Italian culinary culture and its excellence across the globe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/initiatives"
              className="group inline-flex items-center gap-3 bg-forest text-cream px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest-deep transition-colors"
            >
              Our Initiatives
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center bg-transparent border border-forest text-forest px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest hover:text-cream transition-colors"
            >
              Become a Member
            </Link>
          </div>
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[5/4] md:aspect-[6/5] overflow-hidden">
            {/* Gold arc framing — editorial reference */}
            <svg
              aria-hidden
              className="absolute -left-6 top-0 h-full w-12 z-10"
              viewBox="0 0 50 600" preserveAspectRatio="none"
            >
              <path d="M 50 0 C 0 200, 0 400, 50 600" stroke="var(--color-gold)" strokeWidth="1" fill="none" />
            </svg>
            <img
              src={heroPasta}
              alt="Authentic Italian fettuccine with basil, cherry tomatoes and parmesan"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
          <Seal />
        </div>
      </div>
    </section>
  );
}

function Seal() {
  return (
    <div className="absolute -top-2 right-2 md:-top-4 md:-right-4 z-20">
      <svg viewBox="0 0 130 130" className="h-24 w-24 md:h-32 md:w-32">
        <defs>
          <path id="circle" d="M 65,65 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
        </defs>
        <circle cx="65" cy="65" r="62" fill="var(--color-cream)" stroke="var(--color-gold)" strokeWidth="1" />
        <circle cx="65" cy="65" r="55" fill="none" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.6" />
        <text fill="var(--color-forest)" fontFamily="Cormorant Garamond, serif" fontSize="9" letterSpacing="2">
          <textPath href="#circle" startOffset="2%">AUTHENTIC ITALIAN CUISINE</textPath>
        </text>
        <text x="65" y="58" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="20" fill="var(--color-forest)" fontWeight="500">ICC</text>
        <text x="65" y="70" textAnchor="middle" fontSize="6" letterSpacing="2" fill="var(--color-gold)">INTERNATIONAL</text>
        <text x="65" y="84" textAnchor="middle" fontSize="11" fill="var(--color-it-red)" fontFamily="Cormorant Garamond, serif">2026</text>
        <text x="65" y="95" textAnchor="middle" fontSize="5" letterSpacing="2" fill="var(--color-forest)" opacity="0.7">QUALITY · CULTURE · TRADITION</text>
      </svg>
    </div>
  );
}

/* ---------------- MISSION ---------------- */
function Mission() {
  const pillars = [
    { icon: ChefHat, title: "Promote", body: "We promote authentic Italian culinary culture across the globe." },
    { icon: Shield, title: "Protect", body: "We defend the authenticity and quality of Italian products and traditions." },
    { icon: Globe2, title: "Connect", body: "We connect institutions, professionals and Italian culinary excellence." },
    { icon: Sprout, title: "Sustain", body: "We support sustainability and the future of our traditions." },
  ];
  return (
    <section className="bg-forest text-cream">
      <div className="container-icc py-14 md:py-20">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.28em] uppercase text-gold">Our Mission</p>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:divide-x md:divide-cream/15">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="text-center px-2 md:px-6">
              <Icon strokeWidth={1.2} className="mx-auto h-10 w-10 text-gold" />
              <h3 className="mt-4 font-display text-[13px] tracking-[0.28em] uppercase text-cream">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/75 max-w-[24ch] mx-auto">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- IMPACT / WORLD MAP ---------------- */
function Impact() {
  return (
    <section className="bg-cream">
      <div className="container-icc py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16 items-center">
          <div>
            <Eyebrow>A Global Community</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground leading-[1.05]">
              Uniting Passion.<br />
              <em className="italic text-forest">Inspiring Excellence.</em>
            </h2>
            <p className="mt-6 max-w-md text-muted-foreground leading-relaxed">
              ICC International is a worldwide network of institutions, chefs, professionals
              and enthusiasts working together to celebrate and safeguard the true essence
              of Italian cuisine.
            </p>
            <Link
              to="/chapters"
              className="mt-8 inline-flex items-center gap-3 border border-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold hover:text-forest transition-colors"
            >
              Discover our network <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="bg-forest text-cream p-8 md:p-12">
            <div className="grid grid-cols-2 gap-y-10 gap-x-6">
              <StatCounter value={150} label="Institutional Members" sublabel="Worldwide" />
              <StatCounter value={60} label="Countries Represented" sublabel="On 5 continents" />
              <StatCounter value={250} label="Events Every Year" sublabel="Across the network" />
              <StatCounter value={2} suffix="M+" label="People Reached" sublabel="Through our programmes" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MapSection({ chapters }: { chapters: Awaited<ReturnType<typeof getChapters>> }) {
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-16 md:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Our World Map</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground">
            ICC presence around the world
          </h2>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Our chapters anchor the Consortium in the cities where Italian gastronomy
            travels, teaches and innovates. Tap a pin to discover a chapter.
          </p>
        </div>
        <div className="mt-10">
          <WorldMap chapters={chapters} />
        </div>
      </div>
    </section>
  );
}

/* ---------------- CHAPTERS ---------------- */
function Chapters({ chapters }: { chapters: Awaited<ReturnType<typeof getChapters>> }) {
  const featured = chapters.filter((c) => c.featured).slice(0, 6);
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Eyebrow>Our Chapters</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground">
              A World of Italian Excellence
            </h2>
            <FlagRule className="mt-5" />
          </div>
          <Link
            to="/chapters"
            className="self-start inline-flex items-center gap-3 border border-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold transition-colors"
          >
            View all chapters <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => {
            const src = resolveImage(c.hero_image);
            return (
              <Link
                key={c.slug}
                to="/chapters/$slug"
                params={{ slug: c.slug }}
                className="group relative block overflow-hidden aspect-[4/5] bg-forest"
              >
                {src && (
                  <img
                    src={src}
                    alt={`${c.city}, ${c.country}`}
                    width={1200}
                    height={900}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-cream">
                  <p className="font-display text-2xl tracking-tight">{c.city}</p>
                  <p className="mt-1 text-[11px] tracking-[0.22em] uppercase text-cream/80">{c.country}</p>
                  <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/60 text-cream group-hover:bg-gold group-hover:border-gold group-hover:text-forest transition">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- INITIATIVES ---------------- */
function Initiatives({ initiatives }: { initiatives: Awaited<ReturnType<typeof getInitiatives>> }) {
  const four = initiatives.slice(0, 4);
  const iconFor = (cat: string) => {
    if (cat === "Education") return ChefHat;
    if (cat === "Certification") return Shield;
    if (cat === "Advocacy") return Globe2;
    return Sprout;
  };
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-16 md:py-24 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <Eyebrow>Driving Impact</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground">
            Our Programmes &amp; Initiatives
          </h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2">
            {four.map((i) => {
              const Icon = iconFor(i.category);
              return (
                <div key={i.slug}>
                  <Icon strokeWidth={1.2} className="h-9 w-9 text-gold" />
                  <h3 className="mt-4 text-[12px] tracking-[0.22em] uppercase font-medium text-foreground">{i.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.summary}</p>
                </div>
              );
            })}
          </div>
          <Link
            to="/initiatives"
            className="mt-10 inline-flex items-center gap-3 border border-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold transition-colors"
          >
            View all initiatives <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[500px] overflow-hidden">
          <img
            src={initiativesChef}
            alt="Chef plating an Italian dish"
            loading="lazy"
            width={1400}
            height={1000}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials({ testimonials }: { testimonials: Awaited<ReturnType<typeof getTestimonials>> }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-forest text-cream">
      <div className="container-icc py-16 md:py-24">
        <div className="text-center">
          <p className="text-[11px] tracking-[0.28em] uppercase text-gold">Voices of the Consortium</p>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <figure key={t.id} className="text-center md:text-left">
              <p className="font-display text-6xl text-gold/40 leading-none">“</p>
              <blockquote className="mt-2 font-display italic text-xl md:text-2xl text-cream leading-snug">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 text-[11px] tracking-[0.22em] uppercase text-gold">
                {t.name} <span className="text-cream/60">— {t.role}{t.country ? `, ${t.country}` : ""}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-10 md:py-14 text-center">
        <p className="font-display italic text-lg md:text-xl text-forest">
          Uniting tradition, innovation and passion to share the excellence of Italian cuisine.
        </p>
        <div className="mt-4 flex items-center justify-center">
          <FlagRule />
        </div>
      </div>
    </section>
  );
}
