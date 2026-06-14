import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListNews, adminSaveNews, adminDeleteNews } from "@/lib/api/admin-content.functions";

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: () => (
    <CrudShell
      title="News & Editorial"
      queryKey="news"
      listFn={adminListNews}
      saveFn={adminSaveNews}
      deleteFn={adminDeleteNews}
      columns={[
        { key: "title", label: "Title" },
        { key: "category", label: "Category" },
        { key: "author", label: "Author" },
        { key: "published_at", label: "Date", render: (v) => v ? new Date(String(v)).toLocaleDateString() : "—" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "category", label: "Category" },
        { name: "author", label: "Author" },
        { name: "published_at", label: "Publish at", type: "datetime" },
        { name: "cover", label: "Cover URL", type: "url", full: true },
        { name: "excerpt", label: "Excerpt", type: "textarea", full: true, rows: 2 },
        { name: "body", label: "Body (markdown)", type: "textarea", full: true, rows: 10 },
        { name: "featured", label: "Featured", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", featured: false, published: true }}
    />
  ),
});