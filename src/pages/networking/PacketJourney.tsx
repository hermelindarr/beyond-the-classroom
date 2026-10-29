import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/env";

// Encapsulation down the sender's stack, across the network, and back up the
// receiver's stack (class slide "Encapsulation: Packing the Message"), plus
// the class walk-through "Follow a Website Request".

type Step = { side: "send" | "wire" | "recv"; layer: string; wraps: string[]; text: string };
const H = { data: "Data", tcp: "TCP header", ip: "IP header", mac: "MAC header", fcs: "Trailer" };

const encap: Step[] = [
  { side: "send", layer: "Application", wraps: [H.data], text: "The application creates the message: an HTTP GET request." },
  { side: "send", layer: "Transport", wraps: [H.tcp, H.data], text: "Transport adds a TCP header with ports. Now it is a segment." },
  { side: "send", layer: "Network", wraps: [H.ip, H.tcp, H.data], text: "Network adds an IP header with source and destination addresses. Now it is a packet." },
  { side: "send", layer: "Data Link", wraps: [H.mac, H.ip, H.tcp, H.data, H.fcs], text: "Data link adds MAC addresses for the next hop. Now it is a frame." },
  { side: "wire", layer: "Physical", wraps: [H.mac, H.ip, H.tcp, H.data, H.fcs], text: "The frame travels as bits: electrical, radio or light signals. Routers forward it using the IP address." },
  { side: "recv", layer: "Data Link", wraps: [H.ip, H.tcp, H.data], text: "The receiver checks the frame and removes the MAC header and trailer." },
  { side: "recv", layer: "Network", wraps: [H.tcp, H.data], text: "The IP header is read and removed: this packet is for this host." },
  { side: "recv", layer: "Transport", wraps: [H.data], text: "The port tells which application gets the data. The TCP header is removed." },
  { side: "recv", layer: "Application", wraps: [H.data], text: "The web server reads the original request and can answer." },
];

const website = [
  { step: "Enter URL", layer: "Application", text: "You type an address in the browser." },
  { step: "DNS resolution", layer: "Application", text: "DNS turns the name into an IP address." },
  { step: "TCP handshake", layer: "Transport", text: "SYN, SYN-ACK, ACK: the two hosts agree to talk." },
  { step: "TLS encryption", layer: "Presentation / Application", text: "Keys are agreed so the conversation is encrypted." },
  { step: "HTTP GET", layer: "Application", text: "The browser finally asks for the page." },
];

const chip: Record<string, string> = {
  [H.data]: "bg-ivory text-navy",
  [H.tcp]: "bg-teal text-navy",
  [H.ip]: "bg-violet text-ivory",
  [H.mac]: "bg-amber text-navy",
  [H.fcs]: "bg-amber/70 text-navy",
};

export function PacketJourney() {
  const [mode, setMode] = useState<"encap" | "web">("encap");
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const steps = mode === "encap" ? encap.length : website.length;

  useEffect(() => setI(0), [mode]);
  useEffect(() => {
    if (!auto || prefersReducedMotion()) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % steps), 1700);
    return () => window.clearInterval(id);
  }, [auto, steps]);

  const s = encap[i];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div role="radiogroup" aria-label="Walk-through" className="inline-flex rounded-full border border-rule p-1 text-sm">
          {([["encap", "Encapsulation"], ["web", "A website request"]] as const).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 transition-colors ${mode === m ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
          ))}
        </div>
        <span className="flex-1" />
        <button type="button" className="btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>Back</button>
        <button type="button" className="btn border-teal/70" onClick={() => setI((i + 1) % steps)}>{i === steps - 1 ? "Start again" : "Next step"}</button>
        <button type="button" className={`btn ${auto ? "border-teal/70 bg-teal/10" : "text-mist"}`} aria-pressed={auto} onClick={() => setAuto(!auto)}>Auto play</button>
      </div>

      {mode === "encap" ? (
        <div className="mt-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3 text-sm">
            {(["send", "recv"] as const).map((side, k) => (
              <div key={side} className={`rounded-evidence border p-4 ${s.side === side ? "border-teal/70" : "border-rule"}`} style={{ order: k === 0 ? 0 : 2 }}>
                <p className="font-display text-base font-semibold">{side === "send" ? "Your laptop" : "Web server"}</p>
                <ul className="mt-3 space-y-1">
                  {["Application", "Transport", "Network", "Data Link", "Physical"].map((l) => (
                    <li key={l} className={`rounded-[2px] px-2 py-1 transition-colors ${(s.side === side || (s.side === "wire" && l === "Physical")) && s.layer === l ? "bg-teal/25 text-ivory" : "text-mist"}`}>{l}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="flex w-16 flex-col items-center justify-center gap-2 sm:w-28" style={{ order: 1 }} aria-hidden="true">
              <span className={`h-px w-full ${s.side === "wire" ? "bg-teal" : "bg-rule"}`} />
              <span className="text-center text-xs text-mist">network</span>
            </div>
          </div>
          <div className="mt-8 flex min-h-[64px] flex-wrap items-center justify-center gap-1 rounded-evidence border border-dashed border-rule p-3" aria-label="The message as it is wrapped">
            {s.wraps.map((w, k) => (
              <span key={`${w}-${k}`} className={`rounded-[2px] px-3 py-2 font-code text-xs transition-all duration-500 ${chip[w]}`}>{w === H.data ? "GET /index.html" : w}</span>
            ))}
          </div>
          <p className="mt-6 text-center text-lg text-ivory/90" aria-live="polite">
            <span className="font-display text-teal-soft">{s.layer}.</span> {s.text}
          </p>
          <p className="mt-2 text-center text-sm text-mist">Like a letter, in an envelope, in a box, on a truck: each layer adds its own label.</p>
        </div>
      ) : (
        <ol className="mt-10 grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule md:grid-cols-5">
          {website.map((w, k) => (
            <li key={w.step} className={`p-5 transition-colors duration-300 ${k === i ? "bg-teal/20" : k < i ? "bg-navy" : "bg-navy opacity-50"}`} aria-current={k === i ? "step" : undefined}>
              <p className="font-display text-sm text-teal-soft">{k + 1}</p>
              <p className="mt-2 font-display text-lg font-semibold tracking-tight">{w.step}</p>
              <p className="mt-1 text-xs text-mist">{w.layer}</p>
              <p className="mt-3 text-[15px] text-ivory/80">{w.text}</p>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-sm text-mist">Step {i + 1} of {steps}. Adapted from the class slides.</p>
    </div>
  );
}
