import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Youtube, MapPin, Mail, Phone } from "lucide-react";
import { NewsletterForm } from "./NewsletterForm";

export function SiteFooter() {
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
          <Link to="/" className="inline-flex flex-col leading-tight">
            <span className="font-display text-xl text-cream">ICC International</span>
            <span className="mt-1 text-[10px] tracking-[0.32em] uppercase text-gold">Italian Culinary Consortium</span>
          </Link>
          <p className="mt-5 text-sm text-cream/70 max-w-xs">
            Safeguarding the authenticity of Italian culinary culture worldwide.
          </p>
          <div className="mt-6 flex items-center gap-4 text-cream/70">
            <a href="#" aria-label="Facebook" className="hover:text-gold"><Facebook className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-gold"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-gold"><Linkedin className="h-4 w-4" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-gold"><Youtube className="h-4 w-4" /></a>
          </div>
        </div>

        <FooterCol title="Quick Links" items={[
          { label: "About ICC", to: "/about" },
          { label: "Leadership", to: "/leadership" },
          { label: "Chapters", to: "/chapters" },
          { label: "Membership", to: "/membership" },
          { label: "Contact", to: "/contact" },
        ]} />

        <FooterCol title="Programmes" items={[
          { label: "Academy", to: "/academy" },
          { label: "Initiatives", to: "/initiatives" },
          { label: "Events", to: "/events" },
          { label: "News & Media", to: "/news" },
          { label: "Partners", to: "/partners" },
        ]} />

        <div>
          <p className="eyebrow !text-gold">Contact</p>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" /> Via di Villa Emiliani, 10 — 00197 Roma, Italy</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 text-gold shrink-0" /> info@icc-international.org</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 text-gold shrink-0" /> +39 06 1234 567</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-icc flex flex-col gap-4 py-6 text-[11px] tracking-[0.16em] uppercase text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} ICC International. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-gold">Privacy</a>
            <a href="#" className="hover:text-gold">Cookies</a>
            <a href="#" className="hover:text-gold">Terms</a>
            <a href="#" className="hover:text-gold">Accessibility</a>
          </div>
        </div>
      </div>

      <div className="bg-forest-deep">
        <div className="container-icc py-4 text-center text-[10px] tracking-[0.32em] uppercase text-cream/50">
          Designed &amp; developed by{" "}
          <a href="https://honeysucklesdesign.uk" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-soft">
            Honeysuckles Design
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="eyebrow !text-gold">{title}</p>
      <ul className="mt-4 space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-cream/80 hover:text-gold transition-colors">{i.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}