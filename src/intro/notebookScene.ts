import * as THREE from "three";
import { gsap } from "../lib/motion";

import cipher from "../assets/notebook/cipher.webp";
import blender from "../assets/notebook/blender.webp";
import gameOverview from "../assets/notebook/game-overview.webp";
import gamePsychology from "../assets/notebook/game-psychology.webp";
import osi from "../assets/notebook/osi.webp";
import securityHabits from "../assets/notebook/security-habits.webp";
import integrity from "../assets/notebook/integrity.webp";

// The opening: one real notebook page writes itself, the rest of the
// notebook fans out, then the camera dives into the paper until its ruled
// lines become the site's grid. Pages are textured planes, no models.

const RULES = 28.0; // ruled lines per page, matches the scans closely
const NAVY = new THREE.Color("#101827");
// The page shader writes colours straight to the screen, so it works in raw
// sRGB values: textures are sampled without conversion and these are sRGB.
const srgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3((n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const NAVY_SRGB = srgb("#101827");
const PAPER_SRGB = srgb("#F1EEE8");

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    // A soft page curl: the outer edge lifts slightly.
    p.z += 0.06 * pow(uv.x, 2.0);
    vShade = 0.86 + 0.14 * (1.0 - uv.x) + 0.05 * uv.y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uHasMap;
  uniform float uReveal;   // 0..1, handwriting appears line by line
  uniform float uOpacity;
  uniform float uDark;     // 0..1, paper turns into the site's navy
  uniform vec3 uPaper; // sRGB
  uniform vec3 uNavy;  // sRGB
  varying vec2 vUv;
  varying float vShade;
  void main() {
    float rules = ${RULES.toFixed(1)};
    float row = floor((1.0 - vUv.y) * rules);
    float line = smoothstep(0.93, 0.985, fract((1.0 - vUv.y) * rules));
    vec3 base = mix(uPaper, uNavy, uDark);
    vec3 lineColor = mix(vec3(0.74, 0.79, 0.85), vec3(0.95, 0.93, 0.91), uDark);
    float lineAlpha = mix(0.75, 0.16, uDark);
    vec3 paper = mix(base, lineColor, line * lineAlpha);
    float written = clamp((uReveal * rules - row - vUv.x) * 5.0, 0.0, 1.0) * uHasMap;
    vec3 ink = texture2D(uMap, vUv).rgb;
    vec3 color = mix(paper, ink, written * (1.0 - uDark));
    color *= mix(vShade, 1.0, uDark);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

type Page = { mesh: THREE.Mesh; u: Record<string, THREE.IUniform> };

export type NotebookScene = { play: () => gsap.core.Timeline; dispose: () => void };

export async function createNotebookScene(canvas: HTMLCanvasElement, rulerEl: HTMLElement): Promise<NotebookScene> {
  const lowPower = (navigator.hardwareConcurrency ?? 4) <= 4;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowPower, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1.25 : 1.75));
  renderer.setClearColor(NAVY, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 0, 7.5);

  const loader = new THREE.TextureLoader();
  const sources = [osi, securityHabits, integrity, cipher, blender, gameOverview, gamePsychology];
  const textures = await Promise.all(
    sources.map((src) =>
      loader.loadAsync(src).then((t) => {
        t.colorSpace = THREE.NoColorSpace;
        t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        return t;
      }),
    ),
  );

  const geometry = new THREE.PlaneGeometry(1, 1.4, 24, 1);
  const pages: Page[] = [];
  // Seven real pages plus two blank ones: week 4 hasn't happened yet.
  const slots = [...textures, null, null];
  slots.forEach((tex) => {
    const u = {
      uMap: { value: tex ?? textures[0] },
      uHasMap: { value: tex ? 1 : 0 },
      uReveal: { value: 1 },
      uOpacity: { value: 0 },
      uDark: { value: 0 },
      uPaper: { value: PAPER_SRGB },
      uNavy: { value: NAVY_SRGB },
    };
    const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms: u, transparent: true, depthWrite: false });
    const mesh = new THREE.Mesh(geometry, mat);
    scene.add(mesh);
    pages.push({ mesh, u });
  });

  const hero = pages[3]; // the cipher page writes itself first
  hero.mesh.renderOrder = 10;

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  const render = () => renderer.render(scene, camera);
  gsap.ticker.add(render);

  // Distance at which a page of height 1.4 exactly fills the viewport height.
  const fillDistance = () => 1.4 / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));

  function play() {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    pages.forEach(({ mesh }, i) => {
      mesh.position.set(0, 0, -3 - i * 0.2);
      mesh.rotation.set(0, 0.5, 0);
    });
    hero.u.uReveal.value = 0;

    // 1. One page arrives and writes itself.
    tl.to(hero.u.uOpacity, { value: 1, duration: 0.9 }, 0)
      .to(hero.mesh.position, { z: 0.6, duration: 2.2, ease: "power4.out" }, 0)
      .to(hero.mesh.rotation, { y: -0.12, z: -0.02, duration: 2.2, ease: "power4.out" }, 0)
      .to(hero.u.uReveal, { value: 1, duration: 2.6, ease: "none" }, 0.5);

    // 2. The notebook fans out across four weeks.
    const spread = Math.min(3.2, camera.aspect * 1.9);
    pages.forEach((p, i) => {
      const t = i / (pages.length - 1);
      const x = (t - 0.5) * 2 * spread;
      const blank = !p.u.uHasMap.value;
      tl.to(p.u.uOpacity, { value: blank ? 0.32 : 1, duration: 0.8 }, 3 + i * 0.07)
        .to(p.mesh.position, { x, y: Math.sin(t * Math.PI) * 0.18 - 0.05, z: p === hero ? 0.2 : -0.6 + Math.sin(t * Math.PI) * 0.4, duration: 1.6, ease: "expo.out" }, 3 + i * 0.07)
        .to(p.mesh.rotation, { y: (0.5 - t) * 0.5, z: (0.5 - t) * 0.14, duration: 1.6, ease: "expo.out" }, 3 + i * 0.07);
    });
    tl.to(rulerEl, { autoAlpha: 1, y: 0, duration: 0.9 }, 3.6);

    // 3. Dive into the cipher page; the others fall away.
    const dive = 6.4;
    tl.to(rulerEl, { autoAlpha: 0, duration: 0.5 }, dive - 0.2);
    pages.forEach((p) => {
      if (p === hero) return;
      tl.to(p.u.uOpacity, { value: 0, duration: 0.9, ease: "power2.in" }, dive)
        .to(p.mesh.position, { z: "-=2", duration: 1.4, ease: "power2.in" }, dive);
    });
    tl.to(hero.mesh.rotation, { y: 0, z: 0, duration: 1.6, ease: "power3.inOut" }, dive)
      .to(hero.mesh.position, { x: 0, y: 0, z: 0, duration: 1.6, ease: "power3.inOut" }, dive)
      .to(camera.position, { z: () => fillDistance() * 0.55, duration: 2.4, ease: "power3.inOut" }, dive + 0.2)
      .to(hero.u.uDark, { value: 1, duration: 1.4, ease: "power2.inOut" }, dive + 1.4);
    return tl;
  }

  function dispose() {
    gsap.ticker.remove(render);
    window.removeEventListener("resize", resize);
    geometry.dispose();
    pages.forEach(({ mesh }) => (mesh.material as THREE.Material).dispose());
    textures.forEach((t) => t.dispose());
    renderer.dispose();
  }

  return { play, dispose };
}
