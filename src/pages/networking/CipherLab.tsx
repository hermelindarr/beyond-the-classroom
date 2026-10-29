import { useMemo, useState } from "react";

// Three ciphers, exactly as in my notebook page:
//  1. Caesar: "one shift for everything"
//  2. A shuffled alphabet (substitution), with the key I wrote down
//  3. Vigenère: "a moving shift" — my notes encrypt ATTACK with shifts
//     +11 +4 +12 +14 +13 +11, which is the key LEMON.

const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// From my notes. The letter under M reads as "Y": it is the only letter
// missing otherwise, and every letter must appear once.
export const MY_KEY = "XNTAHPOGZQWBYSFLRCVMUEKJDI";

const shiftChar = (c: string, s: number) => {
  const i = A.indexOf(c);
  return i < 0 ? c : A[(((i + s) % 26) + 26) % 26];
};
export const caesar = (t: string, s: number) => [...t.toUpperCase()].map((c) => shiftChar(c, s)).join("");
export const substitute = (t: string, key = MY_KEY) => [...t.toUpperCase()].map((c) => (A.includes(c) ? key[A.indexOf(c)] : c)).join("");
export function vigenere(t: string, key: string) {
  let k = 0;
  return [...t.toUpperCase()].map((c) => {
    if (!A.includes(c)) return c;
    const s = A.indexOf(key[k++ % key.length]);
    return shiftChar(c, s);
  }).join("");
}

function Wheel({ shift }: { shift: number }) {
  const r1 = 120, r2 = 88;
  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]" role="img" aria-label={`Caesar wheel with a shift of ${shift}: A becomes ${shiftChar("A", shift)}.`}>
      <circle cx={150} cy={150} r={138} fill="#222A35" />
      <circle cx={150} cy={150} r={104} fill="#101827" />
      {[...A].map((c, i) => {
        const a = ((i / 26) * 360 - 90) * (Math.PI / 180);
        return <text key={c} x={150 + r1 * Math.cos(a)} y={150 + r1 * Math.sin(a) + 5} textAnchor="middle" fontSize={14} fontFamily="Bricolage Grotesque Variable" fontWeight={600} fill={i === 0 ? "#F1EEE8" : "#A3AAB6"}>{c}</text>;
      })}
      <g style={{ transform: `rotate(${(-shift * 360) / 26}deg)`, transformOrigin: "150px 150px", transition: "transform .5s cubic-bezier(.2,.7,.1,1)" }}>
        {[...A].map((c, i) => {
          const a = ((i / 26) * 360 - 90) * (Math.PI / 180);
          return <text key={c} x={150 + r2 * Math.cos(a)} y={150 + r2 * Math.sin(a) + 5} textAnchor="middle" fontSize={14} fontFamily="Bricolage Grotesque Variable" fontWeight={700} fill={c === shiftChar("A", shift) ? "#6FD6D4" : "#F1EEE8"}>{c}</text>;
        })}
      </g>
      <path d="M150 12 L144 0 L156 0 Z" fill="#1FA7A5" />
      <text x={150} y={146} textAnchor="middle" fontSize={34} fontFamily="Bricolage Grotesque Variable" fontWeight={800} fill="#F1EEE8">{shift}</text>
      <text x={150} y={168} textAnchor="middle" fontSize={11} fontFamily="Atkinson Hyperlegible" fill="#A3AAB6">shift</text>
    </svg>
  );
}

const SAMPLE = "THE MESSAGE TO THE NURSE IN THE OTHER UNIT NEEDS TO ARRIVE SECRET AND UNCHANGED";

function Frequencies({ text }: { text: string }) {
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of text) if (A.includes(c)) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [text]);
  const max = counts[0]?.[1] ?? 1;
  return (
    <div className="flex h-28 items-end gap-2" aria-label={`Most frequent ciphertext letters: ${counts.map(([c, n]) => `${c} ${n}`).join(", ")}`}>
      {counts.map(([c, n], i) => (
        <div key={c} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-mist">{n}</span>
          <span className={`w-full rounded-t-[2px] ${i === 0 ? "bg-amber" : "bg-teal/60"}`} style={{ height: `${(n / max) * 72}px` }} />
          <span className="font-code text-sm">{c}</span>
        </div>
      ))}
    </div>
  );
}

export function CipherLab() {
  const [mode, setMode] = useState<"caesar" | "sub" | "vig">("caesar");
  const [shift, setShift] = useState(3);
  const [text, setText] = useState("BY HERMELINDA");
  const [vigText, setVigText] = useState("ATTACK");

  const out = mode === "caesar" ? caesar(text, shift) : mode === "sub" ? substitute(text) : vigenere(vigText, "LEMON");

  return (
    <div data-keys-local>
      <div role="radiogroup" aria-label="Cipher" className="inline-flex flex-wrap rounded-full border border-rule p-1 text-sm">
        {([["caesar", "Caesar"], ["sub", "Shuffled alphabet"], ["vig", "Vigenère"]] as const).map(([m, label]) => (
          <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 transition-colors ${mode === m ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
        ))}
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          {mode === "caesar" && (
            <>
              <Wheel shift={shift} />
              <label className="mt-6 block text-sm text-mist">Shift <span className="font-code text-teal-soft">{shift}</span>
                <input type="range" min={0} max={25} value={shift} onChange={(e) => setShift(+e.target.value)} className="mt-2 block w-full accent-teal" />
              </label>
            </>
          )}
          {mode === "sub" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse font-code text-[13px]">
                <tbody>
                  {[0, 13].map((start) => (
                    <tr key={start}>
                      {[...A.slice(start, start + 13)].map((c, i) => (
                        <td key={c} className="border border-rule px-1.5 py-1 text-center">
                          <span className="block text-mist">{c}</span>
                          <span className="block text-teal-soft">{MY_KEY[start + i]}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-sm text-mist">My key, copied from my notes. 26! ≈ 4 × 10²⁶ possible keys: “about 400 septillion”.</p>
            </div>
          )}
          {mode === "vig" && (
            <div className="space-y-2 font-code text-[13px]">
              {[...vigText.toUpperCase()].filter((c) => A.includes(c)).slice(0, 10).map((c, i) => {
                const k = "LEMON"[i % 5];
                return (
                  <div key={i} className="grid grid-cols-[28px_70px_28px_1fr] items-center gap-2">
                    <span>{c}</span>
                    <span className="text-mist">+{A.indexOf(k)} ({k})</span>
                    <span className="text-mist">→</span>
                    <span className="text-teal-soft">{shiftChar(c, A.indexOf(k))}</span>
                  </div>
                );
              })}
              <p className="pt-3 font-body text-sm text-mist">Key LEMON. The shift changes with every letter, so the same letter can encrypt differently.</p>
            </div>
          )}
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <label className="block text-sm text-mist">
            Plaintext
            <input
              value={mode === "vig" ? vigText : text}
              onChange={(e) => (mode === "vig" ? setVigText(e.target.value.slice(0, 60)) : setText(e.target.value.slice(0, 120)))}
              className="mt-2 block w-full rounded-evidence border border-rule bg-graphite px-4 py-3 font-code text-[15px] text-ivory outline-none focus:border-teal"
              spellCheck={false}
            />
          </label>
          <p className="mt-6 text-sm text-mist">Ciphertext</p>
          <p className="mt-2 break-all font-code text-2xl tracking-wide text-teal-soft" aria-live="polite">{out || " "}</p>
          {mode === "caesar" && <p className="mt-4 text-sm text-mist">Class exercise: encrypt “BY” and your name with a shift of 3. Shifting wraps around with clock arithmetic: (letter + shift) mod 26.</p>}
          {mode === "vig" && vigText.toUpperCase() === "ATTACK" && <p className="mt-4 text-[15px] text-ivory/85">Same result as in my notebook: L X F O P V.</p>}
          {mode === "sub" && (
            <div className="mt-8 border-t border-rule pt-4">
              <p className="text-[15px] text-ivory/85">The weakness in my notes: letter frequencies still give it away. Encrypt a longer English sentence and look for the tallest bar. It is probably E, which my key turns into H.</p>
              <button type="button" className="btn mt-4" onClick={() => setText(SAMPLE)}>Use a longer sentence</button>
              <div className="mt-6"><Frequencies text={substitute(text)} /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
