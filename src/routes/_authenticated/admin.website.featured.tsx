import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListFeatured, adminSaveFeatured } from "@/lib/api/website.functions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/website/featured")({
  component: FeaturedEditor,
});

const PAGE_LABELS: Record<string, string> = {
  home: "Homepage", about: "About", academy: "Academy", events: "Events",
  membership: "Membership", news: "News", partners: "Partners",
  leadership: "Leadership", chapters: "Chapters", contact: "Contact",
};

type Row = { page_key: string; image_url: string | null; alt: string | null };

function FeaturedEditor() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListFeatured);
  const saveFn = useServerFn(adminSaveFeatured);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "featured"], queryFn: () => listFn() });
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (data) setRows(data.map((r: { page_key: string; image_url: string | null; alt: string | null }) => ({ page_key: r.page_key, image_url: r.image_url, alt: r.alt })));
  }, [data]);

  const save = useMutation({
    mutationFn: (row: Row) => saveFn({ data: row }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "featured"] });
      qc.invalidateQueries({ queryKey: ["site-featured"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((r, idx) => (
        <div key={r.page_key} className="border border-border bg-card p-4">
          <p className="font-display text-lg">{PAGE_LABELS[r.page_key] ?? r.page_key}</p>
          <p className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mt-1">/{r.page_key === "home" ? "" : r.page_key}</p>
          <div className="mt-4">
            <ImageUploader
              value={r.image_url}
              onChange={(v) => {
                const next = [...rows]; next[idx] = { ...r, image_url: v }; setRows(next);
              }}
              folder={`featured/${r.page_key}`}
            />
          </div>
          <input
            value={r.alt ?? ""}
            onChange={(e) => { const next = [...rows]; next[idx] = { ...r, alt: e.target.value }; setRows(next); }}
            placeholder="Alt text"
            className="mt-3 w-full bg-cream border border-border px-3 py-2 text-xs focus:outline-none focus:border-gold"
          />
          <button
            onClick={() => save.mutate(r)}
            disabled={save.isPending}
            className="mt-3 w-full bg-forest text-cream px-3 py-2 text-[10px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60"
          >
            Save
          </button>
        </div>
      ))}
    </div>
  );
}