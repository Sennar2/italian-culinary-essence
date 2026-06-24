import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNavLinks, getSiteSettings } from "@/lib/api/website.functions";
import { useEffect, useState } from "react";
import { Menu, X, Search, Facebook, Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const FALLBACK_NAV: { label: string; url: string; external: boolean }[] = [
  { label: "About", url: "/about", external: false },
  { label: "Chapters", url: "/chapters", external: false },
  { label: "Leadership", url: "/leadership", external: false },
  { label: "Academy", url: "/academy", external: false },
  { label: "Initiatives", url: "/initiatives", external: false },
  { label: "Events", url: "/events", external: false },
  { label: "Gallery", url: "/gallery", external: false },
  { label: "News", url: "/news", external: false },
  { label: "Membership", url: "/membership", external: false },
  { label: "Partners", url: "/partners", external: false },
  { label: "Contact", url: "/contact", external: false },
];

type NavRow = { label: string; url: string; location: string; external: boolean; social_platform?: string | null; sort_order: number };

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navFn = useServerFn(getNavLinks);
  const setFn = useServerFn(getSiteSettings);
  const { data: navRows } = useQuery({ queryKey: ["nav-links"], queryFn: () => navFn() });
  const { data: settings } = useQuery({ queryKey: ["site-settings"], queryFn: () => setFn() });

  const headerLinks = (navRows as NavRow[] | undefined)?.filter((n) => n.location === "header");
  const nav = (headerLinks && headerLinks.length > 0) ? headerLinks.map((n) => ({ label: n.label, url: n.url, external: n.external })) : FALLBACK_NAV;

  const socials = (navRows as NavRow[] | undefined)?.filter((n) => n.location === "footer_social") ?? [];
  const settingsSocials = [
    { platform: "facebook", url: settings?.facebook_url },
    { platform: "instagram", url: settings?.instagram_url },
    { platform: "linkedin", url: settings?.linkedin_url },
    { platform: "youtube", url: settings?.youtube_url },
    { platform: "x", url: settings?.x_url },
  ].filter((s) => s.url);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]"
          : "bg-cream/80 backdrop-blur-sm"
      }`}
    >
      {/* Top utility bar (desktop) */}
      <div className="hidden lg:block border-b border-border/40">
        <div className="container-icc flex items-center justify-end gap-6 py-2 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
          <SocialRow size="sm" socials={socials} settingsSocials={settingsSocials} />
          <span className="h-3 w-px bg-border" aria-hidden />
          <button type="button" className="hover:text-forest">EN</button>
          <button type="button" className="hover:text-forest" aria-label="Search"><Search className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="container-icc flex items-center justify-between gap-6 py-4 lg:py-5">
        <Logo />
        <nav className="hidden xl:flex items-center gap-7 text-[12px] tracking-[0.16em] uppercase">
          {nav.map((n) => <NavItem key={n.label + n.url} item={n} />)}
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild className="hidden md:inline-flex bg-gold text-forest hover:bg-gold/90 rounded-none px-5 py-5 text-[11px] tracking-[0.22em] uppercase font-medium h-auto">
            <Link to="/membership">Become a Member</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="xl:hidden inline-flex items-center justify-center h-11 w-11 -mr-2 text-forest"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="xl:hidden border-t border-border bg-cream">
          <nav className="container-icc flex flex-col py-4">
            {nav.map((n) => (
              <NavItem key={n.label + n.url} item={n} mobile onClick={() => setOpen(false)} />
            ))}
            <Button asChild className="mt-4 bg-gold text-forest hover:bg-gold/90 rounded-none py-5 text-[12px] tracking-[0.22em] uppercase font-medium h-auto">
              <Link to="/membership" onClick={() => setOpen(false)}>Become a Member</Link>
            </Button>
            <div className="mt-4 flex items-center gap-5 py-2 text-muted-foreground">
              <SocialRow size="md" socials={socials} settingsSocials={settingsSocials} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavItem({ item, mobile, onClick }: { item: { label: string; url: string; external: boolean }; mobile?: boolean; onClick?: () => void }) {
  const cls = mobile
    ? "py-3 text-[13px] tracking-[0.16em] uppercase text-foreground/80 border-b border-border/60 last:border-b-0"
    : "text-foreground/80 hover:text-forest transition-colors";
  if (item.external || /^https?:\/\//i.test(item.url)) {
    return <a href={item.url} className={cls} target="_blank" rel="noopener noreferrer" onClick={onClick}>{item.label}</a>;
  }
  return (
    <Link to={item.url as never} className={cls} activeProps={{ className: mobile ? `${cls} text-forest` : "text-forest" }} onClick={onClick}>
      {item.label}
    </Link>
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

function SocialRow({ socials, settingsSocials, size }: {
  size: "sm" | "md";
  socials: NavRow[];
  settingsSocials: { platform: string; url?: string }[];
}) {
  const sz = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const list = socials.length > 0
    ? socials.map((s) => ({ url: s.url, platform: s.social_platform ?? s.label }))
    : settingsSocials.filter((s) => !!s.url).map((s) => ({ url: s.url!, platform: s.platform }));
  if (list.length === 0) return null;
  return (
    <>
      {list.map((s) => (
        <a key={s.platform + s.url} href={s.url} aria-label={s.platform} target="_blank" rel="noopener noreferrer" className="hover:text-forest hover:text-gold">
          <SocialIcon platform={s.platform} className={sz} />
        </a>
      ))}
    </>
  );
}