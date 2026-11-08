import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/useCountUp";

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen] as const;
}

/** Fades and lifts its children in when scrolled into view. `delay` (ms) staggers siblings. */
export function Reveal({ children, delay = 0, className, style }: { children: ReactNode; delay?: number; className?: string; style?: CSSProperties }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.15);
  return <div ref={ref} style={{ transitionDelay: `${delay}ms`, ...style }} className={cn("reveal", seen && "is-visible", className)}>{children}</div>;
}

/** Counts up from 0 to `to` the first time it is visible. */
export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.4);
  const v = useCountUp(seen ? to : 0, 1400);
  return <span ref={ref} className={cn("tabular-nums", className)}>{Math.round(v)}{suffix}</span>;
}
