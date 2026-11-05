import { useEffect, useRef, useState } from "react";
import {
  ALARM_STEPS, drawBackground, drawGround, drawScore, LIVES, sprites, drawStar, explosionFrames, explosionImages, GROUND_BOX, GROUND_TILES, random, randomTint,
  ROOM, SPAWN_Y, SPEED_RANGE, SPRITE_FPS, spritesReady, STAR_BOX, starHitsGround, type Star,
} from "../../starfall/engine";
import { SoundBank } from "../../starfall/sounds";
import { prefersReducedMotion } from "../../lib/env";
import { ExplosionFrames } from "./ProjectAnatomy";

// Small, honest demonstrations of single GML events. They reuse the game's
// sprites and the same rules as the engine, one rule at a time.

const sounds = new SoundBank();
sounds.music = false;

const STEP_MS = 1000 / ROOM.fps;

/** True while the element is on screen: demos only animate when someone can see them. */
function useOnScreen(ref: React.RefObject<Element>) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return visible;
}

/** A fixed-step loop like the game's (60 steps per second, optionally slowed). */
function useStepLoop(step: () => void, draw: () => void, wanted: boolean, slow = 1, target?: React.RefObject<Element>) {
  const stepRef = useRef(step);
  const drawRef = useRef(draw);
  stepRef.current = step;
  drawRef.current = draw;
  const onScreen = useOnScreen(target ?? { current: null });
  const running = wanted && (!target || onScreen);
  useEffect(() => {
    spritesReady().then(() => drawRef.current());
    if (!running) return;
    let raf = 0, last = performance.now(), acc = 0;
    const loop = (now: number) => {
      acc = Math.min(acc + (now - last) / slow, 250);
      last = now;
      while (acc >= STEP_MS) {
        stepRef.current();
        acc -= STEP_MS;
      }
      drawRef.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, slow]);
}

function Room({ canvasRef, onPointerDown, label }: { canvasRef: React.RefObject<HTMLCanvasElement>; onPointerDown?: (e: React.PointerEvent<HTMLCanvasElement>) => void; label: string }) {
  return (
    <canvas
      ref={canvasRef}
      width={ROOM.w}
      height={ROOM.h}
      onPointerDown={onPointerDown}
      className="block aspect-[1366/768] w-full rounded-evidence border border-rule bg-graphite"
      role="img"
      aria-label={label}
    />
  );
}

const toRoom = (canvas: HTMLCanvasElement, e: React.PointerEvent) => {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * ROOM.w, y: ((e.clientY - r.top) / r.height) * ROOM.h };
};

function strokeBox(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, dash = false) {
  c.save();
  c.lineWidth = 3;
  c.strokeStyle = color;
  if (dash) c.setLineDash([10, 8]);
  c.strokeRect(x, y, w, h);
  c.restore();
}

/* Alarm 0 (version 1): one star every 60 steps. Version 2.0 switched it off. */
export function SpawnDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(!prefersReducedMotion());
  const [slow, setSlow] = useState(1);
  const [alarm, setAlarm] = useState(ALARM_STEPS);
  const [spawned, setSpawned] = useState(0);
  const state = useRef({ alarm: ALARM_STEPS, stars: [] as Star[], steps: 0 });

  const step = () => {
    const s = state.current;
    s.steps++;
    if (--s.alarm <= 0) {
      s.stars.push({ x: random(50, ROOM.w - 50), y: SPAWN_Y, speed: random(...SPEED_RANGE), angle: random(0, 360), tint: randomTint() });
      s.alarm = ALARM_STEPS;
      setSpawned((n) => n + 1);
    }
    s.stars.forEach((st) => { st.y += st.speed; st.angle += 1; });
    s.stars = s.stars.filter((st) => !starHitsGround(st));
    setAlarm(s.alarm);
  };
  const draw = () => {
    const c = canvasRef.current?.getContext("2d");
    if (!c) return;
    drawBackground(c);
    state.current.stars.forEach((st) => drawStar(c, st));
    drawGround(c);
  };
  useStepLoop(step, draw, running, slow, canvasRef);

  return (
    <div>
      <p className="mb-3 text-sm text-mist">Version 1 (Oct 22), before waves replaced the timer.</p>
      <Room canvasRef={canvasRef} label="Version 1: a new star appears above the room every 60 steps." />
      <div className="mt-4" aria-hidden="true">
        <div className="grid grid-cols-[repeat(60,1fr)] gap-[2px]">
          {Array.from({ length: ALARM_STEPS }, (_, i) => (
            <span key={i} className={`h-3 rounded-[1px] ${i < ALARM_STEPS - alarm ? "bg-teal" : "bg-rule"}`} />
          ))}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <p className="font-code text-[13px] text-teal-soft" aria-live="off">alarm[0] = {alarm}</p>
        <p className="text-mist">Stars created: {spawned}</p>
        <span className="flex-1" />
        <button type="button" className="btn" onClick={() => setRunning(!running)}>{running ? "Pause" : "Play"}</button>
        <button type="button" className="btn" onClick={() => { step(); draw(); }} disabled={running}>One step</button>
        <button type="button" className="btn" aria-pressed={slow > 1} onClick={() => setSlow(slow > 1 ? 1 : 10)}>{slow > 1 ? "Real speed" : "Slow motion ×10"}</button>
      </div>
    </div>
  );
}

/* obj_star Create: what one star rolls. */
export function CreateDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [star, setStar] = useState<Star>(() => ({ x: 683, y: SPAWN_Y, speed: 5, angle: 0, tint: "rgb(200,220,240)" }));
  const [falling, setFalling] = useState(false);
  const live = useRef<Star>({ ...star });

  const roll = () => {
    const s = { x: random(50, ROOM.w - 50), y: SPAWN_Y, speed: random(...SPEED_RANGE), angle: random(0, 360), tint: randomTint() };
    setStar(s);
    live.current = { ...s };
    setFalling(true);
  };
  // Steps until the star's box meets the ground's box.
  const steps = (() => {
    const s = { x: star.x, y: star.y };
    let n = 0;
    while (!starHitsGround(s) && n < 2000) { s.y += star.speed; n++; }
    return n;
  })();

  useStepLoop(
    () => {
      const s = live.current;
      s.y += s.speed;
      s.angle += 1;
      if (starHitsGround(s)) setFalling(false);
    },
    () => {
      const c = canvasRef.current?.getContext("2d");
      if (!c) return;
      drawBackground(c);
      if (falling || live.current.y > SPAWN_Y) drawStar(c, live.current);
      drawGround(c);
    },
    falling,
    1,
    canvasRef,
  );

  const [r, g, b] = star.tint.match(/\d+/g)!.map(Number);
  const pos = ((star.speed - SPEED_RANGE[0]) / (SPEED_RANGE[1] - SPEED_RANGE[0])) * 100;
  return (
    <div>
      <Room canvasRef={canvasRef} label="A star created with random speed, colour and angle, falling to the ground." />
      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-sm text-mist">speed</p>
          <p className="font-display text-2xl tabular-nums">{star.speed.toFixed(2)} <span className="text-sm text-mist">px / step</span></p>
          <div className="relative mt-2 h-1 rounded bg-rule" aria-hidden="true">
            <span className="absolute -top-1.5 h-4 w-1 rounded bg-teal" style={{ left: `${pos}%` }} />
          </div>
          <p className="mt-1 flex justify-between text-xs text-mist"><span>2.5</span><span>7.5</span></p>
        </div>
        <div>
          <p className="text-sm text-mist">image_blend</p>
          <p className="mt-1 flex items-center gap-3 font-code text-[13px]">
            <span className="h-7 w-7 rounded-full border border-ivory/30" style={{ background: star.tint }} aria-hidden="true" />
            {r}, {g}, {b}
          </p>
          <p className="mt-2 text-xs text-mist">Each channel 128–255, so stars are always light.</p>
        </div>
        <div>
          <p className="text-sm text-mist">time to the ground</p>
          <p className="font-display text-2xl tabular-nums">{(steps / ROOM.fps).toFixed(1)} <span className="text-sm text-mist">s · {steps} steps</span></p>
          <p className="mt-2 text-xs text-mist">Faster stars leave less time to react.</p>
        </div>
      </div>
      <button type="button" className="btn mt-5" onClick={roll}>Create a star</button>
    </div>
  );
}

/* obj_star Step: one degree per step. */
export function StepDemo() {
  const [angle, setAngle] = useState(0);
  const [running, setRunning] = useState(!prefersReducedMotion());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const a = useRef(0);
  useStepLoop(
    () => { a.current += 1; },
    () => {
      setAngle(a.current);
      const c = canvasRef.current?.getContext("2d");
      if (!c) return;
      c.clearRect(0, 0, 200, 200);
      c.save();
      c.translate(100 - ROOM.w / 2, 100 - ROOM.h / 2);
      drawStar(c, { x: ROOM.w / 2, y: ROOM.h / 2, angle: a.current, tint: "rgb(200,236,234)" });
      c.restore();
    },
    running,
    1,
    canvasRef,
  );
  return (
    <div className="grid items-center gap-8 sm:grid-cols-[220px_1fr]">
      <canvas ref={canvasRef} width={200} height={200} className="mx-auto rounded-full border border-rule bg-navy" role="img" aria-label="A star turning one degree per step." />
      <div>
        <p className="font-code text-[13px] text-teal-soft">image_angle = {angle % 360}°</p>
        <p className="mt-3 text-ivory/80">One full turn takes 360 steps: exactly 6 seconds at 60 steps per second.</p>
        <button type="button" className="btn mt-5" onClick={() => setRunning(!running)}>{running ? "Pause" : "Play"}</button>
      </div>
    </div>
  );
}

/* obj_star Left Pressed: the click must land inside the star's box. */
export function ClickDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("Click the star.");
  const st = useRef({ star: { x: 683, y: 300, speed: 0, angle: 20, tint: "rgb(246,224,170)" } as Star | null, boom: -1, bx: 0, by: 0, miss: null as null | { x: number; y: number; t: number } });

  useStepLoop(
    () => {
      const s = st.current;
      if (s.star) s.star.angle += 1;
      if (s.boom >= 0) {
        s.boom += SPRITE_FPS / ROOM.fps;
        if (s.boom >= explosionFrames.length) {
          s.boom = -1;
          s.star = { x: random(200, ROOM.w - 200), y: random(140, 380), speed: 0, angle: random(0, 360), tint: randomTint() };
        }
      }
      if (s.miss && ++s.miss.t > 40) s.miss = null;
    },
    () => {
      const c = canvasRef.current?.getContext("2d");
      if (!c) return;
      const s = st.current;
      drawBackground(c);
      if (s.star) {
        drawStar(c, s.star);
        strokeBox(c, s.star.x + STAR_BOX.left, s.star.y + STAR_BOX.top, STAR_BOX.right - STAR_BOX.left, STAR_BOX.bottom - STAR_BOX.top, "#1FA7A5", true);
      }
      const frame = s.boom >= 0 ? explosionImages[Math.floor(s.boom)] : null;
      if (frame?.complete) c.drawImage(frame, s.bx - 64, s.by - 64);
      if (s.miss) {
        c.save();
        c.strokeStyle = "#E0A458";
        c.lineWidth = 4;
        c.beginPath();
        c.arc(s.miss.x, s.miss.y, 18, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
      drawGround(c);
      drawScore(c, score);
    },
    true,
    1,
    canvasRef,
  );

  const press = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = toRoom(canvasRef.current!, e);
    const s = st.current;
    const star = s.star;
    if (star && x >= star.x + STAR_BOX.left && x <= star.x + STAR_BOX.right && y >= star.y + STAR_BOX.top && y <= star.y + STAR_BOX.bottom) {
      sounds.effect("snd_popSound");
      s.bx = star.x; s.by = star.y; s.boom = 0; s.star = null;
      setScore((n) => n + 1);
      setMessage("Hit: pop sound, explosion, score + 1.");
    } else {
      s.miss = { x, y, t: 0 };
      setMessage(star ? "Missed: the click was outside the star's box." : "Wait for the next star.");
    }
  };

  return (
    <div>
      <Room canvasRef={canvasRef} onPointerDown={press} label="A star with its click box drawn. Click inside the box to pop it." />
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <p aria-live="polite" className="text-ivory/85">{message}</p>
        <button type="button" className="btn ml-auto" onClick={() => { const s = st.current.star; if (s) { const r = canvasRef.current!.getBoundingClientRect(); press({ clientX: r.left + (s.x / ROOM.w) * r.width, clientY: r.top + (s.y / ROOM.h) * r.height } as React.PointerEvent<HTMLCanvasElement>); } }}>
          Click the star
        </button>
      </div>
      <p className="mt-2 text-xs text-mist">The dashed rectangle is the star's collision mask. GameMaker uses the same rectangle for clicks.</p>
    </div>
  );
}

/* obj_star Collision with obj_ground: rectangle overlap. */
export function CollisionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [x, setX] = useState(320);
  const [y, setY] = useState(380);
  const hit = starHitsGround({ x, y });
  const wasHit = useRef(false);

  useEffect(() => {
    if (hit && !wasHit.current) sounds.effect("snd_sadWhistleSound");
    wasHit.current = hit;
  }, [hit]);

  useEffect(() => {
    let alive = true;
    spritesReady().then(() => {
      const c = canvasRef.current?.getContext("2d");
      if (!c || !alive) return;
      drawBackground(c);
      drawStar(c, { x, y, angle: 0, tint: hit ? "rgb(240,200,150)" : "rgb(200,236,234)" });
      drawGround(c);
      GROUND_TILES.forEach(([gx, gy]) => strokeBox(c, gx, gy, GROUND_BOX.w, GROUND_BOX.h, "#E0A458"));
      strokeBox(c, x + STAR_BOX.left, y + STAR_BOX.top, STAR_BOX.right - STAR_BOX.left, STAR_BOX.bottom - STAR_BOX.top, hit ? "#E0A458" : "#1FA7A5", !hit);
    });
    return () => { alive = false; };
  }, [x, y, hit]);

  return (
    <div>
      <Room canvasRef={canvasRef} label={`Star box ${hit ? "overlaps" : "does not overlap"} a ground box.`} />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-mist">
          Star x: <span className="font-code text-teal-soft">{x}</span>
          <input type="range" min={60} max={1300} value={x} onChange={(e) => setX(+e.target.value)} className="mt-2 block w-full accent-teal" />
        </label>
        <label className="text-sm text-mist">
          Star y: <span className="font-code text-teal-soft">{y}</span>
          <input type="range" min={100} max={560} value={y} onChange={(e) => setY(+e.target.value)} className="mt-2 block w-full accent-teal" />
        </label>
      </div>
      <p aria-live="polite" className={`mt-4 text-[15px] ${hit ? "text-amber" : "text-ivory/80"}`}>
        {hit ? "Collision: the boxes overlap. The whistle plays and the star is destroyed." : "No collision yet. Move the star down onto the ground."}
      </p>
      <p className="mt-2 text-xs text-mist">Two tiles sit 32 pixels higher (y = 544), so stars over them land sooner.</p>
    </div>
  );
}

/* obj_explosion Animation End. */
export function AnimationEndDemo() {
  const [ended, setEnded] = useState(false);
  return (
    <div>
      <ExplosionFrames onEnd={() => setEnded(true)} />
      <p aria-live="polite" className="mt-4 font-code text-[13px] text-teal-soft">{ended ? "Animation End → instance_destroy()" : "Press play to run the animation to its end."}</p>
    </div>
  );
}

/* Draw GUI: the score is drawn over everything. */
export function GuiDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(3);
  const [wave, setWave] = useState(3);
  useEffect(() => {
    spritesReady().then(() => {
      const c = canvasRef.current?.getContext("2d");
      if (!c) return;
      drawBackground(c);
      drawGround(c);
      drawScore(c, score, wave);
      strokeBox(c, 0, 0, 260, 26, "#1FA7A5", true);
    });
  }, [score, wave]);
  return (
    <div>
      <Room canvasRef={canvasRef} label={`The interface text, Wave:${wave - 1} and Score: ${score}, drawn at the top-left corner.`} />
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <p className="font-code text-[13px] text-teal-soft">"Wave:" + string(wave-1) + "  Score: " + string({score})</p>
        <span className="flex-1" />
        <button type="button" className="btn" onClick={() => setWave(wave + 1)}>wave++</button>
        <button type="button" className="btn" onClick={() => setScore(score + 1)}>gameScore++</button>
      </div>
    </div>
  );
}

/*
 * obj_gameManager Step_0 (version 2.0): waves and three lives, with
 * Create_0's starting values and the two ways to restart after Game Over.
 * A step-by-step model of the rules, without the falling animation.
 */
export function WavesDemo() {
  const start = { wave: 1, stars: 0, starsLost: 0, gameOver: false, score: 0 };
  const [s, setS] = useState(start);
  const [log, setLog] = useState("Room start: no stars yet, wave = 1.");

  // Step_0: no star left → a wave of `wave` stars, then wave++.
  // Three stars lost → Game Over.
  const settle = (n: typeof start, msg: string) => {
    let next = { ...n };
    let text = msg;
    if (next.starsLost >= LIVES && !next.gameOver) {
      next = { ...next, gameOver: true };
      text += " Three stars lost: Game Over, its sound plays and the music stops.";
    }
    if (next.stars <= 0) {
      text += ` No star left: wave ${next.wave} sends ${next.wave} star${next.wave > 1 ? "s" : ""}.`;
      next = { ...next, stars: next.wave, wave: next.wave + 1 };
    }
    setS(next);
    setLog(text.trim());
  };
  useEffect(() => settle(start, "Room start: no stars yet, wave = 1."), []); // eslint-disable-line react-hooks/exhaustive-deps

  const pop = () => settle({ ...s, stars: s.stars - 1, score: s.score + 1 }, "A star is clicked: pop, explosion, one point.");
  const land = () => settle({ ...s, stars: s.stars - 1, starsLost: s.starsLost + 1 }, s.gameOver ? "A star lands after Game Over: still counted, but no whistle." : "A star reaches the ground: sad whistle, one star lost.");
  const restart = () => settle(start, "room_restart(): Create_0 runs again.");

  return (
    <div className="rounded-stage border border-rule bg-graphite p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-mist">Stars falling now</p>
          <div className="mt-2 flex min-h-[40px] flex-wrap gap-1" aria-hidden="true">
            {Array.from({ length: s.stars }, (_, i) => <img key={i} src={sprites.star} alt="" className="h-9 w-9 [image-rendering:pixelated]" />)}
          </div>
        </div>
        <div>
          <p className="text-sm text-mist">Stars lost</p>
          <div className="mt-2 flex gap-2" aria-hidden="true">
            {Array.from({ length: LIVES }, (_, i) => <span key={i} className={`h-4 w-8 rounded-full ${i < s.starsLost ? "bg-amber" : "border border-rule"}`} />)}
          </div>
        </div>
      </div>
      <p className="mt-5 font-code text-[13px] text-teal-soft">
        instance_number(obj_star) = {s.stars} · wave = {s.wave} · starsLost = {s.starsLost} · gameOver = {String(s.gameOver)} · gameScore = {s.score}
      </p>
      {s.gameOver && <img src={sprites.gameOver} alt="Game Over sign" className="mt-4 h-11 [image-rendering:pixelated]" />}
      <p aria-live="polite" className="mt-4 text-[15px] text-ivory/85">{log}</p>
      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <button type="button" className="btn" onClick={pop} disabled={s.gameOver || s.stars <= 0}>Click a star</button>
        <button type="button" className="btn" onClick={land} disabled={s.stars <= 0}>Let a star land</button>
        <button type="button" className="btn" onClick={restart} disabled={!s.gameOver}>Restart (R or click the sign)</button>
      </div>
    </div>
  );
}
