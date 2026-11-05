// StarFall version 2.0 on the OFFLINE build: waves, three lives, Game Over
// (sign, sound, music stops), restart by clicking the sign or pressing R,
// the waves demo and the versions section.
// Usage: node scripts/verify-starfall2.mjs [dist folder] [screenshot folder]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve(process.argv[2] ?? "dist");
const OUT = path.resolve(process.argv[3] ?? "../capturas-starfall2");
const BASE = pathToFileURL(path.join(DIST, "index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(!!ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-sf2-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => {
    const { play, pause } = HTMLMediaElement.prototype;
    window.__audio = [];
    HTMLMediaElement.prototype.play = function () { window.__audio.push(["play", this.src.split("/").pop()]); (window.__els ??= new Set()).add(this); return play.call(this); };
    HTMLMediaElement.prototype.pause = function () { window.__audio.push(["pause", this.src.split("/").pop()]); return pause.call(this); };
  });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("request", (r) => /^https?:/.test(r.url()) && errors.push(`internet: ${r.url()}`));
  p.on("requestfailed", (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? "") && errors.push(`missing: ${r.url().split("/").pop()}`));
  await p.goto(`${BASE}?nointro#/game-design`, { waitUntil: "load" });
  await p.waitForSelector("#gd-play canvas");
  await sleep(1500);
  const live = () => p.$eval("#gd-play [aria-live=polite]", (el) => el.textContent.trim());

  check((await p.evaluate(() => document.body.innerText)).includes("5 objects, 11 events"), "Facts: 5 objects, 11 events");
  await p.$eval("#gd-play", (el) => el.scrollIntoView({ block: "center" }));
  await sleep(500);
  await p.$$eval("#gd-play button", (bs) => bs.find((b) => /Start StarFall/.test(b.textContent)).click());
  await sleep(600);
  check(/Wave 1\. Stars lost: 0 of 3/.test(await live()), "Start: wave 1, no stars lost", await live());
  await p.screenshot({ path: path.join(OUT, "starfall2-start.png") });

  // Nobody clicks: stars land one by one until the third is lost.
  let text = "";
  for (let i = 0; i < 60 && !/Game over/.test(text); i++) { await sleep(500); text = await live(); }
  check(/Game over/.test(text), "Three stars on the ground → Game Over", text);
  const audio = await p.evaluate(() => window.__audio);
  check(audio.filter(([a, f]) => a === "play" && f === "snd_sadWhistleSound.wav").length >= 1, "The whistle plays while stars are lost");
  check(audio.some(([a, f]) => a === "play" && f === "snd_gameOverSound.wav"), "The Game Over sound plays");
  const musicPaused = await p.evaluate(() => {
    const songs = [...(window.__els ?? [])].filter((a) => /snd_(wizardSong\.mp3|music\.wav)$/.test(a.src));
    return songs.length > 0 && songs.every((a) => a.paused && a.currentTime === 0); // the music must have been found
  });
  check(musicPaused, "The music stops (and will start from the top)");
  await sleep(300);
  await p.screenshot({ path: path.join(OUT, "starfall2-gameover.png") });

  // Stars ignore clicks after Game Over; the sign restarts the room.
  const box = await p.$eval("#gd-play canvas", (c) => { const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await p.mouse.click(box.x + box.w * 0.1, box.y + box.h * 0.2);
  await sleep(300);
  check(/Game over/.test(await live()), "Clicking elsewhere after Game Over does nothing");
  await p.mouse.click(box.x + box.w / 2, box.y + box.h / 2);
  await sleep(600);
  text = await live();
  check(/Wave 1\. Stars lost: 0 of 3/.test(text), "Clicking the Game Over sign restarts the game", text);
  check(await p.evaluate(() => [...(window.__els ?? [])].some((a) => /snd_(wizardSong.mp3|music.wav)$/.test(a.src) && !a.paused)), "After restarting, the music plays again");

  // R also restarts (portfolio control: at any time).
  for (let i = 0; i < 60 && !/Game over/.test(text); i++) { await sleep(500); text = await live(); }
  await p.focus("#gd-play canvas");
  await p.keyboard.press("r");
  await sleep(600);
  check(/Wave 1\. Stars lost: 0 of 3/.test(await live()), "R restarts after Game Over", await live());

  // "How it works": the eleven events, labels, and the waves demo.
  const tabs = await p.$$eval("#gd-how [role=tab]", (t) => t.map((x) => x.textContent));
  check(tabs.length === 11, "How it works lists 11 GML events", String(tabs.length));
  check(tabs.filter((t) => /New in 2\.0/.test(t)).length === 3 && tabs.some((t) => /Alarm 0.*Off in 2\.0/.test(t)), "Version 2.0 labels: 3 new events, Alarm 0 off");
  await p.$eval("#tab-manager-step", (b) => b.click());
  await sleep(400);
  const btn = (label) => p.$$eval("#gml-panel button", (bs, l) => bs.find((b) => b.textContent.startsWith(l)).click(), label);
  const panel = () => p.$eval("#gml-panel", (el) => el.innerText);
  check(/instance_number\(obj_star\) = 1 · wave = 2/.test(await panel()), "Waves demo: the room starts with wave 1 (one star)");
  await btn("Click a star");
  await sleep(150);
  check(/instance_number\(obj_star\) = 2 · wave = 3/.test(await panel()), "Waves demo: clearing a wave sends the next, one star bigger");
  for (let i = 0; i < 3; i++) { await btn("Let a star land"); await sleep(150); }
  check(/gameOver = true/.test(await panel()) && (await p.$("#gml-panel img[alt='Game Over sign']")), "Waves demo: three stars lost → Game Over");
  await p.$eval("#gd-how", (el) => el.scrollIntoView());
  await sleep(400);
  await p.screenshot({ path: path.join(OUT, "starfall2-waves-demo.png") });
  await btn("Restart");
  await sleep(150);
  check(/starsLost = 0 · gameOver = false/.test(await panel()), "Waves demo: restart resets the game");
  const gml = await p.$eval("#gml-panel pre", (el) => el.textContent);
  check(gml.includes("for (var i = 0; i < wave; i += 1)") && gml.includes("snd_gameOverSound"), "The real Step_0 code of version 2.0 is shown");

  // Versions section.
  const versions = await p.$eval("#gd-versions", (el) => el.innerText);
  check(/Oct 19/.test(versions) && /Oct 22/.test(versions) && /Nov 2/.test(versions) && /Upcoming/.test(versions), "Three versions, dated, plus the upcoming last session");
  check(errors.length === 0, "No errors, no missing files, no internet", errors.slice(0, 3).join(" | "));
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
