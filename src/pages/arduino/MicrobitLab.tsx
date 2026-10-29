import { useEffect, useRef, useState } from "react";

// micro:bit features from the class slides (Queretaro2), and the class
// activity "Emojis Broadcast" with the exact blocks shown on the projector.

const HAPPY = ["00000", "01010", "00000", "10001", "01110"];
const SAD = ["00000", "01010", "00000", "01110", "10001"];
const BLANK = ["00000", "00000", "00000", "00000", "00000"];

type Feature = { id: string; name: string; kind: "Input" | "Output" | "Communication"; what: string };
export const features: Feature[] = [
  { id: "buttons", name: "Buttons A and B", kind: "Input", what: "Two push buttons: the simplest way to give the program an input." },
  { id: "sensors", name: "Built-in sensors", kind: "Input", what: "Light, temperature, accelerometer (motion), compass; microphone and touch on version 2." },
  { id: "leds", name: "5 × 5 LED matrix", kind: "Output", what: "25 LEDs that display light, text and emoji." },
  { id: "speaker", name: "Speaker", kind: "Output", what: "An actuator for sound (version 2)." },
  { id: "radio", name: "Radio", kind: "Communication", what: "micro:bits in the same radio group can send numbers and text to each other." },
  { id: "pins", name: "Edge pins", kind: "Communication", what: "General purpose input/output pins to connect extra sensors and actuators." },
];

function Device({ label, grid, onA, onB, highlight }: { label: string; grid: string[]; onA: () => void; onB: () => void; highlight?: string | null }) {
  const ring = (id: string) => (highlight === id ? "#1FA7A5" : "transparent");
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 220 190" className="w-full max-w-[260px]" role="img" aria-label={`${label}: display shows ${grid === HAPPY ? "a happy face" : grid === SAD ? "a sad face" : "nothing"}`}>
        <rect x={6} y={6} width={208} height={150} rx={14} fill="#1B1F27" stroke={ring("radio")} strokeWidth={3} />
        <rect x={10} y={150} width={200} height={34} rx={4} fill="#B98B3E" stroke={ring("pins")} strokeWidth={3} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={22 + i * 42} y={156} width={18} height={24} rx={3} fill="#D9B062" />)}
        <rect x={62} y={30} width={96} height={96} rx={6} fill="none" stroke={ring("leds")} strokeWidth={3} />
        {grid.map((row, y) => [...row].map((v, x) => (
          <rect key={`${x}-${y}`} x={70 + x * 17} y={38 + y * 17} width={10} height={10} rx={2} fill={v === "1" ? "#FF5A4E" : "#3A3F4A"} style={{ filter: v === "1" ? "drop-shadow(0 0 4px #FF5A4E)" : "none" }} />
        )))}
        <g stroke={ring("buttons")} strokeWidth={3}>
          <circle cx={34} cy={78} r={14} fill="#3A3F4A" />
          <circle cx={186} cy={78} r={14} fill="#3A3F4A" />
        </g>
        <text x={34} y={112} textAnchor="middle" fill="#A3AAB6" fontSize={12} fontFamily="Atkinson Hyperlegible">A</text>
        <text x={186} y={112} textAnchor="middle" fill="#A3AAB6" fontSize={12} fontFamily="Atkinson Hyperlegible">B</text>
        <circle cx={110} cy={20} r={5} fill="#3A3F4A" stroke={ring("sensors")} strokeWidth={3} />
        <circle cx={150} cy={140} r={4} fill="#3A3F4A" stroke={ring("speaker")} strokeWidth={3} />
      </svg>
      <figcaption className="mt-3 text-sm text-mist">{label}</figcaption>
      <div className="mt-3 flex gap-3">
        <button type="button" className="btn" onClick={onA} aria-label={`Press button A on ${label}`}>Press A</button>
        <button type="button" className="btn" onClick={onB} aria-label={`Press button B on ${label}`}>Press B</button>
      </div>
    </figure>
  );
}

export function MicrobitLab() {
  const [feature, setFeature] = useState<string | null>("radio");
  const [screens, setScreens] = useState<[string[], string[]]>([BLANK, BLANK]);
  const [log, setLog] = useState<string[]>([]);
  const timers = useRef<number[]>([0, 0]);

  // on radio received number: if value = 1 show happy, else sad; pause 1 s; clear screen
  const receive = (to: 0 | 1, value: number) => {
    setScreens((s) => (to === 0 ? [value === 1 ? HAPPY : SAD, s[1]] : [s[0], value === 1 ? HAPPY : SAD]));
    window.clearTimeout(timers.current[to]);
    timers.current[to] = window.setTimeout(() => setScreens((s) => (to === 0 ? [BLANK, s[1]] : [s[0], BLANK])), 1000);
  };
  const send = (from: 0 | 1, value: 1 | 2) => {
    setLog((l) => [`micro:bit ${from + 1} sends ${value} on group 1`, ...l].slice(0, 4));
    receive(from === 0 ? 1 : 0, value);
  };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const f = features.find((x) => x.id === feature);
  return (
    <div>
      <div className="grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="grid grid-cols-2 gap-6 md:col-span-7">
          <Device label="micro:bit 1" grid={screens[0]} onA={() => send(0, 1)} onB={() => send(0, 2)} highlight={feature} />
          <Device label="micro:bit 2" grid={screens[1]} onA={() => send(1, 1)} onB={() => send(1, 2)} highlight={feature} />
          <ul className="col-span-2 min-h-[96px] space-y-1 font-code text-[13px] text-teal-soft" aria-live="polite" aria-label="Radio log">
            {log.length ? log.map((l, i) => <li key={i} className={i ? "text-mist" : ""}>{l}</li>) : <li className="text-mist">Press A or B on either micro:bit.</li>}
          </ul>
        </div>
        <div className="md:col-span-5">
          <div className="space-y-1 rounded-stage bg-[#F4F5F7] p-4 font-body text-[13px] font-bold text-white" aria-label="The class code as MakeCode blocks">
            <p className="w-max rounded bg-[#3E8E41] px-3 py-1.5">on start</p>
            <p className="ml-5 w-max rounded bg-[#E3008C] px-3 py-1.5">radio set group 1</p>
            <p className="w-max rounded bg-[#C724B1] px-3 py-1.5">on button A pressed → radio send number 1</p>
            <p className="w-max rounded bg-[#C724B1] px-3 py-1.5">on button B pressed → radio send number 2</p>
            <p className="w-max rounded bg-[#E3008C] px-3 py-1.5">on radio received number</p>
            <p className="ml-5 w-max rounded bg-[#00A4A6] px-3 py-1.5">if value = 1 then show icon ☺ else show icon ☹</p>
            <p className="ml-5 w-max rounded bg-[#1E90FF] px-3 py-1.5">pause 1 second · clear screen</p>
          </div>
          <p className="mt-3 text-sm text-mist">Class activity “Emojis Broadcast”, as shown on the projector.</p>
          <div className="mt-8">
            <p className="text-sm text-mist">What is on a micro:bit</p>
            <div role="group" aria-label="micro:bit features" className="mt-3 flex flex-wrap gap-2">
              {features.map((x) => (
                <button key={x.id} type="button" aria-pressed={feature === x.id} onClick={() => setFeature(x.id)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${feature === x.id ? "border-teal bg-teal/15 text-ivory" : "border-rule text-mist hover:text-ivory"}`}>{x.name}</button>
              ))}
            </div>
            {f && (
              <div className="mt-5" aria-live="polite">
                <p className="text-sm text-teal-soft">{f.kind}</p>
                <p className="mt-1 text-[15px] text-ivory/85">{f.what}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
