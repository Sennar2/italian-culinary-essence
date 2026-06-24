import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListBanners, adminSaveBanner, adminDeleteBanner } from "@/lib/api/website.functions";

export const Route = createFileRoute("/_authenticated/admin/website/banner")({
  component: () => (
    <CrudShell
      title="Announcement banner"
      eyebrow="Manage banners"
      queryKey="banners"
      listFn={adminListBanners}
      saveFn={adminSaveBanner}
      deleteFn={adminDeleteBanner}
      columns={[
        { key: "title", label: "Title" },
        { key: "event_date", label: "Date", render: (v) => v ? new Date(String(v)).toLocaleString() : "—" },
        { key: "location", label: "Location" },
        { key: "enabled", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "subtitle", label: "Subtitle", full: true },
        { name: "event_date", label: "Date & time", type: "datetime" },
        { name: "location", label: "Location" },
        { name: "cta_label", label: "CTA label" },
        { name: "cta_url", label: "CTA link", type: "url" },
        { name: "image_url", label: "Banner image (optional)", type: "image", folder: "banners", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "enabled", label: "Enabled", type: "checkbox" },
      ]}
      defaults={{ title: "", enabled: false, sort_order: 0 }}
    />
  ),
});