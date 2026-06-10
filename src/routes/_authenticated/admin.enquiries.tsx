import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminListEnquiries } from "@/lib/api/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  component: AdminEnquiries,
});

function AdminEnquiries() {
  const fn = useServerFn(adminListEnquiries);
  const { data, isLoading } = useQuery({ queryKey: ["admin","enquiries"], queryFn: () => fn() });

  return (
    <div className="space-y-12">
      <div>
        <p className="eyebrow">Inbox</p>
        <h1 className="mt-2 font-display text-3xl">Enquiries</h1>
      </div>
      {isLoading && <p className="text-muted-foreground">Loading…</p>}
      {data && (
        <>
          <Block title="Membership enquiries" rows={data.membership} cols={["created_at","name","email","tier","country","organisation","message"]} />
          <Block title="Contact messages" rows={data.contact} cols={["created_at","name","email","department","message"]} />
          <Block title="Newsletter subscribers" rows={data.newsletter} cols={["created_at","email","locale"]} />
        </>
      )}
    </div>
  );
}

function Block({ title, rows, cols }: { title: string; rows: Record<string, unknown>[]; cols: string[] }) {
  return (
    <section>
      <h2 className="font-display text-xl mb-3">{title} <span className="text-sm text-muted-foreground">({rows.length})</span></h2>
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] tracking-[0.18em] uppercase">
            <tr>{cols.map((c) => <th key={c} className="px-3 py-2">{c.replace("_"," ")}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={cols.length} className="px-3 py-4 text-muted-foreground">No entries.</td></tr>}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                {cols.map((c) => (
                  <td key={c} className="px-3 py-2">
                    {c === "created_at" && r[c] ? new Date(String(r[c])).toLocaleString() : String(r[c] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}