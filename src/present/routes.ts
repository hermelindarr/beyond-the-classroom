import type { Route } from "../lib/router";
import { stopsFor } from "./stops";
import { demoSections } from "../components/CaseStudy";

// Guided presentation routes across the whole portfolio. Narration is public
// English, shown on screen and readable aloud; it states only verified facts.
// Spanish speaker notes stay in public/notes.es.js (notes window only).

export type PStop = {
  route: Route;
  id: string;
  title: string;
  chapter: string;
  /** On-screen English narration (optional in the extended route). */
  narration?: string;
  /** Suggested speaking time. */
  seconds: number;
  /** An interactive demonstration the presenter may skip. */
  demo?: boolean;
};

export const shortRoute: PStop[] = [
  { route: "home", id: "top", chapter: "Introduction", title: "Beyond the Classroom", seconds: 30, narration: "I am Hermelinda Rojas Rubio, an Information Technology student from Querétaro, Mexico. For four weeks I studied at Cambrian College in Greater Sudbury, Ontario." },
  { route: "home", id: "journey", chapter: "Introduction", title: "Four weeks in Sudbury", seconds: 20, narration: "The exchange followed a four-week schedule. Teal marks the workshops where I have my own evidence. Week four is still ahead." },
  { route: "home", id: "week-1", chapter: "Introduction", title: "Week 1: everything felt like a movie", seconds: 25, narration: "My first week felt like a movie. Every morning the bus took us to Cambrian College, and I could not believe I was really in Canada." },
  { route: "home", id: "week-2", chapter: "Introduction", title: "Week 2: creativity and technology", seconds: 30, narration: "In week two I felt more comfortable. I made a game with stars, loved our micro:bit class, and learned that I don't have to be naturally good at everything to learn something valuable from it." },
  { route: "home", id: "workshops", chapter: "Introduction", title: "Ten workshops", seconds: 15, narration: "There are ten workshops. Each case study is built from my notes, files and photos, and shows clearly what came from the class." },
  { route: "game-design", id: "gd-play", chapter: "Game Design", title: "Play StarFall", seconds: 50, demo: true, narration: "StarFall is my first video game, made in GameMaker during the workshop. In this online version, the workshop's sprites and sounds are replaced by placeholders." },
  { route: "game-design", id: "gd-how", chapter: "Game Design", title: "How it works", seconds: 35, demo: true, narration: "In version 2.0 the stars come in waves, each one bigger than the last. Three stars on the ground mean Game Over, and you can start again." },
  { route: "drawing", id: "dr-sheet", chapter: "Drawing", title: "A character sheet in two passes", seconds: 25, narration: "In the drawing workshops, my Photoshop file kept each round of sketching on its own layer." },
  { route: "animation", id: "an-keys", chapter: "Animation", title: "Keyframes and timing", seconds: 30, demo: true, narration: "In the Harmony workshop I worked with keyframes. Stop-motion keys hold a pose; motion keys let the software draw the frames in between." },
  { route: "arduino", id: "ar-sensor", chapter: "Arduino and Micro:bits", title: "Distance in, light out", seconds: 30, demo: true, narration: "With Arduino, a sensor gives an input and the program decides the output. This is the class demonstration in Tinkercad." },
  { route: "networking", id: "net-cia", chapter: "Networking and Cybersecurity", title: "Private, unchanged, available", seconds: 35, demo: true, narration: "Every security harm breaks one part of the CIA triad. A changed invoice is detected because its fingerprint changes." },
  { route: "networking", id: "net-cipher", chapter: "Networking and Cybersecurity", title: "Ciphers from my notebook", seconds: 30, demo: true, narration: "These ciphers come from my notebook. With the key LEMON, the word ATTACK becomes L X F O P V." },
  { route: "itba", id: "itba-flow", chapter: "IT Business Analysis", title: "The approved request flow", seconds: 35, demo: true, narration: "In business analysis the class worked on Northstar, a fictional case. Every step of the approval flow traces back to a requirement." },
  { route: "ai-agents", id: "ai-loop", chapter: "AI Agents", title: "The agent loop", seconds: 25, narration: "The AI Agents workshop explained how an agent thinks, acts and observes until its goal is met. This section is class material." },
  { route: "home", id: "sudbury", chapter: "Closing", title: "Greater Sudbury, Ontario", seconds: 25, narration: "Greater Sudbury is about 3,370 kilometres from Querétaro. The Database and IoT workshops are still ahead in week four. Thank you." },
];

const chapterOf: Record<Route, string> = {
  home: "Introduction",
  "game-design": "Game Design",
  drawing: "Drawing",
  animation: "Animation",
  arduino: "Arduino and Micro:bits",
  networking: "Networking and Cybersecurity",
  itba: "IT Business Analysis",
  "ai-agents": "AI Agents",
};

const demoIds = demoSections;
const narrationById = new Map(shortRoute.map((s) => [s.id, s.narration]));

/** Every section of every page, in reading order. */
const order: Route[] = ["home", "game-design", "drawing", "animation", "arduino", "networking", "itba", "ai-agents"];
export const extendedRoute: PStop[] = [
  ...order.flatMap((route) =>
    stopsFor(route)
      .filter((s) => !(route === "home" && s.id === "sudbury"))
      .map((s): PStop => ({ route, id: s.id, title: s.title, chapter: chapterOf[route], narration: narrationById.get(s.id), seconds: demoIds.has(s.id) ? 45 : 25, demo: demoIds.has(s.id) })),
  ),
  { ...shortRoute[shortRoute.length - 1] },
];

export type RouteKind = "short" | "extended";
export const routes: Record<RouteKind, PStop[]> = { short: shortRoute, extended: extendedRoute };

export const totalSeconds = (stops: PStop[]) => stops.reduce((t, s) => t + s.seconds, 0);
export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
