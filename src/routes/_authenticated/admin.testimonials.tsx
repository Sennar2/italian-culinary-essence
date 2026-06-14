import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListTestimonials, adminSaveTestimonials, adminDeleteTestimonials } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  component: () => (
    <CrudShell
      title="Testimonials"
      queryKey="testimonials"
      listFn={adminListTestimonials}
      saveFn={adminSaveTestimonials}
      deleteFn={adminDeleteTestimonials}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role" },
        { key: "country", label: "Country" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "role", label: "Role" },
        { name: "country", label: "Country" },
        { name: "portrait", label: "Portrait URL", type: "url", full: true },
        { name: "video_url", label: "Video URL", type: "url", full: true },
        { name: "quote", label: "Quote", type: "textarea", full: true, rows: 4, required: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ name: "", quote: "", sort_order: 0, published: true }}
    />
  ),
});