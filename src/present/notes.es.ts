import { isPresenterWindow } from "./stops";

// Private Spanish speaker notes live in public/notes.es.js, outside the app
// bundle. Only the presenter window injects that script, so the audience
// window never downloads the notes, let alone renders them.

export type Notes = Record<string, string[] | undefined>;

declare global {
  interface Window {
    BTC_NOTES?: Notes;
  }
}

export function loadNotes(): Promise<Notes> {
  if (!isPresenterWindow()) return Promise.reject(new Error("Speaker notes can only load in the presenter window."));
  if (window.BTC_NOTES) return Promise.resolve(window.BTC_NOTES);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "./notes.es.js"; // classic script: works from file:// too
    s.onload = () => resolve(window.BTC_NOTES ?? {});
    s.onerror = () => reject(new Error("notes.es.js not found next to index.html"));
    document.head.appendChild(s);
  });
}
