import { useRef, useState } from "react";
import { formatDay, weeks, type Week } from "../content/program";
import { weekAnchor, weekReflections, type WeekReflection } from "../content/weekReflections";
import { scrollToElement } from "../lib/motion";
import { href, type CaseRoute } from "../lib/router";
import { Provenance } from "./CaseStudy";

const pageNames: Record<CaseRoute, string> = {
  "game-design": "Game Design",
  animation: "Animation",
  drawing: "Drawing",
  "ai-agents": "AI Agents",
  networking: "Networking",
  arduino: "Arduino and Micro:bits",
  itba: "IT Business Analysis",
};

const span = (w?: Week) => (!w ? "" : w.pending ? `until ${formatDay(w.end)}` : `${formatDay(w.start)} – ${formatDay(w.end)}`);

function WeekEntry({ r }: { r: WeekReflection }) {
  const [open, setOpen] = useState(false);
  const article = useRef<HTMLElement>(null);
  const meta = weeks.find((w) => w.n === r.week);
  const pages = [...new Set(r.parts.map((p) => p.page).filter((p): p is CaseRoute => !!p))];
  const fullId = `${weekAnchor(r.week)}-full`;

  const close = () => {
    setOpen(false);
    if (article.current) {
      scrollToElement(article.current);
      article.current.focus({ preventScroll: true });
    }
  };

  return (
    <article id={weekAnchor(r.week)} ref={article} tabIndex={-1} className="border-t border-rule py-14 outline-none md:py-20" aria-labelledby={`${weekAnchor(r.week)}-title`}>
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <p className="text-sm text-mist">Week {r.week}{meta ? ` · ${meta.label} · ${span(meta)}` : ""}</p>
          <h3 id={`${weekAnchor(r.week)}-title`} className="heading mt-3 text-3xl md:text-[40px]">{r.title}</h3>
          {r.summary && <p className="mt-5 max-w-measure text-lg text-ivory/85">{r.summary}</p>}
          {pages.length > 0 && (
            <p className="mt-6 text-sm text-mist">
              Workshops this week:{" "}
              {pages.map((p, i) => (
                <span key={p}>
                  {i > 0 && ", "}
                  <a href={href(p)} className="text-teal-soft underline-offset-4 hover:underline">{pageNames[p]}</a>
                </span>
              ))}
            </p>
          )}
          <button type="button" className="btn mt-8" aria-expanded={open} aria-controls={fullId} onClick={() => setOpen(!open)}>
            {open ? "Close the full reflection" : "Read the full reflection"}
          </button>
        </div>

        {r.quote && (
          <figure className="border-l-2 border-teal pl-6 md:col-span-6 md:col-start-7 md:self-center">
            <blockquote className="font-display text-[clamp(24px,2.6vw,36px)] font-light leading-[1.2] tracking-tight">“{r.quote}”</blockquote>
            <figcaption className="mt-4"><Provenance tone="student">In my words</Provenance></figcaption>
          </figure>
        )}
      </div>

      <div id={fullId} data-reflection-full hidden={!open} className="mt-14">
        {/* The quote is already shown large just above: don't repeat it word for word. */}
        {r.opening.length > 0 && <Row>{r.opening.filter((t) => t !== r.quote)}</Row>}
        {r.parts.map((p) => (
          <Row key={p.heading} heading={p.heading} page={p.page}>{p.text}</Row>
        ))}
        {r.closing.length > 0 && <Row heading="Looking back">{r.closing}</Row>}
        <div className="grid md:grid-cols-12 md:gap-8">
          <div className="pt-8 md:col-span-6 md:col-start-7">
            <button type="button" className="btn" onClick={close} aria-controls={fullId}>Back to the summary</button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** One block of the full reading: margin heading on the left, text in a reading column. */
function Row({ heading, page, children }: { heading?: string; page?: CaseRoute; children: string[] }) {
  return (
    <div className="grid gap-3 border-t border-rule/60 py-8 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        {heading && <h4 className="font-display text-xl font-semibold tracking-tight">{heading}</h4>}
        {page && <a href={href(page)} className="mt-1 inline-block text-sm text-teal-soft underline-offset-4 hover:underline">See the {pageNames[page]} case study</a>}
      </div>
      <div className="max-w-measure space-y-4 text-[17px] leading-relaxed text-ivory/90 md:col-span-6 md:col-start-7">
        {children.map((t) => <p key={t}>{t}</p>)}
      </div>
    </div>
  );
}

export function WeekReflections() {
  const list = weekReflections();
  const written = new Set(list.map((r) => r.week));
  const later = weeks.filter((w) => !written.has(w.n));

  return (
    <section id="reflections" tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="reflections-title">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 id="reflections-title" className="heading text-3xl md:col-span-6 md:text-4xl">In my own words, week by week</h2>
          <p className="max-w-measure text-ivory/80 md:col-span-5 md:col-start-8">
            One reflection for each week, written once the week is over: what I lived, how I felt and what I learned.
          </p>
        </div>

        <div className="mt-10 border-b border-rule">
          {list.map((r) => <WeekEntry key={r.week} r={r} />)}
          {later.map((w) => (
            <div key={w.n} className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-rule py-8">
              <p className="heading text-2xl text-ivory/60">Week {w.n} <span className="ml-2 font-body text-sm font-normal tracking-normal text-mist">{w.label} · {span(w)}</span></p>
              <p className="flex items-center gap-2 text-sm text-mist">
                <span className="h-2 w-2 rounded-full border border-dashed border-mist" aria-hidden="true" />
                Reflection coming soon
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
