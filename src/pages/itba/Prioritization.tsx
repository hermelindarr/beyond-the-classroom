import { useMemo, useState } from "react";
import { decisions, features, requirements, weights, workedMoscow, workedRatings, type FeatureId } from "./northstar";

const categories = ["Must", "Should", "Could", "Won't"] as const;
type Category = (typeof categories)[number];

/** Organizational decisions linked to a feature, via its requirements. */
function linkedDecisions(f: FeatureId) {
  const ids = new Set(requirements.filter((r) => r.feature === f).flatMap((r) => r.decisions));
  return [...ids].map((id) => ({ id, ...decisions[id] }));
}

export function Moscow() {
  const [picks, setPicks] = useState<Partial<Record<FeatureId, Category>>>({});
  const [selected, setSelected] = useState<FeatureId>("F-02");
  const [showWorked, setShowWorked] = useState(false);
  const counts = categories.map((c) => Object.values(picks).filter((p) => p === c).length);
  const linked = linkedDecisions(selected);

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-7">
        <ul className="divide-y divide-rule border-y border-rule">
          {features.map((f) => (
            <li key={f.id} className={`grid gap-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center ${selected === f.id ? "bg-ivory/[0.03]" : ""}`}>
              <button type="button" onClick={() => setSelected(f.id)} aria-pressed={selected === f.id} className="text-left">
                <span className="font-code text-[13px] text-teal-soft">{f.id}</span>
                <span className="ml-3 text-[15px]">{f.name}</span>
                <span className="ml-2 text-xs text-mist">{f.reqs} req.</span>
              </button>
              <div role="radiogroup" aria-label={`MoSCoW category for ${f.id}`} className="flex gap-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={picks[f.id] === c}
                    onClick={() => { setPicks((p) => ({ ...p, [f.id]: c })); setSelected(f.id); }}
                    className={`rounded-[3px] border px-2.5 py-1 text-xs transition-colors ${picks[f.id] === c ? (c === "Won't" ? "border-amber bg-amber/20 text-ivory" : "border-teal bg-teal/20 text-ivory") : "border-rule text-mist hover:text-ivory"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-mist">
          {categories.map((c, i) => <span key={c}>{c}: <span className="font-code text-ivory">{counts[i]}</span></span>)}
          <button type="button" className={`btn ml-auto ${showWorked ? "border-violet/70 bg-violet/10" : ""}`} aria-pressed={showWorked} onClick={() => setShowWorked(!showWorked)}>Class worked example</button>
        </div>
      </div>

      <aside className="md:col-span-5" aria-live="polite">
        <p className="font-code text-[13px] text-teal-soft">{selected}</p>
        <p className="heading mt-2 text-2xl">{features.find((f) => f.id === selected)!.name}</p>
        <p className="mt-4 text-[15px] text-ivory/80">Ask: what happens if this capability is not available in Release 1? Then check the decisions already made.</p>
        <ul className="mt-5 space-y-2">
          {linked.map((d) => (
            <li key={d.id} className="rounded-evidence border border-rule p-3 text-sm">
              <span className="font-code text-mist">{d.id}</span>
              <span className={`ml-2 ${d.status === "Approved" ? "text-teal-soft" : d.status === "Pending" ? "text-violet-soft" : "text-amber"}`}>{d.status}</span>
              <p className="mt-1 text-ivory/85">{d.text}</p>
            </li>
          ))}
        </ul>
        {showWorked && (
          <div className="mt-5 border-l-2 border-violet pl-4">
            <p className="text-sm text-violet-soft">Class worked example (slide 11)</p>
            {workedMoscow[selected] ? (
              <p className="mt-1 text-[15px]"><strong>{workedMoscow[selected]!.category}</strong>: {workedMoscow[selected]!.why}.</p>
            ) : (
              <p className="mt-1 text-[15px] text-mist">Not covered by the worked example; the class decided this one in discussion.</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

type Ratings = typeof workedRatings;
const criteria: { key: keyof Ratings; label: string; letter: string }[] = [
  { key: "business", label: "Business value", letter: "B" },
  { key: "user", label: "User impact", letter: "U" },
  { key: "urgency", label: "Urgency", letter: "T" },
  { key: "feasibility", label: "Feasibility", letter: "F" },
];
const score = (r: Ratings) => weights.business * r.business + weights.user * r.user + weights.urgency * r.urgency + weights.feasibility * r.feasibility;

export function Weighted() {
  const [ratings, setRatings] = useState<Partial<Record<FeatureId, Ratings>>>({ "F-02": workedRatings });
  const [selected, setSelected] = useState<FeatureId>("F-02");
  const r = ratings[selected] ?? { business: 3, user: 3, urgency: 3, feasibility: 3 };
  const set = (key: keyof Ratings, v: number) => setRatings((all) => ({ ...all, [selected]: { ...r, [key]: v } }));
  const ranked = useMemo(() => (Object.entries(ratings) as [FeatureId, Ratings][]).map(([id, x]) => ({ id, s: score(x) })).sort((a, b) => b.s - a.s), [ratings]);
  const isWorked = selected === "F-02" && JSON.stringify(r) === JSON.stringify(workedRatings);

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-7">
        <label className="block text-sm text-mist">
          Feature group
          <select value={selected} onChange={(e) => setSelected(e.target.value as FeatureId)} className="mt-2 block w-full rounded-evidence border border-rule bg-graphite px-3 py-2.5 text-ivory">
            {features.map((f) => <option key={f.id} value={f.id}>{f.id} · {f.name}</option>)}
          </select>
        </label>
        <div className="mt-6 space-y-5">
          {criteria.map((c) => (
            <label key={c.key} className="grid grid-cols-[1fr_auto] items-center gap-x-4 text-[15px]">
              <span>{c.label} <span className="text-sm text-mist">× {weights[c.key].toFixed(2)}</span></span>
              <span className="font-code text-teal-soft">{r[c.key]}</span>
              <input type="range" min={1} max={5} step={1} value={r[c.key]} onChange={(e) => set(c.key, +e.target.value)} className="col-span-2 mt-1 accent-teal" aria-label={`${c.label}, 1 to 5`} />
            </label>
          ))}
        </div>
        <p className="mt-6 rounded-evidence bg-graphite p-4 font-code text-[13px] leading-relaxed text-ivory/90">
          score = {criteria.map((c) => `${weights[c.key]} × ${r[c.key]}`).join(" + ")}
          <br />
          <span className="text-2xl text-teal-soft">= {score(r).toFixed(2)}</span> <span className="text-mist">out of 5.00</span>
        </p>
        <p className="mt-3 text-sm text-mist" aria-live="polite">
          {isWorked ? "These are the ratings from the class worked example: 2.00 + 1.25 + 1.00 + 0.60 = 4.85." : "Try your own ratings. The class workbook's ratings were illustrative, not Northstar estimates."}
        </p>
      </div>
      <div className="md:col-span-4 md:col-start-9">
        <p className="text-sm text-mist">Ranking of the groups you have rated</p>
        <ol className="mt-3 space-y-2">
          {ranked.map((x, i) => (
            <li key={x.id} className="grid grid-cols-[24px_56px_1fr] items-center gap-2 text-[15px]">
              <span className="text-mist">{i + 1}</span>
              <span className="font-code text-[13px] text-teal-soft">{x.id}</span>
              <span className="flex items-center gap-2">
                <span className="h-2 rounded-full bg-teal" style={{ width: `${(x.s / 5) * 100}%` }} aria-hidden="true" />
                <span className="font-code text-[13px]">{x.s.toFixed(2)}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
