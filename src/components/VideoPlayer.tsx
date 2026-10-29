import { useRef, useState } from "react";
import type { MediaItem } from "../lib/media";

/**
 * Accessible video player for media registered in media.js. Uses the native
 * <video> element, which plays local MP4 files from file:// without a server.
 * Used by subject case studies (from CP2).
 */
export function VideoPlayer({ item }: { item: MediaItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => setFailed(true));
    else v.pause();
  };

  return (
    <figure>
      <div className="relative overflow-hidden rounded-stage bg-graphite">
        <video
          ref={ref}
          src={item.file}
          poster={item.poster}
          preload="metadata"
          playsInline
          className="block aspect-video w-full"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
          onError={() => setFailed(true)}
          onClick={toggle}
        >
          {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" default />}
        </video>
        {failed && (
          <p className="absolute inset-0 flex items-center justify-center bg-graphite p-6 text-center text-mist">
            This video could not load. Check that {item.file} is next to index.html.
          </p>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button type="button" className="btn" onClick={toggle} aria-label={playing ? `Pause ${item.title}` : `Play ${item.title}`}>
          {playing ? "Pause" : "Play"}
        </button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round(progress * 1000)}
          aria-label="Seek"
          className="flex-1 accent-teal"
          onChange={(e) => {
            const v = ref.current;
            if (v?.duration) v.currentTime = (Number(e.target.value) / 1000) * v.duration;
          }}
        />
        <button type="button" className="btn" onClick={() => ref.current?.requestFullscreen?.()}>Full screen</button>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 text-sm text-mist">
        <span className={`h-2 w-2 rounded-full ${item.source === "student" ? "bg-teal" : "bg-violet"}`} aria-hidden="true" />
        {item.title}
        {item.recorded && ` · ${item.recorded}`}
      </figcaption>
    </figure>
  );
}
