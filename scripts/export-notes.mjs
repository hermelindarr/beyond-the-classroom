// Printable copy of the Spanish speaker notes, in guided-route order.
// Usage: node scripts/export-notes.mjs <output .txt>
import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const out = process.argv[2] ?? "NOTAS-PRESENTADOR.txt";
const ctx = { window: {} };
vm.runInNewContext(await readFile("public/notes.es.js", "utf8"), ctx);
const notes = ctx.window.BTC_NOTES;
const routes = await readFile("src/present/routes.ts", "utf8");
const short = routes.slice(routes.indexOf("shortRoute"), routes.indexOf("];"));
const stops = [...short.matchAll(/id: "([^"]+)", chapter: "([^"]+)", title: "([^"]+)", seconds: (\d+)(?:, demo: true)?, narration: "([^"]+)"/g)]
  .map(([, id, chapter, title, seconds, narration]) => ({ id, chapter, title, seconds: +seconds, narration }));

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const lines = [
  "NOTAS DEL PRESENTADOR (privadas, en español)",
  "Beyond the Classroom — ruta guiada",
  "==============================================",
  "",
  "Copia impresa de respaldo. Las notas que ve la ventana de notas (tecla N) están en",
  "portafolio/notes.es.js; si cambias ese archivo, vuelve a pedir esta copia o edítala a mano.",
  "",
];
let t = 0;
stops.forEach((s, i) => {
  lines.push(`--- Parada ${i + 1} de ${stops.length} · ${s.chapter} · ${s.title}`);
  lines.push(`    Tiempo sugerido: ${s.seconds} s (minuto ${mmss(t)} a ${mmss(t + s.seconds)})`);
  lines.push(`    Texto en inglés para leer: ${s.narration}`);
  for (const n of notes[s.id] ?? ["(sin notas para esta parada)"]) lines.push(`    • ${n}`);
  lines.push("");
  t += s.seconds;
});
lines.push(`Duración total planeada: ${mmss(t)}`, "", "", "OTRAS NOTAS (ruta extendida y secciones sueltas)", "-----------------------------------------------");
const used = new Set(stops.map((s) => s.id));
for (const [id, list] of Object.entries(notes)) {
  if (used.has(id)) continue;
  lines.push(`[${id}]`);
  for (const n of list) lines.push(`    • ${n}`);
}
await writeFile(out, "﻿" + lines.join("\r\n") + "\r\n", "utf8");
console.log(`${stops.length} stops, ${mmss(t)} → ${out}`);
