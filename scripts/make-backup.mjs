// Backup presentation: walks the guided route on the offline build and saves
// every stop as a PNG, plus one PDF with all of them (one stop per page).
// Usage: node scripts/make-backup.mjs <dist folder> <output folder>
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DIST = path.resolve(process.argv[2] ?? "dist");
const OUT = path.resolve(process.argv[3] ?? "../respaldo-presentacion");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-backup-"));
const browser = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true, userDataDir: profile });
try {
  const p = await browser.newPage();
  await p.setViewport({ width: 1600, height: 900 });
  await p.goto(`${pathToFileURL(path.join(DIST, "index.html")).href}?nointro`, { waitUntil: "load" });
  await sleep(1500);
  await p.keyboard.press("p");
  await sleep(400);
  await p.keyboard.press("Enter");
  await sleep(1000);
  const files = [];
  const total = await p.evaluate(() => Number(document.querySelector("[aria-live=polite].truncate")?.textContent.match(/\/ (\d+)/)?.[1] ?? 0));
  for (let i = 0; i < total; i++) {
    if (i > 0) await p.keyboard.press("ArrowRight");
    await sleep(2600);
    const file = `parada-${String(i + 1).padStart(2, "0")}.png`;
    await p.screenshot({ path: path.join(OUT, file) });
    files.push(file);
    console.log(file, await p.evaluate(() => document.querySelector("[aria-live=polite].truncate")?.textContent));
  }
  const imgs = await Promise.all(files.map(async (f) => `data:image/png;base64,${(await readFile(path.join(OUT, f))).toString("base64")}`));
  const doc = await browser.newPage();
  await doc.setContent(`<!doctype html><style>@page{size:1600px 900px;margin:0}body{margin:0}img{display:block;width:1600px;height:900px;page-break-after:always}</style>${imgs.map((s) => `<img src="${s}">`).join("")}`, { waitUntil: "load" });
  await doc.pdf({ path: path.join(OUT, "Presentacion-respaldo.pdf"), width: "1600px", height: "900px", printBackground: true });
  console.log("PDF ready");
} finally {
  await browser.close();
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
