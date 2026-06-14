import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListLeadership, adminSaveLeadership, adminDeleteLeadership } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/leadership")({
  component: () => (
    <CrudShell
      title="Leadership"
      queryKey="leadership"
      listFn={adminListLeadership}
      saveFn={adminSaveLeadership}
      deleteFn={adminDeleteLeadership}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "country", label: "Country" },
        { key: "published", label: "Live", render: (v) => (v ? "Yes" : "—") },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "role", label: "Role", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "region", label: "Region" },
        { name: "country", label: "Country" },
        { name: "portrait", label: "Portrait URL", type: "url", full: true },
        { name: "bio", label: "Biography", type: "textarea", full: true, rows: 5 },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ name: "", role: "", slug: "", sort_order: 0, published: true }}
    />
  ),
});