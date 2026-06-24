import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListNav, adminSaveNav, adminDeleteNav } from "@/lib/api/website.functions";

export const Route = createFileRoute("/_authenticated/admin/website/nav")({
  component: () => (
    <CrudShell
      title="Navigation links"
      eyebrow="Header & footer"
      queryKey="nav-links"
      listFn={adminListNav}
      saveFn={adminSaveNav}
      deleteFn={adminDeleteNav}
      columns={[
        { key: "location", label: "Where" },
        { key: "label", label: "Label" },
        { key: "url", label: "URL" },
        { key: "sort_order", label: "Order" },
        { key: "external", label: "External", render: (v) => v ? "↗" : "—" },
        { key: "active", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "label", label: "Label", required: true },
        { name: "url", label: "URL", required: true, placeholder: "/about or https://…" },
        { name: "location", label: "Location", type: "select", required: true, options: [
          { value: "header", label: "Header" },
          { value: "footer_quick", label: "Footer — Quick links" },
          { value: "footer_programme", label: "Footer — Programmes" },
          { value: "footer_legal", label: "Footer — Legal" },
          { value: "footer_social", label: "Footer — Social" },
        ]},
        { name: "social_platform", label: "Social platform", placeholder: "instagram / facebook / linkedin / youtube / x" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "external", label: "External link", type: "checkbox" },
        { name: "active", label: "Active", type: "checkbox" },
      ]}
      defaults={{ label: "", url: "", location: "header", sort_order: 0, external: false, active: true }}
    />
  ),
});