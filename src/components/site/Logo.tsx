import { Link } from "@tanstack/react-router";

export function Logo({ variant = "dark", compact = false }: { variant?: "dark" | "light"; compact?: boolean }) {
  const isDark = variant === "dark";
  return (
    <Link to="/" className="flex items-center gap-3 group" aria-label="ICC International — home">
      <span
        aria-hidden
        className="relative inline-flex items-center justify-center"
        style={{ width: 44, height: 44 }}
      >
        <svg viewBox="0 0 44 44" className="absolute inset-0">
          <circle cx="22" cy="22" r="20.5" fill="none" stroke="var(--color-gold)" strokeWidth="1" />
          <circle cx="22" cy="22" r="17" fill="none" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.5" />
        </svg>
        <span className="font-display text-[15px] font-semibold tracking-tight" style={{ color: "var(--color-gold)" }}>
          ICC
        </span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-[13px] font-medium tracking-[0.18em] uppercase ${isDark ? "text-foreground" : "text-cream"}`}>
            Italian Culinary
          </span>
          <span className={`font-display text-[13px] font-medium tracking-[0.18em] uppercase ${isDark ? "text-foreground" : "text-cream"}`}>
            Consortium
          </span>
          <span className="mt-0.5 text-[9px] tracking-[0.32em] uppercase" style={{ color: "var(--color-gold)" }}>
            International
          </span>
        </span>
      )}
    </Link>
  );
}