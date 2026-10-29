import { useEffect, useRef, useState } from "react";

// A small Harmony-style timeline: 60 frames at 24 fps, like the scene in my
// photo. Keyframes hold (the class default, "Stop Motion Keyframes") or
// in-between with motion keyframes.

const FRAMES = 60;
const FPS = 24;
const PINK = "#F7A8F2"; // the "Pink" swatch from my Harmony scene

type Key = { frame: number; x: number; y: number };
type Mode = "stop" | "motion" | "ease";

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function positionAt(keys: Key[], frame: number, mode: Mode) {
  const sorted = [...keys].sort((a, b) => a.frame - b.frame);
  const prev = [...sorted].reverse().find((k) => k.frame <= frame) ?? sorted[0];
  const next = sorted.find((k) => k.frame > frame);
  if (!next || mode === "stop") return { x: prev.x, y: prev.y };
  const t = (frame - prev.frame) / (next.frame - prev.frame);
  const p = mode === "ease" ? ease(t) : t;
  return { x: prev.x + (next.x - prev.x) * p, y: prev.y + (next.y - prev.y) * p };
}

export function KeyframeLab() {
  const [keys, setKeys] = useState<Key[]>([
    { frame: 1, x: 22, y: 62 },
    { frame: 30, x: 50, y: 30 },
    { frame: 60, x: 78, y: 62 },
  ]);
  const [frame, setFrame] = useState(7);
  const [mode, setMode] = useState<Mode>("stop");
  const [onion, setOnion] = useState(false);
  const [playing, setPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setFrame((f) => (f >= FRAMES ? 1 : f + 1)), 1000 / FPS);
    return () => window.clearInterval(id);
  }, [playing]);

  const pos = positionAt(keys, frame, mode);
  const keyHere = keys.find((k) => k.frame === frame);

  const moveTo = (e: React.PointerEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - r.top) / r.height) * 100));
    // Moving the drawing on a frame sets a keyframe there, as in Harmony.
    setKeys((ks) => [...ks.filter((k) => k.frame !== frame), { frame, x, y }]);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    if (e.key === "ArrowRight") { e.preventDefault(); setFrame((f) => Math.min(FRAMES, f + 1)); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setFrame((f) => Math.max(1, f - 1)); }
    else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
  };

  const ghosts = onion ? [-2, -1, 1, 2].map((d) => frame + d).filter((f) => f >= 1 && f <= FRAMES) : [];

  return (
    <div data-keys-local onKeyDown={onKey} className="mx-auto max-w-[1000px]">
      <div
        ref={stageRef}
        className="relative aspect-[16/9] w-full cursor-move touch-none select-none overflow-hidden rounded-stage border border-rule bg-[#8E929B]"
        onPointerDown={(e) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); setPlaying(false); moveTo(e); }}
        onPointerMove={(e) => dragging.current && moveTo(e)}
        onPointerUp={() => (dragging.current = false)}
        role="application"
        tabIndex={0}
        aria-label={`Animation stage, frame ${frame} of ${FRAMES}. Drag the circle to set a keyframe. Left and right arrows change frame, Space plays.`}
      >
        {/* Camera frame, as in the Harmony camera view */}
        <div className="pointer-events-none absolute inset-[8%] border border-navy/50" aria-hidden="true" />
        {ghosts.map((f) => {
          const g = positionAt(keys, f, mode);
          return <span key={f} className="pointer-events-none absolute h-[18%] w-[10.1%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-navy/40" style={{ left: `${g.x}%`, top: `${g.y}%`, background: f < frame ? "rgba(31,167,165,.25)" : "rgba(124,120,184,.3)" }} aria-hidden="true" />;
        })}
        <span className="pointer-events-none absolute h-[18%] w-[10.1%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-navy/60 shadow-lg" style={{ left: `${pos.x}%`, top: `${pos.y}%`, background: PINK }} aria-hidden="true" />
        <p className="absolute right-3 top-2 font-code text-xs text-navy/80" aria-hidden="true">Fr {frame}</p>
      </div>

      {/* Timeline */}
      <div className="mt-4 overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-[repeat(60,1fr)] gap-px" role="group" aria-label="Timeline">
          {Array.from({ length: FRAMES }, (_, i) => i + 1).map((f) => {
            const isKey = keys.some((k) => k.frame === f);
            return (
              <button
                key={f}
                type="button"
                onClick={() => { setPlaying(false); setFrame(f); }}
                aria-label={`Frame ${f}${isKey ? ", keyframe" : ""}`}
                aria-current={f === frame ? "true" : undefined}
                tabIndex={-1}
                className={`relative h-9 ${f === frame ? "bg-teal/40" : f % 6 === 0 ? "bg-graphite" : "bg-graphite/60"} hover:bg-teal/20`}
              >
                {isKey && <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ivory" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
        <div className="grid min-w-[640px] grid-cols-[repeat(60,1fr)] text-[10px] text-mist" aria-hidden="true">
          {Array.from({ length: FRAMES }, (_, i) => i + 1).map((f) => <span key={f} className="text-center">{f === 1 || f % 12 === 0 ? f : ""}</span>)}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <button type="button" className="btn" onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play at 24 fps"}</button>
        <div role="radiogroup" aria-label="Keyframe type" className="flex rounded-full border border-rule p-1">
          {([["stop", "Stop-motion keys"], ["motion", "Motion keys"], ["ease", "Ease in and out"]] as const).map(([m, label]) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1 transition-colors ${mode === m ? "bg-ivory text-navy" : "text-mist hover:text-ivory"}`}>{label}</button>
          ))}
        </div>
        <button type="button" className={`btn ${onion ? "border-teal/70 bg-teal/10" : "text-mist"}`} aria-pressed={onion} onClick={() => setOnion(!onion)}>Onion skin</button>
        {keyHere && keys.length > 2 && (
          <button type="button" className="btn text-mist" onClick={() => setKeys((ks) => ks.filter((k) => k.frame !== frame))}>Delete keyframe {frame}</button>
        )}
        <span className="ml-auto font-code text-[13px] text-teal-soft" aria-live="off">
          frame {frame} / {FRAMES} · {(frame / FPS).toFixed(2)} s
        </span>
      </div>
      <p className="mt-3 text-sm text-mist">
        {mode === "stop"
          ? "Stop-motion keys hold each pose until the next key: the circle jumps. This was the class default in Harmony."
          : mode === "motion"
            ? "Motion keys let Harmony draw the in-between frames: the circle glides at a constant speed."
            : "Easing slows the start and the end of each move, so it feels less mechanical."}
      </p>
    </div>
  );
}
