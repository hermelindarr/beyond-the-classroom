// CP5 checks on the OFFLINE build (file://) in Microsoft Edge: whole-site
// integrity, guided presentation, notes privacy, reduced motion, low-power
// hardware and keyboard reachability. Usage: node scripts/verify-cp5.mjs [dist] [outDir]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve(process.argv[2] ?? "dist");
const OUT = path.resolve(process.argv[3] ?? "../capturas-cp5");
const BASE = pathToFileURL(path.join(DIST, "index.html")).href;
const ROUTES = ["", "game-design", "drawing", "animation", "arduino", "networking", "itba", "ai-agents"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-cp5-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });

async function open(route, viewport = { width: 1440, height: 900 }, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  if (opts.reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  if (opts.cpu) await page.emulateCPUThrottling(opts.cpu);
  page.errors = [];
  page.external = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("request", (r) => /^https?:/.test(r.url()) && page.external.push(r.url()));
  // A media preload cancelled by navigation (ERR_ABORTED) is normal; anything else is a real failure.
  page.on("requestfailed", (r) => r.failure()?.errorText !== "net::ERR_ABORTED" && page.errors.push(`failed: ${r.url().split("/").pop()} ${r.failure()?.errorText}`));
  await page.goto(`${BASE}${opts.query ?? "?nointro"}${route ? `#/${route}` : ""}`, { waitUntil: "load" });
  await page.waitForSelector("main section", { timeout: 15000 });
  await sleep(1200);
  return page;
}
const bodyText = (p) => p.evaluate(() => document.body.innerText);

try {
  /* ---------- Every page: assets, placeholders, errors, offline ---------- */
  for (const route of ROUTES) {
    const p = await open(route);
    // Scroll through so lazy images load.
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 700) { await p.evaluate((y) => window.scrollTo(0, y), y); await sleep(120); }
    await sleep(800);
    const broken = await p.$$eval("img", (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.alt.slice(0, 30)));
    const internal = await p.$$eval("[data-internal]", (e) => e.length);
    const spanish = /\b(Parada|Pendiente|Saluda|Explica)\b/.test(await bodyText(p));
    check(broken.length === 0, `/${route || "home"}: every image loads`, broken.join(", "));
    check(internal === 0 && !spanish, `/${route || "home"}: no internal placeholders or Spanish in the public view`, `${internal} internal`);
    check(p.errors.length === 0 && p.external.length === 0, `/${route || "home"}: no errors, no internet requests`, [...p.errors, ...p.external].slice(0, 2).join(" | "));
    await p.close();
  }

  /* ---------- Guided presentation (short route) ---------- */
  const p = await open("");
  await p.keyboard.press("p");
  await sleep(400);
  check(!!(await p.$("[role=dialog][aria-labelledby=chooser-title]")), "P opens the route chooser");
  await p.screenshot({ path: path.join(OUT, "present-00-chooser.png") });
  const chooserText = await p.$eval("[role=dialog]", (d) => d.textContent);
  check(/Guided route.*7:20.*15 stops/s.test(chooserText), "Guided route lasts 7:20 with 15 stops", chooserText.match(/\d+:\d+ · \d+ stops/g)?.join(" / "));
  const popup = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await p.keyboard.press("Enter"); // first option has focus
  await sleep(1200);
  check(await p.evaluate(() => document.documentElement.hasAttribute("data-presenting")), "Enter starts the guided route");
  await p.keyboard.press("n");
  const notes = await Promise.race([popup, sleep(4000).then(() => null)]);
  if (notes) await sleep(1200);

  const seen = [];
  for (let i = 0; i < 15; i++) {
    await sleep(1600);
    const state = await p.evaluate(() => {
      const hud = document.querySelector("[aria-live=polite].truncate")?.textContent ?? "";
      const caption = document.querySelector("p.max-w-\\[900px\\]")?.textContent ?? "";
      return { hash: location.hash, hud, caption };
    });
    seen.push(state);
    if (i === 2) await p.screenshot({ path: path.join(OUT, "present-03-week1.png") });
    if (i === 3) await p.screenshot({ path: path.join(OUT, "present-04-week2.png") });
    if (i === 5) await p.screenshot({ path: path.join(OUT, "present-04-starfall.png") });
    if (i === 10) await p.screenshot({ path: path.join(OUT, "present-09-cia.png") });
    if (i === 14) await p.screenshot({ path: path.join(OUT, "present-13-closing.png") });
    if (i === 8 && notes) {
      await notes.setViewport({ width: 980, height: 760 });
      await notes.screenshot({ path: path.join(OUT, "present-notes-window.png") });
    }
    if (i < 14) await p.keyboard.press("PageDown");
  }
  const pages = new Set(seen.map((s) => s.hash.replace("#/", "") || "home"));
  check(pages.size === 8, "Guided route visits all eight pages", [...pages].join(", "));
  check(seen.every((s) => s.caption.length > 40), "Every guided stop shows English narration");
  check(seen[14].hud.includes("15 / 15"), "Progress indicator reaches 15 / 15", seen[14].hud);
  if (notes) {
    const t = await notes.evaluate(() => document.body.innerText);
    check(/Parada 15 de 15/.test(t) && /Texto en inglés para leer/.test(t), "Notes window follows across pages and shows the narration to read");
  } else check(false, "Notes window opens during the presentation");
  check(!/Parada|Saluda|Sudbury está/.test(await bodyText(p)) && !(await p.evaluate(() => "BTC_NOTES" in window)), "Projected window never shows or loads Spanish notes");

  // Back, skip a demo, captions, wander away and return, exit, resume.
  await p.keyboard.press("Home"); // no-op key must not break anything
  for (let i = 0; i < 9; i++) await p.keyboard.press("PageUp");
  await sleep(1800);
  const atStarfall = await p.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  check(atStarfall.includes("6 / 15"), "PageUp goes back across pages", atStarfall);
  await p.keyboard.press("s");
  await sleep(1800);
  const afterSkip = await p.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  check(afterSkip.includes("Drawing") && afterSkip.includes("8 / 15"), "S skips the rest of the Game Design demos", afterSkip);
  await p.keyboard.press("c");
  await sleep(200);
  check(!(await p.$("p.max-w-\\[900px\\]")), "C hides the narration captions");
  await p.keyboard.press("c");
  await p.evaluate(() => (location.hash = "#/itba"));
  await sleep(1500);
  check(!!(await p.$$eval("button", (bs) => bs.some((b) => b.textContent.startsWith("Return to stop 8")))), "Exploring another page offers “Return to stop 8”");
  await p.keyboard.press("r");
  await sleep(1800);
  check(await p.evaluate(() => location.hash === "#/drawing" && Math.abs(document.getElementById("dr-sheet").getBoundingClientRect().top - 72) < 40), "R returns to the current stop without losing progress");
  await p.keyboard.press("Escape");
  await sleep(300);
  check(!(await p.evaluate(() => document.documentElement.hasAttribute("data-presenting"))), "Esc ends the presentation");
  await p.keyboard.press("p");
  await sleep(300);
  check(!(await p.$$eval("button", (bs) => bs.some((b) => b.textContent.startsWith("Resume")))), "After Esc, the presentation starts fresh (nothing to resume)");
  await p.keyboard.press("Escape");
  // Reload mid-presentation, then resume.
  await p.keyboard.press("p"); await sleep(300); await p.keyboard.press("Enter"); await sleep(800);
  await p.keyboard.press("PageDown"); await p.keyboard.press("PageDown"); await sleep(1200);
  await p.reload({ waitUntil: "load" }); await sleep(1200);
  await p.keyboard.press("p"); await sleep(400);
  const resume = await p.$$eval("button", (bs) => bs.find((b) => b.textContent.startsWith("Resume"))?.textContent ?? "");
  check(resume.includes("stop 3"), "After a reload, the chooser offers to resume at stop 3", resume);
  await p.close();

  // Extended route
  const e = await open("");
  await e.keyboard.press("p"); await sleep(300);
  await e.$$eval("[role=dialog] button", (bs) => bs.find((b) => b.textContent.includes("Extended exploration")).click());
  await sleep(1200);
  const ext = await e.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  check(/1 \/ 4\d/.test(ext), "Extended route covers every section", ext);
  await e.close();

  /* ---------- Reduced motion ---------- */
  const rm = await open("", { width: 1440, height: 900 }, { reducedMotion: true, query: "?intro" });
  check(!(await rm.$("[role=dialog][aria-label='Opening animation']")), "Reduced motion: no opening animation, even when forced");
  check(!(await rm.evaluate(() => document.documentElement.classList.contains("lenis"))), "Reduced motion: no smooth-scroll hijacking");
  await rm.evaluate(() => (location.hash = "#/game-design"));
  await sleep(1500);
  const spinning = await rm.$eval("#gd-top img", (i) => getComputedStyle(i).animationName);
  check(spinning === "none", "Reduced motion: the decorative spinning star stops", spinning);
  check(rm.errors.length === 0, "Reduced motion: no errors", rm.errors.slice(0, 3).join(" | "));
  await rm.close();

  /* ---------- Lower-performance hardware (CPU slowed 4× and 6×) ---------- */
  for (const cpu of [4, 6]) {
    const slow = await open("game-design", { width: 1366, height: 768 }, { cpu });
    await slow.waitForSelector("#gd-play");
    await slow.evaluate(() => document.getElementById("gd-play").scrollIntoView());
    await sleep(800);
    const measure = () => slow.evaluate(() => new Promise((res) => { let n = 0; const s = performance.now(); const f = () => { n++; if (performance.now() - s < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
    // Headless Edge may cap all pages (often 30 fps): compare the game with the same page at rest.
    const idle = await measure();
    await slow.click("#gd-play button.rounded-full");
    await sleep(1500);
    const fps = await measure();
    const nav = Date.now();
    await slow.evaluate(() => (location.hash = "#/networking"));
    await slow.waitForSelector("#net-top");
    const navMs = Date.now() - nav;
    if (cpu === 4) {
      check(fps >= 0.85 * idle && fps >= 24, "4× slower CPU: playing StarFall keeps the page's frame rate", `${Math.round(fps)} frames/s playing vs ${Math.round(idle)} at rest (game speed is fixed at 60 steps/s)`);
      check(navMs < 3000, "4× slower CPU: changing page stays under 3 s", `${navMs} ms`);
    } else {
      console.log(`INFO  6× slower CPU (very weak hardware): StarFall ${Math.round(fps)} frames/s (page at rest ${Math.round(idle)}), page change ${navMs} ms`);
    }
    check(slow.errors.length === 0, `${cpu}× slower CPU: no errors`, slow.errors.slice(0, 2).join(" | "));
    await slow.close();
  }

  /* ---------- Keyboard reachability ---------- */
  for (const route of ROUTES) {
    const k = await open(route);
    await k.evaluate(() => document.activeElement?.blur());
    const seenEls = new Set();
    let invisible = 0;
    for (let i = 0; i < 60; i++) {
      await k.keyboard.press("Tab");
      const info = await k.evaluate(() => {
        const a = document.activeElement;
        if (!a || a === document.body) return null;
        const r = a.getBoundingClientRect();
        const s = getComputedStyle(a);
        return { key: `${a.tagName}:${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 30)}:${Math.round(r.top + scrollY)}`, visible: r.width > 0 && r.height > 0 && s.visibility !== "hidden" };
      });
      if (!info) continue;
      seenEls.add(info.key);
      if (!info.visible) invisible++;
    }
    check(seenEls.size >= 12 && invisible <= 1, `/${route || "home"}: Tab moves through ${seenEls.size} controls`, invisible ? `${invisible} without size` : "");
    await k.close();
  }

  /* ---------- Final screenshots ---------- */
  const shots = [["", "top", "desktop-home"], ["", "workshops", "desktop-home-workshops"], ["game-design", "gd-play", "desktop-game-design"], ["drawing", "dr-sheet", "desktop-drawing"], ["animation", "an-keys", "desktop-animation"], ["arduino", "ar-sensor", "desktop-arduino"], ["networking", "net-cipher", "desktop-networking"], ["itba", "itba-flow", "desktop-itba"], ["ai-agents", "ai-loop", "desktop-ai-agents"]];
  for (const [route, id, name] of shots) {
    const s = await open(route);
    await s.evaluate((id) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - 64), id);
    await sleep(900);
    await s.screenshot({ path: path.join(OUT, `${name}.png`) });
    await s.close();
  }
  for (const [route, name] of [["", "mobile-home"], ["game-design", "mobile-game-design"], ["networking", "mobile-networking"], ["itba", "mobile-itba"]]) {
    const m = await open(route, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await m.screenshot({ path: path.join(OUT, `${name}.png`) });
    check((await m.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, `Mobile /${route || "home"}: no sideways scrolling`);
    await m.close();
  }
} catch (err) {
  check(false, "Test run crashed", err.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
