import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyMember, updateMyProfile } from "@/lib/api/members.functions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  component: Profile,
});

function Profile() {
  const qc = useQueryClient();
  const fn = useServerFn(getMyMember);
  const save = useServerFn(updateMyProfile);
  const { data } = useQuery({ queryKey: ["my-member"], queryFn: () => fn() });
  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm({ full_name: (data as any).full_name ?? "", phone: (data as any).phone ?? "", country: (data as any).country ?? "", city: (data as any).city ?? "", profession: (data as any).profession ?? "", company: (data as any).company ?? "" }); }, [data]);
  const mut = useMutation({
    mutationFn: (d: any) => save({ data: d }),
    onSuccess: () => { toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["my-member"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const cls = "w-full bg-cream border border-border px-4 py-3 text-sm focus:outline-none focus:border-gold";
  return (
    <div className="max-w-2xl">
      <p className="eyebrow">Profile</p>
      <h1 className="mt-2 font-display text-3xl">Your details</h1>
      <p className="mt-2 text-sm text-muted-foreground">Email: {(data as any)?.email}</p>
      <form onSubmit={(e) => { e.preventDefault(); mut.mutate(form); }} className="mt-8 grid gap-4 sm:grid-cols-2">
        <Field label="Full name"><input className={cls} value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
        <Field label="Phone"><input className={cls} value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
        <Field label="Country"><input className={cls} value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="City"><input className={cls} value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Profession"><input className={cls} value={form.profession ?? ""} onChange={(e) => setForm({ ...form, profession: e.target.value })} /></Field>
        <Field label="Company"><input className={cls} value={form.company ?? ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field>
        <div className="sm:col-span-2">
          <button disabled={mut.isPending} className="bg-forest text-cream px-6 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep disabled:opacity-60">{mut.isPending ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1 text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{label}<span className="block text-foreground normal-case tracking-normal">{children}</span></label>;
}