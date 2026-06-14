import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListInitiatives, adminSaveInitiatives, adminDeleteInitiatives } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/initiatives")({
  component: () => (
    <CrudShell
      title="Initiatives"
      queryKey="initiatives"
      listFn={adminListInitiatives}
      saveFn={adminSaveInitiatives}
      deleteFn={adminDeleteInitiatives}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "category", label: "Category", required: true },
        { name: "cover", label: "Cover URL", type: "url", full: true },
        { name: "summary", label: "Summary", type: "textarea", full: true, rows: 2 },
        { name: "body", label: "Body", type: "textarea", full: true, rows: 8 },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", category: "", sort_order: 0, published: true }}
    />
  ),
});