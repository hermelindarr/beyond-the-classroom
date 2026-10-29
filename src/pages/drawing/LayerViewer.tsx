import { useState } from "react";
import manifest from "../../assets/drawing/layers.json";

// The real layers of my Photoshop file (Dibujo Herme_1504.psd), exported in
// their original order and position. Layer 0 is the paper.
const files = import.meta.glob<string>("../../assets/drawing/layer-*.webp", { eager: true, import: "default" });
const layers = manifest.layers.map((l) => ({ ...l, src: files[`../../assets/drawing/${l.file}`] }));
const sketchLayers = layers.slice(1);
const labels = ["First pass", "Second pass"];

export function LayerViewer() {
  const [visible, setVisible] = useState<boolean[]>(sketchLayers.map(() => true));
  const [focus, setFocus] = useState<number | null>(null);
  const [fade, setFade] = useState(100);
  // Isolating only makes sense for a layer that is switched on.
  const isolated = focus !== null && visible[focus] ? focus : null;

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-7">
        <div className="relative mx-auto max-w-[620px] overflow-hidden rounded-evidence bg-ivory shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]" style={{ aspectRatio: `${manifest.width} / ${manifest.height}` }}>
          {sketchLayers.map((l, i) => (
            <img
              key={l.file}
              src={l.src}
              alt=""
              className="absolute inset-0 h-full w-full transition-opacity duration-500"
              style={{
                opacity: !visible[i] ? 0 : isolated !== null && isolated !== i ? 0.12 : i === sketchLayers.length - 1 ? fade / 100 : 1,
              }}
            />
          ))}
          <p className="sr-only">
            My character sheet: faces built on guide lines, a figure in a dress, a cat-faced fruit character, a pair of shorts, a
            star, flowers and a spiral.
          </p>
        </div>
      </div>
      <div className="md:col-span-5">
        <p className="text-sm text-mist">Layers in the Photoshop file</p>
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {sketchLayers.map((_, i) => i).reverse().map((i) => (
            <li key={i} className="flex items-center gap-4 py-3" onMouseEnter={() => setFocus(i)} onMouseLeave={() => setFocus(null)}>
              <button
                type="button"
                aria-pressed={visible[i]}
                aria-label={`${visible[i] ? "Hide" : "Show"} ${sketchLayers[i].name}`}
                onClick={() => setVisible((v) => v.map((x, j) => (j === i ? !x : x)))}
                className={`grid h-9 w-9 place-items-center rounded-evidence border transition-colors ${visible[i] ? "border-teal bg-teal/15 text-ivory" : "border-rule text-mist"}`}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  {visible[i] ? <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></> : <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s4 7 10 7a9.6 9.6 0 0 0 4.4-1.1" />}
                </svg>
              </button>
              <div className="h-14 w-10 shrink-0 overflow-hidden rounded-[1px] bg-ivory" aria-hidden="true">
                <img src={sketchLayers[i].src} alt="" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-tight">{sketchLayers[i].name}</p>
                <p className="text-sm text-mist">{labels[i]}</p>
              </div>
            </li>
          ))}
          <li className="flex items-center gap-4 py-3 text-mist">
            <span className="grid h-9 w-9 place-items-center rounded-evidence border border-rule" aria-hidden="true">·</span>
            <div className="h-14 w-10 rounded-[1px] bg-ivory" aria-hidden="true" />
            <p className="font-display text-lg font-semibold tracking-tight">{layers[0].name}<span className="ml-2 font-body text-sm font-normal">the paper</span></p>
          </li>
        </ul>
        <label className="mt-6 block text-sm text-mist">
          Second pass opacity <span className="font-code text-teal-soft">{fade}%</span>
          <input type="range" min={0} max={100} value={fade} onChange={(e) => setFade(+e.target.value)} className="mt-2 block w-full accent-teal" />
        </label>
        <p className="mt-6 text-[15px] text-ivory/80">
          Point at a layer to isolate it, or use the eye buttons. Each pass adds new characters on its own layer, so earlier
          ideas stay untouched.
        </p>
      </div>
    </div>
  );
}
