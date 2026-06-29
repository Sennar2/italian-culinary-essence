import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNavLinks, getSiteSettings } from "@/lib/api/website-public.functions";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";

type NavRow = {
  label: string;
  url: string;
  location: string;
  external: boolean;
  social_platform?: string | null;
  sort_order: number;
  in_more_menu?: boolean;
  is_cta?: boolean;
};

type NavItem = { label: string; url: string; external: boolean };

const FALLBACK_PRIMARY: NavItem[] = [
  { label: "About", url: "/about", external: false },
  { label: "Academy", url: "/academy", external: false },
  { label: "Events", url: "/events", external: false },
  { label: "Membership", url: "/membership", external: false },
];
const FALLBACK_MORE: NavItem[] = [
  { label: "Chapters", url: "/chapters", external: false },
  { label: "Leadership", url: "/leadership", external: false },
  { label: "Initiatives", url: "/initiatives", external: false },
  { label: "Gallery", url: "/gallery", external: false },
  { label: "News", url: "/news", external: false },
  { label: "Partners", url: "/partners", external: false },
  { label: "Contact", url: "/contact", external: false },
];
const FALLBACK_CTA: NavItem = { label: "Become a Member", url: "/membership", external: false };

const MAX_PRIMARY = 4;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navFn = useServerFn(getNavLinks);
  const setFn = useServerFn(getSiteSettings);
  const { data: navRows } = useQuery({ queryKey: ["nav-links"], queryFn: () => navFn() });
  useQuery({ queryKey: ["site-settings"], queryFn: () => setFn() });

  const headerRows = ((navRows as NavRow[] | undefined) ?? []).filter((n) => n.location === "header");

  let primary: NavItem[];
  let more: NavItem[];
  let cta: NavItem;
  if (headerRows.length === 0) {
    primary = FALLBACK_PRIMARY;
    more = FALLBACK_MORE;
    cta = FALLBACK_CTA;
  } else {
    const sorted = [...headerRows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const ctaRow = sorted.find((n) => n.is_cta);
    cta = ctaRow ? { label: ctaRow.label, url: ctaRow.url, external: ctaRow.external } : FALLBACK_CTA;
    const nonCta = sorted.filter((n) => !n.is_cta);
    const explicitPrimary = nonCta.filter((n) => !n.in_more_menu);
    const explicitMore = nonCta.filter((n) => n.in_more_menu);
    const overflow = explicitPrimary.slice(MAX_PRIMARY);
    primary = explicitPrimary.slice(0, MAX_PRIMARY).map((n) => ({ label: n.label, url: n.url, external: n.external }));
    more = [...overflow, ...explicitMore].map((n) => ({ label: n.label, url: n.url, external: n.external }));
  }

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-md border-b border-border"
          : "bg-cream/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container-icc grid grid-cols-[auto_1fr_auto] items-center gap-4 md:gap-8 h-16 md:h-20">
        <Logo height={44} className="md:[&_img]:!h-12" />

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8 min-w-0 text-[11px] tracking-[0.22em] uppercase font-medium">
          {primary.map((n) => <DesktopNavLink key={n.label + n.url} item={n} />)}
          {more.length > 0 && <MoreMenu items={more} />}
        </nav>
        <div className="lg:hidden" aria-hidden />

        <div className="flex items-center justify-end gap-2 shrink-0">
          <CtaButton item={cta} className="hidden md:inline-flex" />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center h-11 w-11 -mr-2 text-forest"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-cream">
          <nav className="container-icc flex flex-col py-2">
            {[...primary, ...more].map((n) => (
              <MobileNavLink key={n.label + n.url} item={n} onClick={() => setOpen(false)} />
            ))}
            <div className="py-4">
              <CtaButton item={cta} fullWidth onClick={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DesktopNavLink({ item }: { item: NavItem }) {
  const cls = "text-foreground/80 hover:text-forest transition-colors whitespace-nowrap";
  if (item.external || /^https?:\/\//i.test(item.url)) {
    return <a href={item.url} className={cls} target="_blank" rel="noopener noreferrer">{item.label}</a>;
  }
  return (
    <Link to={item.url as never} className={cls} activeProps={{ className: "text-forest whitespace-nowrap" }}>
      {item.label}
    </Link>
  );
}

function MobileNavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const cls = "py-3 text-[12px] tracking-[0.22em] uppercase text-foreground/80 border-b border-border/60";
  if (item.external || /^https?:\/\//i.test(item.url)) {
    return <a href={item.url} className={cls} target="_blank" rel="noopener noreferrer" onClick={onClick}>{item.label}</a>;
  }
  return (
    <Link to={item.url as never} className={cls} activeProps={{ className: `${cls} text-forest` }} onClick={onClick}>
      {item.label}
    </Link>
  );
}

function MoreMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 text-foreground/80 hover:text-forest transition-colors whitespace-nowrap"
      >
        More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-3 w-56 bg-cream border border-border shadow-[0_20px_40px_-20px_rgba(15,61,46,0.25)] py-2"
        >
          {items.map((n) => (
            <MoreItem key={n.label + n.url} item={n} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MoreItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const cls = "block px-4 py-2.5 text-[11px] tracking-[0.22em] uppercase text-foreground/80 hover:bg-secondary hover:text-forest";
  if (item.external || /^https?:\/\//i.test(item.url)) {
    return <a href={item.url} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>{item.label}</a>;
  }
  return <Link to={item.url as never} className={cls} activeProps={{ className: `${cls} text-forest` }} onClick={onClick}>{item.label}</Link>;
}

function CtaButton({ item, className = "", fullWidth = false, onClick }: { item: NavItem; className?: string; fullWidth?: boolean; onClick?: () => void }) {
  const cls = `${fullWidth ? "w-full justify-center" : ""} inline-flex items-center bg-gold text-forest hover:bg-gold/90 px-5 py-3 text-[11px] tracking-[0.22em] uppercase font-medium ${className}`;
  if (item.external || /^https?:\/\//i.test(item.url)) {
    return <a href={item.url} className={cls} target="_blank" rel="noopener noreferrer" onClick={onClick}>{item.label}</a>;
  }
  return <Link to={item.url as never} className={cls} onClick={onClick}>{item.label}</Link>;
}