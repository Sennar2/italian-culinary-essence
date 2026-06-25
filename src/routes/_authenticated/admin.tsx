import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { meIsAdmin, claimFirstAdmin } from "@/lib/api/admin.functions";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdminFn = useServerFn(meIsAdmin);
  const claimFn = useServerFn(claimFirstAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["me-is-admin"], queryFn: () => isAdminFn() });

  async function onSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function onClaim() {
    try {
      const res = await claimFn();
      if (res.granted) {
        toast.success("You are now the admin.");
        queryClient.invalidateQueries({ queryKey: ["me-is-admin"] });
      } else {
        toast.error(res.reason ?? "Could not grant admin");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      <header className="bg-forest text-cream border-b border-cream/10">
        <div className="container-icc flex items-center justify-between py-4">
          <Logo variant="light" />
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="text-cream/70 hover:text-gold">View site</Link>
            <button onClick={onSignOut} className="text-cream/70 hover:text-gold">Sign out</button>
          </div>
        </div>
      </header>
      <div className="flex-1 container-icc py-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1 text-sm">
          <p className="eyebrow mb-3">Overview</p>
          <SideLink to="/admin">Dashboard</SideLink>

          <p className="eyebrow mt-6 mb-3">Website</p>
          <SideLink to="/admin/website/hero">Hero</SideLink>
          <SideLink to="/admin/website/banner">Banner</SideLink>
          <SideLink to="/admin/website/gallery">Gallery</SideLink>
          <SideLink to="/admin/website/featured">Featured images</SideLink>
          <SideLink to="/admin/website/nav">Navigation</SideLink>
          <SideLink to="/admin/website/footer">Footer</SideLink>
          <SideLink to="/admin/website/contact">Contact details</SideLink>

          <p className="eyebrow mt-6 mb-3">Content</p>
          <SideLink to="/admin/chapters">Chapters</SideLink>
          <SideLink to="/admin/leadership">Leadership</SideLink>
          <SideLink to="/admin/news">News</SideLink>
          <SideLink to="/admin/events">Events</SideLink>
          <SideLink to="/admin/initiatives">Initiatives</SideLink>
          <SideLink to="/admin/academy">Academy</SideLink>
          <SideLink to="/admin/academy-modules">Academy modules</SideLink>
          <SideLink to="/admin/magazine">ICC Gusto issues</SideLink>
          <SideLink to="/admin/podcasts">Podcasts</SideLink>
          <SideLink to="/admin/partners">Partners</SideLink>
          <SideLink to="/admin/testimonials">Testimonials</SideLink>

          <p className="eyebrow mt-6 mb-3">Membership</p>
          <SideLink to="/admin/members">Members</SideLink>
          <SideLink to="/admin/tiers">Membership tiers</SideLink>
          <SideLink to="/admin/access">Access control</SideLink>

          <p className="eyebrow mt-6 mb-3">System</p>
          <SideLink to="/admin/enquiries">Enquiries</SideLink>
          <SideLink to="/admin/settings">Site settings</SideLink>
        </aside>
        <main>
          {!isLoading && data && !data.isAdmin && (
            <div className="mb-6 border border-gold bg-cream p-5">
              <p className="text-sm">You're signed in but not yet an admin.</p>
              <button onClick={onClaim} className="mt-3 text-[11px] tracking-[0.22em] uppercase bg-forest text-cream px-4 py-2 hover:bg-forest-deep">
                Claim admin (first user only)
              </button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to as never}
      className="block px-3 py-2 text-foreground hover:bg-secondary"
      activeProps={{ className: "block px-3 py-2 bg-forest text-cream" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}