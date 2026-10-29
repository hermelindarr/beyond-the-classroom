// CP1 regression on the OFFLINE build: homepage, opening animation, timeline,
// workshop index, header navigation and presentation mode on the homepage.
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT = path.resolve(process.argv[2] ?? "../capturas-cp1-regresion");
const BASE = pathToFileURL(path.resolve("dist/index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-cp1-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile, args: ["--enable-unsafe-swiftshader"] });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  const errors = [], external = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("request", (r) => /^https?:/.test(r.url()) && external.push(r.url()));

  await p.goto(`${BASE}?intro`, { waitUntil: "load" });
  await sleep(3500);
  const introUp = await p.$("[role=dialog][aria-label='Opening animation']");
  check(!!introUp, "Opening animation plays on first visit");
  await p.screenshot({ path: path.join(OUT, "intro-fan.png") });
  await p.keyboard.press("Escape");
  await sleep(1200);
  check(!(await p.$("[role=dialog][aria-label='Opening animation']")), "Esc skips the opening animation");
  await p.goto(`${BASE}`, { waitUntil: "load" });
  await sleep(1200);
  check(!(await p.$("[role=dialog][aria-label='Opening animation']")), "Opening animation does not repeat after it was seen");
  check((await p.$eval("#top", (s) => s.textContent)).includes("Cambrian College"), "Hero shows the exchange identity");
  check((await p.$$eval("#journey ol > li", (l) => l.length)) === 4, "Timeline shows four weeks");
  await p.$$eval("#workshops button", (bs) => bs.find((b) => b.textContent === "By week").click());
  await sleep(300);
  check((await p.$$eval("#workshops h3", (h) => h.map((x) => x.textContent))).some((t) => t.startsWith("Week 4")), "Workshops can be viewed by week");
  await p.$$eval("header nav a", (as) => as.find((a) => a.textContent === "Sudbury").click());
  await sleep(1500);
  check(await p.evaluate(() => Math.abs(document.getElementById("sudbury").getBoundingClientRect().top - 72) < 30), "Header link scrolls to its section");
  await p.screenshot({ path: path.join(OUT, "home-sudbury.png") });
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.keyboard.press("p");
  await sleep(400);
  await p.keyboard.press("Enter"); // guided route
  await sleep(1000);
  const popup = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await p.keyboard.press("n");
  const notes = await Promise.race([popup, sleep(4000).then(() => null)]);
  if (notes) await sleep(1500); // let the notes window finish loading
  check(!!notes && /Parada 1 de 15/.test(await notes.evaluate(() => document.body.innerText)), "Homepage presentation: notes window in Spanish");
  check(!/Parada|Saluda/.test(await p.evaluate(() => document.body.innerText)), "Homepage presentation: no Spanish on the projected page");
  check(errors.length === 0 && external.length === 0, "Homepage: no errors, no internet requests", [...errors, ...external].slice(0, 2).join(" | "));
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed.`);
}
