// Exports every layer of the student's Photoshop drawing as a web image,
// in its original order and position, plus a manifest. The PSD is not modified.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { readPsd, initializeCanvas } from "ag-psd";
import sharp from "sharp";

// Raw pixel buffers are enough here; no drawing canvas is needed in Node.
initializeCanvas(
  () => { throw new Error("canvas not available"); },
  undefined,
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
);

const SRC = process.env.SRC ?? "C:/Users/herme/AppData/Local/Temp/claude/cbz";
const file = `${SRC}/07_Drawing_and_Character_Development/Evidencias/Dibujo Herme_1504.psd`;
const OUT = "src/assets/drawing";
const WIDTH = 1100; // output width; the canvas is 3300 × 5100

await mkdir(OUT, { recursive: true });
const psd = readPsd(await readFile(file), { useImageData: true, skipThumbnail: true });
const scale = WIDTH / psd.width;
const H = Math.round(psd.height * scale);
console.log(`canvas ${psd.width}×${psd.height}, ${psd.children?.length ?? 0} top-level layers`);

const layers = [];
let i = 0;
for (const layer of psd.children ?? []) {
  const info = { name: layer.name, hidden: !!layer.hidden, opacity: layer.opacity ?? 1, blend: layer.blendMode, left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom, group: !!layer.children };
  console.log(JSON.stringify(info));
  if (!layer.imageData || layer.right - layer.left <= 0) continue;
  const { width, height, data } = layer.imageData;
  // Place the layer on a full-size transparent canvas so all layers align.
  const piece = await sharp(Buffer.from(data.buffer), { raw: { width, height, channels: 4 } }).png().toBuffer();
  const full = await sharp({ create: { width: psd.width, height: psd.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, left: Math.max(0, layer.left), top: Math.max(0, layer.top) }])
    .png()
    .toBuffer();
  const name = `layer-${String(i).padStart(2, "0")}.webp`;
  await sharp(full).resize({ width: WIDTH }).webp({ quality: 82, alphaQuality: 90 }).toFile(`${OUT}/${name}`);
  layers.push({ file: name, name: layer.name, hidden: !!layer.hidden, opacity: layer.opacity ?? 1 });
  i++;
}
await writeFile(`${OUT}/layers.json`, JSON.stringify({ width: WIDTH, height: H, source: "Dibujo Herme_1504.psd", layers }, null, 2));
console.log(`exported ${layers.length} layers to ${OUT}`);
