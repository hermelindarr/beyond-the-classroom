import { useEffect, useRef, useState } from "react";
import { explosionFrames, sprites, SPRITE_FPS } from "../../starfall/engine";
import { soundFiles, type SoundName } from "../../starfall/sounds";

/** Scrub or play spr_explosion frame by frame (9 frames at 30 fps). */
export function ExplosionFrames({ onEnd }: { onEnd?: () => void }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setFrame((f) => {
        if (f >= explosionFrames.length - 1) {
          setPlaying(false);
          onEnd?.();
          return f;
        }
        return f + 1;
      });
    }, 1000 / SPRITE_FPS);
    return () => window.clearInterval(id);
  }, [playing, onEnd]);

  return (
    <div>
      <div className="flex items-end gap-1 overflow-x-auto pb-1">
        {explosionFrames.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => { setPlaying(false); setFrame(i); }}
            aria-label={`Frame ${i + 1}`}
            aria-pressed={frame === i}
            className={`shrink-0 rounded-evidence border p-1 transition-colors ${frame === i ? "border-teal bg-teal/10" : "border-rule"}`}
          >
            <img src={src} alt="" className="h-12 w-12 [image-rendering:pixelated]" />
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm text-mist">
        <button type="button" className="btn" onClick={() => { setFrame(0); setPlaying(true); }}>Play at 30 fps</button>
        <span aria-live="polite">Frame {frame + 1} of {explosionFrames.length}{frame === explosionFrames.length - 1 ? " · last frame: Animation End fires" : ""}</span>
      </div>
    </div>
  );
}

function SoundRow({ name, use }: { name: SoundName; use: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const toggle = () => {
    const a = ref.current!;
    if (a.paused) {
      a.currentTime = 0;
      a.play().catch(() => {});
    } else a.pause();
  };
  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-rule py-4">
      <button type="button" onClick={toggle} className="btn w-[92px] justify-center" aria-label={`${playing ? "Stop" : "Play"} ${name}`}>
        {playing ? "Stop" : "Play"}
      </button>
      <div className="min-w-0">
        <p className="truncate font-code text-[13px] text-teal-soft">{name}</p>
        <p className="text-sm text-mist">{use}</p>
      </div>
      <span className="text-sm tabular-nums text-mist">{duration ? `${duration.toFixed(1)} s` : ""}</span>
      <audio
        ref={ref}
        src={soundFiles[name]}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
    </li>
  );
}

export function ProjectAnatomy() {
  return (
    <div className="grid gap-x-8 gap-y-16 md:grid-cols-12">
      <div className="md:col-span-7">
        <h3 className="heading text-xl">Five sprites</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-mist"><span className="h-2 w-2 rounded-full bg-violet" aria-hidden="true" />From the workshop's StarFall asset pack, used unchanged in my project. Version 2.0 adds spr_gameover, an image our instructor gave us. This public version shows simple placeholders instead, because those files are not mine to redistribute.</p>
        <div className="mt-6 grid grid-cols-[2fr_1fr_1fr] items-end gap-4">
          {[
            [sprites.space, "spr_space", "800 × 480, stretched to fill the room", "aspect-[5/3] p-0"],
            [sprites.ground, "spr_ground", "205 × 208", "aspect-square p-3"],
            [sprites.star, "spr_star", "128 × 128, tinted per star", "aspect-square p-3"],
          ].map(([src, name, size, box]) => (
            <figure key={name}>
              <div className={`flex items-center justify-center overflow-hidden rounded-evidence border border-rule bg-navy ${box}`}>
                <img src={src} alt={`${name} sprite`} className="h-full w-full object-contain [image-rendering:pixelated]" />
              </div>
              <figcaption className="mt-2">
                <span className="block font-code text-[13px] text-teal-soft">{name}</span>
                <span className="text-sm text-mist">{size}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <figure className="mt-6">
          <div className="flex items-center justify-center rounded-evidence border border-rule bg-navy p-5">
            <img src={sprites.gameOver} alt="spr_gameover sprite: the words GAME OVER in green pixel letters" className="w-[270px] max-w-full [image-rendering:pixelated]" />
          </div>
          <figcaption className="mt-2"><span className="block font-code text-[13px] text-teal-soft">spr_gameover</span><span className="text-sm text-mist">270 × 55, from our instructor, added in version 2.0</span></figcaption>
        </figure>
        <div className="mt-8">
          <p className="mb-3"><span className="font-code text-[13px] text-teal-soft">spr_explosion</span> <span className="text-sm text-mist">· 9 frames, 128 × 128, 30 fps</span></p>
          <ExplosionFrames />
        </div>
      </div>

      <div className="md:col-span-5">
        <h3 className="heading text-xl">Four sounds</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-mist"><span className="h-2 w-2 rounded-full bg-violet" aria-hidden="true" />Three from the same asset pack; version 2.0 adds the Game Over sound. Placeholder sounds in this public version</p>
        <ul className="mt-4 border-b border-rule">
          <SoundRow name="snd_wizardSong" use="Background music, looped from the start" />
          <SoundRow name="snd_popSound" use="A star is clicked" />
          <SoundRow name="snd_sadWhistleSound" use="A star reaches the ground" />
          <SoundRow name="snd_gameOverSound" use="The third star is lost: Game Over" />
        </ul>

        <h3 className="heading mt-12 text-xl">Five objects, one room</h3>
        <dl className="mt-4 divide-y divide-rule border-y border-rule text-[15px]">
          {[
            ["obj_gameManager", "No sprite. Runs the music, the waves, the lives and the score."],
            ["obj_star", "Falls, spins, can be clicked, hits the ground."],
            ["obj_explosion", "Plays once, then removes itself. Six are placed in the room and play at the start."],
            ["obj_gameOver", "The Game Over sign. Clicking it restarts the room."],
            ["obj_ground", "Seven tiles. No code: only a collision target."],
            ["Room1", "1366 × 768 pixels, 60 steps per second."],
            ["scoreFont", "Sitka Small Semibold, 12 pt."],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[150px_1fr] gap-4 py-3">
              <dt className="font-code text-[13px] text-teal-soft">{k}</dt>
              <dd className="text-ivory/80">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
