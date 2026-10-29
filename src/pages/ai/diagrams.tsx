import { useState } from "react";

// Interactive versions of diagrams from the AI Agents lectures (Hasan
// Shahriar, Cambrian College). Wording and examples follow the slides.

/* Lecture 0, slide 6: the agent loop, with the class example. */
const loopSteps = [
  { phase: "Goal", text: "Do I need a jacket in Sudbury today?" },
  { phase: "Think", text: "I need today's weather → use the weather tool" },
  { phase: "Act", text: 'get_weather("Sudbury")', code: true },
  { phase: "Observe", text: "4 °C, light snow" },
  { phase: "Think", text: "Cold and snowy → I can answer now" },
  { phase: "Done", text: "Yes! 4 °C with light snow. Bring a warm jacket." },
] as const;
const ringPhases = ["Think", "Act", "Observe"] as const;

export function AgentLoop() {
  const [step, setStep] = useState(0);
  const current = loopSteps[step];
  const angleOf: Record<string, number> = { Think: -90, Act: 30, Observe: 150 };
  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[360px]" role="img" aria-label={`Agent loop. Current step: ${current.phase}.`}>
          <circle cx={150} cy={150} r={100} fill="none" stroke="#2C3544" strokeWidth={2} />
          <path d="M150 50 A100 100 0 1 1 149.9 50" fill="none" stroke="#7C78B8" strokeWidth={2} strokeDasharray="3 7" />
          {ringPhases.map((p) => {
            const a = (angleOf[p] * Math.PI) / 180;
            const on = current.phase === p;
            return (
              <g key={p} transform={`translate(${150 + 100 * Math.cos(a)} ${150 + 100 * Math.sin(a)})`}>
                <circle r={on ? 34 : 28} fill={on ? "#7C78B8" : "#222A35"} stroke={on ? "#C3BFF0" : "#2C3544"} strokeWidth={2} style={{ transition: "all .4s" }} />
                <text textAnchor="middle" dy={5} fill="#F1EEE8" fontSize={14} fontFamily="Bricolage Grotesque Variable" fontWeight={600}>{p}</text>
              </g>
            );
          })}
          <text x={150} y={146} textAnchor="middle" fill={current.phase === "Goal" || current.phase === "Done" ? "#C3BFF0" : "#A3AAB6"} fontSize={15} fontFamily="Bricolage Grotesque Variable" fontWeight={600}>
            {current.phase === "Done" ? "Done!" : "Goal"}
          </text>
          <text x={150} y={166} textAnchor="middle" fill="#A3AAB6" fontSize={11} fontFamily="Atkinson Hyperlegible">repeat until the goal is met</text>
        </svg>
      </div>
      <div className="md:col-span-6 md:col-start-7">
        <ol className="space-y-2">
          {loopSteps.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => setStep(i)}
                aria-current={i === step ? "step" : undefined}
                className={`grid w-full grid-cols-[96px_1fr] items-baseline gap-4 border-l-2 py-2 pl-4 text-left transition-colors ${i === step ? "border-violet text-ivory" : i < step ? "border-violet/40 text-ivory/60" : "border-rule text-ivory/35"}`}
              >
                <span className="font-display text-[15px] font-semibold text-violet-soft">{s.phase}</span>
                <span className={"code" in s ? "font-code text-[14px]" : ""}>{s.text}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex gap-3">
          <button type="button" className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
          <button type="button" className="btn border-violet/70" onClick={() => setStep(step === loopSteps.length - 1 ? 0 : step + 1)}>{step === loopSteps.length - 1 ? "Start again" : "Next step"}</button>
        </div>
      </div>
    </div>
  );
}

/* Lecture 0, slide 5: anatomy of an agent, mapped to the lectures. */
const parts = [
  { name: "Senses", does: "Reads text, images and sound", lecture: "L1" },
  { name: "Knowledge", does: "Looks things up (RAG)", lecture: "L2" },
  { name: "Arms & legs", does: "Uses tools and APIs to act", lecture: "L2" },
  { name: "Muscles & memory", does: "Tasks, state and MCP", lecture: "L3" },
  { name: "Team", does: "A supervisor and sub-agents", lecture: "L4" },
  { name: "Rules", does: "Approvals, budgets, limits", lecture: "L4" },
];

export function Anatomy() {
  const [active, setActive] = useState(0);
  return (
    <div className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
      <svg viewBox="0 0 420 340" className="w-full md:col-span-7" role="img" aria-label="Anatomy of an AI agent: the LLM brain in the centre, with six parts around it.">
        {parts.map((p, i) => {
          const a = ((i / parts.length) * 360 - 90) * (Math.PI / 180);
          const x = 210 + 150 * Math.cos(a), y = 170 + 120 * Math.sin(a);
          const on = i === active;
          return (
            <g key={p.name} onMouseEnter={() => setActive(i)} style={{ cursor: "pointer" }} onClick={() => setActive(i)}>
              <line x1={210} y1={170} x2={x} y2={y} stroke={on ? "#7C78B8" : "#2C3544"} strokeWidth={on ? 2.5 : 1.5} />
              <rect x={x - 62} y={y - 18} width={124} height={36} rx={18} fill={on ? "#7C78B8" : "#222A35"} stroke={on ? "#C3BFF0" : "#2C3544"} />
              <text x={x} y={y + 5} textAnchor="middle" fill="#F1EEE8" fontSize={13} fontFamily="Atkinson Hyperlegible">{p.name}</text>
            </g>
          );
        })}
        <circle cx={210} cy={170} r={46} fill="#101827" stroke="#C3BFF0" strokeWidth={2} />
        <text x={210} y={166} textAnchor="middle" fill="#F1EEE8" fontSize={18} fontFamily="Bricolage Grotesque Variable" fontWeight={700}>LLM</text>
        <text x={210} y={186} textAnchor="middle" fill="#A3AAB6" fontSize={12} fontFamily="Atkinson Hyperlegible">the brain</text>
      </svg>
      <div className="md:col-span-5">
        <div role="group" aria-label="Agent parts" className="flex flex-wrap gap-2">
          {parts.map((p, i) => (
            <button key={p.name} type="button" aria-pressed={i === active} onClick={() => setActive(i)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${i === active ? "border-violet bg-violet/20 text-ivory" : "border-rule text-mist hover:text-ivory"}`}>{p.name}</button>
          ))}
        </div>
        <div className="mt-8" aria-live="polite">
          <p className="font-display text-sm text-violet-soft">Lecture {parts[active].lecture.slice(1)}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{parts[active].name}</p>
          <p className="mt-3 text-lg text-ivory/85">{parts[active].does}</p>
        </div>
      </div>
    </div>
  );
}

/* Lecture 2, slide 6: RAG as two pipelines. */
const indexing = ["Documents", "Split into chunks", "Embed each chunk", "Vector database"];
const querying = ["Question", "Embed the question", "Search: top-k chunks", "Prompt + chunks", "LLM", "Answer + sources"];

export function RagPipelines() {
  const total = indexing.length + querying.length;
  const [step, setStep] = useState(0);
  const Row = ({ items, offset, title, note }: { items: string[]; offset: number; title: string; note: string }) => (
    <div>
      <p className="font-display text-sm font-semibold text-violet-soft">{title}</p>
      <p className="text-sm text-mist">{note}</p>
      <ol className="mt-4 flex flex-wrap items-center gap-2">
        {items.map((it, i) => {
          const n = offset + i;
          const state = n < step ? "done" : n === step ? "now" : "next";
          return (
            <li key={it} className="flex items-center gap-2">
              <span className={`rounded-evidence border px-3 py-2 text-[15px] transition-colors duration-300 ${state === "now" ? "border-violet bg-violet/25 text-ivory" : state === "done" ? "border-violet/40 text-ivory/80" : "border-rule text-ivory/40"}`}>{it}</span>
              {i < items.length - 1 && <span className={state === "done" ? "text-violet-soft" : "text-rule"} aria-hidden="true">→</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
  return (
    <div>
      <div className="space-y-10">
        <Row items={indexing} offset={0} title="1 · Indexing" note="Once, ahead of time. Store once, search many times." />
        <Row items={querying} offset={indexing.length} title="2 · Querying" note="Every time a user asks. The search finds similar chunks." />
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" className="btn" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</button>
        <button type="button" className="btn border-violet/70" onClick={() => setStep((step + 1) % total)}>{step === total - 1 ? "Start again" : "Next step"}</button>
        <span className="text-sm text-mist" aria-live="polite">Step {step + 1} of {total}</span>
      </div>
    </div>
  );
}

/* Lecture 4, slide 6: human in the loop, by risk. */
const requests = [
  { ask: "Balance enquiry", tier: 0 },
  { ask: "Transaction details", tier: 0 },
  { ask: "Change of address", tier: 1 },
  { ask: "Order a cheque book", tier: 1 },
  { ask: "KYC update", tier: 2 },
  { ask: "Large transfer", tier: 2 },
];
const tiers = [
  { name: "Just do it", kind: "Read-only", what: "The agent acts on its own." },
  { name: "Ask the customer", kind: "Changes", what: "Show a summary; the customer confirms." },
  { name: "Ask a human expert", kind: "High risk", what: "A bank employee reviews first." },
];

export function HumanInTheLoop() {
  const [pick, setPick] = useState(2);
  const [decision, setDecision] = useState<"approve" | "deny" | null>(null);
  const tier = requests[pick].tier;
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-4">
        <p className="text-sm text-mist">A customer asks the bank assistant for…</p>
        <div role="radiogroup" aria-label="Customer request" className="mt-3 grid gap-2">
          {requests.map((r, i) => (
            <button key={r.ask} type="button" role="radio" aria-checked={i === pick} onClick={() => { setPick(i); setDecision(null); }} className={`rounded-evidence border px-4 py-2.5 text-left transition-colors ${i === pick ? "border-violet bg-violet/20 text-ivory" : "border-rule text-ivory/70 hover:text-ivory"}`}>{r.ask}</button>
          ))}
        </div>
      </div>
      <div className="md:col-span-8">
        <ol className="grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule sm:grid-cols-3">
          {tiers.map((t, i) => (
            <li key={t.name} className={`p-5 transition-colors duration-300 ${i === tier ? "bg-violet/25" : "bg-navy"}`} aria-current={i === tier ? "true" : undefined}>
              <p className="text-sm text-mist">{t.kind}</p>
              <p className={`mt-2 font-display text-xl font-semibold tracking-tight ${i === tier ? "text-ivory" : "text-ivory/50"}`}>{t.name}</p>
              <p className={`mt-2 text-[15px] ${i === tier ? "text-ivory/85" : "text-ivory/40"}`}>{t.what}</p>
            </li>
          ))}
        </ol>
        {requests[pick].ask === "Change of address" && (
          <div className="mt-6 rounded-evidence border border-rule p-5">
            <p className="text-sm text-mist">What it looks like: the service agent prepares the change</p>
            <p className="mt-2 text-lg">Update address to 42 Maple Ave, Sudbury?</p>
            <div className="mt-4 flex gap-3">
              <button type="button" className="btn border-violet/70" onClick={() => setDecision("approve")}>Approve</button>
              <button type="button" className="btn" onClick={() => setDecision("deny")}>Deny</button>
            </div>
            <p className="mt-3 text-[15px] text-ivory/85" aria-live="polite">
              {decision === "approve" ? "Approved → the tool runs." : decision === "deny" ? "Denied → nothing changes." : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
