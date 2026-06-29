import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ChefHat, Shield, Globe2, Sprout } from "lucide-react";
import { Eyebrow, FlagRule } from "@/components/site/Eyebrow";
import { StatCounter } from "@/components/site/StatCounter";
import { ChaptersMap } from "@/components/site/ChaptersMap";
import iccLogo from "@/assets/icc-logo.svg.asset.json";
import { resolveImage } from "@/lib/chapter-images";
import {
  getInitiatives,
  getTestimonials,
} from "@/lib/api/public-content.functions";
import {
  getActiveChapters,
  getSiteSettings,
  getActiveBanner,
  getGallery,
} from "@/lib/api/website-public.functions";
import heroPasta from "@/assets/hero-pasta.jpg";
import initiativesChef from "@/assets/initiatives-chef.jpg";

const homeQuery = queryOptions({
  queryKey: ["home-content"],
  queryFn: async () => {
    const [chapters, initiatives, testimonials, settings, banner, gallery] = await Promise.all([
      getActiveChapters(),
      getInitiatives(),
      getTestimonials(),
      getSiteSettings(),
      getActiveBanner(),
      getGallery(),
    ]);
    return { chapters, initiatives, testimonials, settings, banner, gallery };
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ICC — Safeguarding Authentic Italian Cuisine" },
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
      {data.banner && <BannerStrip banner={data.banner} />}
      <Hero settings={data.settings} />
      <Mission />
      <Impact />
      <MapSection chapters={data.chapters} />
      <Chapters chapters={data.chapters} />
      {data.gallery.length > 0 && <GallerySection items={data.gallery} />}
      <Initiatives initiatives={data.initiatives} />
      <Testimonials testimonials={data.testimonials} />
      <CtaBand />
    </>
  );
}

/* ---------------- HERO ---------------- */
type Settings = Record<string, string>;

function Hero({ settings }: { settings: Settings }) {
  const eyebrow = settings.hero_eyebrow?.trim() || "2026";
  const titleRaw = settings.hero_title?.trim();
  const subtitle = settings.hero_subtitle?.trim() || "The Italian Culinary Consortium International promotes, protects and values authentic Italian culinary culture and its excellence across the globe.";
  const heroImage = settings.hero_image?.trim() || heroPasta;
  const bg = settings.hero_background_image?.trim();
  const primaryLabel = settings.hero_cta_primary_label?.trim() || "Our Initiatives";
  const primaryUrl = settings.hero_cta_primary_url?.trim() || "/initiatives";
  const secondaryLabel = settings.hero_cta_secondary_label?.trim() || "Become a Member";
  const secondaryUrl = settings.hero_cta_secondary_url?.trim() || "/membership";
  return (
    <section className="relative overflow-hidden bg-cream">
      {bg && (
        <div className="absolute inset-0 -z-0">
          <img src={bg} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-cream/80" />
        </div>
      )}
      <div className="relative container-icc grid items-center gap-10 lg:gap-16 py-10 md:py-16 lg:py-20 lg:grid-cols-[1.05fr_1.2fr]">
        <div className="relative order-2 lg:order-1">
          <p className="font-display text-3xl text-gold/90">{eyebrow}</p>
          <FlagRule className="mt-4" />
          <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-[64px]">
            {titleRaw || (<>Italian Culinary Consortium —{" "}<em className="italic text-forest">Safeguarding Authentic Italian Cuisine</em></>)}
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-[17px] leading-relaxed text-muted-foreground">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink url={primaryUrl} primary>{primaryLabel}</CtaLink>
            <CtaLink url={secondaryUrl}>{secondaryLabel}</CtaLink>
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
              src={heroImage}
              alt={titleRaw || "Italian Culinary Consortium hero"}
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

function CtaLink({ url, primary, children }: { url: string; primary?: boolean; children: React.ReactNode }) {
  const cls = primary
    ? "group inline-flex items-center gap-3 bg-forest text-cream px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest-deep transition-colors"
    : "inline-flex items-center bg-transparent border border-forest text-forest px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest hover:text-cream transition-colors";
  const external = /^https?:/i.test(url);
  if (external) {
    return <a href={url} className={cls} target="_blank" rel="noopener noreferrer">{children}{primary && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}</a>;
  }
  return <Link to={url as never} className={cls}>{children}{primary && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />}</Link>;
}

/* ---------------- BANNER ---------------- */
function BannerStrip({ banner }: { banner: { title: string; subtitle?: string | null; event_date?: string | null; location?: string | null; cta_label?: string | null; cta_url?: string | null; image_url?: string | null } }) {
  const date = banner.event_date ? new Date(banner.event_date) : null;
  const dateText = date ? date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : "";
  const timeText = date ? date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";
  const meta = [dateText, timeText, banner.location].filter(Boolean).join(" · ");
  return (
    <section className="bg-forest text-cream border-b border-cream/10">
      <div className="container-icc grid gap-6 py-5 md:py-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-5">
          {banner.image_url && (
            <img src={banner.image_url} alt="" className="hidden md:block h-16 w-16 object-cover" />
          )}
          <div>
            <p className="font-display text-lg md:text-xl text-cream leading-tight">{banner.title}</p>
            {banner.subtitle && <p className="mt-1 text-sm text-cream/75">{banner.subtitle}</p>}
            {meta && <p className="mt-1 text-[11px] tracking-[0.22em] uppercase text-gold">{meta}</p>}
          </div>
        </div>
        {banner.cta_label && banner.cta_url && (
          <a href={banner.cta_url} className="self-start md:self-center inline-flex items-center bg-gold text-forest px-5 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold/90">
            {banner.cta_label} <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </section>
  );
}

/* ---------------- GALLERY (homepage teaser) ---------------- */
function GallerySection({ items }: { items: { id: string; image_url: string; title?: string | null; caption?: string | null }[] }) {
  const shown = items.slice(0, 8);
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Eyebrow>Gallery</Eyebrow>
            <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground">Moments from the Consortium</h2>
          </div>
          <Link to="/gallery" className="self-start inline-flex items-center gap-3 border border-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-gold transition-colors">
            View full gallery <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {shown.map((g) => (
            <figure key={g.id} className="group relative overflow-hidden aspect-square bg-forest/5">
              <img src={g.image_url} alt={g.title ?? g.caption ?? ""} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              {(g.title || g.caption) && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/95 to-transparent p-3 text-cream">
                  {g.title && <p className="text-sm font-display">{g.title}</p>}
                  {g.caption && <p className="text-[10px] tracking-[0.18em] uppercase text-cream/80">{g.caption}</p>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Seal() {
  return (
    <div className="absolute -top-2 right-2 md:-top-4 md:-right-4 z-20">
      <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-cream border border-gold/60 shadow-[0_8px_24px_-12px_rgba(15,61,46,0.35)] flex items-center justify-center p-3">
        <img src={iccLogo.url} alt="ICC International seal" className="h-full w-full object-contain" />
      </div>
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
          <h2 className="text-[11px] tracking-[0.28em] uppercase text-gold font-sans font-normal">Our Mission</h2>
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

function MapSection({ chapters }: { chapters: Awaited<ReturnType<typeof getActiveChapters>> }) {
  return (
    <section className="bg-cream border-t border-border/60">
      <div className="container-icc py-16 md:py-24">
        <div className="max-w-2xl">
          <Eyebrow>Global Network</Eyebrow>
          <h2 className="mt-4 font-display text-3xl md:text-5xl text-foreground">
            ICC Around the World
          </h2>
          <p className="mt-4 text-muted-foreground max-w-prose">
            Explore our growing network of chapters and hospitality professionals.
          </p>
        </div>
        <div className="mt-10">
          <ChaptersMap chapters={chapters} height={520} />
        </div>
        <div className="mt-8">
          <Link
            to="/chapters"
            className="inline-flex items-center gap-3 bg-forest text-cream px-7 py-4 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest-deep transition-colors"
          >
            Explore Chapters <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CHAPTERS ---------------- */
function Chapters({ chapters }: { chapters: Awaited<ReturnType<typeof getActiveChapters>> }) {
  const featured = chapters.filter((c: { featured?: boolean }) => c.featured).slice(0, 6);
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
          {featured.map((c: { slug: string; city: string; country: string; hero_image?: string | null }) => {
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
