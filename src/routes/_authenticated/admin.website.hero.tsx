import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { adminGetSettings, adminSaveSettings } from "@/lib/api/admin-content.functions";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/website/hero")({
  component: HeroEditor,
});

const TEXT_FIELDS: { key: string; label: string; type?: "text" | "textarea" }[] = [
  { key: "hero_eyebrow", label: "Eyebrow (e.g. 2026)" },
  { key: "hero_title", label: "Hero title", type: "textarea" },
  { key: "hero_subtitle", label: "Hero subtitle", type: "textarea" },
  { key: "hero_cta_primary_label", label: "Primary CTA label" },
  { key: "hero_cta_primary_url", label: "Primary CTA link" },
  { key: "hero_cta_secondary_label", label: "Secondary CTA label" },
  { key: "hero_cta_secondary_url", label: "Secondary CTA link" },
];

function HeroEditor() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSettings);
  const saveFn = useServerFn(adminSaveSettings);
  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => getFn() });
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!data) return;
    const next: Record<string, string> = {};
    for (const f of TEXT_FIELDS) next[f.key] = String((data as Record<string, unknown>)[f.key] ?? "");
    next.hero_image = String((data as Record<string, unknown>).hero_image ?? "");
    next.hero_background_image = String((data as Record<string, unknown>).hero_background_image ?? "");
    setForm(next);
  }, [data]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { data: { ...((data as Record<string, unknown>) ?? {}), ...form } } }),
    onSuccess: () => {
      toast.success("Hero saved");
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
      qc.invalidateQueries({ queryKey: ["home-content"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="grid gap-4">
        {TEXT_FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {f.label}
            <span className="text-foreground normal-case tracking-normal">
              {f.type === "textarea" ? (
                <textarea rows={3} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-cream border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold resize-none" />
              ) : (
                <input value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-cream border border-border px-3 py-2 text-sm focus:outline-none focus:border-gold" />
              )}
            </span>
          </label>
        ))}
      </div>
      <div className="grid gap-6">
        <ImageUploader
          label="Hero featured image"
          value={form.hero_image || null}
          onChange={(v) => setForm({ ...form, hero_image: v ?? "" })}
          folder="hero"
          aspect="aspect-[4/3]"
        />
        <ImageUploader
          label="Hero background image (optional)"
          value={form.hero_background_image || null}
          onChange={(v) => setForm({ ...form, hero_background_image: v ?? "" })}
          folder="hero"
          aspect="aspect-video"
        />
      </div>
      <div className="lg:col-span-2 flex justify-end">
        <button type="submit" disabled={save.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">
          {save.isPending ? "Saving…" : "Save hero"}
        </button>
      </div>
    </form>
  );
}