// StarFall 3.0 (the horror version) on the OFFLINE build: title screen, start,
// whisper and music, losing three lives (whistle, Game Over sound, music stops),
// R starts again without the title, sounds load from file://, no errors.
// (Winning and the Giant Eye were checked by playing in development.)
// Usage: node scripts/verify-starfall3.mjs [dist folder] [screenshot folder]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve(process.argv[2] ?? "dist");
const OUT = path.resolve(process.argv[3] ?? "../capturas-starfall3");
const BASE = pathToFileURL(path.join(DIST, "index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(!!ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-sf3-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile, args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => {
    const { play, pause } = HTMLMediaElement.prototype;
    window.__audio = [];
    HTMLMediaElement.prototype.play = function () { window.__audio.push(["play", this.src.split("/").pop(), this.playbackRate]); (window.__els ??= new Set()).add(this); return play.call(this); };
    HTMLMediaElement.prototype.pause = function () { window.__audio.push(["pause", this.src.split("/").pop()]); return pause.call(this); };
  });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("request", (r) => /^https?:/.test(r.url()) && errors.push(`internet: ${r.url()}`));
  p.on("requestfailed", (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? "") && errors.push(`missing: ${r.url().split("/").pop()}`));
  await p.goto(`${BASE}?nointro#/game-design`, { waitUntil: "load" });
  await p.waitForSelector("#gd-horror canvas");
  await p.$eval("#gd-horror canvas", (el) => el.scrollIntoView({ block: "center" }));
  await sleep(1500);
  const live = () => p.$eval("#gd-horror [aria-live=polite]", (el) => el.textContent.trim());

  check(/Title screen/.test(await live()), "The title screen shows first", await live());
  const text = await p.$eval("#gd-horror", (el) => el.innerText);
  check(/AI assistant \(Claude\)/.test(text), "The AI help is stated under the game");
  await p.screenshot({ path: path.join(OUT, "starfall3-title.png") });

  const box = await (await p.$("#gd-horror canvas")).boundingBox();
  await p.mouse.click(box.x + box.width / 2, box.y + box.height * 0.2);
  await sleep(800);
  check(/Wave \d+ of 10\. Lives: 3/.test(await live()), "A click starts the game: 10 waves, 3 lives", await live());
  let audio = await p.evaluate(() => window.__audio);
  check(audio.some(([a, f]) => a === "play" && f === "snd_whisper.wav"), "A whisper sounds when the game starts");
  check(audio.some(([a, f]) => a === "play" && f === "snd_wizardSong.wav"), "The new music starts");
  await sleep(4000);
  await p.screenshot({ path: path.join(OUT, "starfall3-playing.png") });

  // Nobody clicks: the eyes land until three lives are lost.
  let t = "";
  for (let i = 0; i < 300 && !/Game over/.test(t); i++) { await sleep(500); t = await live(); }
  check(/Game over/.test(t), "Three eyes on the ground → Game Over", t);
  await sleep(600);
  await p.screenshot({ path: path.join(OUT, "starfall3-gameover.png") });
  audio = await p.evaluate(() => window.__audio);
  check(audio.filter(([a, f]) => a === "play" && f === "snd_sadWhistleSound.wav").length >= 3, "The wail plays for each lost life");
  check(audio.some(([a, f]) => a === "play" && f === "snd_gameOverSound.wav"), "The Game Over sound plays");
  const musicStopped = await p.evaluate(() => {
    const songs = [...(window.__els ?? [])].filter((a) => /snd_wizardSong\.wav$/.test(a.src));
    return songs.length > 0 && songs.every((a) => a.paused && a.currentTime === 0);
  });
  check(musicStopped, "The music stops at Game Over");
  const decoded = await p.evaluate(() => [...(window.__els ?? [])].filter((a) => /starfall3/.test(a.src)).every((a) => !a.error && a.readyState >= 1));
  check(decoded, "Every 3.0 sound loads from the offline folder");

  await p.keyboard.press("r");
  await sleep(600);
  check(/Wave \d+ of 10\. Lives: 3/.test(await live()), "R starts again straight away, without the title", await live());
  check(errors.length === 0, "No errors, no missing files, no internet", errors.slice(0, 3).join(" | "));
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
