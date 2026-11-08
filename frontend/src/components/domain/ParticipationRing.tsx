import { useEffect, useState } from "react";

/** Animated progress ring. `pct` 0-100. Uses pathLength so the dash maths stays simple. */
export function ParticipationRing({ pct, children }: { pct: number; children?: React.ReactNode }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(Math.max(0, Math.min(100, pct)))); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <div className="relative h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <defs><linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#818CF8" /><stop offset="0.55" stopColor="#C084FC" /><stop offset="1" stopColor="#2DD4BF" /></linearGradient></defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="60" cy="60" r="50" pathLength={100} fill="none" stroke="url(#ring-grad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={`${shown} 100`} style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.2,0.8,0.2,1)", filter: "drop-shadow(0 0 6px rgba(192,132,252,0.6))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}
