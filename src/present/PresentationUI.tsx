import { useEffect, useRef } from "react";
import { mmss, routes, totalSeconds, type RouteKind } from "./routes";
import type { usePresentation } from "./usePresentation";

type P = ReturnType<typeof usePresentation>;

/** Choose the short guided route or the extended one (or resume). */
export function PresentChooser({ p }: { p: P }) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);
  const option = (k: RouteKind, title: string, text: string, ref?: React.Ref<HTMLButtonElement>) => (
    <button ref={ref} type="button" onClick={() => p.start(k)} className="w-full rounded-evidence border border-rule p-5 text-left transition-colors hover:border-teal focus-visible:border-teal">
      <span className="flex items-baseline justify-between gap-4">
        <span className="font-display text-xl font-semibold tracking-tight">{title}</span>
        <span className="font-code text-sm text-teal-soft">{mmss(totalSeconds(routes[k]))} · {routes[k].length} stops</span>
      </span>
      <span className="mt-2 block text-[15px] text-ivory/75">{text}</span>
    </button>
  );
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-navy/80 p-5 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="chooser-title" onKeyDown={(e) => e.key === "Escape" && p.closeChooser()}>
      <div className="w-full max-w-[560px] rounded-stage border border-rule bg-navy p-6 md:p-8">
        <h2 id="chooser-title" className="heading text-3xl">Present the portfolio</h2>
        <p className="mt-2 text-ivory/75">Arrow keys or a presentation remote move between stops. Press N for the private notes window.</p>
        <div className="mt-6 space-y-3">
          {p.resumable && (
            <button type="button" onClick={() => p.start(p.resumable!.kind, p.resumable!.index)} className="w-full rounded-evidence border border-teal/70 bg-teal/10 p-4 text-left">
              <span className="font-display text-lg font-semibold">Resume where you stopped</span>
              <span className="mt-1 block text-sm text-ivory/75">{p.resumable.kind === "short" ? "Guided route" : "Extended route"}, stop {p.resumable.index + 1}</span>
            </button>
          )}
          {option("short", "Guided route", "The recommended talk: one key moment from every workshop, with narration on screen.", first)}
          {option("extended", "Extended exploration", "Every section of every case study, for questions and longer sessions.")}
        </div>
        <button type="button" className="btn mt-6" onClick={p.closeChooser}>Cancel</button>
      </div>
    </div>
  );
}

/** On-screen progress, narration and controls while presenting. */
export function PresentationHud({ p }: { p: P }) {
  if (!p.presenting || !p.current) return null;
  const chapters = p.stops.reduce<{ name: string; count: number; start: number }[]>((acc, s, i) => {
    const last = acc[acc.length - 1];
    if (last && last.name === s.chapter) last.count++;
    else acc.push({ name: s.chapter, count: 1, start: i });
    return acc;
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-3 px-4 pb-4">
      {p.captions && p.current.narration && (
        <p className="pointer-events-auto max-w-[900px] rounded-evidence bg-navy px-5 py-3 text-center text-lg leading-snug text-ivory shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] md:text-xl" aria-live="polite">
          {p.current.narration}
        </p>
      )}
      <div className="pointer-events-auto w-full max-w-[1100px] rounded-stage border border-rule bg-navy px-4 py-3">
        <div className="flex gap-1" aria-hidden="true">
          {chapters.map((c) => (
            <div key={c.start} className="flex flex-1 gap-[2px]" style={{ flexGrow: c.count }}>
              {Array.from({ length: c.count }, (_, k) => {
                const i = c.start + k;
                return <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < p.index ? "bg-teal/60" : i === p.index ? "bg-teal" : "bg-rule"}`} />;
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <p className="min-w-0 flex-1 truncate" aria-live="polite">
            <span className="text-teal-soft">{p.current.chapter}</span>
            <span className="text-mist"> · {p.current.title} · {p.index + 1} / {p.stops.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn py-1" onClick={() => p.go(-1)} disabled={p.index === 0} aria-keyshortcuts="ArrowLeft">Back</button>
            <button type="button" className="btn border-teal/70 py-1" onClick={() => p.go(1)} disabled={p.index === p.stops.length - 1} aria-keyshortcuts="ArrowRight">Next</button>
            {p.current.demo && <button type="button" className="btn py-1 text-mist" onClick={p.skipChapter} aria-keyshortcuts="S">Skip demo</button>}
            {p.away && <button type="button" className="btn border-amber/70 py-1" onClick={p.returnToStop} aria-keyshortcuts="R">Return to stop {p.index + 1}</button>}
            <button type="button" className={`btn py-1 ${p.captions ? "" : "text-mist"}`} aria-pressed={p.captions} onClick={p.toggleCaptions} aria-keyshortcuts="C">Captions</button>
            <button type="button" className="btn py-1" onClick={p.exit} aria-keyshortcuts="Escape">Exit</button>
          </div>
        </div>
      </div>
    </div>
  );
}
