// Weekly reflections (weeks 1 and 2) on the OFFLINE build: completeness, weeks
// 3–4 left unwritten, Halloween events, reading view, keyboard, workshop links,
// presentation, responsive layout, offline integrity.
// Usage: node scripts/verify-reflections.mjs [dist folder] [screenshot folder]
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve(process.argv[2] ?? "dist");
const OUT = path.resolve(process.argv[3] ?? "../capturas-reflexiones");
const BASE = pathToFileURL(path.join(DIST, "index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(!!ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-refl-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });

async function open(route = "", viewport = { width: 1440, height: 900 }, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  if (opts.reducedMotion) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("request", (r) => /^https?:/.test(r.url()) && page.errors.push(`internet: ${r.url()}`));
  await page.goto(`${BASE}?nointro${route ? `#/${route}` : ""}`, { waitUntil: "load" });
  await page.waitForSelector("main section");
  await sleep(1200);
  return page;
}
const text = (page, sel) => page.$eval(sel, (el) => el.innerText);
const topOf = (page, sel) => page.$eval(sel, (el) => Math.round(el.getBoundingClientRect().top));

try {
  /* ---------- Content: complete, in order, nothing invented ---------- */
  const p = await open();
  const data = await p.evaluate(() => window.BTC_WEEKS);
  check(Array.isArray(data) && data.map((w) => w.week).join() === "1,2", "reflections.js holds exactly weeks 1 and 2", data?.map((w) => w.week).join());
  check(await p.$("#week-1") && await p.$("#week-2"), "Home shows a reflection for week 1 and week 2");
  check(!(await p.$("#week-3")) && !(await p.$("#week-4")), "No reflection exists for weeks 3 and 4");
  const titles = await p.$$eval("#reflections article h3", (h) => h.map((x) => x.textContent));
  check(titles[0] === "A New Beginning: Everything Felt Like a Movie" && titles[1] === "Creativity, Technology and New Experiences", "Week titles are exact", titles.join(" | "));
  const soon = await p.$$eval("#reflections .border-t", (rows) => rows.filter((r) => r.textContent.includes("Reflection coming soon")).map((r) => r.textContent.match(/Week \d/)?.[0]));
  check(soon.join() === "Week 3,Week 4", "Weeks 3 and 4 say only “Reflection coming soon”", soon.join());

  check(await p.$eval("#week-1-full", (el) => el.hidden) && await p.$eval("#week-2-full", (el) => el.hidden), "Full reflections start closed (summary first)");
  const summary1 = await text(p, "#week-1");
  check(summary1.includes("Sometimes I felt like I was in a movie") && summary1.includes("In my words"), "Week 1 summary shows the movie quote");
  check((await text(p, "#week-2")).includes("I don't have to be naturally good at everything to learn something valuable from it."), "Week 2 summary shows its quote");

  for (const n of [1, 2]) {
    await p.click(`#week-${n} button[aria-controls="week-${n}-full"]`);
    await sleep(400);
    // The quote is shown once, large, in the summary; everything else is in the reading.
    const full = (await text(p, `#week-${n}-full`)) + (await text(p, `#week-${n} figure`)).replace(/[“”]/g, "");
    const w = data.find((x) => x.week === n);
    const all = [...w.opening, ...w.parts.flatMap((x) => [x.heading, ...x.text]), ...w.closing];
    const missing = all.filter((s) => !full.includes(s));
    check(missing.length === 0, `Week ${n}: the full reflection shows every paragraph, untruncated (${all.length} blocks)`, missing.map((m) => m.slice(0, 50)).join(" | "));
    check(await p.$eval(`#week-${n} button[aria-controls="week-${n}-full"]`, (b) => b.getAttribute("aria-expanded")) === "true", `Week ${n}: the button reports aria-expanded`);
  }
  const w1 = await text(p, "#week-1"), w2 = await text(p, "#week-2");
  for (const [words, where] of [["bus", w1], ["breakfast", w1], ["bouncing ball", w1], ["micro:bit as a gift", w1], ["really like stars", w2], ["10 out of 10", w2], ["little bracelets", w2], ["characters for my future video games", w2]]) {
    check(where.includes(words), `Personal detail kept: “${words}”`);
  }
  check(w2.includes("Halloween Social") && !w1.includes("Halloween"), "Halloween Social appears in week 2 only");
  // Editorial integrity: full length, no repeated sentences, quote not repeated in the body,
  // and each workshop line is taken word for word from its week.
  for (const w of data) {
    const body = [...w.opening, ...w.parts.flatMap((x) => x.text), ...w.closing];
    const words = body.join(" ").split(/\s+/).filter(Boolean).length;
    check(words >= 550 && words <= 900, `Week ${w.week}: full reflection length`, `${words} words`);
    const sentences = body.join(" ").split(/(?<=[.!?:])\s+/);
    const repeated = sentences.filter((s, i) => sentences.indexOf(s) !== i);
    check(repeated.length === 0, `Week ${w.week}: no sentence is repeated`, repeated.join(" | "));
    check(!body.some((b) => b.includes(w.quote)), `Week ${w.week}: the large quote is not repeated word for word in the body`);
    const echoes = w.parts.filter((x) => x.echo);
    check(echoes.every((x) => x.text.join(" ").includes(x.echo)), `Week ${w.week}: workshop lines are quoted word for word from the text`);
  }
  // Game Design: week 1 was theory only; StarFall started in week 2.
  check(!/StarFall|GameMaker|developing our video game/i.test(w1) && /introduction to game design/.test(w1), "Week 1 mentions only the introduction to game design, not StarFall");
  check(/started developing our video game/.test(w2) && /Game Design/.test(w2), "Week 2 is when StarFall was started");
  const gdRow = await p.$$eval("#workshops li", (lis) => lis.find((li) => li.querySelector("h3")?.textContent.startsWith("Game Design"))?.innerText ?? "");
  check(/theory in week 1/.test(gdRow) && /started in week 2/.test(gdRow), "Workshops list: Game Design says theory in week 1, StarFall started in week 2", gdRow.split("\n").slice(0, 2).join(" / "));
  const panel = await p.$eval("#starfall", (el) => el.innerText);
  check(/When\s*Week 2/.test(panel), "Home StarFall panel says Week 2");
  const notesW1 = (await readFile(path.join(DIST, "notes.es.js"), "utf8")).match(/"week-1": \[[\s\S]*?\]/)?.[0] ?? "";
  check(!/StarFall|GameMaker/i.test(notesW1), "Week 1 Spanish notes don't mention StarFall");
  const pageText = await p.evaluate(() => document.body.innerText);
  check((pageText.match(/Halloween/g) ?? []).length === (w2.match(/Halloween/g) ?? []).length, "Halloween is not mentioned anywhere else on the page");
  check(!/Special Halloween Event/i.test(pageText), "The Special Halloween Event (week 3) is never described as done");
  await p.screenshot({ path: path.join(OUT, "desktop-week2-open.png") });
  await p.$eval("#week-1", (el) => el.scrollIntoView());
  await sleep(500);
  await p.screenshot({ path: path.join(OUT, "desktop-week1-open.png") });

  // Back to the summary closes the reading and returns to the week.
  await p.click("#week-1-full button");
  await sleep(1500);
  check(await p.$eval("#week-1-full", (el) => el.hidden) && (await p.evaluate(() => document.activeElement?.id)) === "week-1", "“Back to the summary” closes it and returns focus to the week");

  /* ---------- Keyboard ---------- */
  await p.focus("#week-2 button[aria-controls='week-2-full']");
  await p.keyboard.press("Enter");
  await sleep(300);
  check(await p.$eval("#week-2-full", (el) => el.hidden), "Enter on the button closes the open reflection");
  await p.keyboard.press("Space");
  await sleep(300);
  check(!(await p.$eval("#week-2-full", (el) => el.hidden)), "Space opens it again");
  const outline = await p.$eval("#week-2 button[aria-controls='week-2-full']", (b) => getComputedStyle(b).outlineStyle);
  check(outline !== "none", "The button shows a visible focus ring", outline);

  /* ---------- Navigation into the reflections ---------- */
  await p.evaluate(() => window.scrollTo(0, 0));
  await sleep(400);
  await p.$$eval("header nav a", (as) => as.find((a) => a.textContent === "In my words").click());
  await sleep(1600);
  check(Math.abs((await topOf(p, "#reflections")) - 72) < 30, "Header link “In my words” scrolls to the reflections");
  await p.$$eval("#journey button", (bs) => bs.find((b) => b.textContent.includes("week 2")).click());
  await sleep(1600);
  check(Math.abs((await topOf(p, "#week-2")) - 72) < 30, "Timeline link “Read my reflection on week 2” scrolls to week 2");
  check(p.errors.length === 0, "Home: no errors, no internet requests", p.errors.slice(0, 2).join(" | "));
  await p.close();

  /* ---------- Workshop pages quote the matching week ---------- */
  const expected = { "game-design": [2], drawing: [2], animation: [1], arduino: [2], networking: [1], itba: [], "ai-agents": [] };
  for (const [route, wk] of Object.entries(expected)) {
    const c = await open(route);
    const found = await c.$$eval("figcaption", (f) => f.map((x) => x.textContent.match(/From my Week (\d) reflection/)?.[1]).filter(Boolean).map(Number));
    check(found.join() === wk.join(), `/${route}: quotes ${wk.length ? `week ${wk.join(", ")}` : "no weekly reflection"}`, found.join() || "none");
    check(c.errors.length === 0, `/${route}: no errors, no internet requests`, c.errors.slice(0, 2).join(" | "));
    if (route === "game-design") {
      await c.$$eval("button", (bs) => bs.find((b) => b.textContent === "Read the whole week").scrollIntoView({ block: "center" }));
      await sleep(600);
      await c.screenshot({ path: path.join(OUT, "desktop-game-design-echo.png") });
      await c.$$eval("button", (bs) => bs.find((b) => b.textContent === "Read the whole week").click());
      await sleep(2200);
      check((await c.evaluate(() => location.hash)) === "#/" && Math.abs((await topOf(c, "#week-2")) - 72) < 40, "“Read the whole week” opens the homepage at week 2");
    }
    await c.close();
  }

  /* ---------- Presentation: key ideas only ---------- */
  const s = await open();
  await s.click("#week-1 button[aria-controls='week-1-full']"); // even if left open…
  await s.keyboard.press("p");
  await sleep(400);
  await s.keyboard.press("Enter");
  await sleep(1200);
  await s.keyboard.press("PageDown"); // 2: the timeline
  await sleep(600);
  await s.keyboard.press("PageDown");
  await sleep(1800);
  let hud = await s.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  const caption = await s.evaluate(() => document.querySelector("p.max-w-\\[900px\\]")?.textContent ?? "");
  check(hud.includes("Week 1") && hud.includes("3 / 15"), "Guided route: stop 3 (after the timeline) is the week 1 reflection", hud);
  check(caption.includes("movie") && caption.length < 220, "Week 1 stop narrates only the key idea", caption);
  check(await s.$eval("#week-1-full", (el) => getComputedStyle(el).display === "none"), "…the long reading stays hidden while presenting");
  check(Math.abs((await topOf(s, "#week-1")) - 72) < 30, "The week 1 stop scrolls to the week");
  await s.screenshot({ path: path.join(OUT, "present-week1.png") });
  await s.keyboard.press("PageDown");
  await sleep(1800);
  hud = await s.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent ?? "");
  check(hud.includes("Week 2") && hud.includes("4 / 15"), "Stop 4 is the week 2 reflection", hud);
  check(Math.abs((await topOf(s, "#week-2")) - 72) < 30, "The week 2 stop scrolls to the week");
  await s.screenshot({ path: path.join(OUT, "present-week2.png") });
  await s.keyboard.press("Escape");
  await sleep(500);
  await s.keyboard.press("p");
  await sleep(400);
  const chooser = await s.$eval("[role=dialog]", (d) => d.textContent);
  check(/Guided route.*7:20.*15 stops/s.test(chooser), "Guided route now lasts 7:20 with 15 stops", chooser.match(/\d+:\d+ · \d+ stops/g)?.join(" / "));
  check(s.errors.length === 0, "Presentation: no errors, no internet requests", s.errors.slice(0, 2).join(" | "));
  await s.close();

  /* ---------- Responsive and reduced motion ---------- */
  for (const [name, vp] of [["tablet", { width: 820, height: 1180 }], ["mobile", { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }]]) {
    const m = await open("", vp, { reducedMotion: name === "mobile" });
    await m.click("#week-2 button[aria-controls='week-2-full']");
    await sleep(400);
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(overflow <= 0, `${name}: no sideways scrolling with the reflection open`, `${overflow}px`);
    const tooWide = await m.$$eval("#week-2-full p", (ps) => ps.filter((x) => x.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length);
    check(tooWide === 0, `${name}: every paragraph fits the screen`);
    const size = await m.$eval("#week-2-full p", (x) => parseFloat(getComputedStyle(x).fontSize));
    check(size >= 16, `${name}: reading text is at least 16 px`, `${size}px`);
    await m.$eval("#week-2", (el) => el.scrollIntoView());
    await sleep(500);
    await m.screenshot({ path: path.join(OUT, `${name}-week2.png`) });
    await m.$eval("#week-2-full", (el) => el.children[3].scrollIntoView());
    await sleep(400);
    await m.screenshot({ path: path.join(OUT, `${name}-week2-reading.png`) });
    check(m.errors.length === 0, `${name}: no errors`, m.errors.slice(0, 2).join(" | "));
    await m.close();
  }
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
