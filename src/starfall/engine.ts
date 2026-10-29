// StarFall, ported from Hermelinda's GameMaker project "juego Herme"
// (GameMaker 2026.0.0.16, Room1 1366×768, option_game_speed 60).
// Every rule cites the GML event it reproduces; see ADAPTATIONS for what
// had to change to run in a browser.

import star from "../assets/starfall/spr_star.png";
import space from "../assets/starfall/spr_space.png";
import ground from "../assets/starfall/spr_ground.png";

export const explosionFrames = Object.values(
  import.meta.glob<string>("../assets/starfall/spr_explosion-*.png", { eager: true, import: "default" }),
);
export const sprites = { star, space, ground };

export const ROOM = { w: 1366, h: 768, fps: 60 };
export const SPRITE_FPS = 30; // spr_explosion playbackSpeed
export const ALARM_STEPS = 60; // alarm_set(0, 60)
export const SPEED_RANGE: [number, number] = [2.5, 7.5]; // random_range(2.5, 7.5)
export const SPAWN_Y = -150;
/** spr_star: origin (64,64), rectangle collision mask, bbox 0..126 × 16..108. */
export const STAR_BOX = { left: -64, right: 62, top: -48, bottom: 44 };
/** spr_ground: origin (0,0), rectangle mask, bbox 0..204 × 0..207. */
export const GROUND_BOX = { w: 205, h: 208 };
/** obj_ground instances placed in Room1. */
export const GROUND_TILES: [number, number][] = [[0, 576], [224, 544], [448, 576], [640, 576], [864, 544], [1088, 576], [1184, 576]];
/** obj_star instances placed above the screen in Room1. */
const ROOM_STARS: [number, number][] = [[198, -512], [710, -736], [422, -672], [6, -352], [1152, -736], [1155, -416], [742, -416]];

export type Star = { x: number; y: number; speed: number; angle: number; tint: string };
type Boom = { x: number; y: number; t: number };
export type GameEvents = { onScore?: (n: number) => void; onPop?: () => void; onGround?: () => void };

export const random = (a: number, b: number) => a + Math.random() * (b - a);
export const randomTint = () => {
  const c = () => Math.round(random(128, 255)); // random_range(128,255) per channel
  return `rgb(${c()},${c()},${c()})`;
};

function load(src: string) {
  const img = new Image();
  img.src = src;
  return img;
}
const images = { star: load(star), space: load(space), ground: load(ground), boom: explosionFrames.map(load) };
export const explosionImages = images.boom;
export const spritesReady = () =>
  Promise.all([images.star, images.space, images.ground, ...images.boom].map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));

const tintCache = new Map<string, HTMLCanvasElement>();
/** image_blend: GameMaker multiplies the sprite by the blend colour. */
export function tintedStar(tint: string) {
  let c = tintCache.get(tint);
  if (!c && images.star.complete) {
    c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.drawImage(images.star, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = tint;
    g.fillRect(0, 0, 128, 128);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(images.star, 0, 0);
    tintCache.set(tint, c);
  }
  return c;
}

export function drawStar(ctx: CanvasRenderingContext2D, s: Pick<Star, "x" | "y" | "angle" | "tint">) {
  const t = tintedStar(s.tint);
  if (!t) return;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate((-s.angle * Math.PI) / 180); // GameMaker angles turn counter-clockwise
  ctx.drawImage(t, -64, -64);
  ctx.restore();
}

export function drawGround(ctx: CanvasRenderingContext2D) {
  if (images.ground.complete) GROUND_TILES.forEach(([x, y]) => ctx.drawImage(images.ground, x, y));
}

export function drawBackground(ctx: CanvasRenderingContext2D) {
  if (images.space.complete) ctx.drawImage(images.space, 0, 0, ROOM.w, ROOM.h); // Background layer, stretch: true
}

/** Draw_64 (Draw GUI): draw_text(x, y, "Score: " + string(gameScore)) at the manager's position (0,0). */
export function drawScore(ctx: CanvasRenderingContext2D, score: number) {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.font = '600 16px "Sitka Small Semibold", "Sitka Small", Sitka, Georgia, serif'; // scoreFont: 12 pt
  ctx.fillText(`Score: ${score}`, 0, 0);
  ctx.restore();
}

/** Rectangle-vs-rectangle test, as GameMaker does with rectangle masks. */
export function starHitsGround(s: Pick<Star, "x" | "y">) {
  const l = s.x + STAR_BOX.left, r = s.x + STAR_BOX.right, b = s.y + STAR_BOX.bottom, t = s.y + STAR_BOX.top;
  return GROUND_TILES.some(([gx, gy]) => r >= gx && l <= gx + GROUND_BOX.w - 1 && b >= gy && t <= gy + GROUND_BOX.h - 1);
}

export class StarFall {
  score = 0;
  showBoxes = false;
  private stars: Star[] = [];
  private booms: Boom[] = [];
  private alarm = ALARM_STEPS;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement, private events: GameEvents = {}) {
    canvas.width = ROOM.w;
    canvas.height = ROOM.h;
    this.ctx = canvas.getContext("2d")!;
    this.reset();
  }

  get running() {
    return this.raf !== 0;
  }

  /** Room start: obj_gameManager Create_0 (score 0, alarm 60) and the placed stars. */
  reset() {
    this.score = 0;
    this.alarm = ALARM_STEPS;
    this.stars = [];
    this.booms = [];
    ROOM_STARS.forEach(([x, y]) => this.spawn(x, y));
    this.events.onScore?.(0);
  }

  /** obj_star Create_0: direction 270 (down), random speed, tint and angle. */
  private spawn(x: number, y: number) {
    this.stars.push({ x, y, speed: random(...SPEED_RANGE), angle: random(0, 360), tint: randomTint() });
  }

  /**
   * obj_star Mouse_4 (Left Pressed): fires on every star under the pointer.
   * Each one plays snd_popSound, is destroyed, leaves an obj_explosion and adds 1.
   */
  click(clientX: number, clientY: number): number {
    const r = this.canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * ROOM.w;
    const y = ((clientY - r.top) / r.height) * ROOM.h;
    const hit = this.stars.filter((s) => x >= s.x + STAR_BOX.left && x <= s.x + STAR_BOX.right && y >= s.y + STAR_BOX.top && y <= s.y + STAR_BOX.bottom);
    if (!hit.length) return 0;
    this.stars = this.stars.filter((s) => !hit.includes(s));
    for (const s of hit) {
      this.events.onPop?.();
      this.booms.push({ x: s.x, y: s.y, t: 0 });
      this.score++;
    }
    this.events.onScore?.(this.score);
    return hit.length;
  }

  private step() {
    // obj_gameManager Alarm_0: a new star at a random x, above the room, every 60 steps.
    if (--this.alarm <= 0) {
      this.spawn(random(0 + 50, ROOM.w - 50), SPAWN_Y);
      this.alarm = ALARM_STEPS;
    }
    for (const s of this.stars) {
      s.angle += 1; // obj_star Step_0
      s.y += s.speed; // built-in motion from speed and direction 270
    }
    // obj_star Collision_obj_ground: snd_sadWhistleSound, then destroy.
    const landed = this.stars.filter(starHitsGround);
    if (landed.length) {
      this.stars = this.stars.filter((s) => !landed.includes(s));
      landed.forEach(() => this.events.onGround?.());
    }
    // obj_explosion Other_7 (Animation End): destroy.
    this.booms = this.booms.filter((b) => (b.t += SPRITE_FPS / ROOM.fps) < explosionFrames.length);
  }

  /**
   * Browser adaptation, not a game rule: on slow computers the canvas is drawn
   * at a lower internal resolution. Positions, speeds and collisions stay in
   * room units, so the game itself is unchanged.
   */
  private quality = 1;
  private slowFrames = 0;
  private bg: HTMLCanvasElement | null = null;

  private setQuality(q: number) {
    this.quality = q;
    this.canvas.width = Math.round(ROOM.w * q);
    this.canvas.height = Math.round(ROOM.h * q);
    this.bg = null;
  }

  /** The stretched background, rendered once at the current resolution. */
  private background() {
    if (!this.bg && images.space.complete) {
      this.bg = document.createElement("canvas");
      this.bg.width = this.canvas.width;
      this.bg.height = this.canvas.height;
      this.bg.getContext("2d")!.drawImage(images.space, 0, 0, this.bg.width, this.bg.height);
    }
    return this.bg;
  }

  draw() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const bg = this.background();
    if (bg) ctx.drawImage(bg, 0, 0);
    ctx.setTransform(this.quality, 0, 0, this.quality, 0, 0);
    for (const s of this.stars) drawStar(ctx, s);
    for (const b of this.booms) {
      const f = images.boom[Math.floor(b.t)];
      if (f?.complete) ctx.drawImage(f, b.x - 64, b.y - 64);
    }
    drawGround(ctx);
    if (this.showBoxes) this.drawBoxes();
    drawScore(ctx, this.score);
  }

  private drawBoxes() {
    const { ctx } = this;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#1FA7A5";
    for (const s of this.stars) ctx.strokeRect(s.x + STAR_BOX.left, s.y + STAR_BOX.top, STAR_BOX.right - STAR_BOX.left, STAR_BOX.bottom - STAR_BOX.top);
    ctx.strokeStyle = "#E0A458";
    GROUND_TILES.forEach(([x, y]) => ctx.strokeRect(x, y, GROUND_BOX.w, GROUND_BOX.h));
    ctx.restore();
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      // Fixed 60 steps per second (option_game_speed 60), whatever the monitor's refresh rate.
      const frame = now - this.last;
      this.acc = Math.min(this.acc + frame, 250);
      this.last = now;
      // About a second of frames slower than 25 fps: switch to lighter drawing.
      // (30 Hz screens and power-saving modes stay at full quality.)
      this.slowFrames = frame > 40 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
      if (this.slowFrames > 30 && this.quality > 0.5) {
        this.setQuality(this.quality > 0.7 ? 0.66 : 0.5);
        this.slowFrames = 0;
      }
      while (this.acc >= 1000 / ROOM.fps) {
        this.step();
        this.acc -= 1000 / ROOM.fps;
      }
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
}
