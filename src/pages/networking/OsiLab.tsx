import { useState } from "react";

// Layer data follows the class slides ("OSI Model: Seven Layers",
// "Encapsulation", "TCP/IP Model") and my handwritten notes.
export const osi = [
  { n: 7, name: "Application", does: "Services users access directly: web, email, files.", examples: "HTTP, HTTPS, SMTP, FTP, DNS", unit: "Data", tcpip: "Application" },
  { n: 6, name: "Presentation", does: "Encoding, character sets, compression, encryption and decryption.", examples: "TLS encryption, UTF-8", unit: "Data", tcpip: "Application" },
  { n: 5, name: "Session", does: "Establishes, manages and ends sessions; keeps the dialogue in sync.", examples: "Keeping a login session alive", unit: "Data", tcpip: "Application" },
  { n: 4, name: "Transport", does: "End-to-end delivery, ports, reliability.", examples: "TCP (reliable), UDP (fast)", unit: "Segment", tcpip: "Transport" },
  { n: 3, name: "Network", does: "IP addressing and routing between networks.", examples: "IP, ICMP · routers", unit: "Packet", tcpip: "Internet" },
  { n: 2, name: "Data Link", does: "Local frames and MAC addresses on the same link.", examples: "Ethernet, Wi-Fi · switches", unit: "Frame", tcpip: "Link" },
  { n: 1, name: "Physical", does: "Electrical, radio or optical signals and the media.", examples: "Cable, Wi-Fi radio, fibre", unit: "Bits", tcpip: "Link" },
] as const;

const tcpipLayers = ["Application", "Transport", "Internet", "Link"] as const;

export function OsiLab() {
  const [active, setActive] = useState(3); // index into osi (Transport)
  const [model, setModel] = useState<"osi" | "tcpip">("osi");
  const layer = osi[active];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(osi.length - 1, a + 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
  };

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-6" data-keys-local onKeyDown={onKey}>
        <div role="radiogroup" aria-label="Model" className="mb-5 inline-flex rounded-full border border-rule p-1 text-sm">
          {([["osi", "OSI · 7 layers"], ["tcpip", "TCP/IP · 4 layers"]] as const).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={model === m} onClick={() => setModel(m)} className={`rounded-full px-4 py-1.5 transition-colors ${model === m ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <ol className="flex-1 space-y-1.5" aria-label="OSI layers, top to bottom">
            {osi.map((l, i) => (
              <li key={l.n}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-pressed={i === active}
                  className={`grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 rounded-evidence border px-4 py-3 text-left transition-all duration-300 ${i === active ? "translate-x-2 border-teal bg-teal/15" : "border-rule hover:border-mist/50"}`}
                >
                  <span className="font-display text-xl font-semibold text-teal-soft">{l.n}</span>
                  <span className="font-display text-lg font-semibold tracking-tight">{l.name}</span>
                  <span className="font-code text-xs text-mist">{l.unit}</span>
                </button>
              </li>
            ))}
          </ol>
          {model === "tcpip" && (
            <ol className="flex w-28 flex-col gap-1.5" aria-label="TCP/IP layers">
              {tcpipLayers.map((t) => {
                const span = osi.filter((l) => l.tcpip === t).length;
                const on = layer.tcpip === t;
                return (
                  <li key={t} style={{ flexGrow: span }} className={`flex items-center justify-center rounded-evidence border px-2 text-center text-sm transition-colors ${on ? "border-violet bg-violet/20 text-ivory" : "border-rule text-mist"}`}>
                    {t}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        <p className="mt-4 text-sm text-mist">Mnemonic from class, layers 7 to 1: All People Seem To Need Data Processing. Arrow keys move between layers.</p>
      </div>

      <div className="md:col-span-5 md:col-start-8" aria-live="polite">
        <p className="font-display text-sm text-teal-soft">Layer {layer.n}{model === "tcpip" ? ` · TCP/IP ${layer.tcpip}` : ""}</p>
        <p className="heading mt-2 text-4xl">{layer.name}</p>
        <p className="mt-5 text-lg text-ivory/85">{layer.does}</p>
        <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-rule pt-4 text-[15px]">
          <div><dt className="text-sm text-mist">Examples</dt><dd className="mt-1">{layer.examples}</dd></div>
          <div><dt className="text-sm text-mist">Data unit</dt><dd className="mt-1 font-code text-teal-soft">{layer.unit}</dd></div>
        </dl>
      </div>
    </div>
  );
}
