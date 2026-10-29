// Checks the published GitHub Pages site in Microsoft Edge.
// Usage: node scripts/verify-online.mjs <url> [screenshot folder]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const URL_ = process.argv[2] ?? "https://hermelindarr.github.io/beyond-the-classroom/";
const OUT = path.resolve(process.argv[3] ?? "../capturas-online");
const host = new URL(URL_).host;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(!!ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-online-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.evaluateOnNewDocument(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { (window.__played ??= []).push(this); return play.call(this); };
  });
  const errors = [], failed = [], hosts = new Set();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("request", (r) => { const u = r.url(); if (/^https?:/.test(u)) hosts.add(new URL(u).host); });
  p.on("requestfailed", (r) => !/ERR_ABORTED/.test(r.failure()?.errorText ?? "") && failed.push(`${r.url().split("/").pop()} ${r.failure()?.errorText}`));
  p.on("response", (r) => r.status() >= 400 && failed.push(`${r.url().split("/").pop()} HTTP ${r.status()}`));

  await p.goto(`${URL_}?nointro`, { waitUntil: "networkidle2" });
  await p.waitForSelector("main section");
  await sleep(1500);
  check((await p.title()).startsWith("Beyond the Classroom"), "The published page opens", await p.title());
  const st = await p.evaluate(() => ({ weeks: (window.BTC_WEEKS ?? []).map((w) => w.week).join(), media: Array.isArray(window.BTC_MEDIA), notes: "BTC_NOTES" in window }));
  check(st.weeks === "1,2" && st.media, "reflections.js and media.js load online", `weeks ${st.weeks}`);
  check(!st.notes, "Speaker notes are not loaded in the page");
  check(await p.$("#week-1") && await p.$("#week-2") && !(await p.$("#week-3")), "Weeks 1 and 2 reflections; nothing for weeks 3–4");
  await p.click("#week-2 button[aria-controls='week-2-full']");
  await sleep(400);
  check((await p.$eval("#week-2-full", (el) => el.innerText)).includes("Halloween Social"), "The full Week 2 reflection opens");
  await p.$eval("#reflections", (el) => el.scrollIntoView());
  await sleep(800);
  await p.screenshot({ path: path.join(OUT, "online-reflections.png") });
  const review = await p.evaluate(() => document.querySelectorAll("[data-internal]").length);
  check(review === 0, "No internal notes on the page");

  // StarFall with the placeholder assets.
  await p.evaluate(() => (location.hash = "#/game-design"));
  await sleep(2500);
  await p.$eval("#gd-play", (el) => el.scrollIntoView({ block: "center" }));
  await sleep(600);
  await p.$$eval("#gd-play button", (bs) => bs.find((b) => /Start StarFall/.test(b.textContent)).click());
  await sleep(3000);
  const music = await p.evaluate(() => new Promise((res) => {
    const a = (window.__played ?? []).find((x) => x.src.endsWith("snd_music.wav"));
    if (!a) return res(null);
    const t0 = a.currentTime;
    setTimeout(() => res({ paused: a.paused, advanced: a.currentTime > t0, error: a.error?.code ?? null }), 1200);
  }));
  check(music && !music.paused && music.advanced && !music.error, "StarFall starts and its placeholder music plays online", JSON.stringify(music));
  await p.screenshot({ path: path.join(OUT, "online-starfall.png") });
  check((await p.evaluate(() => document.body.innerText)).includes("replaces them with simple placeholders"), "StarFall explains that its assets are placeholders");

  // Guided presentation.
  await p.evaluate(() => (location.hash = "#/"));
  await sleep(1500);
  await p.keyboard.press("p");
  await sleep(400);
  const chooser = await p.$eval("[role=dialog]", (d) => d.textContent);
  check(/Guided route.*7:20.*15 stops/s.test(chooser), "Presentation: guided route 7:20, 15 stops");
  await p.keyboard.press("Enter");
  await sleep(1200);
  for (let i = 0; i < 2; i++) { await p.keyboard.press("PageDown"); await sleep(1300); }
  const hud = await p.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  check(hud.includes("Week 1") && hud.includes("3 / 15"), "Presentation reaches the Week 1 stop", hud);
  await p.screenshot({ path: path.join(OUT, "online-presentation.png") });
  await p.keyboard.press("Escape");

  check(errors.length === 0, "No JavaScript errors", errors.slice(0, 2).join(" | "));
  check(failed.length === 0, "Every file loads (no 404)", failed.slice(0, 3).join(" | "));
  check([...hosts].every((h) => h === host), "Only loads from GitHub Pages (no other sites)", [...hosts].join(", "));

  // Mobile.
  const m = await browser.newPage();
  await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await m.goto(`${URL_}?nointro`, { waitUntil: "networkidle2" });
  await sleep(1500);
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= 0, "Mobile: no sideways scrolling", `${overflow}px`);
  await m.screenshot({ path: path.join(OUT, "online-mobile-home.png") });
  await m.$eval("#week-1", (el) => el.scrollIntoView());
  await sleep(600);
  await m.screenshot({ path: path.join(OUT, "online-mobile-week1.png") });
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const bad = results.filter((r) => !r).length;
  console.log(`\n${results.length - bad} passed, ${bad} failed. Screenshots: ${OUT}`);
}
