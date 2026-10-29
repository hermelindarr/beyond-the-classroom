import { useState } from "react";

// The approved Northstar time-off process (Lesson 7, slide 9 and the
// requirements register), as a working state machine. Each transition shows
// the requirement IDs it satisfies. The phone screens follow the class's
// three-screen design example (slide 20): low fidelity on purpose.

type State = "Draft" | "Pending Approval" | "Returned for Correction" | "Approved" | "Denied" | "Cancelled";
type Screen = "new" | "list" | "correct";
const states: State[] = ["Draft", "Pending Approval", "Returned for Correction", "Approved", "Denied", "Cancelled"];

export function RequestFlow() {
  const [state, setState] = useState<State>("Draft");
  const [valid, setValid] = useState(false);
  const [supervisor, setSupervisor] = useState(true);
  const [routed, setRouted] = useState(false);
  const [message, setMessage] = useState({ text: "A new request starts in Draft.", reqs: ["REQ-005"] });
  const [history, setHistory] = useState<State[]>(["Draft"]);

  const go = (to: State, text: string, reqs: string[]) => {
    setState(to);
    setMessage({ text, reqs });
    setHistory((h) => [...h, to].slice(-6));
  };
  const submit = () => {
    if (!valid) return setMessage({ text: "Missing or invalid fields: the request stays in Draft with correction messages.", reqs: ["REQ-006", "REQ-007"] });
    go("Pending Approval", "Valid: the request is submitted and waits for the supervisor.", ["REQ-006", "REQ-008"]);
    setRouted(false);
  };
  const decide = (to: State) => {
    if (!supervisor && !routed) return setMessage({ text: "No supervisor assigned: HR must route it manually first. Automatic delegation is not approved.", reqs: ["REQ-017"] });
    go(to, `The supervisor records the decision: ${to}.`, ["REQ-010", "REQ-012"]);
  };
  const reset = () => {
    setState("Draft"); setValid(false); setRouted(false); setHistory(["Draft"]);
    setMessage({ text: "A new request starts in Draft.", reqs: ["REQ-005"] });
  };

  const screen: Screen = state === "Draft" ? "new" : state === "Returned for Correction" ? "correct" : "list";

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-7">
        <ol className="flex flex-wrap gap-2" aria-label="Request states">
          {states.map((s) => (
            <li key={s} className={`rounded-full border px-3 py-1 text-sm transition-colors ${state === s ? "border-teal bg-teal/20 text-ivory" : "border-rule text-mist"}`} aria-current={state === s ? "step" : undefined}>{s}</li>
          ))}
        </ol>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm text-mist">Employee</legend>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={valid} onChange={(e) => setValid(e.target.checked)} disabled={state !== "Draft" && state !== "Returned for Correction"} className="accent-teal" />
              Fields complete and dates valid
            </label>
            <button type="button" className="btn w-full justify-center" onClick={submit} disabled={state !== "Draft"}>Submit</button>
            <button type="button" className="btn w-full justify-center" disabled={state !== "Returned for Correction"} onClick={() => (valid ? go("Pending Approval", "Corrected and resubmitted: validated again, then back to the supervisor.", ["REQ-016", "REQ-006"]) : setMessage({ text: "Still invalid: fix the fields before resubmitting.", reqs: ["REQ-007"] }))}>Correct and resubmit</button>
            <button type="button" className="btn w-full justify-center" disabled={state !== "Pending Approval"} onClick={() => go("Cancelled", "The employee cancels while it is Pending Approval.", ["REQ-016"])}>Cancel request</button>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm text-mist">Supervisor</legend>
            {(["Approved", "Denied", "Returned for Correction"] as State[]).map((d) => (
              <button key={d} type="button" className="btn w-full justify-center" disabled={state !== "Pending Approval"} onClick={() => { if (d === "Returned for Correction") setValid(false); decide(d); }}>
                {d === "Returned for Correction" ? "Return" : d === "Approved" ? "Approve" : "Deny"}
              </button>
            ))}
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm text-mist">HR</legend>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={!supervisor} onChange={(e) => { setSupervisor(!e.target.checked); setRouted(false); }} className="accent-amber" />
              Supervisor missing
            </label>
            <button type="button" className="btn w-full justify-center" disabled={supervisor || routed || state !== "Pending Approval"} onClick={() => { setRouted(true); setMessage({ text: "HR coordinates authorized manual routing to another supervisor.", reqs: ["REQ-013", "REQ-017"] }); }}>Route manually</button>
            <button type="button" className="btn w-full justify-center text-mist" onClick={reset}>Start a new request</button>
          </fieldset>
        </div>

        <div className="mt-8 rounded-evidence border border-rule p-4" aria-live="polite">
          <p className="text-[15px] text-ivory/90">{message.text}</p>
          <p className="mt-2 flex flex-wrap gap-2">{message.reqs.map((r) => <span key={r} className="rounded-[3px] bg-teal/15 px-2 py-0.5 font-code text-[12px] text-teal-soft">{r}</span>)}</p>
        </div>
        <p className="mt-3 text-sm text-mist">Path so far: {history.join(" → ")}</p>
      </div>

      <div className="md:col-span-4 md:col-start-9">
        <Phone screen={screen} state={state} valid={valid} />
        <p className="mt-3 text-center text-sm text-mist">Low-fidelity screen, after the class design example</p>
      </div>
    </div>
  );
}

function Field({ label, value, error }: { label: string; value: string; error?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-navy/70">{label}</p>
      <div className={`mt-0.5 rounded-[3px] border px-2 py-1.5 text-[12px] ${error ? "border-[#C0392B] text-[#C0392B]" : "border-navy/30 text-navy"}`}>{value}</div>
    </div>
  );
}

function Phone({ screen, state, valid }: { screen: Screen; state: State; valid: boolean }) {
  return (
    <div className="mx-auto w-[240px] rounded-[28px] border-[6px] border-graphite bg-ivory p-4 text-navy shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" role="img" aria-label={`Phone screen: ${screen === "new" ? "New time-off request" : screen === "correct" ? "Correct request" : "My requests"}`}>
      <p className="font-display text-[15px] font-bold">{screen === "new" ? "New Time-Off Request" : screen === "correct" ? "Correct Request" : "My Requests"}</p>
      <div className="mt-4 space-y-2.5">
        {screen === "new" && (
          <>
            <Field label="Leave type" value={valid ? "Vacation" : "Select…"} error={!valid} />
            <Field label="Start date" value="Nov 14" />
            <Field label="End date" value={valid ? "Nov 15" : "Nov 12"} error={!valid} />
            {!valid && <p className="text-[11px] text-[#C0392B]">Fix 2 items before submitting</p>}
            <div className="rounded-[3px] bg-navy py-2 text-center text-[12px] text-ivory">Submit Request</div>
          </>
        )}
        {screen === "list" && (
          <>
            {[["Request 001", state], ["Request 002", "Approved"], ["Request 003", "Draft"]].map(([n, s]) => (
              <div key={n} className="flex items-center justify-between rounded-[3px] border border-navy/30 px-2 py-2 text-[12px]">
                <span>{n}</span>
                <span className="rounded-full border border-navy/40 px-1.5 text-[10px]">{s}</span>
              </div>
            ))}
          </>
        )}
        {screen === "correct" && (
          <>
            <p className="rounded-[3px] bg-[#C0392B]/10 p-2 text-[11px] text-[#C0392B]">Correction required: end date before start date</p>
            <Field label="Start date" value="Nov 14" />
            <Field label="End date" value={valid ? "Nov 15" : "Nov 12"} error={!valid} />
            <div className="rounded-[3px] bg-navy py-2 text-center text-[12px] text-ivory">Resubmit Request</div>
          </>
        )}
      </div>
    </div>
  );
}
