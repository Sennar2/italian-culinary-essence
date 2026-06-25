import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAccessMatrix, setAccess } from "@/lib/api/access.functions";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/access")({ component: AccessAdmin });

const TYPES = [
  { key: "module", label: "Academy modules" },
  { key: "news", label: "News posts" },
  { key: "magazine_issue", label: "ICC Gusto issues" },
  { key: "podcast", label: "Podcast episodes" },
  { key: "event", label: "Events" },
  { key: "article", label: "Magazine articles" },
] as const;

function AccessAdmin() {
  const [type, setType] = useState<string>("module");
  const qc = useQueryClient();
  const fn = useServerFn(getAccessMatrix);
  const saveFn = useServerFn(setAccess);
  const { data, isLoading } = useQuery({ queryKey: ["access-matrix", type], queryFn: () => fn({ data: { content_type: type } }) });

  const toggle = useMutation({
    mutationFn: (p: { content_id: string; tier_id: string; allowed: boolean }) =>
      saveFn({ data: { content_type: type, ...p } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["access-matrix", type] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const items = (data as any)?.items ?? [];
  const tiers = (data as any)?.tiers ?? [];
  const rules: { content_id: string; tier_id: string }[] = (data as any)?.rules ?? [];
  const allowed = new Set(rules.map((r) => `${r.content_id}:${r.tier_id}`));
  const hasAnyRule = (id: string) => rules.some((r) => r.content_id === id);

  return (
    <div>
      <p className="eyebrow">Membership</p>
      <h1 className="mt-2 font-display text-3xl">Access control</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
        For each content item, tick the membership tiers that may access it. Items with no ticks are open to all members.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)} className={`px-4 py-2 text-[11px] tracking-[0.22em] uppercase border ${type === t.key ? "bg-forest text-cream border-forest" : "border-border hover:border-gold"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-border bg-card overflow-x-auto">
        {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] tracking-[0.22em] uppercase">
              <tr>
                <th className="px-4 py-3">Item</th>
                {tiers.map((t: any) => <th key={t.id} className="px-3 py-3 text-center">{t.name}</th>)}
                <th className="px-3 py-3">Access</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={tiers.length + 2} className="px-4 py-6 text-muted-foreground">No items.</td></tr>}
              {items.map((it: any) => (
                <tr key={it.id} className="border-t border-border">
                  <td className="px-4 py-3">{it.label || "Untitled"}</td>
                  {tiers.map((t: any) => {
                    const key = `${it.id}:${t.id}`;
                    const on = allowed.has(key);
                    return (
                      <td key={t.id} className="px-3 py-3 text-center">
                        <input type="checkbox" checked={on} onChange={(e) => toggle.mutate({ content_id: it.id, tier_id: t.id, allowed: e.target.checked })} />
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-xs text-muted-foreground">{hasAnyRule(it.id) ? "Restricted" : "Open"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}