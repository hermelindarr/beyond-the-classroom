import { useState } from "react";

// From my notebook page "Blender": the same four tools sit on different keys
// in Harmony and in Blender.
const pairs = [
  { tool: "Select", harmony: "Q", blender: "W" },
  { tool: "Move", harmony: "W", blender: "G" },
  { tool: "Rotate", harmony: "E", blender: "R" },
  { tool: "Scale", harmony: "R", blender: "S" },
];

export function ShortcutMap() {
  const [app, setApp] = useState<"harmony" | "blender">("harmony");
  const [active, setActive] = useState<string | null>("Move");

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key.toUpperCase();
    const hit = pairs.find((p) => p[app] === k);
    if (hit) {
      e.preventDefault();
      setActive(hit.tool);
    }
  };

  return (
    <div data-keys-local onKeyDown={onKey} tabIndex={0} aria-label={`Shortcut map. Press a ${app === "harmony" ? "Harmony" : "Blender"} key: ${pairs.map((p) => p[app]).join(", ")}.`} className="rounded-stage outline-none focus-visible:ring-2 focus-visible:ring-teal-soft">
      <div className="flex flex-wrap items-center gap-4">
        <div role="radiogroup" aria-label="Press keys as in" className="inline-flex rounded-full border border-rule p-1 text-sm">
          {([["harmony", "Harmony"], ["blender", "Blender"]] as const).map(([a, label]) => (
            <button key={a} type="button" role="radio" aria-checked={app === a} onClick={() => setApp(a)} className={`rounded-full px-4 py-1.5 transition-colors ${app === a ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
          ))}
        </div>
        <p className="text-sm text-mist">Click here, then press {pairs.map((p) => p[app]).join(" ")} on your keyboard.</p>
      </div>
      <ul className="mt-6 divide-y divide-rule border-y border-rule">
        {pairs.map((p) => {
          const on = active === p.tool;
          return (
            <li key={p.tool}>
              <button type="button" onClick={() => setActive(p.tool)} aria-pressed={on} className={`grid w-full grid-cols-[1fr_auto_40px_auto] items-center gap-4 py-4 text-left transition-colors sm:gap-8 ${on ? "text-ivory" : "text-ivory/55 hover:text-ivory/80"}`}>
                <span className="font-display text-2xl font-semibold tracking-tight">{p.tool}</span>
                <kbd className={`grid h-12 w-12 place-items-center rounded-evidence border font-display text-xl ${on && app === "harmony" ? "border-teal bg-teal/15" : "border-rule"}`}>{p.harmony}</kbd>
                <span className={`h-px w-full ${on ? "bg-teal" : "bg-rule"}`} aria-hidden="true" />
                <kbd className={`grid h-12 w-12 place-items-center rounded-evidence border font-display text-xl ${on && app === "blender" ? "border-teal bg-teal/15" : "border-rule"}`}>{p.blender}</kbd>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 grid grid-cols-[1fr_auto_40px_auto] gap-4 text-sm text-mist sm:gap-8" aria-hidden="true">
        <span />
        <span className="w-12 text-center">Harmony</span>
        <span />
        <span className="w-12 text-center">Blender</span>
      </p>
    </div>
  );
}
