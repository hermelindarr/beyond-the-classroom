import { useEffect, useLayoutEffect, useRef } from "react";
import { drawBackground, drawGround, drawScore, drawStar, ROOM, spritesReady } from "../../starfall/engine";
import { gsap } from "../../lib/motion";
import { prefersReducedMotion } from "../../lib/env";

// Room1 really has these layers: a Background layer (spr_space, stretched),
// an Instances layer (stars, ground, explosions) and the Draw GUI pass that
// obj_gameManager uses for the score. Scrolling separates them in depth.
const layers = [
  { key: "gui", name: "Draw GUI", detail: "The score, always on top", draw: (c: CanvasRenderingContext2D) => drawScore(c, 12) },
  {
    key: "instances", name: "Instances", detail: "obj_star, obj_ground, obj_explosion",
    draw: (c: CanvasRenderingContext2D) => {
      [[260, 180, 20, "rgb(214,240,187)"], [700, 300, 200, "rgb(250,190,220)"], [1050, 120, 95, "rgb(180,214,252)"], [480, 420, 300, "rgb(246,234,170)"]]
        .forEach(([x, y, angle, tint]) => drawStar(c, { x: +x, y: +y, angle: +angle, tint: String(tint) }));
      drawGround(c);
    },
  },
  { key: "bg", name: "Background", detail: "spr_space, stretched to 1366 × 768", draw: drawBackground },
];

export function ExplodedRoom() {
  const root = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);

  useEffect(() => {
    spritesReady().then(() =>
      layers.forEach((l, i) => {
        const c = canvases.current[i];
        if (!c) return;
        c.width = ROOM.w;
        c.height = ROOM.h;
        l.draw(c.getContext("2d")!);
      }),
    );
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const planes = gsap.utils.toArray<HTMLElement>("[data-plane]");
      const labels = gsap.utils.toArray<HTMLElement>("[data-plane-label]");
      const exploded = { rotateX: 48, rotateZ: -18, scale: 0.7 };
      const gap = 110;
      if (prefersReducedMotion()) {
        gsap.set("[data-stack]", exploded);
        planes.forEach((p, i) => gsap.set(p, { z: (planes.length - 1 - i) * gap }));
        gsap.set(labels, { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top 70%", end: "center 45%", scrub: 1.1 },
      });
      tl.fromTo("[data-stack]", { rotateX: 0, rotateZ: 0, scale: 1 }, { ...exploded, ease: "none" }, 0);
      planes.forEach((p, i) => tl.fromTo(p, { z: 0 }, { z: (planes.length - 1 - i) * gap, ease: "none" }, 0));
      tl.fromTo(labels, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05, ease: "none" }, 0.6);
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="grid items-center gap-10 md:grid-cols-12">
      <div className="relative md:col-span-8" style={{ perspective: "1800px" }} aria-hidden="true">
        <div data-stack className="relative mx-auto aspect-[1366/768] w-full" style={{ transformStyle: "preserve-3d" }}>
          {layers.map((l, i) => (
            <div
              key={l.key}
              data-plane
              className={`absolute inset-0 rounded-evidence ${l.key === "bg" ? "" : "border border-ivory/25"}`}
              style={{ transformStyle: "preserve-3d", zIndex: layers.length - i }}
            >
              <canvas ref={(el) => (canvases.current[i] = el)} className="h-full w-full rounded-evidence" />
            </div>
          ))}
        </div>
      </div>
      <ol className="space-y-6 md:col-span-4">
        {layers.map((l, i) => (
          <li key={l.key} data-plane-label className="grid grid-cols-[28px_1fr] gap-3 border-t border-rule pt-4">
            <span className="font-display text-lg text-mist">{i + 1}</span>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight">{l.name}</p>
              <p className="mt-1 text-[15px] text-ivory/75">{l.detail}</p>
            </div>
          </li>
        ))}
        <li className="pt-2 text-sm text-mist">The stars in this picture are placed by hand to show the layer; in the game they fall.</li>
      </ol>
    </div>
  );
}
