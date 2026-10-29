import { useState } from "react";
import { formatDay, isUpcoming, subjects, weeks, type Subject } from "../content/program";
import { Internal } from "./Internal";
import { href, type Route } from "../lib/router";

/** Workshops whose case study is built. */
const caseStudies: Partial<Record<Subject["id"], Route>> = {
  "game-design": "game-design",
  harmony: "animation",
  blender: "animation",
  drawing: "drawing",
  "ai-agents": "ai-agents",
  networking: "networking",
  microbits: "arduino",
  itba: "itba",
};

function weeksLabel(s: Subject) {
  if (!s.weeks.length) return "Date to be confirmed";
  return s.weeks.length === 1 ? `Week ${s.weeks[0]}` : `Weeks ${s.weeks.join(", ")}`;
}

function firstDate(s: Subject) {
  return weeks.flatMap((w) => w.events).find((e) => e.subject === s.id)?.date;
}

function Status({ s }: { s: Subject }) {
  if (s.status === "upcoming") {
    const d = firstDate(s);
    // Once the date has passed, it stays unclaimed until real evidence is added.
    if (d && !isUpcoming(d)) return <span className="chip chip-upcoming">Evidence not added yet</span>;
    return <span className="chip chip-upcoming">Upcoming{d ? ` · ${formatDay(d)}` : ""}</span>;
  }
  if (s.status === "class") return <span className="chip chip-class">Class material only</span>;
  return (
    <>
      <span className="chip chip-student">My work ({s.studentPieces})</span>
      {s.classPieces > 0 && <span className="chip chip-class">Class material ({s.classPieces})</span>}
    </>
  );
}

function Row({ s, compact = false }: { s: Subject; compact?: boolean }) {
  return (
    <li className={`grid gap-4 border-t border-rule py-7 md:grid-cols-12 md:gap-8 ${s.status === "upcoming" ? "text-ivory/60" : ""}`}>
      <div className="md:col-span-7">
        <h3 className={`heading ${compact ? "text-xl" : "text-2xl md:text-[34px]"}`}>
          {caseStudies[s.id] ? (
            <a href={href(caseStudies[s.id]!)} className="decoration-teal decoration-2 underline-offset-[6px] hover:underline">
              {s.name}
              <span className="ml-3 align-middle font-body text-sm font-normal tracking-normal text-teal-soft">Case study</span>
            </a>
          ) : (
            s.name
          )}
        </h3>
        {!compact && <p className="mt-3 max-w-measure text-ivory/70">{s.inside}</p>}
        {s.pending && <Internal></Internal>}
      </div>
      <p className="text-sm text-mist md:col-span-2 md:pt-2">{weeksLabel(s)}</p>
      <div className="flex flex-wrap items-start gap-2 md:col-span-3 md:justify-end md:pt-1">
        <Status s={s} />
      </div>
    </li>
  );
}

export function Workshops() {
  const [view, setView] = useState<"subject" | "week">("subject");
  const undated = subjects.filter((s) => !s.weeks.length);

  return (
    <section id="workshops" tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="workshops-title">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <h2 id="workshops-title" className="heading text-3xl md:text-4xl">Ten workshops</h2>
            <p className="mt-4 max-w-measure text-ivory/80">
              Each workshop gets its own case study. The numbers count the pieces of evidence I have so far.
            </p>
          </div>
          <div role="group" aria-label="Organize workshops" className="flex rounded-full border border-rule p-1 text-sm">
            {(["subject", "week"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 transition-colors ${view === v ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}
              >
                By {v}
              </button>
            ))}
          </div>
        </div>

        {view === "subject" ? (
          <ul className="mt-14 border-b border-rule">{subjects.map((s) => <Row key={s.id} s={s} />)}</ul>
        ) : (
          <div className="mt-14 space-y-14">
            {weeks.map((w) => (
              <div key={w.n}>
                <h3 className="text-sm text-mist">Week {w.n} · {w.label}</h3>
                <ul className="mt-3 border-b border-rule">
                  {subjects.filter((s) => s.weeks.includes(w.n)).map((s) => <Row key={s.id} s={s} compact />)}
                </ul>
              </div>
            ))}
            {undated.length > 0 && (
              <div>
                <h3 className="text-sm text-mist">Date to be confirmed</h3>
                <ul className="mt-3 border-b border-rule">{undated.map((s) => <Row key={s.id} s={s} compact />)}</ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
