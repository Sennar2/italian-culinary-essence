import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/website/chapters")({
  component: () => (
    <div className="border border-border bg-card p-6">
      <p className="eyebrow">Chapters & World Map</p>
      <h2 className="mt-2 font-display text-2xl">Edit chapters in the dedicated section</h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-xl">
        The world map renders every chapter marked <strong>Active</strong> with valid latitude and longitude.
        Manage chapter cards, addresses, contacts and pins below.
      </p>
      <Link to="/admin/chapters" className="mt-5 inline-block bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
        Open chapters manager
      </Link>
    </div>
  ),
});