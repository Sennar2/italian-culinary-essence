import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] tracking-[0.28em] uppercase font-medium text-gold", className)}>
      {children}
    </p>
  );
}

export function FlagRule({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block w-16 h-[2px]", className)}
      style={{
        background:
          "linear-gradient(to right, var(--color-it-green) 0 33%, var(--color-it-white) 33% 66%, var(--color-it-red) 66% 100%)",
      }}
    />
  );
}