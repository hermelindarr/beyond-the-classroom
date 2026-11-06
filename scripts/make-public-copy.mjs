// Turns a fresh copy of the private project's src/ and public/ into the
// public version published on GitHub. Run it once after copying:
//   node scripts/make-public-copy.mjs
// It stops on the first text it cannot find, so nothing private slips through.
//   1. Private Spanish speaker notes → empty template.
//   2. Texts that describe third-party assets say they are placeholders here.
//   3. Internal review notes are emptied; review mode is development-only.
//   4. Third-party assets → original placeholders (scripts/make-public-assets.mjs).
import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const edit = async (file, pairs) => {
  let t = await readFile(file, "utf8");
  for (const [a, b] of pairs) {
    if (!t.includes(a)) throw new Error(`${file}: not found: ${a.slice(0, 70)}`);
    t = t.replace(a, b);
  }
  await writeFile(file, t, "utf8");
};

// 1. Speaker notes.
await writeFile("public/notes.es.js", "// Private speaker notes (Spanish) are not published in this repository.\n// Copy your own notes file here to use the notes window (key N).\nwindow.BTC_NOTES = {};\n", "utf8");

// 2. Third-party assets: honest wording for the public version.
const notMine = "This public version shows simple placeholders instead, because those files are not mine to redistribute.";
await edit("src/pages/game-design/PlayStage.tsx", [["so the game would have an ending.", `so the game would have an ending. ${notMine}`]]);
await edit("src/pages/game-design/ProjectAnatomy.tsx", [
  ["Version 2.0 adds spr_gameover, an image our instructor gave us.</p>", `Version 2.0 adds spr_gameover, an image our instructor gave us. ${notMine}</p>`],
  ["Three from the same asset pack; version 2.0 adds the Game Over sound</p>", "Three from the same asset pack; version 2.0 adds the Game Over sound. Placeholder sounds in this public version</p>"],
]);
await edit("src/pages/GameDesignPage.tsx", [
  ["\"All sprites and the explosion's 9 frames at 30 fps (from the workshop's StarFall asset pack), plus the Game Over image our instructor gave us, added in 2.0\",",
   "\"The explosion's 9 frames at 30 fps (sprites shown here are placeholders: the workshop's asset pack and the instructor's Game Over image are not redistributed)\","],
  ["\"All four sounds: looping music, pop, sad whistle (from the same asset pack) and the Game Over sound added in 2.0\",",
   "\"Four sounds: looping music, pop, sad whistle and Game Over (placeholders in this public version)\","],
]);
await edit("src/present/routes.ts", [["The sprites and sounds come from the workshop's asset pack.", "In this online version, the workshop's sprites and sounds are replaced by placeholders."]]);
await edit("src/pages/game-design/PlayHorror.tsx", [["The Game Over sign is the image our instructor gave us, tinted red.", "The Game Over sign here is a placeholder, tinted red: the original is the image our instructor gave us, which is not redistributed."]]);
await edit("src/pages/ItbaPage.tsx", [["<Provenance tone=\"class\">Process diagram from the workshop</Provenance>", "<Provenance tone=\"class\">Process diagram from the workshop (not included in the public version)</Provenance>"]]);
await edit("src/starfall/sounds.ts", [["  snd_wizardSong: \"./starfall/snd_wizardSong.mp3\",", "  // Public version: an original placeholder loop replaces the workshop's music.\n  snd_wizardSong: \"./starfall/snd_music.wav\","]]);

// 3. Internal review notes.
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(e.name)) yield p;
  }
}
let notes = 0, pendings = 0;
for await (const file of walk("src")) {
  let t = await readFile(file, "utf8");
  const before = t;
  t = t.replace(/(<Internal(?: block)?>)[\s\S]*?(<\/Internal>)/g, (_, a, b) => (notes++, `${a}${b}`));
  if (file.endsWith(path.join("content", "program.ts"))) {
    t = t.replace(/, pending: "[^"]*"/g, () => (pendings++, ""));
    t = t.replace(/\n\s*pending: "[^"]*",/g, () => (pendings++, ""));
    t = t.replace(/pending: \[[^\]]*\],/, () => (pendings++, "pending: [] as string[],"));
  }
  if (t !== before) await writeFile(file, t, "utf8");
}
await edit("src/components/Internal.tsx", [["{ children: ReactNode; block?: boolean }", "{ children?: ReactNode; block?: boolean }"]]);
await edit("src/components/Reflection.tsx", [["export function Reflection({ topic, label }: { topic: string; label: string }) {", "export function Reflection({ topic }: { topic: string; label: string }) {"]]);
let env = await readFile("src/lib/env.ts", "utf8");
env = env.replace(/\/\/ Review mode[\s\S]*?export const REVIEW = [^\n]*\n/, "// Review mode shows internal placeholders. In this public version the\n// internal notes are not published, so it exists only in development.\nexport const REVIEW = import.meta.env.DEV;\n");
if (!env.includes("export const REVIEW = import.meta.env.DEV;")) throw new Error("env.ts: REVIEW not replaced");
await writeFile("src/lib/env.ts", env, "utf8");

// 4. Placeholder assets.
if (existsSync("public/starfall/snd_wizardSong.mp3")) await rm("public/starfall/snd_wizardSong.mp3");
execFileSync(process.execPath, ["scripts/make-public-assets.mjs"], { stdio: "inherit" });
console.log(`public copy ready: ${notes} internal notes emptied, ${pendings} pending fields removed`);
