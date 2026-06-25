import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyMember } from "@/lib/api/members.functions";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/membership")({
  component: MyMembership,
});

function MyMembership() {
  const fn = useServerFn(getMyMember);
  const { data, isLoading } = useQuery({ queryKey: ["my-member"], queryFn: () => fn() });
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const m: any = data;
  const tier = m?.membership_tiers;
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Your membership</p>
        <h1 className="mt-2 font-display text-3xl">{tier?.name || "Membership pending"}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card label="Status"><p className="font-medium capitalize">{m?.status}</p></Card>
        <Card label="Member since"><p className="font-medium">{m?.join_date ? new Date(m.join_date).toLocaleDateString("en-GB") : "—"}</p></Card>
        <Card label="Renewal date"><p className="font-medium">{m?.renewal_date ? new Date(m.renewal_date).toLocaleDateString("en-GB") : "—"}</p></Card>
        <Card label="Payment status"><p className="font-medium">{m?.payment_status || "—"}</p></Card>
      </div>
      {tier && (
        <div className="border border-border bg-card p-6">
          <p className="eyebrow">Benefits</p>
          <ul className="mt-4 space-y-2 text-sm">
            {(tier.benefits ?? []).map((b: string) => (
              <li key={b} className="flex gap-2"><Check className="h-4 w-4 text-gold mt-0.5 shrink-0" /> {b}</li>
            ))}
          </ul>
          {tier.payment_link && (
            <a href={tier.payment_link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block bg-forest text-cream px-5 py-3 text-[11px] tracking-[0.22em] uppercase hover:bg-forest-deep">
              Renew / manage payment
            </a>
          )}
        </div>
      )}
    </div>
  );
}
function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{label}</p>
      <div className="mt-2 text-foreground">{children}</div>
    </div>
  );
}