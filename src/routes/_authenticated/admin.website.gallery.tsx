import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListGallery, adminSaveGallery, adminDeleteGallery } from "@/lib/api/website.functions";

export const Route = createFileRoute("/_authenticated/admin/website/gallery")({
  component: () => (
    <CrudShell
      title="Gallery"
      eyebrow="Manage gallery"
      queryKey="gallery"
      listFn={adminListGallery}
      saveFn={adminSaveGallery}
      deleteFn={adminDeleteGallery}
      columns={[
        { key: "image_url", label: "Preview", render: (v) => v ? <img src={String(v)} alt="" className="h-12 w-16 object-cover" /> : "—" },
        { key: "title", label: "Title" },
        { key: "caption", label: "Caption" },
        { key: "sort_order", label: "Order" },
        { key: "featured", label: "Featured", render: (v) => v ? "Yes" : "—" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "image_url", label: "Image", type: "image", folder: "gallery", required: true, full: true },
        { name: "title", label: "Title", full: true },
        { name: "caption", label: "Caption", type: "textarea", full: true, rows: 2 },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ image_url: "", sort_order: 0, featured: false, published: true }}
    />
  ),
});