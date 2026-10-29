// Turns the student's raw evidence (phone photos, notebook scans, GameMaker sprites)
// into web-ready files under src/assets. Originals are never modified.
// Usage: SRC=<extracted zip folder> npm run prep:assets
import sharp from "sharp";
import { mkdir, readFile, copyFile } from "node:fs/promises";
import path from "node:path";

const SRC = process.env.SRC ?? "C:/Users/herme/AppData/Local/Temp/claude/cbz";
const OUT = path.resolve("src/assets");
const notes = `${SRC}/00_Por_clasificar/Apuntes`;
const photos = `${SRC}/00_Por_clasificar/Fotografias`;
const captures = `${SRC}/00_Por_clasificar/Capturas_recibidas`;
const game = `${SRC}/08_Game_Design/Evidencias`;

await mkdir(`${OUT}/notebook`, { recursive: true });
await mkdir(`${OUT}/evidence`, { recursive: true });
await mkdir(`${OUT}/starfall`, { recursive: true });

// Notebook pages: most were photographed sideways, so rotate upright,
// trim the desk around the paper and even out the warm indoor light.
const pages = [
  ["image(20261028-003426).png", "cipher", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003441).png", "blender", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003453).png", "game-psychology", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003457).png", "game-overview", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003512).png", "security-habits", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003519).png", "integrity", 270, { left: 60, top: 40, width: 1080, height: 1500 }],
  ["image(20261028-003528).png", "osi", 0, { left: 150, top: 40, width: 1000, height: 1500 }],
];
for (const [file, name, angle, crop] of pages) {
  await sharp(`${notes}/${file}`)
    .rotate(angle)
    .extract(crop)
    .resize({ width: 768 })
    .modulate({ saturation: 0.55, brightness: 1.08 })
    .normalise()
    .webp({ quality: 74 })
    .toFile(`${OUT}/notebook/${name}.webp`);
}

// Evidence photos used on the homepage. Crops remove anything that should not
// be public (a classmate's face in the background, an informal word in a notebook).
const evidence = [
  [`${SRC}/07_Drawing_and_Character_Development/Evidencias/Dibujo_Herme2110.jpg`, "drawing-pose", null, 1100],
  [`${photos}/87670048-6e8e-4ae4-881f-718a0d9d5bb2.jpg`, "thumbnails", { left: 180, top: 140, width: 900, height: 1250 }, 1000],
  [`${photos}/88836a12-0eb9-42aa-98c0-fb820850da90.jpg`, "harmony-walk-rig", { left: 180, top: 80, width: 1340, height: 900 }, 1400],
  [`${photos}/76913e23-9794-4f9e-9d75-e031148ff147.jpg`, "arduino-desk", { left: 0, top: 470, width: 1200, height: 680 }, 1400],
  [`${captures}/image(20261028-004616).png`, "padlet-card", { left: 952, top: 386, width: 152, height: 168 }, 456],
  [`${photos}/c964e6cd-3328-40bc-8a70-81128837b312.jpg`, "harmony-keyframes", { left: 0, top: 380, width: 899, height: 1219 }, 900],
  [`${photos}/df30e6a0-1e9a-4aff-a581-d9109c3848c6.jpg`, "photoshop-screen-a", { left: 120, top: 80, width: 1480, height: 910 }, 1400],
  [`${photos}/682c25bd-aad0-4ef6-8e6f-7b5da9741792.jpg`, "photoshop-screen-b", { left: 200, top: 0, width: 1100, height: 1130 }, 1100],
  // Class demonstrations photographed on the projector (instructor's screen).
  [`${photos}/a967417e-c8c6-4359-a6a2-cfca5d10a22d.jpg`, "tinkercad-ultrasonic-demo", { left: 150, top: 480, width: 850, height: 560 }, 1300],
  [`${photos}/aad441ac-79ad-4f63-b97d-31c08768217d.jpg`, "microbit-radio-demo", { left: 0, top: 420, width: 1200, height: 940 }, 1200],
  [`${captures}/image(20261028-004716).png`, "northstar-flow", null, 1000],
];
for (const [src, name, crop, width] of evidence) {
  let img = sharp(src).rotate();
  if (crop) img = img.extract(crop);
  await img.resize({ width, withoutEnlargement: false }).webp({ quality: 80 }).toFile(`${OUT}/evidence/${name}.webp`);
}

// StarFall sprites: copy the frames in the order GameMaker plays them.
async function frames(sprite) {
  const yy = await readFile(`${game}/sprites/${sprite}/${sprite}.yy`, "utf8");
  return [...yy.matchAll(/"\$GMSpriteFrame"[^}]*?"name":"([0-9a-f-]{36})"/g)].map((m) => m[1]);
}
for (const sprite of ["spr_star", "spr_explosion", "spr_space", "spr_ground"]) {
  const ids = await frames(sprite);
  for (const [i, id] of ids.entries()) {
    const suffix = ids.length > 1 ? `-${i}` : "";
    await copyFile(`${game}/sprites/${sprite}/${id}.png`, `${OUT}/starfall/${sprite}${suffix}.png`);
  }
  console.log(`${sprite}: ${ids.length} frame(s)`);
}
// StarFall source code, copied verbatim so the site shows the real GML.
await mkdir(`${OUT}/../starfall/gml`, { recursive: true });
for (const [obj, event] of [
  ["obj_gameManager", "Create_0"], ["obj_gameManager", "Alarm_0"], ["obj_gameManager", "Draw_64"],
  ["obj_star", "Create_0"], ["obj_star", "Step_0"], ["obj_star", "Mouse_4"], ["obj_star", "Collision_obj_ground"],
  ["obj_explosion", "Other_7"],
]) {
  await copyFile(`${game}/objects/${obj}/${event}.gml`, path.resolve(`src/starfall/gml/${obj}.${event}.gml`));
}

// Sounds stay as separate files next to index.html (played with <audio>,
// which works from file://) so the single-file build stays small.
await mkdir("public/starfall", { recursive: true });
for (const s of ["snd_popSound/snd_popSound.wav", "snd_sadWhistleSound/snd_sadWhistleSound.wav", "snd_wizardSong/snd_wizardSong.mp3"]) {
  await copyFile(`${game}/sounds/${s}`, `public/starfall/${path.basename(s)}`);
}
console.log("Assets ready in", OUT);
