import { Eyebrow, FlagRule } from "@/components/site/Eyebrow";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-cream border-b border-border/60">
      <div className="container-icc py-14 md:py-20 max-w-4xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-4 font-display text-4xl md:text-6xl text-foreground leading-[1.05]">{title}</h1>
        {intro && <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">{intro}</p>}
        <FlagRule className="mt-8" />
      </div>
    </section>
  );
}