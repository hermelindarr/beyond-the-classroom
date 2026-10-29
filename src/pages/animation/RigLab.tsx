import { useRef, useState } from "react";

// Forward vs inverse kinematics on a two-bone limb, from my Blender notes
// ("FK – Forward Kinematics, IK – Inverse Kinematics").

const ROOT = { x: 200, y: 150 };
const L1 = 120;
const L2 = 110;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function forward(a1: number, a2: number) {
  const elbow = { x: ROOT.x + L1 * Math.cos(rad(a1)), y: ROOT.y + L1 * Math.sin(rad(a1)) };
  const hand = { x: elbow.x + L2 * Math.cos(rad(a1 + a2)), y: elbow.y + L2 * Math.sin(rad(a1 + a2)) };
  return { elbow, hand };
}

/** Analytic two-bone IK: joint angles that put the hand on the target (or as close as possible). */
function inverse(tx: number, ty: number) {
  const dx = tx - ROOT.x, dy = ty - ROOT.y;
  const d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
  const cos2 = (d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  const a2 = Math.acos(Math.max(-1, Math.min(1, cos2)));
  const a1 = Math.atan2(dy, dx) - Math.atan2(L2 * Math.sin(a2), L1 + L2 * Math.cos(a2));
  return { a1: deg(a1), a2: deg(a2) };
}

function Bone({ from, to, color }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }) {
  return <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={22} strokeLinecap="round" />;
}

export function RigLab() {
  const [mode, setMode] = useState<"fk" | "ik">("fk");
  const [a1, setA1] = useState(30);
  const [a2, setA2] = useState(40);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const { elbow, hand } = forward(a1, a2);

  const dragTo = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 460;
    const y = ((e.clientY - r.top) / r.height) * 360;
    const s = inverse(x, y);
    setA1(s.a1);
    setA2(s.a2);
  };
  const nudge = (dx: number, dy: number) => {
    const s = inverse(hand.x + dx, hand.y + dy);
    setA1(s.a1);
    setA2(s.a2);
  };

  return (
    <div className="grid gap-8 md:grid-cols-12" data-keys-local>
      <div className="md:col-span-7">
        <svg
          ref={svgRef}
          viewBox="0 0 460 360"
          className={`w-full touch-none rounded-stage border border-rule bg-graphite ${mode === "ik" ? "cursor-grab" : ""}`}
          onPointerDown={(e) => { if (mode !== "ik") return; dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); dragTo(e); }}
          onPointerMove={(e) => mode === "ik" && dragging.current && dragTo(e)}
          onPointerUp={() => (dragging.current = false)}
          role="img"
          aria-label={`A two-bone limb. Upper bone at ${Math.round(a1)} degrees, lower bone bent ${Math.round(a2)} degrees.`}
        >
          <g opacity={0.25}>{[60, 120, 180, 240, 300].map((y) => <line key={y} x1={0} x2={460} y1={y} y2={y} stroke="#F1EEE8" strokeWidth={0.5} />)}</g>
          <Bone from={ROOT} to={elbow} color={mode === "fk" ? "#1FA7A5" : "#4FB9B7"} />
          <Bone from={elbow} to={hand} color={mode === "fk" ? "#2DC2BF" : "#1FA7A5"} />
          <circle cx={ROOT.x} cy={ROOT.y} r={9} fill="#101827" stroke="#F1EEE8" strokeWidth={2} />
          <circle cx={elbow.x} cy={elbow.y} r={8} fill="#101827" stroke="#F1EEE8" strokeWidth={2} />
          {mode === "ik" ? (
            <g>
              <circle cx={hand.x} cy={hand.y} r={16} fill="none" stroke="#E0A458" strokeWidth={2.5} strokeDasharray="4 4" />
              <text x={hand.x > 330 ? hand.x - 22 : hand.x + 22} y={hand.y + 5} textAnchor={hand.x > 330 ? "end" : "start"} fill="#E0A458" fontSize={13} fontFamily="Atkinson Hyperlegible">drag the hand</text>
            </g>
          ) : (
            <circle cx={hand.x} cy={hand.y} r={7} fill="#F1EEE8" />
          )}
          <text x={ROOT.x - 14} y={ROOT.y - 18} fill="#A3AAB6" fontSize={12} fontFamily="Atkinson Hyperlegible" textAnchor="end">shoulder</text>
        </svg>
      </div>

      <div className="md:col-span-5">
        <div role="radiogroup" aria-label="Kinematics mode" className="inline-flex rounded-full border border-rule p-1 text-sm">
          {([["fk", "Forward (FK)"], ["ik", "Inverse (IK)"]] as const).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 transition-colors ${mode === m ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
          ))}
        </div>
        {mode === "fk" ? (
          <>
            <p className="mt-5 text-ivory/85">Rotate each joint, starting from the shoulder. The hand ends up wherever the chain takes it.</p>
            <label className="mt-6 block text-sm text-mist">Shoulder <span className="font-code text-teal-soft">{Math.round(a1)}°</span>
              <input type="range" min={-180} max={180} value={Math.round(a1)} onChange={(e) => setA1(+e.target.value)} className="mt-2 block w-full accent-teal" />
            </label>
            <label className="mt-4 block text-sm text-mist">Elbow <span className="font-code text-teal-soft">{Math.round(a2)}°</span>
              <input type="range" min={0} max={160} value={Math.round(a2)} onChange={(e) => setA2(+e.target.value)} className="mt-2 block w-full accent-teal" />
            </label>
          </>
        ) : (
          <>
            <p className="mt-5 text-ivory/85">Place the hand. The rig works backwards and finds the shoulder and elbow angles for you.</p>
            <div className="mt-6 grid w-max grid-cols-3 gap-2" aria-label="Move the hand with buttons">
              <span />
              <button type="button" className="btn justify-center" onClick={() => nudge(0, -15)} aria-label="Move hand up">↑</button>
              <span />
              <button type="button" className="btn justify-center" onClick={() => nudge(-15, 0)} aria-label="Move hand left">←</button>
              <button type="button" className="btn justify-center" onClick={() => nudge(0, 15)} aria-label="Move hand down">↓</button>
              <button type="button" className="btn justify-center" onClick={() => nudge(15, 0)} aria-label="Move hand right">→</button>
            </div>
            <p className="mt-4 font-code text-[13px] text-teal-soft">shoulder {Math.round(a1)}° · elbow {Math.round(a2)}°</p>
          </>
        )}
        <p className="mt-6 text-sm text-mist">FK suits arcs, like a swinging arm. IK suits contact, like a foot planted on the ground during a walk.</p>
      </div>
    </div>
  );
}
