import { useEffect, useRef, useState } from "react";
import { StarFall, spritesReady } from "../../starfall/engine";
import { SoundBank } from "../../starfall/sounds";

/** The full game, with the project's music and sounds. */
export function PlayStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<StarFall | null>(null);
  const soundsRef = useRef(new SoundBank());
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [music, setMusic] = useState(true);
  const [effects, setEffects] = useState(true);
  const [volume, setVolume] = useState(70);
  const [boxes, setBoxes] = useState(false);

  useEffect(() => {
    const sounds = soundsRef.current;
    const game = new StarFall(canvasRef.current!, {
      onScore: setScore,
      onPop: () => sounds.effect("snd_popSound"),
      onGround: () => sounds.effect("snd_sadWhistleSound"),
    });
    gameRef.current = game;
    spritesReady().then(() => game.draw());
    // Leaving the stage pauses the game and the music.
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && game.running) {
        game.stop();
        sounds.pauseMusic();
        setPaused(true);
      }
    }, { threshold: 0.15 });
    io.observe(stageRef.current!);
    return () => {
      io.disconnect();
      game.stop();
      sounds.stopAll();
    };
  }, []);

  const begin = () => {
    gameRef.current!.start();
    soundsRef.current.startMusic(); // needs this click: browsers block sound until the player interacts
    setStarted(true);
    setPaused(false);
    canvasRef.current?.focus();
  };

  const togglePause = () => {
    const g = gameRef.current!;
    if (!started) return begin();
    if (g.running) {
      g.stop();
      soundsRef.current.pauseMusic();
      setPaused(true);
    } else {
      g.start();
      if (music) soundsRef.current.startMusic();
      setPaused(false);
    }
  };

  const restart = () => {
    const g = gameRef.current!;
    g.reset();
    g.draw();
    if (!g.running) togglePause();
  };

  const toggleMusic = () => {
    soundsRef.current.setMusic(!music);
    if (!started || paused) soundsRef.current.pauseMusic();
    setMusic(!music);
  };
  const toggleEffects = () => {
    soundsRef.current.effects = !effects;
    setEffects(!effects);
  };
  const toggleBoxes = () => {
    gameRef.current!.showBoxes = !boxes;
    gameRef.current!.draw();
    setBoxes(!boxes);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") { e.preventDefault(); togglePause(); }
    else if (k === "r") restart();
    else if (k === "m") toggleMusic();
    else if (k === "b") toggleBoxes();
    else if (k === "f") fullscreen();
  };

  const fullscreen = () => {
    const el = stageRef.current!;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  const toggleBtn = (on: boolean) => `btn ${on ? "border-teal/70 bg-teal/10" : "text-mist"}`;

  return (
    <div ref={stageRef} data-keys-local onKeyDown={onKeyDown} className="group/stage bg-navy [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:p-6">
      <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-stage border border-rule bg-graphite [:fullscreen_&]:max-w-[min(100%,calc((100vh-120px)*1366/768))]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="block aspect-[1366/768] w-full cursor-crosshair touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-teal-soft"
          onPointerDown={(e) => started && !paused && gameRef.current?.click(e.clientX, e.clientY)}
          aria-label="StarFall game. Click or tap the falling stars to pop them. Space pauses, R restarts, M mutes music, B shows collision boxes, F is full screen."
          role="application"
        />
        {!started && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-navy/55 p-6 text-center backdrop-blur-[2px]">
            <button type="button" onClick={begin} className="rounded-full bg-ivory px-7 py-3 font-display text-lg font-semibold tracking-tight text-navy transition-transform duration-300 hover:scale-[1.03]">
              Start StarFall
            </button>
            <p className="hidden max-w-[44ch] text-sm text-ivory/85 sm:block">Sound on. Click the stars before they reach the ground.</p>
          </div>
        )}
        {started && paused && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-navy/40">
            <p className="font-display text-2xl font-semibold">Paused</p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">Score: {score}</p>

      <div className="mx-auto mt-4 flex w-full max-w-[1180px] flex-wrap items-center gap-3 text-sm">
        <button type="button" className="btn" onClick={togglePause} aria-keyshortcuts="Space">{!started ? "Start" : paused ? "Resume" : "Pause"}</button>
        <button type="button" className="btn" onClick={restart} aria-keyshortcuts="R">Restart</button>
        <span className="mx-1 hidden h-5 w-px bg-rule sm:block" aria-hidden="true" />
        <button type="button" className={toggleBtn(music)} aria-pressed={music} onClick={toggleMusic} aria-keyshortcuts="M">Music</button>
        <button type="button" className={toggleBtn(effects)} aria-pressed={effects} onClick={toggleEffects}>Sound effects</button>
        <label className="flex items-center gap-2 text-mist">
          Volume
          <input type="range" min={0} max={100} value={volume} className="w-24 accent-teal" onChange={(e) => { const v = Number(e.target.value); setVolume(v); soundsRef.current.setVolume(v / 100); }} />
        </label>
        <span className="mx-1 hidden h-5 w-px bg-rule sm:block" aria-hidden="true" />
        <button type="button" className={toggleBtn(boxes)} aria-pressed={boxes} onClick={toggleBoxes} aria-keyshortcuts="B">Collision boxes</button>
        <button type="button" className="btn sm:ml-auto" onClick={fullscreen} aria-keyshortcuts="F">Full screen</button>
      </div>
      <p className="mx-auto mt-3 w-full max-w-[1180px] text-sm text-mist">
        The rules and code come from my GameMaker project. My project uses the workshop's StarFall asset pack for sprites, music and sounds; this public version replaces them with simple placeholders, because they are not mine to redistribute.
        The controls under the game were added for
        this portfolio.
      </p>
    </div>
  );
}
