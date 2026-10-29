import { useState } from "react";
import { sha256 } from "../../lib/sha256";

// The class story "The Story Takes a Turn": one message, three harms, three
// sets of controls. Threats, examples and controls follow the class slides.

const props = [
  {
    key: "c", name: "Confidentiality", question: "Who can read it?", harm: "A stranger reads the message",
    example: "A sensitive attachment is emailed over an unencrypted connection and read in transit.",
    controls: ["Access permissions", "Encryption", "Multi-factor authentication"],
  },
  {
    key: "i", name: "Integrity", question: "Was it changed?", harm: "Someone changes one instruction",
    example: "An invoice for $1,200 is altered to $12,000 before delivery.",
    controls: ["Cryptographic hashes", "Digital signatures", "Audit logs"],
  },
  {
    key: "a", name: "Availability", question: "Can we reach it?", harm: "A jammer blocks delivery",
    example: "Ransomware takes a hospital portal offline; staff go back to paper for hours.",
    controls: ["Regular backups", "Redundancy", "Patching"],
  },
] as const;

const ORIGINAL = "Invoice total: $1,200";

function Integrity() {
  const [tampered, setTampered] = useState(false);
  const received = tampered ? ORIGINAL.replace("$1,200", "$12,000") : ORIGINAL;
  const sent = sha256(ORIGINAL);
  const got = sha256(received);
  const match = sent === got;
  return (
    <div className="mt-6 space-y-3 font-code text-[13px]">
      <div className="rounded-evidence border border-rule p-4">
        <p className="font-body text-sm text-mist">Sent</p>
        <p className="mt-1 text-ivory">{ORIGINAL}</p>
        <p className="mt-2 break-all text-teal-soft">SHA-256 {sent.slice(0, 32)}…</p>
      </div>
      <div className={`rounded-evidence border p-4 ${match ? "border-rule" : "border-amber"}`}>
        <p className="font-body text-sm text-mist">Received</p>
        <p className="mt-1 text-ivory">{received}</p>
        <p className={`mt-2 break-all ${match ? "text-teal-soft" : "text-amber"}`}>SHA-256 {got.slice(0, 32)}…</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 font-body">
        <button type="button" className={`btn ${tampered ? "border-amber/70 bg-amber/10" : ""}`} aria-pressed={tampered} onClick={() => setTampered(!tampered)}>
          {tampered ? "Undo the tampering" : "Tamper in transit"}
        </button>
        <p aria-live="polite" className={`text-[15px] ${match ? "text-ivory/85" : "text-amber"}`}>
          {match ? "Fingerprints match: the message is unchanged." : "Fingerprints differ: the change is detected."}
        </p>
      </div>
    </div>
  );
}

function Confidentiality() {
  const [encrypted, setEncrypted] = useState(false);
  const plain = "Patient file attached";
  const shown = encrypted ? sha256(plain).slice(0, 22).toUpperCase() : plain;
  return (
    <div className="mt-6 space-y-3">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-evidence border border-rule p-4">
        <div>
          <p className="text-sm text-mist">What an eavesdropper sees in transit</p>
          <p className={`mt-1 font-code text-[13px] ${encrypted ? "text-teal-soft" : "text-amber"}`}>{shown}</p>
        </div>
        <span className="text-2xl" aria-hidden="true">{encrypted ? "🔒" : "👁"}</span>
      </div>
      <button type="button" className={`btn ${encrypted ? "border-teal/70 bg-teal/10" : ""}`} aria-pressed={encrypted} onClick={() => setEncrypted(!encrypted)}>
        {encrypted ? "Turn encryption off" : "Encrypt the connection"}
      </button>
      <p className="text-sm text-mist">Illustration only: real encryption uses a key, not a fingerprint. Encryption protects confidentiality, but not integrity or availability on its own.</p>
    </div>
  );
}

function Availability() {
  const [down, setDown] = useState(false);
  const [backup, setBackup] = useState(false);
  const reachable = !down || backup;
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-center gap-3 rounded-evidence border border-rule p-4">
        <span className={`h-3 w-3 rounded-full ${reachable ? "bg-teal" : "bg-amber"}`} aria-hidden="true" />
        <p aria-live="polite">{reachable ? (down ? "Main portal down, failover system serving users" : "Patient portal online") : "Patient portal offline: staff switch to paper"}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="button" className={`btn ${down ? "border-amber/70 bg-amber/10" : ""}`} aria-pressed={down} onClick={() => setDown(!down)}>{down ? "End the attack" : "Simulate an outage"}</button>
        <button type="button" className={`btn ${backup ? "border-teal/70 bg-teal/10" : ""}`} aria-pressed={backup} onClick={() => setBackup(!backup)}>Redundancy {backup ? "on" : "off"}</button>
      </div>
    </div>
  );
}

export function CiaLab() {
  const [active, setActive] = useState(1);
  const p = props[active];
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-5">
        <svg viewBox="0 0 300 260" className="mx-auto w-full max-w-[340px]" aria-hidden="true">
          <path d="M150 20 L280 240 L20 240 Z" fill="none" stroke="#2C3544" strokeWidth={2} />
          {[[150, 20], [20, 240], [280, 240]].map(([x, y], i) => (
            <g key={i} onClick={() => setActive(i)} style={{ cursor: "pointer" }}>
              <circle cx={x} cy={y} r={i === active ? 18 : 12} fill={i === active ? "#1FA7A5" : "#222A35"} stroke="#F1EEE8" strokeWidth={1.5} style={{ transition: "all .3s" }} />
              <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontFamily="Bricolage Grotesque Variable" fontWeight={700} fill={i === active ? "#101827" : "#F1EEE8"}>{props[i].key.toUpperCase()}</text>
            </g>
          ))}
          <text x={150} y={170} textAnchor="middle" fill="#A3AAB6" fontSize={12} fontFamily="Atkinson Hyperlegible">one message, three harms</text>
        </svg>
        <div role="radiogroup" aria-label="Security property" className="mt-6 grid gap-2">
          {props.map((q, i) => (
            <button key={q.key} type="button" role="radio" aria-checked={i === active} onClick={() => setActive(i)} className={`grid grid-cols-[1fr_auto] items-baseline rounded-evidence border px-4 py-3 text-left transition-colors ${i === active ? "border-teal bg-teal/15" : "border-rule hover:border-mist/50"}`}>
              <span className="font-display text-lg font-semibold tracking-tight">{q.name}</span>
              <span className="text-sm text-mist">{q.question}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-6 md:col-start-7">
        <p className="text-sm text-amber">The harm: {p.harm.toLowerCase()}</p>
        <p className="mt-3 text-lg text-ivory/90">{p.example}</p>
        {p.key === "c" ? <Confidentiality /> : p.key === "i" ? <Integrity /> : <Availability />}
        <div className="mt-8 border-t border-rule pt-4">
          <p className="text-sm text-mist">Controls that help</p>
          <ul className="mt-2 flex flex-wrap gap-2">{p.controls.map((c) => <li key={c} className="chip chip-student">{c}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
