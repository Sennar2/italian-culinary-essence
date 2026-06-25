import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListModules, adminSaveModule, adminDeleteModule, adminListLessons, adminSaveLesson, adminDeleteLesson } from "@/lib/api/academy.functions";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/academy-modules")({
  component: AcademyModulesPage,
});

function AcademyModulesPage() {
  const [openLessonsFor, setOpenLessonsFor] = useState<{ id: string; title: string } | null>(null);
  return (
    <div className="space-y-10">
      <CrudShell
        title="Academy modules"
        eyebrow="Academy"
        queryKey="academy-modules"
        listFn={adminListModules}
        saveFn={adminSaveModule}
        deleteFn={adminDeleteModule}
        columns={[
          { key: "title", label: "Title" },
          { key: "category", label: "Category" },
          { key: "duration_minutes", label: "Min" },
          { key: "certificate_eligible", label: "Cert.", render: (v) => v ? "Yes" : "—" },
          { key: "published", label: "Live", render: (v) => v ? "Yes" : "—" },
          { key: "id", label: "Lessons", render: (id, r) => (
            <button onClick={() => setOpenLessonsFor({ id: String(id), title: String(r.title) })} className="text-forest hover:text-gold underline text-xs">
              Manage lessons
            </button>
          )},
        ]}
        fields={[
          { name: "title", label: "Title", required: true, full: true },
          { name: "slug", label: "Slug", required: true },
          { name: "category", label: "Category", type: "select", options: [
            "Italian Cuisine","Pizza","Pastry & Gelato","Wine & Mixology","Front of House","Restaurant Leadership","Food Safety","Hospitality Management"
          ].map((c) => ({ value: c, label: c })) },
          { name: "description", label: "Description", type: "textarea", full: true, rows: 4 },
          { name: "cover_url", label: "Cover image", type: "image", folder: "academy", full: true },
          { name: "duration_minutes", label: "Duration (min)", type: "number" },
          { name: "passing_score", label: "Passing score (%)", type: "number" },
          { name: "sort_order", label: "Sort order", type: "number" },
          { name: "certificate_eligible", label: "Certificate eligible", type: "checkbox" },
          { name: "published", label: "Published", type: "checkbox" },
        ]}
        defaults={{ title: "", slug: "", published: false, sort_order: 0, certificate_eligible: false }}
      />

      {openLessonsFor && (
        <LessonsModal moduleId={openLessonsFor.id} moduleTitle={openLessonsFor.title} onClose={() => setOpenLessonsFor(null)} />
      )}
    </div>
  );
}

function LessonsModal({ moduleId, moduleTitle, onClose }: { moduleId: string; moduleTitle: string; onClose: () => void }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListLessons);
  const saveFn = useServerFn(adminSaveLesson);
  const delFn = useServerFn(adminDeleteLesson);
  const { data, isLoading } = useQuery({ queryKey: ["admin-lessons", moduleId], queryFn: () => listFn({ data: { module_id: moduleId } }) });
  const [editing, setEditing] = useState<any>(null);

  const save = useMutation({
    mutationFn: (row: any) => {
      const cleaned: any = { ...row, module_id: moduleId };
      for (const k of Object.keys(cleaned)) if (cleaned[k] === "") cleaned[k] = null;
      if (!cleaned.id) delete cleaned.id;
      return saveFn({ data: cleaned });
    },
    onSuccess: () => { toast.success("Lesson saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-lessons", moduleId] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-lessons", moduleId] }); },
  });

  const cls = "input";
  return (
    <div className="fixed inset-0 z-50 bg-forest/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Lessons</p>
            <h2 className="mt-1 font-display text-2xl">{moduleTitle}</h2>
          </div>
          <button onClick={() => setEditing({ kind: "video", sort_order: ((data as any[])?.length ?? 0) + 1 })} className="inline-flex items-center gap-2 bg-forest text-cream px-4 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep"><Plus className="h-4 w-4" /> New lesson</button>
        </div>

        <div className="mt-6 border border-border bg-card">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && ((data as any[])?.length ?? 0) === 0 && <p className="p-4 text-sm text-muted-foreground">No lessons yet.</p>}
          {(data as any[])?.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between p-3 border-b border-border">
              <div className="text-sm"><span className="text-[10px] tracking-[0.2em] uppercase text-gold mr-2">{l.kind}</span>{l.title}</div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(l)} className="text-forest hover:text-gold"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => confirm("Delete lesson?") && del.mutate(l.id)} className="text-destructive hover:opacity-80"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-border pt-6">
            <Label label="Title *"><input className={cls} required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Label>
            <Label label="Kind"><select className={cls} value={editing.kind ?? "video"} onChange={(e) => setEditing({ ...editing, kind: e.target.value })}>
              <option value="video">Video</option><option value="pdf">PDF</option><option value="scorm">SCORM</option><option value="text">Text</option>
            </select></Label>
            <Label label="Sort order"><input className={cls} type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Label>
            {editing.kind === "video" && <Label label="Video URL" full><input className={cls} value={editing.video_url ?? ""} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} /></Label>}
            {editing.kind === "pdf" && <Label label="PDF URL" full><input className={cls} value={editing.pdf_url ?? ""} onChange={(e) => setEditing({ ...editing, pdf_url: e.target.value })} /></Label>}
            {editing.kind === "scorm" && (<>
              <Label label="SCORM launch URL (e.g. /scorm/course/index.html)" full><input className={cls} value={editing.scorm_launch_url ?? ""} onChange={(e) => setEditing({ ...editing, scorm_launch_url: e.target.value })} /></Label>
              <Label label="SCORM package path (storage)" full><input className={cls} value={editing.scorm_package_path ?? ""} onChange={(e) => setEditing({ ...editing, scorm_package_path: e.target.value })} /></Label>
            </>)}
            {editing.kind === "text" && <Label label="Body" full><textarea rows={6} className={cls + " resize-none"} value={editing.body ?? ""} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></Label>}
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" disabled={save.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">{save.isPending ? "Saving…" : "Save lesson"}</button>
            </div>
          </form>
        )}
        <div className="mt-6 text-right">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
      </div>
      <style>{`.input{width:100%;background:var(--color-cream);border:1px solid var(--color-border);padding:.6rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--color-gold)}`}</style>
    </div>
  );
}
function Label({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={`flex flex-col gap-1 text-[11px] tracking-[0.22em] uppercase text-muted-foreground ${full ? "sm:col-span-2" : ""}`}>{label}<span className="block text-foreground normal-case tracking-normal">{children}</span></label>;
}