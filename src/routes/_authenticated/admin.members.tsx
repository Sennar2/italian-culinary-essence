import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListMembers, adminSaveMember, adminSendMemberReset, adminMemberProgress } from "@/lib/api/members.functions";
import { adminListTiers } from "@/lib/api/tiers.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, KeyRound, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/members")({ component: MembersAdmin });

function MembersAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminListMembers);
  const tiersFn = useServerFn(adminListTiers);
  const saveFn = useServerFn(adminSaveMember);
  const resetFn = useServerFn(adminSendMemberReset);

  const { data: members, isLoading } = useQuery({ queryKey: ["admin-members"], queryFn: () => listFn() });
  const { data: tiers } = useQuery({ queryKey: ["admin-tiers"], queryFn: () => tiersFn() });
  const [editing, setEditing] = useState<any>(null);
  const [progressOf, setProgressOf] = useState<any>(null);

  const save = useMutation({
    mutationFn: (row: any) => saveFn({ data: row }),
    onSuccess: () => { toast.success("Saved"); setEditing(null); qc.invalidateQueries({ queryKey: ["admin-members"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const reset = useMutation({
    mutationFn: (email: string) => resetFn({ data: { email } }),
    onSuccess: () => toast.success("Password reset link generated"),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div>
      <p className="eyebrow">Membership</p>
      <h1 className="mt-2 font-display text-3xl">Members</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage individual member accounts, tiers and status.</p>

      <div className="mt-8 border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] tracking-[0.22em] uppercase">
            <tr>
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th><th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Renewal</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">Loading…</td></tr>}
            {!isLoading && (members ?? []).length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-muted-foreground">No members yet.</td></tr>}
            {(members ?? []).map((m: any) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3">{m.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3">{m.membership_tiers?.name || "—"}</td>
                <td className="px-4 py-3 capitalize">{m.status}</td>
                <td className="px-4 py-3">{m.renewal_date ? new Date(m.renewal_date).toLocaleDateString("en-GB") : "—"}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => setProgressOf(m)} className="text-forest hover:text-gold mr-3" title="Progress"><GraduationCap className="h-4 w-4" /></button>
                  <button onClick={() => m.email && reset.mutate(m.email)} className="text-forest hover:text-gold mr-3" title="Reset password"><KeyRound className="h-4 w-4" /></button>
                  <button onClick={() => setEditing(m)} className="text-forest hover:text-gold" title="Edit"><Pencil className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.full_name || editing.email}>
          <form onSubmit={(e) => { e.preventDefault(); save.mutate({
            id: editing.id,
            full_name: editing.full_name ?? null,
            phone: editing.phone ?? null,
            country: editing.country ?? null,
            city: editing.city ?? null,
            profession: editing.profession ?? null,
            company: editing.company ?? null,
            tier_id: editing.tier_id || null,
            status: editing.status,
            renewal_date: editing.renewal_date || null,
            payment_status: editing.payment_status ?? null,
            payment_reference: editing.payment_reference ?? null,
            internal_notes: editing.internal_notes ?? null,
          }); }} className="grid gap-4 sm:grid-cols-2">
            <F label="Full name"><input className="input" value={editing.full_name ?? ""} onChange={(e) => setEditing({ ...editing, full_name: e.target.value })} /></F>
            <F label="Phone"><input className="input" value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></F>
            <F label="Country"><input className="input" value={editing.country ?? ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></F>
            <F label="City"><input className="input" value={editing.city ?? ""} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></F>
            <F label="Profession"><input className="input" value={editing.profession ?? ""} onChange={(e) => setEditing({ ...editing, profession: e.target.value })} /></F>
            <F label="Company"><input className="input" value={editing.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></F>
            <F label="Tier"><select className="input" value={editing.tier_id ?? ""} onChange={(e) => setEditing({ ...editing, tier_id: e.target.value })}>
              <option value="">—</option>
              {(tiers ?? []).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select></F>
            <F label="Status"><select className="input" value={editing.status ?? "pending"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
              {["pending","active","suspended","expired"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select></F>
            <F label="Renewal date"><input type="date" className="input" value={editing.renewal_date ? String(editing.renewal_date).slice(0,10) : ""} onChange={(e) => setEditing({ ...editing, renewal_date: e.target.value || null })} /></F>
            <F label="Payment status"><input className="input" value={editing.payment_status ?? ""} onChange={(e) => setEditing({ ...editing, payment_status: e.target.value })} /></F>
            <F label="Payment reference" full><input className="input" value={editing.payment_reference ?? ""} onChange={(e) => setEditing({ ...editing, payment_reference: e.target.value })} /></F>
            <F label="Internal notes" full><textarea rows={4} className="input resize-none" value={editing.internal_notes ?? ""} onChange={(e) => setEditing({ ...editing, internal_notes: e.target.value })} /></F>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className="text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" disabled={save.isPending} className="bg-forest text-cream px-5 py-2 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">{save.isPending ? "Saving…" : "Save"}</button>
            </div>
          </form>
        </Modal>
      )}

      {progressOf && <ProgressModal member={progressOf} onClose={() => setProgressOf(null)} />}
      <style>{`.input{width:100%;background:var(--color-cream);border:1px solid var(--color-border);padding:.6rem .75rem;font-size:.875rem;outline:none}.input:focus{border-color:var(--color-gold)}`}</style>
    </div>
  );
}

function ProgressModal({ member, onClose }: { member: any; onClose: () => void }) {
  const fn = useServerFn(adminMemberProgress);
  const { data, isLoading } = useQuery({ queryKey: ["admin-member-progress", member.id], queryFn: () => fn({ data: { member_id: member.id } }) });
  return (
    <Modal onClose={onClose} title={`Progress · ${member.full_name || member.email}`}>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {data && (
        <div className="space-y-6">
          <section>
            <p className="eyebrow mb-2">Course progress</p>
            {(data as any).progress.length === 0 ? <p className="text-sm text-muted-foreground">No activity yet.</p> : (
              <ul className="divide-y divide-border border border-border">
                {(data as any).progress.map((p: any) => (
                  <li key={p.id} className="p-3 text-sm flex justify-between">
                    <span>{p.academy_modules?.title ?? "?"} · <span className="text-muted-foreground">{p.academy_lessons?.title ?? "?"}</span></span>
                    <span className="capitalize">{p.status}{p.score != null ? ` · ${p.score}` : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <p className="eyebrow mb-2">Certificates</p>
            {(data as any).certificates.length === 0 ? <p className="text-sm text-muted-foreground">No certificates issued.</p> : (
              <ul className="divide-y divide-border border border-border">
                {(data as any).certificates.map((c: any) => (
                  <li key={c.id} className="p-3 text-sm flex justify-between">
                    <span>{c.academy_modules?.title}</span>
                    <span className="text-muted-foreground">{c.certificate_number} · {new Date(c.issued_at).toLocaleDateString("en-GB")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </Modal>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-forest/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function F({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return <label className={`flex flex-col gap-1 text-[11px] tracking-[0.22em] uppercase text-muted-foreground ${full ? "sm:col-span-2" : ""}`}>{label}<span className="block text-foreground normal-case tracking-normal">{children}</span></label>;
}