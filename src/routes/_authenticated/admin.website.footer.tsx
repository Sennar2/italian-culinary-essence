import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetSettings, adminSaveSettings } from "@/lib/api/admin-content.functions";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/website/footer")({
  component: FooterEditor,
});

const FIELDS: { key: string; label: string; type?: "text" | "textarea" | "url" }[] = [
  { key: "footer_description", label: "Footer description", type: "textarea" },
  { key: "footer_copyright", label: "Copyright text" },
  { key: "instagram_url", label: "Instagram URL", type: "url" },
  { key: "facebook_url", label: "Facebook URL", type: "url" },
  { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { key: "youtube_url", label: "YouTube URL", type: "url" },
  { key: "x_url", label: "X / Twitter URL", type: "url" },
  { key: "credit_label", label: "Credit label" },
  { key: "credit_url", label: "Credit URL", type: "url" },
];

function FooterEditor() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSettings);
  const saveFn = useServerFn(adminSaveSettings);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => getFn() });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const f of FIELDS) next[f.key] = String((data as Record<string, unknown>)[f.key] ?? "");
    setForm(next);
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { data: { ...((data as Record<string, unknown>) ?? {}), ...form } } }),
    onSuccess: () => {
      toast.success("Footer saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-4 sm:grid-cols-2 max-w-3xl">
      {FIELDS.map((f) => (
        <label key={f.key} className={`flex flex-col gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground ${f.type === "textarea" ? "sm:col-span-2" : ""}`}>
          {f.label}
          <span className="text-foreground normal-case tracking-normal">
            {f.type === "textarea" ? (
              <textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-cream border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none" />
            ) : (
              <input type={f.type ?? "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-cream border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold" />
            )}
          </span>
        </label>
      ))}
      <div className="sm:col-span-2 flex justify-end">
        <button type="submit" disabled={save.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">
          {save.isPending ? "Saving…" : "Save footer"}
        </button>
      </div>
    </form>
  );
}