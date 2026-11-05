import { useLayoutEffect, useRef } from "react";
import { formatDay, isUpcoming, subjects, weeks, type ProgramEvent } from "../content/program";
import { weekAnchor, weekReflections } from "../content/weekReflections";
import { gsap, scrollToElement } from "../lib/motion";
import { prefersReducedMotion } from "../lib/env";
import { Internal } from "./Internal";

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
};

function marker(e: ProgramEvent) {
  if (isUpcoming(e.date)) return "upcoming";
  const subject = subjects.find((s) => s.id === e.subject);
  if (e.kind === "evidence" || subject?.status === "student") return "student";
  // A workshop whose date has passed without evidence is a schedule fact, not class material.
  if (subject?.status === "upcoming") return "program";
  if (subject) return "class";
  return "program";
}

const dot: Record<string, string> = {
  student: "bg-teal",
  class: "bg-violet",
  upcoming: "border border-dashed border-mist",
  program: "border border-ivory/40",
};

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
      {[
        ["student", "My work"],
        ["class", "Class material only"],
        ["program", "Program event"],
        ["upcoming", "Upcoming"],
      ].map(([k, label]) => (
        <li key={k} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${dot[k]}`} aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

export function Journey() {
  const root = useRef<HTMLElement>(null);
  const start = parse("2026-10-12");
  const end = parse("2026-11-08");
  const progress = Math.min(1, Math.max(0, (Date.now() - start) / (end - start)));
  const reflected = new Set(weekReflections().map((r) => r.week));
  const toReflection = (n: number) => {
    const el = document.getElementById(weekAnchor(n));
    if (!el) return;
    scrollToElement(el);
    el.focus({ preventScroll: true });
  };

  // The progress line draws itself once, up to today.
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-progress]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 1.6,
        ease: "power3.inOut",
        scrollTrigger: { trigger: "[data-progress]", start: "top 85%", once: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="journey" ref={root} tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="journey-title">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 id="journey-title" className="heading text-3xl md:col-span-6 md:text-4xl">Four weeks in Sudbury, day by day</h2>
          <div className="md:col-span-5 md:col-start-8">
            <p className="max-w-measure text-ivory/80">
              The program schedule, with the work I made along the way. Teal marks my own evidence; everything else is
              context from the program.
            </p>
            <div className="mt-6"><Legend /></div>
          </div>
        </div>

        <div className="relative mt-16" aria-hidden="true">
          <div className="h-px w-full border-t border-dashed border-mist/40" />
          <div data-progress className="absolute left-0 top-0 h-[2px] -translate-y-1/2 bg-teal" style={{ width: `${progress * 100}%` }} />
          {progress > 0 && progress < 1 && (
            <div className="absolute top-0 -translate-x-1/2" style={{ left: `${progress * 100}%` }}>
              <div className="h-3 w-3 -translate-y-1/2 rounded-full bg-teal ring-4 ring-navy" />
              <p className="mt-2 whitespace-nowrap text-sm text-teal-soft">Today</p>
            </div>
          )}
        </div>

        <ol className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-4">
          {weeks.map((w) => {
            const future = isUpcoming(w.start);
            return (
              <li key={w.n} className={future ? "opacity-70" : ""}>
                <h3 className="heading text-2xl">Week {w.n}</h3>
                <p className="mt-1 text-sm text-mist">
                  {w.label} · {w.pending ? `until ${formatDay(w.end)}` : `${formatDay(w.start)} – ${formatDay(w.end)}`}
                  {future && " · upcoming"}
                </p>
                {w.pending && <Internal></Internal>}
                {reflected.has(w.n) && (
                  <button type="button" onClick={() => toReflection(w.n)} className="mt-3 text-sm text-teal-soft underline-offset-4 hover:underline">
                    Read my reflection on week {w.n}
                  </button>
                )}
                <ul className="mt-6 space-y-3">
                  {w.events.map((e, i) => {
                    const m = marker(e);
                    return (
                      <li key={i} className="grid grid-cols-[52px_12px_1fr] items-baseline gap-2 text-[15px]">
                        <time dateTime={e.date} className="text-sm text-mist">{formatDay(e.date)}</time>
                        <span className={`inline-block h-2 w-2 translate-y-[-1px] rounded-full ${dot[m]}`} aria-label={m === "student" ? "My work" : m === "class" ? "Class material only" : m === "upcoming" ? "Upcoming" : "Program event"} />
                        <span className={m === "program" ? "text-ivory/65" : ""}>
                          {e.title}
                          {e.pending && <><br /><Internal></Internal></>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ol>
        <p className="mt-12 text-sm text-mist">Dates come from the Cambrian College program schedule.</p>
      </div>
    </section>
  );
}
