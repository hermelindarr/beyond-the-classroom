import { useEffect, useRef, useState } from "react";
import { StarFall, spritesReady } from "../starfall/engine";
import { prefersReducedMotion } from "../lib/env";
import { href } from "../lib/router";
import starCreate from "../starfall/gml/obj_star.Create_0.gml?raw";

export function FeaturedStarFall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<StarFall | null>(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const game = new StarFall(canvasRef.current!, { onScore: setScore });
    gameRef.current = game;
    const reduce = prefersReducedMotion();
    spritesReady().then(() => game.draw());
    // Silent preview: animate only while visible.
    const io = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      if (entry.isIntersecting) game.start();
      else game.stop();
      setRunning(game.running);
    }, { threshold: 0.25 });
    io.observe(canvasRef.current!);
    return () => {
      io.disconnect();
      game.stop();
    };
  }, []);

  const toggle = () => {
    const g = gameRef.current;
    if (!g) return;
    if (g.running) g.stop();
    else g.start();
    setRunning(g.running);
  };

  return (
    <section id="starfall" tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="starfall-title">
      <div className="shell grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
        <div className="min-w-0 md:col-span-7">
          <div className="overflow-hidden rounded-stage border border-rule bg-graphite">
            <canvas
              ref={canvasRef}
              className="block aspect-[1366/768] w-full cursor-crosshair"
              onPointerDown={(e) => gameRef.current?.click(e.clientX, e.clientY)}
              aria-label="StarFall preview. Click a falling star to pop it."
              role="img"
            />
          </div>
          <p className="sr-only" aria-live="polite">Score: {score}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-mist">
            <span>Silent preview of my game, rebuilt for the browser. Click a star to pop it.</span>
            <button type="button" onClick={toggle} className="btn">{running ? "Pause" : "Play preview"}</button>
          </div>
        </div>

        <div className="min-w-0 md:col-span-4 md:col-start-9">
          <p className="text-sm text-mist">A featured project from Game Design</p>
          <h2 id="starfall-title" className="display mt-3 text-[clamp(56px,7vw,96px)]">StarFall</h2>
          <p className="mt-6 max-w-measure text-lg text-ivory/85">
            My first video game, made in GameMaker. Stars fall from the night sky. Click them before they hit the ground.
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-rule pt-4 text-[15px]">
            <div><dt className="text-sm text-mist">Engine</dt><dd className="mt-1">GameMaker</dd></div>
            <div><dt className="text-sm text-mist">Language</dt><dd className="mt-1">GML</dd></div>
            <div><dt className="text-sm text-mist">When</dt><dd className="mt-1">Week 2</dd></div>
          </dl>
          <figure className="mt-8">
            <pre className="overflow-x-auto rounded-stage bg-graphite p-5 font-code text-[13px] leading-relaxed text-teal-soft"><code>{starCreate.trim()}</code></pre>
            <figcaption className="mt-3 text-sm text-mist">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-teal align-middle" aria-hidden="true" />
              From my project: every new star gets its own speed, colour and angle (obj_star, Create event)
            </figcaption>
          </figure>
          <a href={href("game-design")} className="btn mt-8 border-teal text-ivory">Open the case study, with sound</a>
        </div>
      </div>
    </section>
  );
}
