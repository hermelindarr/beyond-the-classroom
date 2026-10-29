// CP4 checks on the OFFLINE build (file://) in the installed Microsoft Edge:
// Networking & Cybersecurity, Arduino & Micro:bits, IT Business Analysis.
import puppeteer from "puppeteer-core";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const OUT = path.resolve(process.argv[2] ?? "../capturas-cp4");
const BASE = pathToFileURL(path.resolve("dist/index.html")).href;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (ok, name, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

await mkdir(OUT, { recursive: true });
const profile = await mkdtemp(path.join(tmpdir(), "btc-cp4-"));
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
const clickText = (page, scope, text) => page.$$eval(`${scope} button`, (bs, t) => { const b = bs.find((x) => x.textContent.trim() === t); if (!b) throw new Error(`button "${t}" not found`); b.click(); }, text);
const text = (page, sel) => page.$eval(sel, (e) => e.textContent);
const setRange = (page, sel, v) => page.$eval(sel, (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, String(v)); el.dispatchEvent(new Event("input", { bubbles: true })); }, v);
const typeInto = async (page, sel, value) => { await page.click(sel, { clickCount: 3 }); await page.keyboard.press("Backspace"); await page.type(sel, value); };

try {
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

  /* ---------------- Networking ---------------- */
  let p = await open("networking", desktop);
  check((await p.title()).startsWith("Networking"), "Networking page opens from file://");
  await shot(p, "networking-01-hero");
  await at(p, "net-osi");
  await p.$$eval("#net-osi ol button", (bs) => bs.find((b) => b.textContent === "3NetworkPacket").click());
  await sleep(200);
  check((await text(p, "#net-osi [aria-live]")).includes("IP addressing"), "OSI: selecting Layer 3 explains routing and IP");
  await p.focus("#net-osi ol button[aria-pressed=true]");
  await p.keyboard.press("ArrowDown");
  check((await text(p, "#net-osi [aria-live]")).includes("Data Link"), "OSI: arrow keys move between layers (keyboard)");
  await clickText(p, "#net-osi", "TCP/IP · 4 layers");
  await sleep(200);
  check((await text(p, "#net-osi [aria-live]")).includes("TCP/IP Link"), "OSI: TCP/IP mapping (Data Link → Link)");
  await shot(p, "networking-02-osi");

  await at(p, "net-journey");
  for (let i = 0; i < 4; i++) await clickText(p, "#net-journey", "Next step");
  const chips = await p.$$eval("#net-journey [aria-label='The message as it is wrapped'] span", (s) => s.map((x) => x.textContent));
  check(chips.join("|") === "MAC header|IP header|TCP header|GET /index.html|Trailer", "Packet journey: frame wraps all headers at step 5", chips.join(" "));
  await shot(p, "networking-03-journey");
  for (let i = 0; i < 4; i++) await clickText(p, "#net-journey", "Next step");
  check((await p.$$eval("#net-journey [aria-label='The message as it is wrapped'] span", (s) => s.length)) === 1, "Packet journey: receiver removes headers back to the data");
  await clickText(p, "#net-journey", "A website request");
  await clickText(p, "#net-journey", "Next step"); await clickText(p, "#net-journey", "Next step");
  check((await text(p, "#net-journey [aria-current=step]")).includes("TCP handshake"), "Website request: steps through DNS to the TCP handshake");

  await at(p, "net-cia");
  await clickText(p, "#net-cia", "Tamper in transit");
  await sleep(200);
  check((await text(p, "#net-cia [aria-live=polite]")).includes("Fingerprints differ"), "Integrity: tampering changes the SHA-256 fingerprint");
  await shot(p, "networking-04-cia-integrity");
  await p.$$eval("#net-cia [role=radio]", (bs) => bs.find((b) => b.textContent.startsWith("Availability")).click());
  await clickText(p, "#net-cia", "Simulate an outage");
  check((await text(p, "#net-cia [aria-live=polite]")).includes("offline"), "Availability: outage takes the portal offline");
  await clickText(p, "#net-cia", "Redundancy off");
  check((await text(p, "#net-cia [aria-live=polite]")).includes("failover"), "Availability: redundancy keeps it reachable");

  await at(p, "net-cipher");
  await typeInto(p, "#net-cipher input:not([type])", "BY HERMELINDA");
  check((await text(p, "#net-cipher p[aria-live]")) === "EB KHUPHOLQGD", "Caesar shift 3: BY HERMELINDA → EB KHUPHOLQGD");
  await shot(p, "networking-05-caesar");
  await clickText(p, "#net-cipher", "Vigenère");
  await typeInto(p, "#net-cipher input:not([type])", "ATTACK");
  check((await text(p, "#net-cipher p[aria-live]")) === "LXFOPV", "Vigenère LEMON: ATTACK → LXFOPV, as in my notes");
  await clickText(p, "#net-cipher", "Shuffled alphabet");
  await clickText(p, "#net-cipher", "Use a longer sentence");
  await sleep(200);
  const top = await p.$eval("#net-cipher [aria-label^='Most frequent']", (e) => e.getAttribute("aria-label"));
  check(/ciphertext letters: H /.test(top), "Frequency attack: most common letter is H (E under my key)", top);
  await shot(p, "networking-06-frequency");
  check(p.errors.length === 0 && p.external.length === 0, "Networking: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- Arduino ---------------- */
  p = await open("arduino", desktop);
  check((await p.title()).startsWith("Arduino"), "Arduino page opens from file://");
  await shot(p, "arduino-01-hero");
  await at(p, "ar-kit");
  await p.click("#ar-kit button[aria-label^='Piezo buzzer']");
  check((await text(p, "#ar-kit [aria-live]")).includes("sound"), "Kit map: selecting the buzzer explains it");
  await clickText(p, "#ar-kit", "Input");
  const dimmed = await p.$$eval("#ar-kit figure button", (bs) => bs.filter((b) => b.className.includes("opacity-20")).length);
  check(dimmed === 8, "Kit map: Input filter leaves only the sensor highlighted", `${dimmed} dimmed`);
  await shot(p, "arduino-02-kit");
  await at(p, "ar-sensor");
  const led11 = () => p.$$eval("#ar-sensor span.rounded-t-full", (s) => s[2].style.background);
  await setRange(p, "#ar-sensor input[type=range]", 150);
  await sleep(200);
  const lit = await led11();
  await setRange(p, "#ar-sensor input[type=range]", 300);
  await sleep(200);
  const latched = await led11();
  check(lit !== "rgb(44, 53, 68)" && latched === lit, "Ultrasonic: < 200 lights pin 11 and, as in the class code, it stays on");
  await clickText(p, "#ar-sensor", "Add an else block");
  await sleep(200);
  check((await led11()) === "rgb(44, 53, 68)", "Ultrasonic: my else block turns pin 11 off again");
  await shot(p, "arduino-03-ultrasonic");
  await at(p, "ar-microbit");
  await p.click("#ar-microbit button[aria-label='Press button A on micro:bit 1']");
  await sleep(150);
  check((await p.$$eval("#ar-microbit svg[role=img]", (s) => s[1].getAttribute("aria-label"))).includes("happy"), "micro:bit radio: A on #1 shows a happy face on #2");
  await shot(p, "arduino-04-microbit");
  await sleep(1200);
  check((await p.$$eval("#ar-microbit svg[role=img]", (s) => s[1].getAttribute("aria-label"))).includes("nothing"), "micro:bit radio: screen clears after 1 second");
  await p.click("#ar-microbit button[aria-label='Press button B on micro:bit 2']");
  await sleep(150);
  check((await p.$$eval("#ar-microbit svg[role=img]", (s) => s[0].getAttribute("aria-label"))).includes("sad"), "micro:bit radio: B on #2 shows a sad face on #1");
  // Cross-link to the cipher notes
  await p.$$eval("#ar-microbit a", (as) => as.find((a) => a.textContent.includes("cipher notes")).click());
  await p.waitForSelector("#net-cipher");
  await sleep(1500);
  check(await p.evaluate(() => Math.abs(document.getElementById("net-cipher").getBoundingClientRect().top) < 200), "Cipher-notes link opens Networking at the cipher section");
  check(p.errors.length === 0 && p.external.length === 0, "Arduino: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- IT Business Analysis ---------------- */
  p = await open("itba", desktop);
  check((await p.title()).startsWith("IT Business Analysis"), "ITBA page opens from file://");
  check((await text(p, "#itba-top")).includes("fictional organization"), "ITBA states Northstar is a fictional classroom case");
  await shot(p, "itba-01-hero");
  await at(p, "itba-moscow");
  await p.click("#itba-moscow [aria-label='MoSCoW category for F-08'] button:nth-child(4)");
  await clickText(p, "#itba-moscow", "Class worked example");
  await sleep(200);
  const aside = await text(p, "#itba-moscow aside");
  check(aside.includes("A-14") && aside.includes("Explicitly excluded"), "MoSCoW: F-08 shows decision A-14 and the worked example");
  await shot(p, "itba-02-moscow");
  await at(p, "itba-weighted");
  check((await text(p, "#itba-weighted p.font-code")).includes("4.85"), "Weighted: F-02 worked example scores 4.85");
  await setRange(p, "#itba-weighted input[type=range]", 3);
  await sleep(200);
  check((await text(p, "#itba-weighted p.font-code")).includes("4.05"), "Weighted: lowering business value to 3 gives 4.05");
  await shot(p, "itba-03-weighted");
  await at(p, "itba-flow");
  await clickText(p, "#itba-flow", "Submit");
  check((await text(p, "#itba-flow [aria-live=polite]")).includes("stays in Draft"), "Flow: invalid request stays in Draft (REQ-007)");
  await p.click("#itba-flow fieldset:nth-of-type(1) input[type=checkbox]");
  await clickText(p, "#itba-flow", "Submit");
  await clickText(p, "#itba-flow", "Return");
  check((await text(p, "#itba-flow [aria-current=step]")) === "Returned for Correction", "Flow: supervisor returns the request for correction");
  await shot(p, "itba-04-flow-correct");
  await p.click("#itba-flow fieldset:nth-of-type(1) input[type=checkbox]");
  await clickText(p, "#itba-flow", "Correct and resubmit");
  await p.click("#itba-flow fieldset:nth-of-type(3) input[type=checkbox]");
  await clickText(p, "#itba-flow", "Approve");
  check((await text(p, "#itba-flow [aria-live=polite]")).includes("HR must route"), "Flow: missing supervisor blocks the decision (REQ-017)");
  await clickText(p, "#itba-flow", "Route manually");
  await clickText(p, "#itba-flow", "Approve");
  check((await text(p, "#itba-flow [aria-current=step]")) === "Approved", "Flow: after HR routing, the request is approved");
  await at(p, "itba-trace");
  await p.select("#itba-trace select", "F-06");
  await sleep(200);
  check((await text(p, "#itba-trace [aria-live=polite]")).startsWith("2 of 22"), "Traceability: filter by feature group");
  await p.select("#itba-trace select", "all");
  await clickText(p, "#itba-trace", "Excluded");
  await sleep(200);
  check((await text(p, "#itba-trace [aria-live=polite]")).startsWith("2 of 22"), "Traceability: 2 requirements excluded from Release 1");
  await p.$$eval("#itba-trace td button", (bs) => bs.find((b) => b.textContent === "REQ-018").click());
  check((await text(p, "#itba-trace aside")).includes("Exclude direct payroll integration"), "Traceability: REQ-018 traces to decision A-14");
  await shot(p, "itba-05-trace");
  check(p.errors.length === 0 && p.external.length === 0, "ITBA: no errors, no internet requests", [...p.errors, ...p.external].slice(0, 2).join(" | "));

  /* ---------------- Navigation ---------------- */
  p = await open("", desktop);
  const links = await p.$$eval("#workshops h3 a", (as) => as.map((a) => a.getAttribute("href")));
  check(["#/networking", "#/arduino", "#/itba"].every((l) => links.includes(l)), "Workshop rows link to the three new case studies", links.join(", "));
  await at(p, "workshops"); await shot(p, "home-workshops");

  /* ---------------- Presentation and notes ---------------- */
  p = await open("itba", desktop);
  // Guided route (since CP5): ITBA is stop 13 of 15.
  await p.keyboard.press("p");
  await sleep(400);
  await p.keyboard.press("Enter");
  await sleep(1000);
  const popup = new Promise((res) => browser.once("targetcreated", (t) => res(t.page())));
  await p.keyboard.press("n");
  const notes = await Promise.race([popup, sleep(4000).then(() => null)]);
  if (!notes) check(false, "Notes window opens on the ITBA page");
  else {
    await sleep(1200);
    for (let i = 0; i < 12; i++) { await p.keyboard.press("PageDown"); await sleep(450); }
    await sleep(1500);
    const t = await notes.evaluate(() => document.body.innerText);
    check(/Parada 13 de 15/.test(t) && /Juega los roles/.test(t), "Notes window shows ITBA notes in Spanish");
    await p.keyboard.press("PageDown");
    await sleep(1500);
    check(/Parada 14 de 15/.test(await notes.evaluate(() => document.body.innerText)), "Notes follow the stops after ITBA");
    check(!/Parada|Clasifica|ficticio/.test(await p.evaluate(() => document.body.innerText)) && !(await p.evaluate(() => "BTC_NOTES" in window)), "Projected ITBA page shows no Spanish notes");
  }

  /* ---------------- Mobile ---------------- */
  for (const [route, ids] of [["networking", ["net-top", "net-osi", "net-journey", "net-cipher"]], ["arduino", ["ar-top", "ar-kit", "ar-sensor", "ar-microbit"]], ["itba", ["itba-top", "itba-moscow", "itba-flow", "itba-trace"]]]) {
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
