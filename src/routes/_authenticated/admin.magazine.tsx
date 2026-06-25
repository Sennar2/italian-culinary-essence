import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListIssues, adminSaveIssue, adminDeleteIssue } from "@/lib/api/media-content.functions";

export const Route = createFileRoute("/_authenticated/admin/magazine")({
  component: () => (
    <CrudShell
      title="ICC Gusto issues"
      eyebrow="Magazine"
      queryKey="magazine"
      listFn={adminListIssues}
      saveFn={adminSaveIssue}
      deleteFn={adminDeleteIssue}
      columns={[
        { key: "title", label: "Title" },
        { key: "issue_date", label: "Issue", render: (v) => v ? new Date(String(v)).toLocaleDateString("en-GB") : "—" },
        { key: "public_preview", label: "Preview", render: (v) => v ? "Yes" : "—" },
        { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
      ]}
      fields={[
        { name: "title", label: "Issue title", required: true, full: true },
        { name: "slug", label: "Slug", required: true },
        { name: "issue_date", label: "Issue date", type: "datetime" },
        { name: "description", label: "Description", type: "textarea", full: true, rows: 4 },
        { name: "cover_url", label: "Cover image", type: "image", folder: "magazine", full: true },
        { name: "public_preview", label: "Public preview enabled", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      defaults={{ title: "", slug: "", published: true }}
    />
  ),
});