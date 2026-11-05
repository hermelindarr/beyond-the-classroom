// Public-repository version only: replaces third-party assets whose
// redistribution rights are not confirmed with simple original placeholders
// (same file names and sizes, so the game code is unchanged).
//   - StarFall sprites, music and sounds (the workshop's asset pack)
//   - The Game Over image and sound of version 2.0 (given by the instructor)
//   - The Northstar flow diagram (authorship not confirmed)
// Usage: node scripts/make-public-assets.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`);
const png = (file, w, h, body) => sharp(svg(w, h, body)).png().toFile(file);

// A five-pointed star, white so GameMaker-style tinting (image_blend) still colours it.
const starPoints = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
await png("src/assets/starfall/spr_star.png", 128, 128, `<polygon points="${starPoints(64, 68, 58, 24)}" fill="#ffffff" stroke="#d9d9d9" stroke-width="3" stroke-linejoin="round"/>`);

// Night sky: flat gradient with a few fixed dots.
const dots = Array.from({ length: 60 }, (_, i) => `<circle cx="${(i * 137) % 800}" cy="${(i * 89) % 480}" r="${i % 3 ? 1 : 1.6}" fill="#cfd6e6" opacity="${0.35 + (i % 4) * 0.15}"/>`).join("");
await png("src/assets/starfall/spr_space.png", 800, 480, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1020"/><stop offset="1" stop-color="#1b2440"/></linearGradient></defs><rect width="800" height="480" fill="url(#g)"/>${dots}`);

// Ground block: grass strip over soil, drawn as flat shapes.
await png("src/assets/starfall/spr_ground.png", 205, 208, `<rect y="40" width="205" height="168" fill="#5b3b2a"/><rect width="205" height="48" fill="#3f9a4a"/><path d="M0 48 Q25 62 51 48 T102 48 T153 48 T205 48 V60 H0Z" fill="#2f7a3a"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${(i * 53) % 190 + 6}" y="${80 + ((i * 37) % 110)}" width="10" height="6" rx="3" fill="#4a2f22"/>`).join("")}`);

// Explosion: nine frames of an expanding, fading ring.
for (let f = 0; f < 9; f++) {
  const r = 10 + f * 6.5;
  const o = (1 - f / 9).toFixed(2);
  await png(`src/assets/starfall/spr_explosion-${f}.png`, 128, 128, `<circle cx="64" cy="64" r="${r}" fill="none" stroke="#ffe08a" stroke-width="${Math.max(2, 12 - f)}" opacity="${o}"/><circle cx="64" cy="64" r="${Math.max(0, 18 - f * 2.5)}" fill="#fff6d6" opacity="${o}"/>`);
}

// Game Over sign (version 2.0): the instructor's image is not redistributed; plain text instead.
await png("src/assets/starfall/spr_gameover.png", 270, 55, `<rect x="2" y="2" width="266" height="51" rx="6" fill="#1b2440" stroke="#cfd6e6" stroke-width="3"/><text x="135" y="38" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">GAME OVER</text>`);

// Flow diagram placeholder (same size as the original image).
await sharp(svg(1000, 1411, `<rect width="1000" height="1411" fill="#F1EEE8"/><rect x="40" y="40" width="920" height="1331" fill="none" stroke="#7C78B8" stroke-width="4" stroke-dasharray="18 14" rx="24"/><text x="500" y="660" font-family="Arial, sans-serif" font-size="46" fill="#222A35" text-anchor="middle">Diagram not included</text><text x="500" y="730" font-family="Arial, sans-serif" font-size="32" fill="#4a5262" text-anchor="middle">in the public version</text>`)).webp({ quality: 80 }).toFile("src/assets/evidence/northstar-flow.webp");

// Sounds: synthesized 16-bit mono WAV files.
function wav(seconds, sample) {
  const rate = 22050, n = Math.floor(seconds * rate), buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample(i / rate))) * 32767 * 0.6), 44 + i * 2);
  return buf;
}
const tone = (f, t) => Math.sin(2 * Math.PI * f * t);
await writeFile("public/starfall/snd_popSound.wav", wav(0.18, (t) => tone(880 - t * 2400, t) * Math.exp(-t * 22)));
await writeFile("public/starfall/snd_sadWhistleSound.wav", wav(0.9, (t) => tone(700 - t * 380, t) * Math.min(1, t * 20) * Math.exp(-t * 2.2)));
// Calm looping arpeggio (A minor, C, G, F), 16 seconds.
const chords = [[220, 261.6, 329.6], [261.6, 329.6, 392], [196, 246.9, 293.7], [174.6, 220, 261.6]];
await writeFile("public/starfall/snd_music.wav", wav(16, (t) => {
  const bar = Math.floor(t / 4) % 4, step = Math.floor(t / 0.5) % 3, local = t % 0.5;
  return (tone(chords[bar][step], t) * Math.exp(-local * 5) + 0.35 * tone(chords[bar][0] / 2, t)) * 0.7;
}));
// Game Over: three falling notes.
await writeFile("public/starfall/snd_gameOverSound.wav", wav(1.3, (t) => {
  const note = [392, 330, 262][Math.min(2, Math.floor(t / 0.35))];
  return tone(note, t) * Math.exp(-(t % 0.35) * 4) * (t < 1.05 ? 1 : Math.max(0, 1 - (t - 1.05) * 4));
}));
console.log("Placeholders written: 13 sprites, 1 diagram, 4 sounds");
