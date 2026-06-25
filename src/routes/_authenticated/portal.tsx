import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyMember } from "@/lib/api/members.functions";
import { Logo } from "@/components/site/Logo";
import { LayoutDashboard, GraduationCap, Newspaper, BookOpen, Headphones, Calendar, User, IdCard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  component: PortalLayout,
});

function PortalLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fn = useServerFn(getMyMember);
  const { data: member } = useQuery({ queryKey: ["my-member"], queryFn: () => fn() });

  async function onSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const tier = (member as any)?.membership_tiers?.name as string | undefined;
  const status = (member as any)?.status as string | undefined;

  return (
    <div className="min-h-dvh flex flex-col bg-cream">
      <header className="bg-forest text-cream border-b border-cream/10">
        <div className="container-icc flex items-center justify-between py-4">
          <Logo variant="light" />
          <div className="flex items-center gap-4 text-sm">
            {tier && <span className="hidden sm:inline text-gold text-[11px] tracking-[0.22em] uppercase">{tier}</span>}
            <Link to="/" className="text-cream/70 hover:text-gold">View site</Link>
            <button onClick={onSignOut} className="text-cream/70 hover:text-gold">Sign out</button>
          </div>
        </div>
      </header>
      {status && status !== "active" && (
        <div className="bg-gold/15 border-b border-gold/40">
          <div className="container-icc py-3 text-sm text-forest">
            Your membership is <strong className="font-semibold capitalize">{status}</strong>. Some content may be limited until activation.
            <Link to="/portal/membership" className="ml-3 underline">View membership</Link>
          </div>
        </div>
      )}
      <div className="flex-1 container-icc py-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1 text-sm">
          <p className="eyebrow mb-3">Member portal</p>
          <NavItem to="/portal" icon={<LayoutDashboard className="h-4 w-4" />} exact>Dashboard</NavItem>
          <NavItem to="/portal/membership" icon={<IdCard className="h-4 w-4" />}>My membership</NavItem>
          <NavItem to="/portal/academy" icon={<GraduationCap className="h-4 w-4" />}>Academy</NavItem>
          <NavItem to="/portal/news" icon={<Newspaper className="h-4 w-4" />}>News</NavItem>
          <NavItem to="/portal/magazine" icon={<BookOpen className="h-4 w-4" />}>ICC Gusto</NavItem>
          <NavItem to="/portal/podcasts" icon={<Headphones className="h-4 w-4" />}>Podcasts</NavItem>
          <NavItem to="/portal/events" icon={<Calendar className="h-4 w-4" />}>Events</NavItem>
          <NavItem to="/portal/profile" icon={<User className="h-4 w-4" />}>Profile</NavItem>
        </aside>
        <main><Outlet /></main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, children, exact }: { to: string; icon: React.ReactNode; children: React.ReactNode; exact?: boolean }) {
  return (
    <Link
      to={to as never}
      className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-secondary"
      activeProps={{ className: "flex items-center gap-2 px-3 py-2 bg-forest text-cream" }}
      activeOptions={{ exact: !!exact }}
    >
      {icon}
      {children}
    </Link>
  );
}