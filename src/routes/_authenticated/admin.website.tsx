import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/website")({
  component: WebsiteSettings,
});

const TABS = [
  { to: "/admin/website/hero", label: "Hero" },
  { to: "/admin/website/banner", label: "Banner" },
  { to: "/admin/website/gallery", label: "Gallery" },
  { to: "/admin/website/featured", label: "Featured Images" },
  { to: "/admin/website/chapters", label: "Chapters / Map" },
  { to: "/admin/website/nav", label: "Header Links" },
  { to: "/admin/website/footer", label: "Footer" },
  { to: "/admin/website/contact", label: "Contact" },
] as const;

function WebsiteSettings() {
  return (
    <div>
      <p className="eyebrow">Configure</p>
      <h1 className="mt-2 font-display text-3xl">Website Settings</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xl">
        Edit every public-facing surface of the website. Changes appear immediately after saving.
      </p>
      <div className="mt-8 -mx-2 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to as never}
            className="px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-muted-foreground hover:text-forest"
            activeProps={{ className: "px-3 py-2 text-[11px] tracking-[0.22em] uppercase text-forest border-b-2 border-gold -mb-px" }}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}