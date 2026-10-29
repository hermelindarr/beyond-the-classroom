import { useEffect, useRef } from "react";
import { gsap, setScrollLocked } from "../lib/motion";
import type { NotebookScene } from "./notebookScene";

type Props = { onDone: () => void };

/** Optional cinematic opening. Skippable at any moment (button, Esc, Enter). */
export function Intro({ onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<() => void>(() => {});

  useEffect(() => {
    let scene: NotebookScene | null = null;
    let tl: gsap.core.Timeline | null = null;
    let finished = false;
    let cancelled = false;
    setScrollLocked(true);

    const finish = () => {
      if (finished) return;
      finished = true;
      tl?.kill();
      gsap.to(rootRef.current, {
        autoAlpha: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          scene?.dispose();
          setScrollLocked(false);
          onDone();
        },
      });
    };
    skipRef.current = finish;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") finish();
    };
    window.addEventListener("keydown", onKey);

    // Three.js is loaded only when the intro actually plays.
    import("./notebookScene")
      .then(({ createNotebookScene }) => createNotebookScene(canvasRef.current!, rulerRef.current!))
      .then((s) => {
        if (finished || cancelled) return s.dispose();
        scene = s;
        tl = s.play();
        tl.eventCallback("onComplete", finish);
      })
      .catch(finish);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      if (!finished) {
        tl?.kill();
        scene?.dispose();
        setScrollLocked(false);
      }
    };
  }, [onDone]);

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 bg-navy" role="dialog" aria-label="Opening animation">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div ref={rulerRef} className="invisible absolute inset-x-0 bottom-[14vh] translate-y-3 opacity-0" aria-hidden="true">
        <div className="shell grid grid-cols-4 text-sm text-mist">
          {["Week 1", "Week 2", "Week 3", "Week 4"].map((w, i) => (
            <div key={w} className={`border-t pt-3 ${i === 3 ? "border-dashed border-mist/50" : "border-ivory/40"}`}>
              {w}
              {i === 3 && <span className="text-mist/70"> · upcoming</span>}
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={() => skipRef.current()} className="btn absolute bottom-6 right-6 bg-navy/60 backdrop-blur" autoFocus>
        Skip intro
      </button>
    </div>
  );
}
