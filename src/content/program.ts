// Single source of truth for the exchange. Every fact here is traceable to the
// supplied materials: the program handout, the class schedule screenshots
// (weeks 2–4), the Moodle course index, and dated photos. Anything not yet
// verified is recorded as a `pending` note, shown only in review mode.

export type Provenance = "student" | "class" | "upcoming";

export const identity = {
  student: "Hermelinda Rojas Rubio",
  studies: "Information Technology",
  from: "Querétaro, Mexico",
  host: "Cambrian College",
  city: "Greater Sudbury",
  region: "Ontario, Canada",
  program: "Querétaro Exchange Program",
  span: "Four weeks · October–November 2026",
  coordinates: "46.49° N, 80.99° W",
  pending: [] as string[],
};

export type SubjectId =
  | "game-design"
  | "harmony"
  | "blender"
  | "drawing"
  | "microbits"
  | "networking"
  | "itba"
  | "ai-agents"
  | "database"
  | "iot";

export type Subject = {
  id: SubjectId;
  name: string;
  /** What the case study will contain, in plain words. */
  inside: string;
  weeks: number[];
  status: Provenance;
  studentPieces: number;
  classPieces: number;
  pending?: string;
};

export const subjects: Subject[] = [
  { id: "game-design", name: "Game Design", inside: "Game design theory in week 1. StarFall, my first game in GameMaker, started in week 2 and grew into version 2.0 in week 4 (waves, three lives, Game Over) and a horror version 3.0, with its code and my notes on player psychology", weeks: [1, 2, 4], status: "student", studentPieces: 5, classPieces: 2 },
  { id: "drawing", name: "Drawing and Character Development", inside: "A layered digital pose drawing, five thumbnail sketches, and life drawings from Nov 5", weeks: [2, 3, 4], status: "student", studentPieces: 6, classPieces: 2 },
  { id: "harmony", name: "2D Animation in Harmony", inside: "Keyframe practice and a walk cycle on a rigged character", weeks: [1, 2, 3, 4], status: "student", studentPieces: 2, classPieces: 1 },
  { id: "blender", name: "3D Animation in Blender", inside: "My shortcut map from Harmony to Blender, and forward vs inverse kinematics", weeks: [2, 3, 4], status: "student", studentPieces: 1, classPieces: 0 },
  { id: "microbits", name: "Arduino and Micro:bits", inside: "The class's ultrasonic-sensor circuit, my photo of the kit, and my notes on Caesar and Vigenère ciphers", weeks: [1, 2], status: "student", studentPieces: 2, classPieces: 3 },
  { id: "networking", name: "Networking and Cybersecurity", inside: "My notes on the OSI model, the CIA triad and safe habits online", weeks: [1], status: "student", studentPieces: 3, classPieces: 1 },
  { id: "itba", name: "IT Business Analysis", inside: "Requirements and prototyping for a time-off request app", weeks: [2], status: "class", studentPieces: 0, classPieces: 2 },
  { id: "ai-agents", name: "AI Agents and Generative AI", inside: "Class lectures so far; my own work will be added when it exists", weeks: [3], status: "class", studentPieces: 0, classPieces: 5 },
  { id: "database", name: "Database Fundamentals Bootcamp", inside: "Tables, SQL and queries in DB Browser for SQLite, with my database Categoria.db", weeks: [4], status: "student", studentPieces: 1, classPieces: 0 },
  { id: "iot", name: "IoT Application Programming Interfaces", inside: "My photo from the IoT lab: the dashboard on my laptop, and the circuit", weeks: [4], status: "student", studentPieces: 1, classPieces: 0 },
];

export type ProgramEvent = {
  date: string; // ISO date
  title: string;
  kind: "workshop" | "program" | "evidence";
  subject?: SubjectId;
  /** Program events are schedule facts, not proof of attendance. */
  pending?: string;
};

/** `label` uses the week titles from the Portfolio Exchange handout. */
export type Week = { n: number; label: string; start: string; end: string; pending?: string; events: ProgramEvent[] };

export const weeks: Week[] = [
  {
    n: 1, label: "Introduction", start: "2026-10-12", end: "2026-10-18",
    events: [
      { date: "2026-10-14", title: "Arduino circuits in Tinkercad", kind: "evidence", subject: "microbits" },
    ],
  },
  {
    n: 2, label: "Developing", start: "2026-10-19", end: "2026-10-25",
    events: [
      { date: "2026-10-19", title: "Game Design", kind: "workshop", subject: "game-design" },
      { date: "2026-10-19", title: "Micro:bits: Cryptography", kind: "workshop", subject: "microbits" },
      { date: "2026-10-20", title: "Animation: Blender", kind: "workshop", subject: "blender" },
      { date: "2026-10-21", title: "Harmony rigging · Character posing", kind: "workshop", subject: "harmony" },
      { date: "2026-10-22", title: "Requirements and prototyping", kind: "workshop", subject: "itba" },
      { date: "2026-10-22", title: "Game Design", kind: "workshop", subject: "game-design" },
      { date: "2026-10-23", title: "Maple Hill Farms", kind: "program" },
      { date: "2026-10-24", title: "Canada's Wonderland", kind: "program" },
    ],
  },
  {
    n: 3, label: "Review", start: "2026-10-26", end: "2026-11-01",
    events: [
      { date: "2026-10-26", title: "AI Agents", kind: "workshop", subject: "ai-agents" },
      { date: "2026-10-27", title: "Blender · Harmony rigging", kind: "workshop", subject: "blender" },
      { date: "2026-10-28", title: "Entrepreneurship workshop", kind: "program" },
      { date: "2026-10-28", title: "Our business idea won", kind: "evidence" },
      { date: "2026-10-29", title: "Life drawing: gesture and drapery", kind: "workshop", subject: "drawing" },
      { date: "2026-10-29", title: "My gesture sketches", kind: "evidence", subject: "drawing" },
      { date: "2026-10-30", title: "Game Jam social", kind: "program" },
      { date: "2026-11-01", title: "Sudbury Wolves hockey game", kind: "program" },
    ],
  },
  {
    n: 4, label: "Presentation", start: "2026-11-02", end: "2026-11-07",
    events: [
      { date: "2026-11-02", title: "Game Design", kind: "workshop", subject: "game-design" },
      { date: "2026-11-02", title: "StarFall 2.0: waves, lives, Game Over", kind: "evidence", subject: "game-design" },
      { date: "2026-11-02", title: "Database Bootcamp", kind: "workshop", subject: "database" },
      { date: "2026-11-02", title: "My first SQL queries", kind: "evidence", subject: "database" },
      { date: "2026-11-03", title: "Blender · IoT APIs", kind: "workshop", subject: "iot" },
      { date: "2026-11-03", title: "A 3D model in Blender", kind: "evidence", subject: "blender" },
      { date: "2026-11-03", title: "My photo from the IoT lab", kind: "evidence", subject: "iot" },
      { date: "2026-11-04", title: "Harmony · Sacred Fire and Indigenous teaching", kind: "workshop", subject: "harmony" },
      { date: "2026-11-05", title: "Life drawing · Game Design", kind: "workshop", subject: "drawing" },
      { date: "2026-11-05", title: "My life drawings", kind: "evidence", subject: "drawing" },
      { date: "2026-11-05", title: "StarFall 3.0: a horror version", kind: "evidence", subject: "game-design" },
    ],
  },
];

/** Dates are compared as calendar days in local time. */
export function isUpcoming(isoDate: string, today = new Date()): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  const day = new Date(y, m - 1, d);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return day > t;
}

export function formatDay(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}
