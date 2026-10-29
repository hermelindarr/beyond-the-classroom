import { useState } from "react";

// Two concepts from the class slides, as small toys: shape language
// ("Character Design and Development") and counterbalance ("Character Posing!").

const shapes = {
  circle: { label: "Circle", words: ["Soft", "Friendly", "Warm", "Youthful", "Unthreatening"] },
  square: { label: "Square", words: ["Stable", "Strong", "Reliable", "Grounded", "Stubborn"] },
  triangle: { label: "Triangle", words: ["Dynamic", "Dangerous", "Sharp", "Unpredictable", "Aggressive"] },
} as const;
type Shape = keyof typeof shapes;

function Character({ shape }: { shape: Shape }) {
  // One simple character, rebuilt from the chosen basic shape.
  const body = {
    circle: <ellipse cx={100} cy={128} rx={58} ry={54} />,
    square: <rect x={46} y={74} width={108} height={110} rx={6} />,
    triangle: <path d="M100 52 L166 186 L34 186 Z" />,
  }[shape];
  const head = {
    circle: <circle cx={100} cy={62} r={34} />,
    square: <rect x={70} y={26} width={60} height={56} rx={4} />,
    triangle: <path d="M100 8 L136 74 L64 74 Z" />,
  }[shape];
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
      <g fill="#F1EEE8" stroke="#101827" strokeWidth={3}>
        {body}
        {head}
      </g>
      <g fill="#101827">
        <circle cx={88} cy={shape === "triangle" ? 56 : 60} r={4} />
        <circle cx={112} cy={shape === "triangle" ? 56 : 60} r={4} />
      </g>
    </svg>
  );
}

export function ShapeLanguage() {
  const [shape, setShape] = useState<Shape>("circle");
  return (
    <div>
      <div className="flex aspect-square max-h-[260px] items-center justify-center rounded-evidence bg-graphite p-6">
        <Character shape={shape} />
      </div>
      <div role="radiogroup" aria-label="Base shape" className="mt-4 inline-flex rounded-full border border-rule p-1 text-sm">
        {(Object.keys(shapes) as Shape[]).map((s) => (
          <button key={s} type="button" role="radio" aria-checked={shape === s} onClick={() => setShape(s)} className={`rounded-full px-4 py-1.5 transition-colors ${shape === s ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{shapes[s].label}</button>
        ))}
      </div>
      <p className="mt-4 text-ivory/85" aria-live="polite">{shapes[shape].label} shapes read as: {shapes[shape].words.join(", ").toLowerCase()}.</p>
    </div>
  );
}

export function Counterbalance() {
  const [tilt, setTilt] = useState(12);
  // Shoulders tilt one way, hips the other: the slides' rule of thumb.
  const shoulder = { cx: 100, cy: 70 };
  const hip = { cx: 100, cy: 130 };
  return (
    <div>
      <div className="flex aspect-square max-h-[260px] items-center justify-center rounded-evidence bg-graphite p-6">
        <svg viewBox="0 0 200 220" className="h-full" aria-hidden="true">
          <circle cx={100 + tilt * 0.4} cy={34} r={18} fill="none" stroke="#F1EEE8" strokeWidth={3} />
          <g transform={`rotate(${-tilt} ${shoulder.cx} ${shoulder.cy})`}>
            <line x1={58} y1={70} x2={142} y2={70} stroke="#1FA7A5" strokeWidth={5} strokeLinecap="round" />
          </g>
          <g transform={`rotate(${tilt} ${hip.cx} ${hip.cy})`}>
            <line x1={70} y1={130} x2={130} y2={130} stroke="#7C78B8" strokeWidth={5} strokeLinecap="round" />
            <line x1={74} y1={130} x2={70} y2={205} stroke="#F1EEE8" strokeWidth={3} strokeLinecap="round" />
            <line x1={126} y1={130} x2={134} y2={205} stroke="#F1EEE8" strokeWidth={3} strokeLinecap="round" />
          </g>
          <path d={`M${100 + tilt * 0.3} 54 Q ${100 - tilt * 0.9} 100 100 130`} fill="none" stroke="#F1EEE8" strokeWidth={3} />
        </svg>
      </div>
      <label className="mt-4 block text-sm text-mist">
        Tilt <span className="font-code text-teal-soft">{tilt}°</span>
        <input type="range" min={-20} max={20} value={tilt} onChange={(e) => setTilt(+e.target.value)} className="mt-2 block w-full accent-teal" />
      </label>
      <p className="mt-3 text-ivory/85">
        <span className="text-teal-soft">Shoulders</span> and <span className="text-violet-soft">hips</span> tilt in opposite
        directions. The body curves into a line of action and looks balanced, not stiff.
      </p>
    </div>
  );
}
