import { createFileRoute } from "@tanstack/react-router";
import { CrudShell } from "@/components/admin/CrudShell";
import { adminListTiers, adminSaveTier, adminDeleteTier } from "@/lib/api/tiers.functions";

export const Route = createFileRoute("/_authenticated/admin/tiers")({
  component: () => (
    <CrudShell
      title="Membership tiers"
      eyebrow="Membership"
      queryKey="tiers"
      listFn={adminListTiers}
      saveFn={adminSaveTier}
      deleteFn={adminDeleteTier}
      columns={[
        { key: "name", label: "Tier" },
        { key: "billing_frequency", label: "Billing" },
        { key: "price_cents", label: "Price", render: (v, r) => v ? `${(r.currency as string) || "EUR"} ${((v as number) / 100).toFixed(0)}` : "Enquiry" },
        { key: "featured", label: "Featured", render: (v) => v ? "★" : "" },
        { key: "active", label: "Active", render: (v) => v ? "Yes" : "—" },
        { key: "sort_order", label: "Order" },
      ]}
      fields={[
        { name: "name", label: "Tier name", required: true },
        { name: "slug", label: "Slug", required: true },
        { name: "billing_frequency", label: "Billing", type: "select", required: true, options: [
          { value: "monthly", label: "Monthly" }, { value: "yearly", label: "Yearly" },
          { value: "one_off", label: "One-off" }, { value: "on_enquiry", label: "On enquiry" },
        ]},
        { name: "price_cents", label: "Price (in cents)", type: "number" },
        { name: "currency", label: "Currency", placeholder: "EUR" },
        { name: "access_level", label: "Access level", type: "number" },
        { name: "description", label: "Description", type: "textarea", full: true, rows: 3 },
        { name: "benefits_text", label: "Benefits (one per line)", type: "textarea", full: true, rows: 6 },
        { name: "payment_link", label: "Payment link (Stripe / PayPal / external)", type: "url", full: true },
        { name: "cta_label", label: "CTA label", placeholder: "Join now" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured tier", type: "checkbox" },
        { name: "active", label: "Active", type: "checkbox" },
      ]}
      defaults={{ name: "", slug: "", billing_frequency: "yearly", currency: "EUR", active: true, sort_order: 0 }}
      transformIn={(row: Record<string, unknown>) => ({ ...row, benefits_text: Array.isArray((row as Record<string, unknown>).benefits) ? ((row as Record<string, unknown>).benefits as string[]).join("\n") : "" })}
      transformOut={(row: Record<string, unknown>) => {
        const benefits = String((row as any).benefits_text ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
        const { benefits_text, ...rest } = row as any;
        void benefits_text;
        return { ...rest, benefits };
      }}
    />
  ),
});