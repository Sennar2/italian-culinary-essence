import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, Twitter, MapPin, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNavLinks, getSiteSettings } from "@/lib/api/website-public.functions";
import { NewsletterForm } from "./NewsletterForm";
import iccLogo from "@/assets/icc-logo.svg.asset.json";

type NavRow = { label: string; url: string; location: string; external: boolean; social_platform?: string | null; sort_order: number };

const FALLBACK_QUICK = [
  { label: "About ICC", url: "/about", external: false },
  { label: "Leadership", url: "/leadership", external: false },
  { label: "Chapters", url: "/chapters", external: false },
  { label: "Membership", url: "/membership", external: false },
  { label: "Contact", url: "/contact", external: false },
];
const FALLBACK_PROG = [
  { label: "Academy", url: "/academy", external: false },
  { label: "Initiatives", url: "/initiatives", external: false },
  { label: "Events", url: "/events", external: false },
  { label: "News & Media", url: "/news", external: false },
  { label: "Partners", url: "/partners", external: false },
];
const FALLBACK_LEGAL = [
  { label: "Privacy", url: "/privacy", external: false },
  { label: "Cookies", url: "/cookies", external: false },
  { label: "Terms", url: "/terms", external: false },
];

export function SiteFooter() {
  const navFn = useServerFn(getNavLinks);
  const setFn = useServerFn(getSiteSettings);
  const { data: navRows } = useQuery({ queryKey: ["nav-links"], queryFn: () => navFn() });
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: () => setFn() });
  const all = (navRows as NavRow[] | undefined) ?? [];
  const pick = (loc: string, fallback: { label: string; url: string; external: boolean }[]) => {
    const r = all.filter((n) => n.location === loc);
    return r.length > 0 ? r.map((n) => ({ label: n.label, url: n.url, external: n.external })) : fallback;
  };
  const quick = pick("footer_quick", FALLBACK_QUICK);
  const programmes = pick("footer_programme", FALLBACK_PROG);
  const legal = pick("footer_legal", FALLBACK_LEGAL);
  const socials = all.filter((n) => n.location === "footer_social");

  const description = settings?.footer_description?.trim() || "Celebrating Italian Excellence Worldwide.";
  const copyright = settings?.footer_copyright?.trim()
    || `© ${new Date().getFullYear()} Italian Culinary Consortium. All rights reserved.`;
  const creditLabel = settings?.credit_label?.trim() || "Website designed & developed by Honeysuckles Design";
  const creditUrl = settings?.credit_url?.trim() || "https://honeysucklesdesign.uk";

  const contactItems: { icon: typeof MapPin; text: string; href?: string }[] = [];
  if (settings?.contact_address?.trim()) contactItems.push({ icon: MapPin, text: settings.contact_address });
  if (settings?.contact_email?.trim()) contactItems.push({ icon: Mail, text: settings.contact_email, href: `mailto:${settings.contact_email}` });
  if (settings?.contact_phone?.trim()) contactItems.push({ icon: Phone, text: settings.contact_phone, href: `tel:${settings.contact_phone.replace(/\s+/g, "")}` });

  const settingsSocials = [
    { platform: "facebook", url: settings?.facebook_url },
    { platform: "instagram", url: settings?.instagram_url },
    { platform: "linkedin", url: settings?.linkedin_url },
    { platform: "youtube", url: settings?.youtube_url },
    { platform: "x", url: settings?.x_url },
  ].filter((s) => s.url?.trim());

  const socialList = socials.length > 0
    ? socials.map((s) => ({ url: s.url, platform: s.social_platform ?? s.label }))
    : settingsSocials.map((s) => ({ url: s.url!, platform: s.platform }));

  return (
    <footer className="bg-forest text-cream">
      {/* Newsletter band */}
      <div className="border-b border-cream/10">
        <div className="container-icc grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow !text-gold">Stay Connected</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-cream">
              Join our global community
            </h2>
            <p className="mt-3 max-w-md text-sm text-cream/70">
              Subscribe to receive news, events and initiatives from the Consortium and its chapters around the world.
            </p>
          </div>
          <NewsletterForm variant="dark" />
        </div>
      </div>

      <div className="container-icc grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" aria-label="ICC International — home" className="inline-flex">
            <img
              src={iccLogo.url}
              alt="Italian Culinary Consortium International"
              className="block h-12 w-auto brightness-0 invert"
              draggable={false}
            />
          </Link>
          <p className="mt-5 text-sm text-cream/70 max-w-xs">{description}</p>
          <div className="mt-6 flex items-center gap-4 text-cream/70">
            {socialList.map((s) => (
              <a key={s.platform + s.url} href={s.url} aria-label={s.platform} target="_blank" rel="noopener noreferrer" className="hover:text-gold">
                <SocialIcon platform={s.platform} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Quick Links" items={quick} />
        <FooterCol title="Programmes" items={programmes} />

        <div>
          <p className="eyebrow !text-gold">Contact</p>
          {contactItems.length > 0 ? (
            <ul className="mt-4 space-y-3 text-sm text-cream/80">
              {contactItems.map((c, i) => {
                const Icon = c.icon;
                const inner = <><Icon className="h-4 w-4 mt-0.5 text-gold shrink-0" /> <span>{c.text}</span></>;
                return (
                  <li key={i} className="flex gap-3">
                    {c.href ? <a href={c.href} className="flex gap-3 hover:text-gold">{inner}</a> : inner}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-cream/60">Add contact details from the admin portal.</p>
          )}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-icc flex flex-col gap-4 py-6 text-[11px] tracking-[0.16em] uppercase text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>{copyright}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legal.map((l) => (
              l.external || /^https?:/i.test(l.url)
                ? <a key={l.label} href={l.url} className="hover:text-gold" target="_blank" rel="noopener noreferrer">{l.label}</a>
                : <Link key={l.label} to={l.url as never} className="hover:text-gold">{l.label}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-forest-deep">
        <div className="container-icc py-4 text-center text-[10px] tracking-[0.32em] uppercase text-cream/50">
          <a href={creditUrl} target="_blank" rel="noopener noreferrer" className="text-cream/60 hover:text-gold">
            {creditLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; url: string; external: boolean }[] }) {
  return (
    <div>
      <p className="eyebrow !text-gold">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label + i.url}>
            {i.external || /^https?:/i.test(i.url)
              ? <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-cream/80 hover:text-gold transition-colors">{i.label}</a>
              : <Link to={i.url as never} className="text-cream/80 hover:text-gold transition-colors">{i.label}</Link>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ platform, className }: { platform: string; className?: string }) {
  const p = platform.toLowerCase();
  if (p === "facebook") return <Facebook className={className} />;
  if (p === "instagram") return <Instagram className={className} />;
  if (p === "linkedin") return <Linkedin className={className} />;
  if (p === "youtube") return <Youtube className={className} />;
  if (p === "x" || p === "twitter") return <Twitter className={className} />;
  return null;
}