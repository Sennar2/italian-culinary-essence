import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useServerFn } from "@tanstack/react-start";
import { meIsAdmin } from "@/lib/api/admin.functions";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ICC International" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    intent: typeof s.intent === "string" ? s.intent : undefined,
    tier: typeof s.tier === "string" ? s.tier : undefined,
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(search.intent === "join" ? "signup" : "signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdminFn = useServerFn(meIsAdmin);

  async function routeAfterAuth() {
    try {
      const res = await isAdminFn();
      navigate({ to: res.isAdmin ? "/admin" : "/portal", replace: true });
    } catch {
      navigate({ to: "/portal", replace: true });
    }
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) routeAfterAuth();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/portal",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.invalidate();
        await routeAfterAuth();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
    if (result.redirected) return;
    router.invalidate();
    await routeAfterAuth();
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-cream py-16">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 font-display text-2xl text-center">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">{mode === "signup" ? "Become an ICC member" : "Members & administration"}</p>

        <button onClick={onGoogle} className="mt-6 w-full border border-border py-3 text-sm hover:bg-secondary">
          Continue with Google
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" />or<span className="flex-1 h-px bg-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" maxLength={160}
              className="w-full bg-cream border border-border px-4 py-3 text-sm focus:outline-none focus:border-gold" />
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full bg-cream border border-border px-4 py-3 text-sm focus:outline-none focus:border-gold" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={8}
            className="w-full bg-cream border border-border px-4 py-3 text-sm focus:outline-none focus:border-gold" />
          <button type="submit" disabled={loading} className="w-full bg-forest text-cream py-3 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-forest-deep disabled:opacity-60">
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-xs text-muted-foreground hover:text-forest">
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </section>
  );
}