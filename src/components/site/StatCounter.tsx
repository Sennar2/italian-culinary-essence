import { useEffect, useRef, useState } from "react";

export function StatCounter({ value, suffix = "+", label, sublabel }: { value: number; suffix?: string; label: string; sublabel?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const startTs = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - startTs) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(eased * value));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center md:text-left">
      <p className="font-display text-4xl md:text-5xl text-gold leading-none">
        {n.toLocaleString()}<span className="text-gold">{suffix}</span>
      </p>
      <p className="mt-3 text-[11px] tracking-[0.22em] uppercase text-cream font-medium">{label}</p>
      {sublabel && <p className="mt-1 text-xs text-cream/60">{sublabel}</p>}
    </div>
  );
}