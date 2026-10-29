// CP3 checks on the OFFLINE build (file://) in the installed Microsoft Edge:
// Animation, Drawing and AI Agents. Saves screenshots, prints PASS / FAIL.
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT = path.resolve(process.argv[2] ?? "../capturas-cp3");
const BASE = pathToFileURL(path.resolve("dist/index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-cp3-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });

async function open(route, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  page.errors = [];
  page.external = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text()));
  page.on("request", (r) => /^https?:/.test(r.url()) && page.external.push(r.url()));
  await page.goto(`${BASE}?nointro#/${route}`, { waitUntil: "load" });
  await sleep(1200);
  return page;
}
async function at(page, id, offset = 0) {
  await page.evaluate((id, o) => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + window.scrollY - 64 + o), id, offset);
  await sleep(900);
}
const shot = (page, name) => page.screenshot({ path: path.join(OUT, `${name}.png`) });
const clickText = (page, scope, text) => page.$$eval(`${scope} button`, (bs, t) => bs.find((b) => b.textContent.trim() === t)?.click(), text);

try {
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

  /* ---------------- Animation ---------------- */
  let p = await open("animation", desktop);
  check((await p.title()).startsWith("Animation"), "Animation page opens from file://");
  await shot(p, "animation-01-hero");
  await at(p, "an-evidence"); await shot(p, "animation-02-evidence");
  await at(p, "an-keys");
  const circle = () => p.$eval("#an-keys [role=application] span.shadow-lg", (e) => e.style.left);
  await p.click("#an-keys button[aria-label='Frame 15']");
  const stopPos = await circle();
  await clickText(p, "#an-keys", "Motion keys");
  await sleep(200);
  const motionPos = await circle();
  check(stopPos === "22%" && motionPos !== stopPos, "Keyframes: stop-motion holds, motion keys in-between", `${stopPos} → ${motionPos}`);
  const stage = await (await p.$("#an-keys [role=application]")).boundingBox();
  await p.click("#an-keys button[aria-label='Frame 45']");
  await p.mouse.click(stage.x + stage.width * 0.5, stage.y + stage.height * 0.8);
  await sleep(200);
  check(await p.$("#an-keys button[aria-label='Frame 45, keyframe']") !== null, "Dragging the drawing sets a new keyframe");
  await clickText(p, "#an-keys", "Onion skin");
  await clickText(p, "#an-keys", "Play at 24 fps");
  await sleep(700);
  const f1 = await p.$eval("#an-keys span.font-code", (e) => e.textContent);
  await sleep(500);
  const f2 = await p.$eval("#an-keys span.font-code", (e) => e.textContent);
  check(f1 !== f2, "Play advances frames at 24 fps", `${f1} → ${f2}`);
  await clickText(p, "#an-keys", "Pause");
  await shot(p, "animation-03-keyframes");
  await p.focus("#an-keys [role=application]");
  const before = await p.$eval("#an-keys span.font-code", (e) => e.textContent);
  await p.keyboard.press("ArrowRight");
  check((await p.$eval("#an-keys span.font-code", (e) => e.textContent)) !== before, "Arrow keys step frames (keyboard)");

  await at(p, "an-rig");
  const rigLabel = () => p.$eval("#an-rig svg[role=img]", (e) => e.getAttribute("aria-label"));
  const r0 = await rigLabel();
  await p.$eval("#an-rig input[type=range]", (el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "-60"); el.dispatchEvent(new Event("input", { bubbles: true })); });
  check((await rigLabel()) !== r0, "FK: shoulder slider rotates the chain");
  await clickText(p, "#an-rig", "Inverse (IK)");
  const r1 = await rigLabel();
  await p.click("#an-rig button[aria-label='Move hand down']");
  await p.click("#an-rig button[aria-label='Move hand down']");
  check((await rigLabel()) !== r1, "IK: moving the hand solves the joint angles");
  await shot(p, "animation-04-rig-ik");

  await at(p, "an-keys-map");
  await clickText(p, "#an-keys-map", "Blender");
  await p.focus("#an-keys-map [data-keys-local]");
  await p.keyboard.press("s");
  const activeTool = await p.$eval("#an-keys-map button[aria-pressed=true]", (b) => b.textContent);
  check(activeTool.startsWith("Scale"), "Shortcut map: Blender S highlights Scale (keyboard)", activeTool);
  await shot(p, "animation-05-shortcuts");
  check(p.errors.length === 0 && p.external.length === 0, "Animation: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- Drawing ---------------- */
  p = await open("drawing", desktop);
  check((await p.title()).startsWith("Drawing"), "Drawing page opens from file://");
  await shot(p, "drawing-01-hero");
  await at(p, "dr-sheet");
  const layerOpacity = () => p.$$eval("#dr-sheet .bg-ivory img.absolute", (imgs) => imgs.map((i) => i.style.opacity));
  const o0 = await layerOpacity();
  await p.click("#dr-sheet button[aria-label='Hide Layer 1']");
  await sleep(300);
  const o1 = await layerOpacity();
  check(o0.length === 2 && o1[0] === "0" && o1[1] === "1", "Layer viewer: real PSD layers toggle", `${o0} → ${o1}`);
  await p.click("#dr-sheet button[aria-label='Show Layer 1']");
  await p.mouse.move(5, 5); // stop pointing at a layer (pointing isolates it)
  await p.$eval("#dr-sheet input[type=range]", (el) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "35"); el.dispatchEvent(new Event("input", { bubbles: true })); });
  await sleep(200);
  check((await layerOpacity())[1] === "0.35", "Layer viewer: second pass opacity slider");
  await shot(p, "drawing-02-layers");
  await at(p, "dr-pose"); await shot(p, "drawing-03-pose");
  await clickText(p, "#dr-pose", "Construction notes");
  check((await p.$eval("#dr-pose button[aria-pressed]", (b) => b.getAttribute("aria-pressed"))) === "false", "Pose study: construction notes toggle");
  await at(p, "dr-ideas");
  await clickText(p, "#dr-ideas", "Triangle");
  check((await p.$eval("#dr-ideas [aria-live]", (e) => e.textContent)).includes("dynamic"), "Shape language responds to the chosen shape");
  await shot(p, "drawing-04-class-ideas");
  check(p.errors.length === 0 && p.external.length === 0, "Drawing: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- AI Agents ---------------- */
  p = await open("ai-agents", desktop);
  check((await p.title()).startsWith("AI Agents"), "AI Agents page opens from file://");
  check((await p.$eval("#ai-top", (s) => s.textContent)).includes("None of my own work is shown here yet"), "AI Agents clearly states it is class material only");
  await shot(p, "ai-01-hero");
  await at(p, "ai-loop");
  for (let i = 0; i < 5; i++) await clickText(p, "#ai-loop", "Next step");
  check((await p.$eval("#ai-loop svg", (s) => s.getAttribute("aria-label"))).includes("Done"), "Agent loop steps through to Done");
  await shot(p, "ai-02-loop");
  await at(p, "ai-anatomy");
  await clickText(p, "#ai-anatomy", "Rules");
  check((await p.$eval("#ai-anatomy [aria-live]", (e) => e.textContent)).includes("Approvals"), "Anatomy shows the selected part");
  await shot(p, "ai-03-anatomy");
  await at(p, "ai-rag");
  for (let i = 0; i < 5; i++) await clickText(p, "#ai-rag", "Next step");
  check((await p.$eval("#ai-rag [aria-live]", (e) => e.textContent)) === "Step 6 of 10", "RAG pipeline steps forward");
  await shot(p, "ai-04-rag");
  await at(p, "ai-human");
  await clickText(p, "#ai-human", "Approve");
  check((await p.$eval("#ai-human [aria-live]", (e) => e.textContent)).includes("the tool runs"), "Human in the loop: approval shows the outcome");
  await shot(p, "ai-05-human");
  check(p.errors.length === 0 && p.external.length === 0, "AI Agents: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- Navigation from the homepage ---------------- */
  p = await open("", desktop);
  const links = await p.$$eval("#workshops h3 a", (as) => as.map((a) => `${a.textContent.replace("Case study", "").trim()}→${a.getAttribute("href")}`));
  check(["Game Design→#/game-design", "Drawing and Character Development→#/drawing", "2D Animation in Harmony→#/animation", "3D Animation in Blender→#/animation", "AI Agents and Generative AI→#/ai-agents"].every((l) => links.includes(l)), "Workshop rows link to their case studies", links.join(", "));
  await at(p, "workshops"); await shot(p, "home-workshops");
  await p.evaluate(() => (location.hash = "#/drawing"));
  await p.waitForSelector("#dr-top");
  await sleep(800);
  await p.$$eval("button", (bs) => bs.find((b) => b.textContent === "Back to all workshops").click());
  await sleep(1300);
  check(await p.evaluate(() => location.hash === "#/" && document.getElementById("workshops").getBoundingClientRect().top < 200), "Back to all workshops returns to the list");

  /* ---------------- Presentation and notes on a CP3 page ---------------- */
  p = await open("animation", desktop);
  // Guided route (since CP5): the Animation stop is number 9 of 15.
  await p.keyboard.press("p");
  await sleep(400);
  await p.keyboard.press("Enter");
  await sleep(1000);
  const popup = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await p.keyboard.press("n");
  const notes = await Promise.race([popup, sleep(4000).then(() => null)]);
  if (!notes) check(false, "Notes window opens on the Animation page");
  else {
    await sleep(1200);
    for (let i = 0; i < 8; i++) { await p.keyboard.press("PageDown"); await sleep(500); }
    await sleep(1500);
    const t = await notes.evaluate(() => document.body.innerText);
    check(/Parada 9 de 15/.test(t) && /Arrastra el círculo/.test(t), "Notes window shows the Animation notes in Spanish");
    await p.keyboard.press("PageDown");
    await sleep(1500);
    check(/Parada 10 de 15/.test(await notes.evaluate(() => document.body.innerText)), "Notes follow the stops after Animation");
    check(!/Parada|Arrastra|Dos talleres/.test(await p.evaluate(() => document.body.innerText)) && !(await p.evaluate(() => "BTC_NOTES" in window)), "Projected Animation page shows no Spanish notes");
  }

  /* ---------------- Mobile ---------------- */
  for (const [route, ids] of [["animation", ["an-top", "an-keys", "an-rig", "an-keys-map"]], ["drawing", ["dr-top", "dr-sheet", "dr-pose", "dr-ideas"]], ["ai-agents", ["ai-top", "ai-loop", "ai-anatomy", "ai-human"]]]) {
    const m = await open(route, mobile);
    const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, `Mobile ${route}: no sideways scrolling`, `${overflow}px`);
    for (const [i, id] of ids.entries()) {
      await at(m, id);
      await m.screenshot({ path: path.join(OUT, `mobile-${route}-${i + 1}-${id}.png`) });
    }
    check(m.errors.length === 0, `Mobile ${route}: no JavaScript errors`, m.errors.slice(0, 2).join(" | "));
  }
} catch (e) {
  check(false, "Test run crashed", e.message);
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed. Screenshots: ${OUT}`);
}
