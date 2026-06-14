import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListPartners, adminSavePartners, adminDeletePartners } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/partners")({
  component: () => (
    <CrudShell
      title="Partners"
      queryKey="partners"
      listFn={adminListPartners}
      saveFn={adminSavePartners}
      deleteFn={adminDeletePartners}
      columns={[
        { key: "name", label: "Name" },
        { key: "tier", label: "Tier" },
        { key: "url", label: "Website" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true, full: true },
        { name: "tier", label: "Tier", type: "select", options: [
          { value: "founding", label: "Founding" }, { value: "platinum", label: "Platinum" },
          { value: "gold", label: "Gold" }, { value: "silver", label: "Silver" }, { value: "media", label: "Media" },
        ]},
        { name: "url", label: "Website URL", type: "url" },
        { name: "logo_url", label: "Logo URL", type: "url", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ name: "", sort_order: 0, published: true }}
    />
  ),
});