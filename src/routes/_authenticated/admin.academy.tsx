import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListAcademy, adminSaveAcademy, adminDeleteAcademy } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/academy")({
  component: () => (
    <CrudShell
      title="Academy"
      queryKey="academy"
      listFn={adminListAcademy}
      saveFn={adminSaveAcademy}
      deleteFn={adminDeleteAcademy}
      columns={[
        { key: "title", label: "Title" },
        { key: "item_type", label: "Type" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "item_type", label: "Type", required: true, type: "select", options: [
          { value: "course", label: "Course" }, { value: "masterclass", label: "Masterclass" },
          { value: "certification", label: "Certification" }, { value: "publication", label: "Publication" },
        ]},
        { name: "cta_url", label: "CTA URL", type: "url" },
        { name: "cover", label: "Cover URL", type: "url", full: true },
        { name: "summary", label: "Summary", type: "textarea", full: true, rows: 2 },
        { name: "body", label: "Body", type: "textarea", full: true, rows: 6 },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", item_type: "course", sort_order: 0, published: true }}
    />
  ),
});