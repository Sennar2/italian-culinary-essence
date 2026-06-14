import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListEvents, adminSaveEvents, adminDeleteEvents } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: () => (
    <CrudShell
      title="Events"
      queryKey="events"
      listFn={adminListEvents}
      saveFn={adminSaveEvents}
      deleteFn={adminDeleteEvents}
      columns={[
        { key: "title", label: "Title" },
        { key: "city", label: "City" },
        { key: "starts_at", label: "Starts", render: (v) => v ? new Date(String(v)).toLocaleDateString() : "—" },
        { key: "status", label: "Status" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "status", label: "Status", type: "select", options: [
          { value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }, { value: "cancelled", label: "Cancelled" },
        ]},
        { name: "city", label: "City" },
        { name: "country", label: "Country" },
        { name: "starts_at", label: "Starts at", type: "datetime" },
        { name: "ends_at", label: "Ends at", type: "datetime" },
        { name: "cover", label: "Cover URL", type: "url", full: true },
        { name: "registration_url", label: "Registration URL", type: "url", full: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", full: true, rows: 2 },
        { name: "body", label: "Body", type: "textarea", full: true, rows: 6 },
        { name: "featured", label: "Featured", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", status: "upcoming", featured: false, published: true }}
    />
  ),
});