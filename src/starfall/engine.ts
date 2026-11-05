// StarFall, ported from Hermelinda's GameMaker project, version 2.0
// (D:\2.0, saved Nov 2 2026; GameMaker 2026.0.0.16, Room1 1366×768,
// option_game_speed 60). Every rule cites the GML event it reproduces; see
// ADAPTATIONS for what had to change to run in a browser.

import star from "../assets/starfall/spr_star.png";
import space from "../assets/starfall/spr_space.png";
import ground from "../assets/starfall/spr_ground.png";
import gameOver from "../assets/starfall/spr_gameover.png";

export const explosionFrames = Object.values(
  import.meta.glob<string>("../assets/starfall/spr_explosion-*.png", { eager: true, import: "default" }),
);
export const sprites = { star, space, ground, gameOver };

export const ROOM = { w: 1366, h: 768, fps: 60 };
export const SPRITE_FPS = 30; // spr_explosion playbackSpeed
/** Version 1's timer, alarm_set(0, 60). Commented out in 2.0, where waves replace it. */
export const ALARM_STEPS = 60;
export const SPEED_RANGE: [number, number] = [2.5, 7.5]; // random_range(2.5, 7.5)
export const SPAWN_Y = -150;
/** obj_gameManager Step_0: if (starsLost >= 3) → Game Over. */
export const LIVES = 3;
/** spr_star: origin (64,64), rectangle collision mask, bbox 0..126 × 16..108. */
export const STAR_BOX = { left: -64, right: 62, top: -48, bottom: 44 };
/** spr_ground: origin (0,0), rectangle mask, bbox 0..204 × 0..207. */
export const GROUND_BOX = { w: 205, h: 208 };
/** spr_gameover: 270 × 55, origin (135, 27). obj_gameOver is created at the room's centre. */
export const GAME_OVER = { x: ROOM.w / 2, y: ROOM.h / 2, w: 270, h: 55, ox: 135, oy: 27 };
/** obj_ground instances placed in Room1. */
export const GROUND_TILES: [number, number][] = [[0, 576], [224, 544], [448, 576], [640, 576], [864, 544], [1088, 576], [1184, 576]];
/** Room1 in version 2.0 places no stars; six obj_explosion instances play once when the room starts. */
const ROOM_EXPLOSIONS: [number, number][] = [[96, 256], [96, 384], [416, 384], [608, 384], [992, 416], [1216, 288]];

export type Star = { x: number; y: number; speed: number; angle: number; tint: string };
type Boom = { x: number; y: number; t: number };
export type GameStatus = { score: number; wave: number; starsLost: number; gameOver: boolean };
export type GameEvents = {
  onScore?: (n: number) => void;
  onPop?: () => void;
  onGround?: () => void;
  /** Score, wave, lives or Game Over changed. */
  onStatus?: (s: GameStatus) => void;
  onGameOver?: () => void;
  /** room_restart(): the game started again. */
  onRestart?: () => void;
};

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
const images = { star: load(star), space: load(space), ground: load(ground), gameOver: load(gameOver), boom: explosionFrames.map(load) };
export const explosionImages = images.boom;
export const spritesReady = () =>
  Promise.all([images.star, images.space, images.ground, images.gameOver, ...images.boom].map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));

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

/**
 * Draw_64 (Draw GUI) at the manager's position (0,0). Version 2.0 draws
 * "Wave:" + string(wave - 1) + "             Score: " + string(gameScore);
 * without a wave it draws version 1's "Score: " + string(gameScore).
 */
export function drawScore(ctx: CanvasRenderingContext2D, score: number, wave?: number) {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "top";
  ctx.font = '600 16px "Sitka Small Semibold", "Sitka Small", Sitka, Georgia, serif'; // scoreFont: 12 pt
  ctx.fillText(wave === undefined ? `Score: ${score}` : `Wave:${wave - 1}             Score: ${score}`, 0, 0);
  ctx.restore();
}

/** obj_gameOver: spr_gameover drawn at the room's centre. */
export function drawGameOver(ctx: CanvasRenderingContext2D) {
  if (images.gameOver.complete) ctx.drawImage(images.gameOver, GAME_OVER.x - GAME_OVER.ox, GAME_OVER.y - GAME_OVER.oy);
}

/** Rectangle-vs-rectangle test, as GameMaker does with rectangle masks. */
export function starHitsGround(s: Pick<Star, "x" | "y">) {
  const l = s.x + STAR_BOX.left, r = s.x + STAR_BOX.right, b = s.y + STAR_BOX.bottom, t = s.y + STAR_BOX.top;
  return GROUND_TILES.some(([gx, gy]) => r >= gx && l <= gx + GROUND_BOX.w - 1 && b >= gy && t <= gy + GROUND_BOX.h - 1);
}

export class StarFall {
  score = 0;
  wave = 1;
  starsLost = 0;
  gameOver = false;
  showBoxes = false;
  private stars: Star[] = [];
  private booms: Boom[] = [];
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

  /**
   * Room start: obj_gameManager Create_0 (score 0, starsLost 0, gameOver
   * false, wave 1) and the six explosions placed in Room1. No stars yet:
   * the first Step sends wave 1.
   */
  reset() {
    this.score = 0;
    this.wave = 1;
    this.starsLost = 0;
    this.gameOver = false;
    this.stars = [];
    this.booms = ROOM_EXPLOSIONS.map(([x, y]) => ({ x, y, t: 0 }));
    this.events.onScore?.(0);
    this.status();
  }

  /** room_restart(): KeyPress_82 (R) or a click on the Game Over sign, once the game is over. */
  restart() {
    this.reset();
    this.events.onRestart?.();
  }

  private status() {
    this.events.onStatus?.({ score: this.score, wave: this.wave, starsLost: this.starsLost, gameOver: this.gameOver });
  }

  /** obj_star Create_0: direction 270 (down), random speed, tint and angle. */
  private spawn(x: number, y: number) {
    this.stars.push({ x, y, speed: random(...SPEED_RANGE), angle: random(0, 360), tint: randomTint() });
  }

  /**
   * A left click. While playing, obj_star Mouse_4 fires on every star under
   * the pointer: snd_popSound, destroy, an obj_explosion and one point.
   * After Game Over, stars ignore clicks and obj_gameOver Mouse_4 restarts
   * the room when its sign is clicked.
   */
  click(clientX: number, clientY: number): number {
    const r = this.canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * ROOM.w;
    const y = ((clientY - r.top) / r.height) * ROOM.h;
    if (this.gameOver) {
      const l = GAME_OVER.x - GAME_OVER.ox, t = GAME_OVER.y - GAME_OVER.oy;
      if (x >= l && x < l + GAME_OVER.w && y >= t && y < t + GAME_OVER.h) this.restart();
      return 0;
    }
    const hit = this.stars.filter((s) => x >= s.x + STAR_BOX.left && x <= s.x + STAR_BOX.right && y >= s.y + STAR_BOX.top && y <= s.y + STAR_BOX.bottom);
    if (!hit.length) return 0;
    this.stars = this.stars.filter((s) => !hit.includes(s));
    for (const s of hit) {
      this.events.onPop?.();
      this.booms.push({ x: s.x, y: s.y, t: 0 });
      this.score++;
    }
    this.events.onScore?.(this.score);
    this.status();
    return hit.length;
  }

  private step() {
    // obj_gameManager Step_0: when no star is left, a wave of `wave` stars
    // above the room at random x positions, and the next wave is one bigger.
    // (It keeps sending waves after Game Over, as in the project.)
    if (this.stars.length <= 0) {
      for (let i = 0; i < this.wave; i++) this.spawn(random(0 + 50, ROOM.w - 50), SPAWN_Y);
      this.wave++;
      this.status();
    }
    // Step_0, second part: three stars lost → obj_gameOver, snd_gameOverSound, music stops.
    if (this.starsLost >= LIVES && !this.gameOver) {
      this.gameOver = true;
      this.events.onGameOver?.();
      this.status();
    }
    for (const s of this.stars) {
      s.angle += 1; // obj_star Step_0
      s.y += s.speed; // built-in motion from speed and direction 270
    }
    // obj_star Collision_obj_ground: the whistle (only while playing), one star lost, destroy.
    const landed = this.stars.filter(starHitsGround);
    if (landed.length) {
      this.stars = this.stars.filter((s) => !landed.includes(s));
      for (let i = 0; i < landed.length; i++) {
        if (!this.gameOver) this.events.onGround?.();
        this.starsLost++;
      }
      this.status();
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
    if (this.gameOver) drawGameOver(ctx); // obj_gameOver, depth 0: above the stars (depth 1)
    if (this.showBoxes) this.drawBoxes();
    drawScore(ctx, this.score, this.wave);
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
