import { Link } from "@tanstack/react-router";
import iccLogo from "@/assets/icc-logo.svg.asset.json";

export function Logo({
  variant = "dark",
  className = "",
  height = 48,
}: {
  variant?: "dark" | "light";
  compact?: boolean;
  className?: string;
  height?: number;
}) {
  const isLight = variant === "light";
  return (
    <Link
      to="/"
      aria-label="Italian Culinary Consortium International — home"
      className={`inline-flex items-center shrink-0 ${className}`}
    >
      <img
        src={iccLogo.url}
        alt="Italian Culinary Consortium International"
        style={{ height, width: "auto" }}
        className={`block w-auto object-contain ${isLight ? "brightness-0 invert" : ""}`}
        draggable={false}
      />
    </Link>
  );
}