// Checks that a video added AFTER the build (copy file + edit media.js, no
// rebuild) appears in the Game Design case study and plays from file://.
// Uses a throwaway copy of dist and a generated colour-bar test clip that is
// never part of the portfolio.
import puppeteer from "puppeteer-core";
import { cp, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const work = await mkdtemp(path.join(tmpdir(), "btc-video-"));
await cp("dist", work, { recursive: true });
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: path.join(work, ".profile") });
let ok = true;
try {
  // 1. Generate a 3-second colour-bar clip in the browser (MediaRecorder → WebM).
  const gen = await browser.newPage();
  const b64 = await gen.evaluate(async () => {
    const c = Object.assign(document.createElement("canvas"), { width: 640, height: 360 });
    const g = c.getContext("2d");
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: "video/webm" });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    rec.start();
    const t0 = performance.now();
    await new Promise((res) => { const f = () => { const t = (performance.now() - t0) / 1000; ["#1FA7A5", "#7C78B8", "#F1EEE8", "#222A35"].forEach((col, i) => { g.fillStyle = col; g.fillRect(((i * 160 + t * 120) % 640), 0, 160, 360); }); g.fillStyle = "#101827"; g.font = "40px sans-serif"; g.fillText("TEST CLIP " + t.toFixed(1), 30, 330); t < 3 ? requestAnimationFrame(f) : res(); }; f(); });
    rec.stop();
    await new Promise((r) => (rec.onstop = r));
    const buf = await new Blob(chunks).arrayBuffer();
    let s = ""; new Uint8Array(buf).forEach((b) => (s += String.fromCharCode(b)));
    return btoa(s);
  });
  await writeFile(path.join(work, "media-test.webm"), Buffer.from(b64, "base64"));

  // 2. Register it the way Hermelinda will: one line in media.js, no rebuild.
  await writeFile(path.join(work, "media.js"), `window.BTC_MEDIA = [{ id: "test", subject: "game-design", file: "media-test.webm", title: "Test clip (not portfolio content)", recorded: "2026-10-28", source: "student" }];\n`);

  // 3. Open the case study from file:// and play it.
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(pathToFileURL(path.join(work, "index.html")).href + "?nointro#/game-design", { waitUntil: "load" });
  await sleep(1200);
  const found = await page.$("#gd-notes video");
  console.log(`${found ? "PASS" : "FAIL"}  Video added via media.js appears without rebuilding`);
  ok &&= !!found;
  if (found) {
    await page.evaluate(() => document.querySelector("#gd-notes video").scrollIntoView({ block: "center" }));
    await page.$$eval("#gd-notes button", (bs) => bs.find((b) => b.textContent === "Play").click());
    await sleep(1500);
    const t = await page.$eval("#gd-notes video", (v) => v.currentTime);
    console.log(`${t > 0.5 ? "PASS" : "FAIL"}  Video plays from file:// — ${t.toFixed(2)} s played`);
    ok &&= t > 0.5;
    const label = await page.$eval("#gd-notes button[aria-label^='Pause']", (b) => b.getAttribute("aria-label")).catch(() => null);
    console.log(`${label ? "PASS" : "FAIL"}  Play button switches to Pause`);
    await page.screenshot({ path: path.resolve("../capturas-cp2/desktop-13-video-player-test.png") });
  }
  // 4. A missing file shows a clear message instead of a broken player.
  await writeFile(path.join(work, "media.js"), `window.BTC_MEDIA = [{ id: "missing", subject: "game-design", file: "media/missing.mp4", title: "Missing file", source: "student" }];\n`);
  await page.reload({ waitUntil: "load" });
  await sleep(1500);
  const msg = await page.$eval("#gd-notes", (s) => s.textContent.includes("could not load")).catch(() => false);
  console.log(`${msg ? "PASS" : "FAIL"}  A missing video file shows a clear message`);
  ok &&= msg;
} finally {
  await browser.close();
  await rm(work, { recursive: true, force: true }).catch(() => {});
}
process.exit(ok ? 0 : 1);
