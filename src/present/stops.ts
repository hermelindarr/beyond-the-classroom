import type { Route } from "../lib/router";

// Presentation stops per page. Titles are public (English); the Spanish notes
// live in public/notes.es.js, keyed by stop id, and load only in the notes window.
export type Stop = { id: string; title: string };

const stopsByRoute: Record<Route, Stop[]> = {
  home: [
    { id: "top", title: "Beyond the Classroom" },
    { id: "journey", title: "Four weeks in Sudbury" },
    { id: "week-1", title: "Week 1: everything felt like a movie" },
    { id: "week-2", title: "Week 2: creativity and technology" },
    { id: "workshops", title: "Ten workshops" },
    { id: "starfall", title: "StarFall" },
    { id: "evidence", title: "From my desk" },
    { id: "sudbury", title: "Greater Sudbury, Ontario" },
  ],
  "game-design": [
    { id: "gd-top", title: "Game Design: StarFall" },
    { id: "gd-play", title: "Play StarFall" },
    { id: "gd-brief", title: "The workshop" },
    { id: "gd-inside", title: "Inside the project" },
    { id: "gd-layers", title: "One room, three layers" },
    { id: "gd-how", title: "How it works" },
    { id: "gd-notes", title: "From my notes to my game" },
  ],
  animation: [
    { id: "an-top", title: "Animation: Harmony and Blender" },
    { id: "an-evidence", title: "From my screen" },
    { id: "an-keys", title: "Keyframes and timing" },
    { id: "an-rig", title: "Rigs: FK and IK" },
    { id: "an-keys-map", title: "Harmony to Blender" },
  ],
  drawing: [
    { id: "dr-top", title: "Drawing and Character Development" },
    { id: "dr-sheet", title: "A character sheet in two passes" },
    { id: "dr-pose", title: "A pose built from shapes" },
    { id: "dr-ideas", title: "What the class taught" },
  ],
  "ai-agents": [
    { id: "ai-top", title: "AI Agents" },
    { id: "ai-loop", title: "The agent loop" },
    { id: "ai-anatomy", title: "Anatomy of an agent" },
    { id: "ai-rag", title: "RAG: open-book answers" },
    { id: "ai-human", title: "Human in the loop" },
  ],
  networking: [
    { id: "net-top", title: "Networking and Cybersecurity" },
    { id: "net-osi", title: "Seven layers" },
    { id: "net-journey", title: "A packet's journey" },
    { id: "net-cia", title: "Private, unchanged, available" },
    { id: "net-cipher", title: "Ciphers from my notebook" },
    { id: "net-labs", title: "Inside the class labs" },
  ],
  arduino: [
    { id: "ar-top", title: "Arduino and Micro:bits" },
    { id: "ar-kit", title: "The kit, part by part" },
    { id: "ar-sensor", title: "Distance in, light out" },
    { id: "ar-microbit", title: "Two micro:bits talking" },
  ],
  itba: [
    { id: "itba-top", title: "IT Business Analysis: Northstar" },
    { id: "itba-moscow", title: "MoSCoW: what must ship?" },
    { id: "itba-weighted", title: "Weighted scores" },
    { id: "itba-flow", title: "The approved request flow" },
    { id: "itba-trace", title: "Traceability" },
  ],
};

export const stopsFor = (route: Route) => stopsByRoute[route];

/** Messages between windows. postMessage works between file:// windows too. */
export type PresenterMessage =
  | { type: "btc:stop"; index: number; total: number; id: string; title: string; next?: string; chapter: string; narration?: string; seconds: number; plannedSoFar: number; plannedTotal: number; route: string }
  | { type: "btc:ready" }
  | { type: "btc:go"; delta: 1 | -1 };

export const PRESENTER_HASH = "#presenter";
export const PRESENTER_NAME = "btc-presenter";

/**
 * True only in a genuine notes window: opened by the portfolio (has an opener),
 * under our window name, with the presenter hash. A reloaded or retyped
 * audience tab fails this check, so notes can never render on the projector.
 */
export function isPresenterWindow(): boolean {
  let opener: Window | null = null;
  try {
    opener = window.opener;
  } catch {
    opener = null;
  }
  return location.hash === PRESENTER_HASH && window.name === PRESENTER_NAME && !!opener && opener !== window;
}
