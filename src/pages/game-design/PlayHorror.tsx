import { useEffect, useRef, useState } from "react";
import { Horror, horrorReady, LAST_WAVE, type HorrorSounds, type HorrorStatus } from "../../starfall/horror";

const files = {
  snd_popSound: "./starfall3/snd_popSound.wav",
  snd_sadWhistleSound: "./starfall3/snd_sadWhistleSound.wav",
  snd_gameOverSound: "./starfall3/snd_gameOverSound.wav",
  snd_whisper: "./starfall3/snd_whisper.wav",
  snd_wizardSong: "./starfall3/snd_wizardSong.wav",
};
type Name = keyof typeof files;

/** Version 3.0's sounds. Pitch changes (combo, boss) use the playback rate without keeping the pitch. */
function makeSounds() {
  const templates = new Map<Name, HTMLAudioElement>();
  const get = (n: Name) => {
    let a = templates.get(n);
    if (!a) { a = new Audio(files[n]); a.preload = "auto"; templates.set(n, a); }
    return a;
  };
  let song: HTMLAudioElement | null = null;
  const state = { music: true, effects: true };
  const api: HorrorSounds & { preload: () => void; pause: () => void; setMusic: (on: boolean) => void; state: typeof state } = {
    state,
    preload: () => (Object.keys(files) as Name[]).forEach(get),
    effect: (name, pitch = 1) => {
      if (!state.effects) return;
      const a = get(name).cloneNode(true) as HTMLAudioElement;
      a.volume = 0.7;
      (a as HTMLAudioElement & { preservesPitch: boolean }).preservesPitch = false;
      a.playbackRate = pitch;
      a.play().catch(() => {});
    },
    startMusic: () => {
      if (!song) { song = get("snd_wizardSong"); song.loop = true; song.volume = 0.6; }
      if (state.music && song.paused) song.play().catch(() => {});
    },
    stopMusic: () => { if (song) { song.pause(); song.currentTime = 0; } },
    pause: () => song?.pause(),
    setMusic: (on) => { state.music = on; if (!song) return; if (on) song.play().catch(() => {}); else song.pause(); },
  };
  return api;
}

/** StarFall 3.0, the horror version, playable in the page. */
export function PlayHorror() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Horror | null>(null);
  const soundsRef = useRef(makeSounds());
  const [status, setStatus] = useState<HorrorStatus>({ score: 0, wave: 1, starsLost: 0, gameOver: false, won: false, started: false });
  const [paused, setPaused] = useState(false);
  const [music, setMusic] = useState(true);

  useEffect(() => {
    const sounds = soundsRef.current;
    const game = new Horror(canvasRef.current!, sounds, setStatus);
    gameRef.current = game;
    if (import.meta.env.DEV) (window as unknown as { __horror: Horror }).__horror = game; // for testing in development only
    horrorReady().then(() => game.draw());
    sounds.preload();
    // The game runs (and the title screen moves) only while it is on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { if (!game.running) { game.start(); setPaused(false); } }
      else if (game.running) { game.stop(); sounds.pause(); setPaused(true); }
    }, { threshold: 0.15 });
    io.observe(stageRef.current!);
    return () => { io.disconnect(); game.stop(); sounds.stopMusic(); };
  }, []);

  const resumeIfPaused = () => {
    const g = gameRef.current!;
    if (!g.running) { g.start(); setPaused(false); }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const g = gameRef.current!;
    if (paused) return;
    // The first click is also the browser's permission to play sound (the music stays off after a lost game).
    if (!(g.gameOver && !g.won)) soundsRef.current.startMusic();
    g.click(e.clientX, e.clientY);
  };

  const togglePause = () => {
    const g = gameRef.current!;
    if (g.running) { g.stop(); soundsRef.current.pause(); setPaused(true); }
    else { g.start(); if (status.started && !(status.gameOver && !status.won)) soundsRef.current.startMusic(); setPaused(false); }
  };

  const restart = () => {
    gameRef.current!.restart();
    resumeIfPaused();
  };

  const toggleMusic = () => { soundsRef.current.setMusic(!music); if (paused || !status.started) soundsRef.current.pause(); setMusic(!music); };

  const fullscreen = () => {
    const el = stageRef.current!;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen?.().catch(() => {});
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === " ") { e.preventDefault(); togglePause(); return; }
    if (k === "f") { fullscreen(); return; }
    if (k === "m") { toggleMusic(); return; }
    if (paused) return;
    const g = gameRef.current!;
    if (!(g.gameOver && !g.won)) soundsRef.current.startMusic();
    g.keyPressed(e.key);
  };

  return (
    <div ref={stageRef} data-keys-local onKeyDown={onKeyDown} className="bg-navy [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:p-6">
      <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-stage border border-rule bg-black [:fullscreen_&]:max-w-[min(100%,calc((100vh-120px)*1366/768))]">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="block aspect-[1366/768] w-full cursor-crosshair touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-teal-soft"
          onPointerDown={onPointerDown}
          aria-label={`StarFall 3.0, the horror version. Click to begin, then click or tap the falling eyes before they reach the ground. Survive ${LAST_WAVE} waves. R plays again after the game ends, Space pauses, M mutes music, F is full screen.`}
          role="application"
        />
        {paused && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="font-display text-2xl font-semibold">Paused</p>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {!status.started ? "Title screen. Click to begin."
          : status.won ? `You survived. Score: ${status.score}. Press R to play again.`
          : status.gameOver ? `Game over. Score: ${status.score}. Press R or click the sign to play again.`
          : `Score: ${status.score}. Wave ${Math.max(0, status.wave - 1)} of ${LAST_WAVE}. Lives: ${Math.max(0, 3 - status.starsLost)}.`}
      </p>
      <div className="mx-auto mt-4 flex w-full max-w-[1180px] flex-wrap items-center gap-3 text-sm">
        <button type="button" className="btn" onClick={togglePause} aria-keyshortcuts="Space">{paused ? "Resume" : "Pause"}</button>
        <button type="button" className="btn" onClick={restart}>Restart</button>
        <button type="button" className={`btn ${music ? "border-teal/70 bg-teal/10" : "text-mist"}`} aria-pressed={music} onClick={toggleMusic} aria-keyshortcuts="M">Music</button>
        <button type="button" className="btn sm:ml-auto" onClick={fullscreen} aria-keyshortcuts="F">Full screen</button>
      </div>
      <p className="mx-auto mt-3 w-full max-w-[1180px] text-sm text-mist">
        Version 3.0 of my GameMaker project, made with the help of an AI assistant (Claude), following my ideas. The eyes, background,
        ground, splatter, music and sounds were generated with code. The Game Over sign here is a placeholder, tinted red: the original is the image our instructor gave us, which is not redistributed.
        The best score is saved in this browser.
      </p>
    </div>
  );
}
