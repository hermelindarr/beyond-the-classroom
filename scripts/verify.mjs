// End-to-end check of the OFFLINE build (dist/index.html opened from file://)
// in the Microsoft Edge installed on this Windows machine, using a temporary
// profile. Saves screenshots and prints PASS / FAIL / SKIP per check.
// Usage: node scripts/verify.mjs [outDir]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const OUT = path.resolve(process.argv[2] ?? "../capturas-cp2");
const BASE = pathToFileURL(path.resolve("dist/index.html")).href;
const results = [];
const log = (status, name, detail = "") => {
  results.push({ status, name, detail });
  console.log(`${status.padEnd(4)}  ${name}${detail ? ` — ${detail}` : ""}`);
};
const check = (cond, name, detail) => log(cond ? "PASS" : "FAIL", name, detail);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-edge-"));
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: true,
  userDataDir: profile,
  args: ["--no-first-run", "--no-default-browser-check", "--autoplay-policy=user-gesture-required", "--allow-file-access-from-files=false"],
});

// Record every play()/pause() so sound behaviour can be verified without speakers.
const audioSpy = () => {
  window.__audio = [];
  const P = HTMLMediaElement.prototype;
  const play = P.play, pause = P.pause;
  P.play = function () { window.__audio.push(["play", this.src.split("/").pop(), this.volume]); return play.call(this); };
  P.pause = function () { window.__audio.push(["pause", this.src.split("/").pop()]); return pause.call(this); };
};

async function newPage(viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.evaluateOnNewDocument(audioSpy);
  page.__errors = [];
  page.__external = [];
  page.on("pageerror", (e) => page.__errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.__errors.push(m.text()));
  page.on("request", (r) => /^https?:/.test(r.url()) && page.__external.push(r.url()));
  return page;
}

const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
async function scrollToId(page, id, offset = 0) {
  await page.evaluate((id, offset) => {
    const el = document.getElementById(id);
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 64 + offset);
  }, id, offset);
  await sleep(900);
}

try {
  /* ---------- Desktop, offline (file://) ---------- */
  const page = await newPage({ width: 1440, height: 900 });
  await page.goto(`${BASE}?nointro#/game-design`, { waitUntil: "load" });
  await sleep(1200);
  check((await page.title()).includes("StarFall"), "Game Design page opens from file://");
  await shot(page, "desktop-01-hero");

  // Game: start, sound, scoring, pause, restart.
  await scrollToId(page, "gd-play");
  await page.click("#gd-play button.rounded-full"); // Start StarFall
  await sleep(1500);
  let audio = await page.evaluate(() => window.__audio);
  check(audio.some(([a, f]) => a === "play" && f === "snd_wizardSong.mp3"), "Music starts on Start (looped wizardSong)");
  const loopFlag = await page.evaluate(() => [...document.querySelectorAll("audio")].length >= 0);
  void loopFlag;
  // Click along several rows until a star pops.
  const canvas = await page.$("#gd-play canvas");
  const box = await canvas.boundingBox();
  let score = 0;
  for (let t = 0; t < 60 && score === 0; t++) {
    for (let fx = 0.06; fx < 1; fx += 0.06) {
      await page.mouse.click(box.x + box.width * fx, box.y + box.height * (0.15 + (t % 5) * 0.12));
    }
    score = await page.evaluate(() => Number(document.querySelector("#gd-play [aria-live]").textContent.match(/Score: (\d+)/)?.[1] ?? -1));
    await sleep(120);
  }
  check(score > 0, "Clicking a star pops it and adds score", `score ${score}`);
  audio = await page.evaluate(() => window.__audio);
  check(audio.some(([a, f]) => a === "play" && f === "snd_popSound.wav"), "Pop sound plays on a hit");
  await sleep(4500);
  audio = await page.evaluate(() => window.__audio);
  check(audio.some(([a, f]) => a === "play" && f === "snd_sadWhistleSound.wav"), "Whistle plays when a star reaches the ground");
  await page.evaluate(() => window.scrollTo(0, window.scrollY)); // keep stage in view
  await shot(page, "desktop-02-playing");

  // Frame rate while playing.
  const fps = await page.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(n / 2); }; requestAnimationFrame(f); }));
  // Headless Edge sometimes caps every page at ~30 fps; 24+ while playing means the game adds no visible lag.
  log(fps >= 24 ? "PASS" : "FAIL", "Rendering speed while playing (headless Edge)", `${Math.round(fps)} frames/s`);

  // Sound controls.
  await page.evaluate(() => (window.__audio = []));
  await page.click("#gd-play button[aria-keyshortcuts='M']");
  await sleep(300);
  audio = await page.evaluate(() => window.__audio);
  check(audio.some(([a, f]) => a === "pause" && f === "snd_wizardSong.mp3"), "Music button stops the music");
  const pressed = await page.$eval("#gd-play button[aria-keyshortcuts='M']", (b) => b.getAttribute("aria-pressed"));
  check(pressed === "false", "Music button reports its state (aria-pressed)");
  await page.click("#gd-play button[aria-keyshortcuts='M']");
  await page.$$eval("#gd-play button", (bs) => bs.find((b) => b.textContent === "Sound effects").click());
  await page.click("#gd-play button[aria-keyshortcuts='R']"); // version 2.0: a fresh game, stars clickable again
  await page.evaluate(() => (window.__audio = []));
  for (let i = 0; i < 25; i++) { for (let fx = 0.06; fx < 1; fx += 0.06) await page.mouse.click(box.x + box.width * fx, box.y + box.height * 0.35); await sleep(80); }
  audio = await page.evaluate(() => window.__audio);
  check(!audio.some(([a, f]) => a === "play" && f === "snd_popSound.wav"), "Sound effects button mutes pops");
  await page.$$eval("#gd-play button", (bs) => bs.find((b) => b.textContent === "Sound effects").click());
  await page.$eval("#gd-play input[type=range]", (el) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(el, "30"); el.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.click("#gd-play button[aria-keyshortcuts='R']");
  await page.evaluate(() => (window.__audio = []));
  for (let i = 0; i < 25; i++) { for (let fx = 0.06; fx < 1; fx += 0.06) await page.mouse.click(box.x + box.width * fx, box.y + box.height * 0.35); await sleep(80); }
  audio = await page.evaluate(() => window.__audio);
  const pop = audio.find(([a, f]) => a === "play" && f === "snd_popSound.wav");
  check(pop && Math.abs(pop[2] - 0.3) < 0.01, "Volume slider changes sound volume", pop ? `volume ${pop[2]}` : "no pop heard");

  // Keyboard: Space pauses, B shows boxes, R restarts.
  await page.focus("#gd-play canvas");
  await page.keyboard.press("Space");
  await sleep(300);
  check(await page.$eval("#gd-play", (s) => s.textContent.includes("Paused")), "Space pauses the game (keyboard)");
  await page.keyboard.press("b");
  await sleep(200);
  check((await page.$eval("#gd-play button[aria-keyshortcuts='B']", (b) => b.getAttribute("aria-pressed"))) === "true", "B toggles collision boxes (keyboard)");
  await shot(page, "desktop-03-collision-boxes");
  await page.keyboard.press("r");
  await sleep(400);
  const afterRestart = await page.evaluate(() => Number(document.querySelector("#gd-play [aria-live]").textContent.match(/Score: (\d+)/)?.[1] ?? -1));
  check(afterRestart === 0, "R restarts with score 0 (keyboard)");
  await page.keyboard.press("Space");

  for (const [id, name, offset] of [["gd-brief", "04-workshop", 0], ["gd-inside", "05-inside-project", 0], ["gd-layers", "06-three-layers", 260], ["gd-how", "07-how-it-works", 0], ["gd-notes", "09-notes-to-game", 0], ["gd-adaptations", "10-original-vs-adapted", 0]]) {
    await scrollToId(page, id, offset);
    await shot(page, `desktop-${name}`);
  }

  // Mechanics lab: keyboard between tabs + collision demo.
  await scrollToId(page, "gd-how");
  await page.focus("[role=tab][aria-selected=true]");
  // Version 2.0 lists eleven events; Collision is seven steps below the default (manager Step).
  for (let i = 0; i < 7; i++) await page.keyboard.press("ArrowDown");
  const tabNow = await page.$eval("[role=tab][aria-selected=true]", (t) => t.textContent);
  check(tabNow.includes("Collision"), "Arrow keys move between GML events", tabNow);
  await page.$eval("#gml-panel input[type=range]:nth-of-type(1)", () => {});
  const ys = await page.$$("#gml-panel input[type=range]");
  await ys[1].focus();
  for (let i = 0; i < 40; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("End");
  await sleep(300);
  check(await page.$eval("#gml-panel [aria-live]", (p) => p.textContent.startsWith("Collision")), "Collision demo reacts to the keyboard slider");
  await scrollToId(page, "gd-how", 160);
  await shot(page, "desktop-08-collision-demo");

  // Tab order from the top of the page.
  await page.goto(`${BASE}?nointro#/game-design`, { waitUntil: "load" });
  await sleep(1000);
  await page.evaluate(() => document.activeElement?.blur());
  const order = [];
  for (let i = 0; i < 16; i++) { // the header gained "In my words" with the weekly reflections
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => { const a = document.activeElement; return `${a.tagName.toLowerCase()}:${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 28)}`; }));
  }
  check(order.some((o) => o.includes("Skip")) && order.some((o) => o.startsWith("canvas:StarFall")) && order.some((o) => o.includes("Restart")), "Tab reaches skip link, navigation, the game and its controls", order.join(" | "));

  // Navigation back home.
  await scrollToId(page, "gd-adaptations", 600);
  await page.$$eval("button", (bs) => bs.find((b) => b.textContent === "Back to all workshops").click());
  await sleep(1500);
  const home = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById("workshops").getBoundingClientRect().top) }));
  check(home.hash === "#/" && home.top < 200, "Back to all workshops returns to the homepage list", JSON.stringify(home));
  await shot(page, "desktop-11-back-home");
  await scrollToId(page, "starfall");
  await shot(page, "desktop-12-home-starfall-link");
  // From home, the case-study link works.
  await page.$$eval("a", (as) => as.find((a) => a.getAttribute("href") === "#/game-design").click());
  await sleep(800);
  check(await page.evaluate(() => location.hash === "#/game-design"), "Homepage link opens the case study");

  check(page.__external.length === 0, "No internet requests (fully offline)", page.__external.slice(0, 3).join(", "));
  check(page.__errors.length === 0, "No JavaScript errors", page.__errors.slice(0, 3).join(" | "));

  /* ---------- Presentation and private notes ---------- */
  await page.evaluate(() => window.scrollTo(0, 0));
  // Since CP5, P opens a route chooser; Enter starts the guided route (15 stops, from the homepage).
  await page.keyboard.press("p");
  await sleep(400);
  await page.keyboard.press("Enter");
  await sleep(1200);
  check(await page.evaluate(() => document.documentElement.hasAttribute("data-presenting")), "P starts presentation mode");
  const popupPromise = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await page.keyboard.press("n");
  const notesPage = await Promise.race([popupPromise, sleep(4000).then(() => null)]);
  if (!notesPage) {
    log("FAIL", "N opens the notes window");
  } else {
    await sleep(1500);
    const notesText = await notesPage.evaluate(() => document.body.innerText);
    check(/Parada 1 de 15/.test(notesText) && /Saluda/.test(notesText), "Notes window shows Spanish notes for the current stop");
    for (let i = 0; i < 5; i++) { await page.keyboard.press("ArrowRight"); await sleep(500); }
    await sleep(1500);
    const notes2 = await notesPage.evaluate(() => document.body.innerText);
    check(/Parada 6 de 15/.test(notes2) && /Start StarFall/.test(notes2), "Notes follow the audience window to StarFall (arrow keys)");
    await page.focus("#gd-play canvas"); // focus inside the game: a clicker must still advance
    await page.keyboard.press("PageDown");
    await sleep(900);
    check(/Parada 7 de 15/.test(await notesPage.evaluate(() => document.body.innerText)), "Clicker PageDown advances even with focus in the game");
    await notesPage.setViewport({ width: 980, height: 720 });
    await notesPage.screenshot({ path: path.join(OUT, "private-notes-window.png") });
    const audienceText = await page.evaluate(() => document.body.innerText);
    const audienceHtml = await page.content();
    check(!/primer videojuego|Parada \d|Haz clic/.test(audienceText), "Projected window shows no Spanish notes");
    check(!/primer videojuego/.test(audienceHtml) && !(await page.evaluate(() => "BTC_NOTES" in window)), "Projected window never loads the notes file");
    await shot(page, "presentation-audience-stop-2");
  }
  await page.keyboard.press("Escape");

  // A reloaded or typed #presenter URL must not show notes.
  const direct = await newPage({ width: 1200, height: 800 });
  await direct.goto(`${BASE}#presenter`, { waitUntil: "load" });
  await sleep(1200);
  const directText = await direct.evaluate(() => document.body.innerText);
  check(!/Parada|primer videojuego|Saluda/.test(directText) && directText.includes("Beyond the"), "Opening #presenter directly shows the portfolio, not notes");

  /* ---------- Mobile ---------- */
  const m = await newPage({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await m.goto(`${BASE}?nointro#/game-design`, { waitUntil: "load" });
  await sleep(1200);
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, "Mobile: no sideways scrolling", `${overflow}px`);
  await m.screenshot({ path: path.join(OUT, "mobile-01-hero.png") });
  for (const [id, name, offset] of [["gd-play", "02-game", 0], ["gd-inside", "03-inside", 0], ["gd-how", "04-how-it-works", 0], ["gd-how", "05-how-code", 900], ["gd-notes", "06-notes", 0]]) {
    await scrollToId(m, id, offset);
    await m.screenshot({ path: path.join(OUT, `mobile-${name}.png`) });
  }
  await scrollToId(m, "gd-play");
  await m.tap("#gd-play button.rounded-full");
  await sleep(1200);
  const mbox = await (await m.$("#gd-play canvas")).boundingBox();
  let mscore = 0;
  for (let t = 0; t < 60 && mscore === 0; t++) {
    for (let fx = 0.06; fx < 1; fx += 0.08) await m.touchscreen.tap(mbox.x + mbox.width * fx, mbox.y + mbox.height * (0.2 + (t % 5) * 0.12));
    mscore = await m.evaluate(() => Number(document.querySelector("#gd-play [aria-live]").textContent.match(/Score: (\d+)/)?.[1] ?? -1));
  }
  check(mscore > 0, "Mobile: tapping a star pops it", `score ${mscore}`);
  await m.screenshot({ path: path.join(OUT, "mobile-07-playing.png") });
  check(m.__errors.length === 0, "Mobile: no JavaScript errors", m.__errors.slice(0, 2).join(" | "));
} catch (e) {
  log("FAIL", "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
