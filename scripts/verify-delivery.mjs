// Checks the DELIVERY folder itself (not dist): opens ABRIR-PORTAFOLIO.html from
// file://, confirms every linked file loads, the editable scripts are read, the
// StarFall sounds really decode and play, and the notes window works. No internet.
// Usage: node scripts/verify-delivery.mjs <delivery folder>
import puppeteer from "puppeteer-core";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(process.argv[2] ?? "../Entrega_Final_Hermelinda");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(!!ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const profile = await mkdtemp(path.join(tmpdir(), "btc-deliv-"));
const browser = await puppeteer.launch({
  executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
  userDataDir: profile,
  args: ["--autoplay-policy=user-gesture-required"],
});
try {
  for (const f of ["ABRIR-PORTAFOLIO.html", "GUIA-DE-USO.txt", "portafolio/index.html", "portafolio/media.js", "portafolio/notes.es.js", "portafolio/reflections.js",
    "portafolio/media/LEEME.txt", "portafolio/starfall/snd_wizardSong.mp3", "portafolio/starfall/snd_popSound.wav", "portafolio/starfall/snd_sadWhistleSound.wav", "portafolio/starfall/snd_gameOverSound.wav",
    "presentacion-respaldo/Presentacion-respaldo.pdf", "notas-del-presentador/NOTAS-PRESENTADOR.txt"]) {
    const s = await stat(path.join(ROOT, f)).catch(() => null);
    check(s && s.size > 0, `File present: ${f}`, s ? `${Math.round(s.size / 1024)} KB` : "missing");
  }

  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      (window.__played ??= []).push(this);
      return play.call(this);
    };
  });
  const errors = [], requests = [], failed = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("request", (r) => requests.push(r.url()));
  p.on("requestfailed", (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? "") && failed.push(`${r.url().split("/").pop()} ${r.failure()?.errorText}`));
  await p.goto(pathToFileURL(path.join(ROOT, "ABRIR-PORTAFOLIO.html")).href, { waitUntil: "load" });
  await sleep(3500);
  check(p.url().endsWith("portafolio/index.html"), "ABRIR-PORTAFOLIO.html opens portafolio/index.html", p.url().split("/").slice(-2).join("/"));
  if (await p.$("[role=dialog][aria-label='Opening animation']")) { await p.keyboard.press("Escape"); await sleep(1200); }

  const linked = await p.evaluate(() => [...document.scripts].map((s) => s.getAttribute("src")?.replace(/^\.\//, "")).filter(Boolean));
  check(["media.js", "reflections.js"].every((s) => linked.includes(s)) && !linked.includes("notes.es.js"), "index.html links media.js and reflections.js (notes.es.js only in the notes window)", linked.join(", "));
  const state = await p.evaluate(() => ({
    weeks: Array.isArray(window.BTC_WEEKS) ? window.BTC_WEEKS.map((w) => w.week) : null,
    media: Array.isArray(window.BTC_MEDIA),
    reflections: typeof window.BTC_REFLECTIONS === "object",
    notes: "BTC_NOTES" in window,
  }));
  check(state.weeks?.join() === "1,2,3,4", "reflections.js is read: weeks 1 to 4", String(state.weeks));
  check(state.media, "media.js is read");
  check(state.reflections, "Workshop lines from reflections.js are read");
  check(!state.notes, "Spanish notes are not loaded in the projected window");
  check(await p.$("#week-1") && await p.$("#week-2") && await p.$("#week-3") && await p.$("#week-4"), "Home shows the reflections of weeks 1 to 4");

  // StarFall sounds: decode each file, then play the game as a visitor would.
  await p.evaluate(() => (location.hash = "#/game-design"));
  await sleep(2500);
  const sounds = await p.evaluate(async () => {
    const out = {};
    for (const f of ["snd_wizardSong.mp3", "snd_popSound.wav", "snd_sadWhistleSound.wav", "snd_gameOverSound.wav"]) {
      out[f] = await new Promise((res) => {
        const a = new Audio(`starfall/${f}`);
        a.oncanplaythrough = () => res(Math.round(a.duration * 100) / 100);
        a.onerror = () => res(`error ${a.error?.code}`);
        setTimeout(() => res("timeout"), 5000);
      });
    }
    return out;
  });
  for (const [f, d] of Object.entries(sounds)) check(typeof d === "number" && d > 0, `Sound decodes from the delivery folder: ${f}`, `${d} s`);
  await p.$eval("#gd-play", (el) => el.scrollIntoView({ block: "center" }));
  await sleep(600);
  await p.$$eval("#gd-play button", (bs) => bs.find((b) => /Start StarFall/.test(b.textContent)).click());
  await sleep(700); // version 2.0 stops the music at Game Over (possible after ~3 s): listen early
  const music = await p.evaluate(() => new Promise((res) => {
    // Every Audio the game played (captured by the spy installed before load).
    const song = (window.__played ?? []).find((a) => a.src.endsWith("snd_wizardSong.mp3"));
    if (!song) return res({ found: false });
    const t0 = song.currentTime;
    setTimeout(() => res({ found: true, paused: song.paused, advanced: song.currentTime > t0, error: song.error?.code ?? null }), 500);
  }));
  check(music.found && !music.paused && music.advanced && !music.error, "Start StarFall: the music really plays (time advances)", JSON.stringify(music));

  // Notes window from the delivered folder.
  await p.evaluate(() => (location.hash = "#/"));
  await sleep(1500);
  await p.keyboard.press("p");
  await sleep(400);
  await p.keyboard.press("Enter");
  await sleep(1200);
  const popup = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await p.keyboard.press("n");
  const notes = await Promise.race([popup, sleep(4000).then(() => null)]);
  if (notes) await sleep(1800);
  const nt = notes ? await notes.evaluate(() => document.body.innerText) : "";
  check(/Parada 1 de 15/.test(nt) && /Saluda/.test(nt), "Notes window loads notes.es.js (Parada 1 de 15)");
  for (let i = 0; i < 2; i++) { await p.keyboard.press("PageDown"); await sleep(1300); }
  const nt3 = notes ? await notes.evaluate(() => document.body.innerText) : "";
  check(/Parada 3 de 15/.test(nt3) && /película/.test(nt3), "Notes for the Week 1 stop are in Spanish");

  check(errors.length === 0, "No JavaScript errors", errors.slice(0, 2).join(" | "));
  check(failed.length === 0, "Every linked file loads", failed.slice(0, 3).join(" | "));
  const outside = requests.filter((u) => !u.startsWith("file:") && !u.startsWith("data:") && !u.startsWith("blob:"));
  check(outside.length === 0, "No internet requests (everything from the folder)", outside.slice(0, 2).join(" | "));
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const bad = results.filter((r) => !r).length;
  console.log(`\n${results.length - bad} passed, ${bad} failed.`);
}
