import type { ReactNode } from "react";
import { goHome } from "../lib/router";

// Building blocks shared by every workshop case study. Each page composes
// them differently; only the structure (heading, intro, provenance) is common.

export const Dot = ({ tone }: { tone: "student" | "class" }) => (
  <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${tone === "student" ? "bg-teal" : "bg-violet"}`} aria-hidden="true" />
);

export function Provenance({ tone, children }: { tone: "student" | "class"; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2 text-sm text-mist">
      <Dot tone={tone} />
      {children}
    </span>
  );
}

/** Sections whose main content is an interactive demonstration built for the portfolio. */
export const demoSections = new Set([
  "starfall", "gd-play", "gd-inside", "gd-layers", "gd-how", "an-keys", "an-rig", "an-keys-map", "dr-sheet", "dr-ideas",
  "ai-loop", "ai-anatomy", "ai-rag", "ai-human", "net-osi", "net-journey", "net-cia", "net-cipher", "ar-kit", "ar-sensor",
  "ar-microbit", "itba-moscow", "itba-weighted", "itba-flow", "itba-trace",
]);

/** The fourth kind of content: demonstrations made for this portfolio (not class files, not my coursework). */
export const DemoTag = () => (
  <span className="mt-4 inline-flex items-center gap-2 text-sm text-mist">
    <span className="inline-block h-2 w-2 rotate-45 border border-ivory/70" aria-hidden="true" />
    Interactive demonstration built for this portfolio
  </span>
);

export function Section({ id, title, intro, children, tone, className = "" }: { id: string; title: string; intro?: ReactNode; children: ReactNode; tone?: "class"; className?: string }) {
  return (
    <section id={id} tabIndex={-1} className={`relative border-t border-rule py-20 outline-none md:py-28 ${className}`} aria-labelledby={`${id}-title`}>
      <div className="shell">
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <h2 id={`${id}-title`} className="heading text-3xl md:text-4xl">{title}</h2>
            {demoSections.has(id) && <DemoTag />}
          </div>
          {intro && <div className={`max-w-measure text-ivory/80 md:col-span-5 md:col-start-8 ${tone === "class" ? "border-l-2 border-violet pl-5" : ""}`}>{intro}</div>}
        </div>
        <div className="mt-12 md:mt-16">{children}</div>
      </div>
    </section>
  );
}

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-mist">
      <button type="button" onClick={() => goHome("workshops")} className="underline-offset-4 hover:text-ivory hover:underline">Workshops</button>
      <span className="mx-2" aria-hidden="true">/</span>
      <span aria-current="page" className="text-ivory/80">{current}</span>
    </nav>
  );
}

export function BackToWorkshops({ note }: { note?: string }) {
  return (
    <div className="mt-20 flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-10">
      <button type="button" onClick={() => goHome("workshops")} className="btn">Back to all workshops</button>
      {note && <p className="text-sm text-mist">{note}</p>}
    </div>
  );
}

/** Small labelled facts row used under case-study titles. */
export function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-[15px] sm:grid-cols-4">
      {items.map(([k, v]) => (
        <div key={k} className="border-t border-rule pt-3">
          <dt className="text-sm text-mist">{k}</dt>
          <dd className="mt-1 font-display text-lg font-medium leading-snug tracking-tight">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
