import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-2 font-display text-3xl">Welcome to the Consortium admin</h1>
      <p className="mt-3 text-muted-foreground max-w-xl">
        From here you can manage international chapters and review enquiries from the public website.
        Future iterations of this dashboard will add leadership, events, news, initiatives, partners and a full media library.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/chapters" className="block border border-border bg-card p-6 hover:border-gold">
          <p className="font-display text-xl">International Chapters</p>
          <p className="mt-2 text-sm text-muted-foreground">Add, edit and order chapter cities and chapter presidents.</p>
        </Link>
        <Link to="/admin/enquiries" className="block border border-border bg-card p-6 hover:border-gold">
          <p className="font-display text-xl">Enquiries</p>
          <p className="mt-2 text-sm text-muted-foreground">Newsletter signups, contact submissions and membership enquiries.</p>
        </Link>
      </div>
    </div>
  );
}