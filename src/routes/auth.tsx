import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ICC International" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.invalidate();
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/admin" });
    if (result.error) toast.error(result.error.message ?? "Google sign-in failed");
    if (result.redirected) return;
    router.invalidate();
    navigate({ to: "/admin" });
  }

  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-cream py-16">
      <div className="w-full max-w-sm border border-border bg-card p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-6 font-display text-2xl text-center">{mode === "signin" ? "Sign in" : "Create account"}</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Administration area</p>

        <button onClick={onGoogle} className="mt-6 w-full border border-border py-3 text-sm hover:bg-secondary">
          Continue with Google
        </button>
        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex-1 h-px bg-border" />or<span className="flex-1 h-px bg-border" />
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
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