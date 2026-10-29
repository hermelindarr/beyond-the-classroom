import { useState } from "react";
import { decisions, features, questions, requirements, type FeatureId, type Status } from "./northstar";

const statusStyle: Record<Status, string> = {
  Approved: "bg-teal/15 text-teal-soft",
  Pending: "bg-violet/20 text-violet-soft",
  Partial: "bg-violet/20 text-violet-soft",
  Excluded: "bg-amber/15 text-amber",
};

/** Every requirement traced to its feature group, decisions and open questions. */
export function TraceMatrix() {
  const [feature, setFeature] = useState<FeatureId | "all">("all");
  const [status, setStatus] = useState<Status | "all">("all");
  const [open, setOpen] = useState<string | null>("REQ-007");
  const rows = requirements.filter((r) => (feature === "all" || r.feature === feature) && (status === "all" || r.status === status || (status === "Pending" && r.status === "Partial")));
  const req = requirements.find((r) => r.id === open);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm text-mist">
          Feature group
          <select value={feature} onChange={(e) => setFeature(e.target.value as FeatureId | "all")} className="mt-1 block rounded-evidence border border-rule bg-graphite px-3 py-2 text-ivory">
            <option value="all">All 8 groups</option>
            {features.map((f) => <option key={f.id} value={f.id}>{f.id} · {f.name}</option>)}
          </select>
        </label>
        <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-1 text-sm">
          {(["all", "Approved", "Pending", "Excluded"] as const).map((s) => (
            <button key={s} type="button" role="radio" aria-checked={status === s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 transition-colors ${status === s ? "border-ivory bg-ivory/10 text-ivory" : "border-rule text-mist hover:text-ivory"}`}>{s === "all" ? "All statuses" : s}</button>
          ))}
        </div>
        <p className="ml-auto text-sm text-mist" aria-live="polite">{rows.length} of 22 requirements</p>
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-12">
        <div className="max-h-[520px] overflow-auto rounded-evidence border border-rule md:col-span-7">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead className="sticky top-0 bg-graphite text-sm text-mist">
              <tr><th className="px-3 py-2 font-normal">ID</th><th className="px-3 py-2 font-normal">Group</th><th className="px-3 py-2 font-normal">Status</th><th className="px-3 py-2 font-normal">Decisions</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className={`border-t border-rule ${open === r.id ? "bg-teal/10" : "hover:bg-ivory/[0.03]"}`}>
                  <td className="px-3 py-2"><button type="button" onClick={() => setOpen(r.id)} aria-pressed={open === r.id} className="font-code text-[13px] text-teal-soft underline-offset-4 hover:underline">{r.id}</button></td>
                  <td className="px-3 py-2 font-code text-[13px] text-mist">{r.feature}</td>
                  <td className="px-3 py-2"><span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${statusStyle[r.status]}`}>{r.status === "Partial" ? "Partial" : r.status}</span></td>
                  <td className="px-3 py-2 font-code text-[12px] text-mist">{r.decisions.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {req && (
          <aside className="md:col-span-5" aria-live="polite">
            <p className="font-code text-[13px] text-teal-soft">{req.id} · {req.feature} · {req.type}</p>
            <p className="mt-3 text-lg text-ivory/90">{req.text}</p>
            <p className="mt-3"><span className={`rounded-full px-2 py-0.5 text-xs ${statusStyle[req.status]}`}>{req.statusText}</span></p>
            <div className="mt-6 space-y-2">
              {req.decisions.map((d) => (
                <div key={d} className="rounded-evidence border border-rule p-3 text-sm">
                  <span className="font-code text-mist">{d}</span> <span className="text-mist">· {decisions[d].status}</span>
                  <p className="mt-1 text-ivory/85">{decisions[d].text}</p>
                </div>
              ))}
              {req.questions.map((q) => (
                <div key={q} className="rounded-evidence border border-dashed border-rule p-3 text-sm">
                  <span className="font-code text-mist">{q}</span> <span className="text-mist">· {questions[q]?.status}</span>
                  <p className="mt-1 text-ivory/85">{questions[q]?.text}</p>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
