import { useRef, useState, type ReactNode } from "react";
import { gmlEvents, type GmlEvent } from "../../starfall/gml";
import { AnimationEndDemo, ClickDemo, CollisionDemo, CreateDemo, GuiDemo, SpawnDemo, StepDemo } from "./demos";

const demos: Record<string, () => ReactNode> = {
  "manager-create": () => <SpawnDemo />,
  "manager-alarm": () => <SpawnDemo />,
  "star-create": () => <CreateDemo />,
  "star-step": () => <StepDemo />,
  "star-click": () => <ClickDemo />,
  "star-ground": () => <CollisionDemo />,
  "explosion-end": () => <AnimationEndDemo />,
  "manager-gui": () => <GuiDemo />,
};

const objects = ["obj_gameManager", "obj_star", "obj_explosion"] as const;

/** Pick a GML event: see the real code, what it does, and try it. */
export function MechanicsLab() {
  const [active, setActive] = useState<GmlEvent>(gmlEvents[1]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const delta = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + gmlEvents.length) % gmlEvents.length;
    setActive(gmlEvents[next]);
    tabs.current[next]?.focus();
  };

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8" data-keys-local>
      <div className="md:col-span-4">
        <div role="tablist" aria-label="GML events" aria-orientation="vertical" className="space-y-8">
          {objects.map((obj) => (
            <div key={obj}>
              <p className="font-code text-[13px] text-mist">{obj}</p>
              <div className="mt-2 border-l border-rule">
                {gmlEvents.map((ev, i) =>
                  ev.object !== obj ? null : (
                    <button
                      key={ev.id}
                      ref={(el) => (tabs.current[i] = el)}
                      role="tab"
                      id={`tab-${ev.id}`}
                      aria-selected={active.id === ev.id}
                      aria-controls="gml-panel"
                      tabIndex={active.id === ev.id ? 0 : -1}
                      onClick={() => {
                        setActive(ev);
                        // On phones the panel sits below the list: bring it into view.
                        if (window.innerWidth < 768) document.getElementById("gml-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      onKeyDown={(e) => onKey(e, i)}
                      className={`-ml-px flex w-full items-baseline justify-between gap-4 border-l-2 py-2 pl-4 pr-2 text-left transition-colors ${active.id === ev.id ? "border-teal text-ivory" : "border-transparent text-ivory/60 hover:text-ivory"}`}
                    >
                      <span className="font-display text-lg font-medium tracking-tight">{ev.event}</span>
                      <span className="text-xs text-mist">{ev.concept}</span>
                    </button>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="gml-panel" role="tabpanel" aria-labelledby={`tab-${active.id}`} className="min-w-0 md:col-span-8">
        <p className="text-sm text-teal-soft">{active.concept}</p>
        <h3 className="heading mt-2 text-2xl md:text-3xl">{active.object} · {active.event}</h3>
        <p className="mt-4 max-w-measure text-lg text-ivory/85">{active.explain}</p>
        <div className="mt-8" key={active.id}>{demos[active.id]()}</div>
        <figure className="mt-8">
          <figcaption className="mb-2 flex items-center gap-2 text-sm text-mist">
            <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
            My project · objects/{active.object}/{active.file}
          </figcaption>
          <pre className="overflow-x-auto rounded-stage bg-graphite p-5 font-code text-[13px] leading-relaxed text-teal-soft"><code>{active.code.trim()}</code></pre>
        </figure>
      </div>
    </div>
  );
}
