import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search, Facebook, Instagram, Linkedin, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "About", to: "/about" as const },
  { label: "Chapters", to: "/chapters" as const },
  { label: "Leadership", to: "/leadership" as const },
  { label: "Academy", to: "/academy" as const },
  { label: "Initiatives", to: "/initiatives" as const },
  { label: "Events", to: "/events" as const },
  { label: "News", to: "/news" as const },
  { label: "Membership", to: "/membership" as const },
  { label: "Partners", to: "/partners" as const },
  { label: "Contact", to: "/contact" as const },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          <a href="#" aria-label="Facebook" className="hover:text-forest"><Facebook className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="Instagram" className="hover:text-forest"><Instagram className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="LinkedIn" className="hover:text-forest"><Linkedin className="h-3.5 w-3.5" /></a>
          <a href="#" aria-label="YouTube" className="hover:text-forest"><Youtube className="h-3.5 w-3.5" /></a>
          <span className="h-3 w-px bg-border" aria-hidden />
          <button type="button" className="hover:text-forest">EN</button>
          <button type="button" className="hover:text-forest" aria-label="Search"><Search className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="container-icc flex items-center justify-between gap-6 py-4 lg:py-5">
        <Logo />
        <nav className="hidden xl:flex items-center gap-7 text-[12px] tracking-[0.16em] uppercase">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-foreground/80 hover:text-forest transition-colors"
              activeProps={{ className: "text-forest" }}
            >
              {n.label}
            </Link>
          ))}
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
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-[13px] tracking-[0.16em] uppercase text-foreground/80 border-b border-border/60 last:border-b-0"
              >
                {n.label}
              </Link>
            ))}
            <Button asChild className="mt-4 bg-gold text-forest hover:bg-gold/90 rounded-none py-5 text-[12px] tracking-[0.22em] uppercase font-medium h-auto">
              <Link to="/membership" onClick={() => setOpen(false)}>Become a Member</Link>
            </Button>
            <div className="mt-4 flex items-center gap-5 py-2 text-muted-foreground">
              <a href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>
              <a href="#" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}