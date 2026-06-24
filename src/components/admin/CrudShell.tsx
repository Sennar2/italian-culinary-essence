import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "datetime" | "email" | "url" | "select" | "image";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  full?: boolean;
  rows?: number;
  folder?: string;
};

export type ColumnDef = { key: string; label: string; render?: (v: unknown, row: Record<string, unknown>) => React.ReactNode };

type Props = {
  title: string;
  eyebrow?: string;
  queryKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listFn: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  saveFn: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deleteFn: any;
  columns: ColumnDef[];
  fields: FieldDef[];
  defaults: Record<string, unknown>;
};

export function CrudShell({ title, eyebrow = "Manage", queryKey, listFn, saveFn, deleteFn, columns, fields, defaults }: Props) {
  const qc = useQueryClient();
  const list = useServerFn(listFn);
  const save = useServerFn(saveFn);
  const del = useServerFn(deleteFn);
  const { data, isLoading } = useQuery({ queryKey: ["admin", queryKey], queryFn: () => list() });
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", queryKey] });
    qc.invalidateQueries({ queryKey: [queryKey] });
    qc.invalidateQueries({ queryKey: ["home-content"] });
  };

  const saveMut = useMutation({
    mutationFn: (row: Record<string, unknown>) => {
      const cleaned: Record<string, unknown> = {};
      for (const k of Object.keys(row)) {
        const v = row[k];
        if (v === "") cleaned[k] = null;
        else cleaned[k] = v;
      }
      if (!cleaned.id) delete cleaned.id;
      return save({ data: cleaned });
    },
    onSuccess: () => { toast.success("Saved"); setEditing(null); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl">{title}</h1>
        </div>
        <button onClick={() => setEditing({ ...defaults })} className="inline-flex items-center gap-2 bg-forest text-cream px-4 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] tracking-[0.22em] uppercase">
            <tr>
              {columns.map((c) => <th key={c.key} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {!isLoading && (data?.length ?? 0) === 0 && <tr><td colSpan={columns.length + 1} className="px-4 py-6 text-muted-foreground">No entries yet.</td></tr>}
            {data?.map((r: Record<string, unknown>) => (
              <tr key={String(r.id)} className="border-t border-border">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-top">
                    {c.render ? c.render(r[c.key], r) : String(r[c.key] ?? "")}
                  </td>
                ))}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(r)} className="text-forest hover:text-gold mr-3"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => r.id && confirm("Delete this entry?") && delMut.mutate(String(r.id))} className="text-destructive hover:opacity-80"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-forest/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-cream max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <p className="eyebrow">{editing.id ? "Edit" : "New"} entry</p>
            <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(editing); }} className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <FieldEl key={f.name} f={f} value={editing[f.name]} onChange={(v) => setEditing({ ...editing, [f.name]: v })} />
              ))}
              <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={saveMut.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">
                  {saveMut.isPending ? "Saving…" : "Save"}
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

function FieldEl({ f, value, onChange }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const full = f.full || f.type === "textarea";
  const cls = `flex flex-col gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground ${full ? "sm:col-span-2" : ""}`;
  if (f.type === "checkbox") {
    return (
      <label className={`${cls} flex-row items-center self-end pb-2 normal-case tracking-normal text-sm text-foreground`}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} /> {f.label}
      </label>
    );
  }
  if (f.type === "image") {
    return (
      <div className={`${full ? "sm:col-span-2" : ""}`}>
        <ImageUploader value={(value as string | null) ?? null} onChange={(v) => onChange(v)} folder={f.folder ?? "uploads"} label={f.label} />
      </div>
    );
  }
  let input: React.ReactNode = null;
  const v = value ?? "";
  if (f.type === "textarea") {
    input = <textarea rows={f.rows ?? 4} value={String(v)} onChange={(e) => onChange(e.target.value)} className="input resize-none" placeholder={f.placeholder} />;
  } else if (f.type === "select") {
    input = (
      <select value={String(v)} onChange={(e) => onChange(e.target.value)} className="input">
        <option value="">—</option>
        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  } else if (f.type === "number") {
    input = <input type="number" value={v === null ? "" : String(v)} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} className="input" required={f.required} />;
  } else if (f.type === "datetime") {
    const local = v ? new Date(String(v)).toISOString().slice(0, 16) : "";
    input = <input type="datetime-local" value={local} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} className="input" />;
  } else {
    input = <input type={f.type ?? "text"} value={String(v)} onChange={(e) => onChange(e.target.value)} className="input" required={f.required} placeholder={f.placeholder} />;
  }
  return (
    <label className={cls}>
      {f.label}{f.required && " *"}
      <span className="block text-foreground normal-case tracking-normal">{input}</span>
    </label>
  );
}