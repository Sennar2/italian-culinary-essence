import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";

export type ChapterPin = {
  slug: string;
  city: string;
  country: string;
  president?: string | null;
  email?: string | null;
  contact_email?: string | null;
  address?: string | null;
  lat?: number | string | null;
  lng?: number | string | null;
};

type Props = {
  chapters: ChapterPin[];
  height?: number;
};

// Leaflet touches `window` at import time — load only on the client.
const ClientMap = lazy(() => import("./ChaptersMap.client"));

export function ChaptersMap({ chapters, height = 460 }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pins = chapters.filter((c) => c.lat != null && c.lng != null && !Number.isNaN(Number(c.lat)) && !Number.isNaN(Number(c.lng)));

  if (pins.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center text-center bg-forest text-cream border border-cream/10"
        style={{ minHeight: height }}
      >
        <MapPin className="h-8 w-8 text-gold" />
        <p className="mt-4 font-display text-2xl">Chapters coming soon</p>
        <p className="mt-2 max-w-sm text-sm text-cream/70">
          The Consortium is expanding its global network. Check back soon for our first chapters.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden border border-border bg-cream" style={{ height }}>
      {mounted ? (
        <Suspense fallback={<MapSkeleton height={height} />}>
          <ClientMap chapters={pins} />
        </Suspense>
      ) : (
        <MapSkeleton height={height} />
      )}
    </div>
  );
}

function MapSkeleton({ height }: { height: number }) {
  return (
    <div className="w-full bg-secondary animate-pulse" style={{ height }} aria-hidden />
  );
}

// Re-exported helpers used by the popup
export function ChapterPopupBody({ c }: { c: ChapterPin }) {
  const email = c.email || c.contact_email;
  return (
    <div className="font-sans">
      <p className="text-[10px] tracking-[0.22em] uppercase text-gold">{c.country}</p>
      <p className="mt-1 font-display text-base text-forest">{c.city}</p>
      {c.president && <p className="mt-1 text-xs text-muted-foreground">President — {c.president}</p>}
      {email && (
        <p className="mt-2 text-xs flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-gold" />
          <a href={`mailto:${email}`} className="text-forest hover:text-gold">{email}</a>
        </p>
      )}
      <Link
        to="/chapters/$slug"
        params={{ slug: c.slug }}
        className="mt-3 inline-block text-[10px] tracking-[0.22em] uppercase text-forest hover:text-gold"
      >
        Visit chapter →
      </Link>
    </div>
  );
}