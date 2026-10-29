import { Internal } from "./Internal";
import { Provenance } from "./CaseStudy";
import { echoesFor, weekAnchor } from "../content/weekReflections";
import { caseRoutes, goHome, type CaseRoute } from "../lib/router";

declare global {
  interface Window {
    BTC_REFLECTIONS?: Record<string, string>;
  }
}

const isPage = (topic: string): topic is CaseRoute => (caseRoutes as readonly string[]).includes(topic);

/**
 * The student's own words for a workshop, read from public/reflections.js:
 * an optional workshop line, then the matching lines of her weekly
 * reflections, each linking to the full week. Nothing is shown publicly until
 * she has written something; review mode shows a placeholder.
 */
export function Reflection({ topic }: { topic: string; label: string }) {
  const text = window.BTC_REFLECTIONS?.[topic]?.trim();
  const echoes = isPage(topic) ? echoesFor(topic) : [];
  if (!text && !echoes.length) {
    return <Internal block></Internal>;
  }
  return (
    <div className="space-y-10">
      {text && (
        <figure className="border-l-2 border-teal pl-5">
          <blockquote className="font-display text-2xl font-light leading-snug tracking-tight">{text}</blockquote>
          <figcaption className="mt-3"><Provenance tone="student">In my words</Provenance></figcaption>
        </figure>
      )}
      {echoes.map((e) => (
        <figure key={`${e.week}-${e.heading}`} className="border-l-2 border-teal pl-5">
          <blockquote className="font-display text-2xl font-light leading-snug tracking-tight">{e.echo}</blockquote>
          <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Provenance tone="student">From my Week {e.week} reflection</Provenance>
            <button type="button" onClick={() => goHome(weekAnchor(e.week))} className="text-sm text-teal-soft underline-offset-4 hover:underline">
              Read the whole week
            </button>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
