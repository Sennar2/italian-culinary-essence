import { resolveImage } from "@/lib/chapter-images";
import { Link } from "@tanstack/react-router";

type ChapterPin = {
  slug: string;
  city: string;
  country: string;
  president?: string | null;
  lat?: number | null;
  lng?: number | null;
  hero_image?: string | null;
};

// Equirectangular projection on a 1000x500 viewport
function project(lng: number, lat: number) {
  return { x: (lng + 180) * (1000 / 360), y: (90 - lat) * (500 / 180) };
}

export function WorldMap({ chapters }: { chapters: ChapterPin[] }) {
  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-auto"
        role="img"
        aria-label="World map of ICC chapters"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="var(--color-gold)" opacity="0.45" />
          </pattern>
          <mask id="continentsMask">
            <rect width="1000" height="500" fill="black" />
            <g fill="white">
              {/* Stylised continent blobs — illustrative, decorative */}
              <ellipse cx="180" cy="200" rx="120" ry="80" />
              <ellipse cx="260" cy="340" rx="65" ry="110" />
              <ellipse cx="490" cy="180" rx="115" ry="65" />
              <ellipse cx="520" cy="350" rx="60" ry="95" />
              <ellipse cx="700" cy="220" rx="155" ry="105" />
              <ellipse cx="830" cy="380" rx="70" ry="50" />
            </g>
          </mask>
        </defs>
        <rect width="1000" height="500" fill="url(#dots)" mask="url(#continentsMask)" />

        {chapters.map((c) => {
          if (c.lat == null || c.lng == null) return null;
          const { x, y } = project(Number(c.lng), Number(c.lat));
          return (
            <g key={c.slug} className="group">
              <circle cx={x} cy={y} r="14" fill="var(--color-it-green)" opacity="0.18">
                <animate attributeName="r" values="6;14;6" dur="2.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.6s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="4" fill="var(--color-it-green)" stroke="var(--color-cream)" strokeWidth="1.5" />
              <title>{c.city}, {c.country}</title>
            </g>
          );
        })}
      </svg>

      {/* Pin list under map (mobile-friendly + a11y) */}
      <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
        {chapters.map((c) => (
          <li key={c.slug}>
            <Link to="/chapters/$slug" params={{ slug: c.slug }} className="group inline-flex items-baseline gap-2 hover:text-forest">
              <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-it-green" />
              <span className="font-medium text-foreground">{c.city}</span>
              <span className="text-muted-foreground text-xs">{c.country}</span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Hidden preload of hero images so the map page feels alive */}
      <div className="hidden">
        {chapters.map((c) => {
          const src = resolveImage(c.hero_image);
          return src ? <img key={c.slug} src={src} alt="" /> : null;
        })}
      </div>
    </div>
  );
}