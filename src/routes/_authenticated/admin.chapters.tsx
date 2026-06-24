import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminListChapters, adminSaveChapter, adminDeleteChapter } from "@/lib/api/admin.functions";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/chapters")({
  component: AdminChapters,
});

type Row = {
  id?: string;
  slug: string;
  city: string;
  country: string;
  region?: string | null;
  president?: string | null;
  email?: string | null;
  contact_email?: string | null;
  address?: string | null;
  phone?: string | null;
  lat?: number | null;
  lng?: number | null;
  hero_image?: string | null;
  summary?: string | null;
  featured?: boolean;
  sort_order?: number;
  published?: boolean;
  active?: boolean;
};

const empty: Row = { slug: "", city: "", country: "", region: "", featured: false, published: true, active: true, sort_order: 0 };

function AdminChapters() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListChapters);
  const saveFn = useServerFn(adminSaveChapter);
  const delFn = useServerFn(adminDeleteChapter);
  const { data, isLoading } = useQuery({ queryKey: ["admin","chapters"], queryFn: () => listFn() });
  const [editing, setEditing] = useState<Row | null>(null);

  const save = useMutation({
    mutationFn: (row: Row) => saveFn({ data: row }),
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin","chapters"] }); qc.invalidateQueries({ queryKey: ["chapters"] }); qc.invalidateQueries({ queryKey: ["home-content"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin","chapters"] }); qc.invalidateQueries({ queryKey: ["chapters"] }); qc.invalidateQueries({ queryKey: ["home-content"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Manage</p>
          <h1 className="mt-2 font-display text-3xl">International Chapters</h1>
        </div>
        <button onClick={() => setEditing(empty)} className="inline-flex items-center gap-2 bg-forest text-cream px-4 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
          <Plus className="h-4 w-4" /> Add chapter
        </button>
      </div>

      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] tracking-[0.22em] uppercase">
            <tr><th className="px-4 py-3">City</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Region</th><th className="px-4 py-3">President</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {data?.map((r: Row) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.city}</td>
                <td className="px-4 py-3">{r.country}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.region}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.president}</td>
                <td className="px-4 py-3">{r.featured ? "Yes" : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(r)} className="inline-flex items-center gap-1 text-forest hover:text-gold mr-3"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => r.id && confirm("Delete this chapter?") && remove.mutate(r.id)} className="inline-flex items-center gap-1 text-destructive hover:opacity-80"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-forest/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-cream max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">{editing.id ? "Edit" : "New"} chapter</p>
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
              className="mt-4 grid gap-4 sm:grid-cols-2"
            >
              <Field label="City *"><input required value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="input" /></Field>
              <Field label="Country *"><input required value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} className="input" /></Field>
              <Field label="Slug *"><input required value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="input" /></Field>
              <Field label="Region"><input value={editing.region ?? ""} onChange={(e) => setEditing({ ...editing, region: e.target.value })} className="input" /></Field>
              <Field label="President"><input value={editing.president ?? ""} onChange={(e) => setEditing({ ...editing, president: e.target.value })} className="input" /></Field>
              <Field label="Email"><input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className="input" /></Field>
              <Field label="Contact email"><input type="email" value={editing.contact_email ?? ""} onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })} className="input" /></Field>
              <Field label="Address" className="sm:col-span-2"><input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="input" /></Field>
              <Field label="Latitude"><input type="number" step="0.0001" value={editing.lat ?? ""} onChange={(e) => setEditing({ ...editing, lat: e.target.value === "" ? null : Number(e.target.value) })} className="input" /></Field>
              <Field label="Longitude"><input type="number" step="0.0001" value={editing.lng ?? ""} onChange={(e) => setEditing({ ...editing, lng: e.target.value === "" ? null : Number(e.target.value) })} className="input" /></Field>
              <div className="sm:col-span-2">
                <ImageUploader value={editing.hero_image ?? null} onChange={(v) => setEditing({ ...editing, hero_image: v })} folder="chapters" label="Chapter hero image" />
              </div>
              <Field label="Summary" className="sm:col-span-2"><textarea rows={3} value={editing.summary ?? ""} onChange={(e) => setEditing({ ...editing, summary: e.target.value })} className="input resize-none" /></Field>
              <Field label="Sort order"><input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} className="input" /></Field>
              <label className="flex items-center gap-2 text-sm self-end pb-2"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured on homepage</label>
              <label className="flex items-center gap-2 text-sm self-end pb-2"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active (shown on map)</label>
              <label className="flex items-center gap-2 text-sm self-end pb-2"><input type="checkbox" checked={editing.published !== false} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>

              <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={save.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">
                  {save.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;background:var(--color-cream);border:1px solid var(--color-border);padding:.6rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--color-gold)}`}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground ${className ?? ""}`}>
      {label}
      <span className="block text-foreground normal-case tracking-normal">{children}</span>
    </label>
  );
}