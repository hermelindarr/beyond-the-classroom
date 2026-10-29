import type { SubjectId } from "../content/program";

export type MediaItem = {
  id: string;
  subject: SubjectId;
  file: string;
  title: string;
  recorded?: string;
  source: "student" | "class";
  poster?: string;
  captions?: string;
};

declare global {
  interface Window {
    BTC_MEDIA?: MediaItem[];
  }
}

/** Videos registered in public/media.js (editable after the build, no rebuild needed). */
export function mediaFor(subject: SubjectId): MediaItem[] {
  return (window.BTC_MEDIA ?? []).filter((m) => m && m.subject === subject && typeof m.file === "string");
}
