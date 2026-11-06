// StarFall 3.0, the horror version (D:\3.0, Nov 5 2026), ported to the browser.
// Made with the help of an AI assistant, following Hermelinda's ideas. Every rule
// cites the GML event it reproduces. Room, ground tiles and the Game Over sign are
// the same as version 2.0 (see engine.ts).

import eyeSrc from "../assets/starfall3/eye.png";
import bgSrc from "../assets/starfall3/background.webp";
import groundSrc from "../assets/starfall3/ground.png";
import { GAME_OVER, GROUND_BOX, GROUND_TILES, ROOM, SPRITE_FPS, random, sprites } from "./engine";

const splatterSrc = Object.entries(import.meta.glob<string>("../assets/starfall3/splatter-*.png", { eager: true, import: "default" }))
  .sort(([a], [b]) => Number(a.match(/(\d+)\.png$/)![1]) - Number(b.match(/(\d+)\.png$/)![1]))
  .map(([, src]) => src);

function load(src: string) {
  const img = new Image();
  img.src = src;
  return img;
}
const img = { eye: load(eyeSrc), bg: load(bgSrc), ground: load(groundSrc), gameOver: load(sprites.gameOver), splatter: splatterSrc.map(load) };
export const horrorReady = () => Promise.all([img.eye, img.bg, img.ground, img.gameOver, ...img.splatter].map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => {}))));

/** The eye sprite (128 × 128, origin 64,64): rectangle mask bbox 13..120 × 6..113. */
const EYE_BOX = { left: -51, right: 56, top: -58, bottom: 49 };
/** obj_gameManager Create_0: lastWave = 10. */
export const LAST_WAVE = 10;
const WHISPERS = ["THEY SEE YOU", "DON'T BLINK", "IT IS STILL HERE", "LOOK UP", "YOU CAN'T SAVE THEM ALL", "KEEP WATCHING", "IT KNOWS YOUR NAME"];
const FONT = '"Sitka Small Semibold", "Sitka Small", Sitka, Georgia, serif';
const BONE = "rgb(225,210,190)";
const BLOOD = "rgb(220,20,40)";
const CYAN = "rgb(80,200,220)";

const irandomRange = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const choose = <T,>(...xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
type RGB = [number, number, number];
const mergeColour = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as RGB;
const css = (c: RGB) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;

type Kind = "star" | "gold" | "boss";
type Eye = {
  kind: Kind; x: number; y: number; speed: number; angle: number; tint: RGB;
  wobble: number; baseScale: number; xscale: number; yscale: number; blinkTimer: number; blink: number;
  hp: number; maxHp: number; hurt: number;
};
type Splat = { x: number; y: number; t: number };
type Popup = { x: number; y: number; text: string; alpha: number };

export type HorrorSounds = {
  /** audio_play_sound(snd, 1, false, gain, offset, pitch) */
  effect: (name: "snd_popSound" | "snd_sadWhistleSound" | "snd_gameOverSound" | "snd_whisper", pitch?: number) => void;
  startMusic: () => void;
  stopMusic: () => void;
};
export type HorrorStatus = { score: number; wave: number; starsLost: number; gameOver: boolean; won: boolean; started: boolean };

/** ini_open("starfall.ini") becomes the browser's storage for this page. */
const BEST_KEY = "starfall3-best";
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const writeBest = (v: number) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* storage blocked */ } };

/** global.seenTitle: after the first game, R starts again without the title screen. */
let seenTitle = false;

const tintCache = new Map<string, HTMLCanvasElement>();
/** image_blend: the sprite multiplied by the colour, keeping its transparency. */
function tinted(src: HTMLImageElement, c: RGB) {
  const key = src.src + c.join(",");
  let t = tintCache.get(key);
  if (!t && src.complete && src.naturalWidth) {
    t = document.createElement("canvas");
    t.width = src.naturalWidth;
    t.height = src.naturalHeight;
    const g = t.getContext("2d")!;
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "multiply";
    g.fillStyle = css(c);
    g.fillRect(0, 0, t.width, t.height);
    g.globalCompositeOperation = "destination-in";
    g.drawImage(src, 0, 0);
    tintCache.set(key, t);
  }
  return t;
}

export class Horror {
  score = 0;
  wave = 1;
  starsLost = 0;
  gameOver = false;
  won = false;
  started = false;
  highScore = 0;
  newBest = false;
  private eyes: Eye[] = [];
  private splats: Splat[] = [];
  private popups: Popup[] = [];
  private lostSign = false;
  private heartTimer = 0;
  private flash = 0;
  private lastLost = 0;
  combo = 0;
  private comboTimer = 0;
  private whisperText = "";
  private whisperTimer = 0;
  private whisperCooldown = 400;
  private whisperX = 0;
  private whisperY = 0;
  private bossWarning = 0;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private ctx: CanvasRenderingContext2D;

  constructor(private canvas: HTMLCanvasElement, private sounds: HorrorSounds, private onStatus: (s: HorrorStatus) => void = () => {}) {
    canvas.width = ROOM.w;
    canvas.height = ROOM.h;
    this.ctx = canvas.getContext("2d")!;
    this.create();
  }

  get running() {
    return this.raf !== 0;
  }

  /** obj_gameManager Create_0 (and room_restart). */
  private create() {
    this.score = 0; this.starsLost = 0; this.gameOver = false; this.wave = 1;
    this.highScore = readBest(); this.newBest = false; this.won = false;
    this.started = seenTitle;
    this.heartTimer = 0; this.flash = 0; this.lastLost = 0; this.combo = 0; this.comboTimer = 0;
    this.whisperText = ""; this.whisperTimer = 0; this.whisperCooldown = 400; this.bossWarning = 0;
    this.eyes = []; this.splats = []; this.popups = []; this.lostSign = false;
    this.status();
  }

  private status() {
    this.onStatus({ score: this.score, wave: this.wave, starsLost: this.starsLost, gameOver: this.gameOver, won: this.won, started: this.started });
  }

  /** room_restart(), from R (KeyPress_82) or a click on the Game Over sign, once the game is over. */
  restart() {
    this.create();
    this.sounds.startMusic(); // Create_0: if (!audio_is_playing(snd_wizardSong)) play it
    this.draw();
  }

  /** The title screen: a click or any key starts the game (obj_gameManager Step_0). */
  private begin() {
    this.started = true;
    seenTitle = true;
    this.sounds.effect("snd_whisper");
    this.status();
  }

  keyPressed(key: string) {
    if (!this.started) return this.begin();
    if (key.toLowerCase() === "r" && this.gameOver) this.restart();
  }

  /** obj_star / obj_goldStar / obj_bigEye Create_0 */
  private spawn(kind: Kind, x: number, y: number) {
    const e: Eye = {
      kind, x, y, speed: random(1.5, 3.5) + Math.min(this.wave - 1, 9) * 0.15, angle: random(0, 360),
      tint: choose<RGB>([235, 225, 205], [180, 210, 150], [195, 165, 225], [240, 160, 160]),
      wobble: random(0, 100), baseScale: 1, xscale: 1, yscale: 1, blinkTimer: irandomRange(60, 240), blink: 0, hp: 0, maxHp: 0, hurt: 0,
    };
    if (kind === "gold") { e.tint = [255, 50, 50]; e.xscale = e.yscale = e.baseScale = 1.2; e.speed += 1.5; }
    if (kind === "boss") { e.tint = [210, 120, 140]; e.baseScale = e.xscale = e.yscale = 2.6; e.speed = 0.9; e.maxHp = e.hp = 8; e.blinkTimer = 100000; }
    this.eyes.push(e);
  }

  private box(e: Eye) {
    return { l: e.x + EYE_BOX.left * e.xscale, r: e.x + EYE_BOX.right * e.xscale, t: e.y + EYE_BOX.top * e.yscale, b: e.y + EYE_BOX.bottom * e.yscale };
  }

  private popup(x: number, y: number, text: string) {
    this.popups.push({ x, y, text, alpha: 1 });
    return this.popups[this.popups.length - 1];
  }

  /** A left click (Mouse_4 on every instance under the pointer). */
  click(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * ROOM.w;
    const y = ((clientY - r.top) / r.height) * ROOM.h;
    if (!this.started) return this.begin();
    if (this.gameOver) {
      // obj_gameOver Mouse_4 (only exists when the game was lost)
      const l = GAME_OVER.x - GAME_OVER.ox, t = GAME_OVER.y - GAME_OVER.oy;
      if (this.lostSign && x >= l && x < l + GAME_OVER.w && y >= t && y < t + GAME_OVER.h) this.restart();
      return;
    }
    const hit = this.eyes.filter((e) => { const b = this.box(e); return x >= b.l && x <= b.r && y >= b.t && y <= b.b; });
    for (const e of hit) {
      if (e.kind === "boss") {
        // obj_bigEye Mouse_4
        e.hp -= 1; e.hurt = 6; e.baseScale -= 0.12;
        this.sounds.effect("snd_popSound", 0.55);
        this.splats.push({ x: e.x + random(-60, 60), y: e.y + random(-60, 60), t: 0 });
        if (e.hp <= 0) {
          for (let i = 0; i < 6; i++) this.splats.push({ x: e.x + random(-110, 110), y: e.y + random(-110, 110), t: 0 });
          this.sounds.effect("snd_gameOverSound", 1.8);
          this.score += 25;
          this.popup(e.x, e.y, "+25");
          this.eyes = this.eyes.filter((o) => o !== e);
        }
      } else if (e.kind === "gold") {
        // obj_goldStar Mouse_4
        this.sounds.effect("snd_popSound");
        this.eyes = this.eyes.filter((o) => o !== e);
        this.splats.push({ x: e.x, y: e.y, t: 0 });
        this.score += 5;
        this.combo += 1; this.comboTimer = 60;
        const p = this.popup(e.x, e.y, "+5");
        if (this.starsLost > 0) { this.starsLost--; p.text = "+5  +1 life"; }
      } else {
        // obj_star Mouse_4: the combo makes each quick pop worth more (up to x5) and sound higher
        this.combo += 1; this.comboTimer = 60;
        const points = Math.min(this.combo, 5);
        this.sounds.effect("snd_popSound", 1 + Math.min(this.combo, 8) * 0.08);
        this.eyes = this.eyes.filter((o) => o !== e);
        this.splats.push({ x: e.x, y: e.y, t: 0 });
        this.score += points;
        this.popup(e.x, e.y, "+" + points);
      }
    }
    if (hit.length) this.status();
  }

  private step() {
    // --- obj_gameManager Step_0 ---
    const beatLength = 60 - Math.min(this.starsLost, 2) * 18;
    this.heartTimer += 1;
    if (this.heartTimer >= beatLength) this.heartTimer = 0;

    if (this.started) {
      if (this.eyes.length <= 0 && !this.gameOver) {
        if (this.wave - 1 >= LAST_WAVE) {
          this.won = true; this.gameOver = true;
          this.sounds.effect("snd_popSound", 0.5);
        } else if (this.wave === LAST_WAVE) {
          this.spawn("boss", ROOM.w / 2, -250);
          for (let i = 0; i < 4; i++) this.spawn("star", random(50, ROOM.w - 50), -300 - i * 220);
          this.bossWarning = 150;
          this.sounds.effect("snd_whisper");
          this.wave++;
        } else {
          for (let i = 0; i < this.wave; i++) {
            const startY = -150 - i * 140;
            this.spawn(this.wave >= 2 && irandomRange(0, 7) === 0 ? "gold" : "star", random(50, ROOM.w - 50), startY);
          }
          this.wave++;
        }
        this.status();
      }
      if (this.starsLost >= 3 && !this.gameOver) {
        this.lostSign = true; this.gameOver = true;
        this.sounds.effect("snd_gameOverSound");
        this.sounds.stopMusic();
        this.status();
      }
      if (this.gameOver && this.score > this.highScore) {
        this.highScore = this.score; this.newBest = true;
        writeBest(this.highScore);
      }
      if (this.starsLost !== this.lastLost) {
        if (this.starsLost > this.lastLost) this.flash = 1;
        this.lastLost = this.starsLost;
      }
      this.flash = Math.max(0, this.flash - 0.03);
      if (this.comboTimer > 0) this.comboTimer -= 1; else this.combo = 0;
      if (this.whisperTimer > 0) this.whisperTimer -= 1;
      this.whisperCooldown -= 1;
      if (this.whisperCooldown <= 0 && !this.gameOver) {
        this.whisperText = WHISPERS[irandomRange(0, WHISPERS.length - 1)];
        this.whisperTimer = 100;
        this.whisperX = random(250, ROOM.w - 250);
        this.whisperY = random(150, ROOM.h - 300);
        this.sounds.effect("snd_whisper");
        this.whisperCooldown = irandomRange(420, 900);
      }
      if (this.bossWarning > 0) this.bossWarning -= 1;
    }

    // --- obj_star / obj_goldStar / obj_bigEye Step_0 and motion ---
    const now = performance.now();
    for (const e of this.eyes) {
      e.angle += 1;
      e.x += Math.sin(now / 90 + e.wobble) * 0.6;
      e.blinkTimer -= 1;
      if (e.blinkTimer <= 0) { e.blink = 8; e.blinkTimer = irandomRange(90, 260); }
      if (e.blink > 0) { e.blink -= 1; e.yscale = e.baseScale * 0.12; } else e.yscale = e.baseScale;
      if (e.kind === "boss") {
        e.xscale = e.baseScale;
        e.angle -= 1.5;
        if (e.hurt > 0) e.hurt -= 1;
      }
      e.y += e.speed;
    }

    // --- Collision with obj_ground ---
    const landed = this.eyes.filter((e) => {
      const b = this.box(e);
      return GROUND_TILES.some(([gx, gy]) => b.r >= gx && b.l <= gx + GROUND_BOX.w - 1 && b.b >= gy && b.t <= gy + GROUND_BOX.h - 1);
    });
    if (landed.length) {
      this.eyes = this.eyes.filter((e) => !landed.includes(e));
      for (const e of landed) {
        if (this.gameOver) continue;
        if (e.kind === "star") { this.sounds.effect("snd_sadWhistleSound"); this.starsLost++; }
        if (e.kind === "boss") { this.sounds.effect("snd_sadWhistleSound", 0.6); this.starsLost = 3; }
        // obj_goldStar: a bonus, missing it costs no life
      }
      this.status();
    }

    // obj_explosion Other_7 and obj_scorePopup Step_0
    this.splats = this.splats.filter((s) => (s.t += SPRITE_FPS / ROOM.fps) < img.splatter.length);
    for (const p of this.popups) { p.y -= 1.5; p.alpha -= 0.025; }
    this.popups = this.popups.filter((p) => p.alpha > 0);
  }

  private drawEye(e: Eye) {
    const tint: RGB = e.kind === "boss" && e.hurt > 0 ? [255, 255, 255] : e.tint;
    const t = tinted(img.eye, tint);
    if (!t) return;
    const { ctx } = this;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate((-e.angle * Math.PI) / 180);
    ctx.scale(e.xscale, e.yscale);
    ctx.drawImage(t, -64, -64);
    ctx.restore();
  }

  private text(s: string, x: number, y: number, scale = 1, colour = BONE, alpha = 1, align: CanvasTextAlign = "left", angle = 0) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.fillStyle = colour;
    ctx.textAlign = align;
    ctx.textBaseline = "top";
    ctx.font = `600 ${16 * scale}px ${FONT}`;
    ctx.translate(x, y);
    if (angle) ctx.rotate((-angle * Math.PI) / 180);
    ctx.fillText(s, 0, 0);
    ctx.restore();
  }

  draw() {
    const { ctx } = this;
    const W = ROOM.w, H = ROOM.h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    // Background layer, tinted by the heartbeat (layer_background_blend)
    if (img.bg.complete) ctx.drawImage(img.bg, 0, 0, W, H);
    const beatLength = 60 - Math.min(this.starsLost, 2) * 18;
    const pulse = Math.max(0, 1 - (this.heartTimer % beatLength) / 14);
    let bg = mergeColour([255, 255, 255], [255, 60, 60], pulse * 0.6);
    bg = mergeColour(bg, [0, 0, 0], Math.min(this.starsLost, 3) * 0.18);
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = css(bg);
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    for (const e of this.eyes) if (e.kind !== "boss") this.drawEye(e);
    for (const e of this.eyes) if (e.kind === "boss") this.drawEye(e);
    for (const s of this.splats) {
      const f = img.splatter[Math.floor(s.t)];
      if (f?.complete) ctx.drawImage(f, s.x - 64, s.y - 64);
    }
    if (img.ground.complete) GROUND_TILES.forEach(([x, y]) => ctx.drawImage(img.ground, x, y));
    for (const p of this.popups) this.text(p.text, p.x, p.y, 1, "rgb(255,60,60)", p.alpha, "center");
    if (this.lostSign) {
      const sign = tinted(img.gameOver, [210, 25, 35]); // obj_gameOver Create_0
      if (sign) ctx.drawImage(sign, GAME_OVER.x - GAME_OVER.ox, GAME_OVER.y - GAME_OVER.oy);
    }
    this.drawGui();
  }

  /** obj_gameManager Draw_64 */
  private drawGui() {
    const { ctx } = this;
    const W = ROOM.w, H = ROOM.h;
    if (this.flash > 0) {
      ctx.save();
      ctx.globalAlpha = this.flash * 0.4;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "red"); g.addColorStop(1, "black");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (this.flash > 0.5) {
        ctx.globalAlpha = 0.35;
        for (let b = 0; b < 5; b++) {
          const y = random(0, H), h = random(3, 18);
          const gb = ctx.createLinearGradient(0, 0, W, 0);
          gb.addColorStop(0, "white"); gb.addColorStop(1, "red");
          ctx.fillStyle = gb; ctx.fillRect(0, y, W, h);
        }
      }
      ctx.restore();
    }
    if (this.whisperTimer > 0) {
      const a = Math.sin((Math.PI * this.whisperTimer) / 100) * random(0.5, 1);
      this.text(this.whisperText, this.whisperX + random(-4, 4), this.whisperY, 2, CYAN, a * 0.6, "center");
      this.text(this.whisperText, this.whisperX, this.whisperY + random(-2, 2), 2, BLOOD, a, "center");
    }
    this.text(`Wave:${this.wave - 1} of ${LAST_WAVE}             Score: ${this.score}`, 0, 0);
    this.text(`Best: ${this.highScore}`, 0, 25);
    const lives = Math.max(0, 3 - this.starsLost);
    for (let i = 0; i < lives; i++) if (img.eye.complete) ctx.drawImage(img.eye, W - 40 - i * 45 - 19.2, 30 - 19.2, 38.4, 38.4);
    if (this.combo >= 2) this.text(`COMBO x${this.combo}`, W / 2, 20, 1.5, "rgb(255,60,60)", 1, "center");
    const boss = this.eyes.find((e) => e.kind === "boss");
    if (boss) {
      ctx.fillStyle = "black"; ctx.fillRect(W / 2 - 200, 60, 400, 16);
      ctx.fillStyle = "rgb(190,18,40)"; ctx.fillRect(W / 2 - 198, 62, (396 * boss.hp) / boss.maxHp, 12);
      this.text("THE GIANT EYE", W / 2, 82, 1, BONE, 1, "center");
    }
    if (this.bossWarning > 0 && Math.floor(this.bossWarning / 10) % 2 === 0) this.text("IT IS AWAKE", W / 2, H / 2 - 120, 3, BLOOD, 1, "center");
    if (this.gameOver) {
      if (this.won) this.text("YOU SURVIVED", W / 2, H / 2 - 40, 3, BLOOD, 1, "center");
      if (this.newBest) this.text("New best score!", W / 2, H / 2 + 50, 1, BONE, 1, "center");
      this.text("Press R to play again", W / 2, H / 2 + 80, 1, BONE, 1, "center");
    }
    if (!this.started) {
      ctx.save(); ctx.globalAlpha = 0.7; ctx.fillStyle = "black"; ctx.fillRect(0, 0, W, H); ctx.restore();
      const shake = random(-3, 3);
      this.text("STARFALL", W / 2 + shake - 5, H / 2 - 120, 6, CYAN, 0.6, "center", random(-1, 1));
      this.text("STARFALL", W / 2 + shake, H / 2 - 120, 6, BLOOD, 1, "center");
      this.text("they are watching", W / 2, H / 2 - 20, 1.5, BONE, 1, "center");
      this.text("Pop the eyes before they reach the ground. Survive 10 waves.", W / 2, H / 2 + 40, 1, BONE, 1, "center");
      if (Math.floor(performance.now() / 500) % 2 === 0) this.text("Click to begin", W / 2, H / 2 + 110, 1.5, BONE, 1, "center");
    }
  }

  start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      this.acc = Math.min(this.acc + (now - this.last), 250);
      this.last = now;
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
