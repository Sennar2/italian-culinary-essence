import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/api/forms.functions";
import { toast } from "sonner";

export function NewsletterForm({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const subscribe = useServerFn(subscribeNewsletter);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await subscribe({ data: { email } });
      toast.success("Thank you — you're subscribed.");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe.");
    } finally {
      setLoading(false);
    }
  }

  const dark = variant === "dark";
  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col sm:flex-row gap-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        aria-label="Email address"
        className={
          dark
            ? "flex-1 bg-transparent border border-cream/30 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
            : "flex-1 bg-cream border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold"
        }
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-gold text-forest px-6 py-3 text-[11px] tracking-[0.22em] uppercase font-medium hover:bg-gold-soft transition-colors disabled:opacity-60"
      >
        {loading ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}