import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToElement } from "../lib/motion";
import { href, queueSection, type Route } from "../lib/router";
import { PRESENTER_HASH, PRESENTER_NAME, type PresenterMessage } from "./stops";
import { routes, totalSeconds, type RouteKind } from "./routes";

const SAVE_KEY = "btc-presentation";
type Saved = { kind: RouteKind; index: number };

function load(): Saved | null {
  try {
    const s = JSON.parse(sessionStorage.getItem(SAVE_KEY) ?? "null");
    return s && routes[s.kind as RouteKind] ? s : null;
  } catch {
    return null;
  }
}
function save(s: Saved | null) {
  try {
    if (s) sessionStorage.setItem(SAVE_KEY, JSON.stringify(s));
    else sessionStorage.removeItem(SAVE_KEY);
  } catch {
    /* progress just isn't remembered */
  }
}

/**
 * Audience-side guided presentation across all pages.
 * Keys: P choose/start · → ↓ Space PageDown next · ← ↑ PageUp back ·
 * S skip the rest of this subject · R return to the current stop ·
 * C captions on/off · N private notes window · Esc exit.
 * This window never loads or renders speaker notes.
 */
export function usePresentation(enabled: boolean, currentRoute: Route) {
  const [kind, setKind] = useState<RouteKind | null>(null);
  const [index, setIndex] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [chooser, setChooser] = useState(false);
  const [resumable, setResumable] = useState<Saved | null>(() => load());
  const [notesBlocked, setNotesBlocked] = useState(false);
  const notesWin = useRef<Window | null>(null);

  const stops = kind ? routes[kind] : [];
  const stop = stops[index];

  const show = useCallback((k: RouteKind, i: number) => {
    const list = routes[k];
    const next = Math.max(0, Math.min(list.length - 1, i));
    const s = list[next];
    setIndex(next);
    save({ kind: k, index: next });
    if (location.hash.replace(/^#\/?/, "") !== (s.route === "home" ? "" : s.route)) {
      // Another page: it opens and scrolls to the section (see App).
      queueSection(s.id);
      location.hash = href(s.route);
    } else {
      const el = document.getElementById(s.id);
      if (el) {
        scrollToElement(el);
        // Focus follows the stop, so arrow keys never stay trapped inside a widget.
        el.focus({ preventScroll: true });
      }
    }
  }, []);

  const start = useCallback((k: RouteKind, from = 0) => {
    setChooser(false);
    setKind(k);
    setResumable(null);
    document.documentElement.setAttribute("data-presenting", "");
    document.documentElement.requestFullscreen?.().catch(() => {});
    show(k, from);
  }, [show]);

  const stop_ = useCallback(() => {
    setKind(null);
    setChooser(false);
    save(null);
    document.documentElement.removeAttribute("data-presenting");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const go = useCallback((delta: number) => kind && show(kind, index + delta), [kind, index, show]);
  /** Skip the rest of the current subject (shortens demos). */
  const skipChapter = useCallback(() => {
    if (!kind) return;
    const list = routes[kind];
    const next = list.findIndex((s, i) => i > index && s.chapter !== list[index].chapter);
    show(kind, next < 0 ? list.length - 1 : next);
  }, [kind, index, show]);
  /** Back to the current stop after exploring elsewhere: progress is kept. */
  const returnToStop = useCallback(() => kind && show(kind, index), [kind, index, show]);
  const away = !!stop && stop.route !== currentRoute;

  const openNotes = useCallback(() => {
    const before = location.href;
    const url = before.split("#")[0] + PRESENTER_HASH;
    const win = window.open(url, PRESENTER_NAME, "popup,width=980,height=760");
    // Some browsers reuse the current tab when pop-ups are blocked: undo that.
    if (!win || win === window) {
      if (location.href !== before) history.replaceState(null, "", before);
      notesWin.current = null;
      setNotesBlocked(true);
      return;
    }
    notesWin.current = win;
    setNotesBlocked(false);
  }, []);

  const send = useCallback(() => {
    const w = notesWin.current;
    if (!w || w.closed || !stop) return;
    const msg: PresenterMessage = {
      type: "btc:stop", index, total: stops.length, id: stop.id, title: stop.title, next: stops[index + 1]?.title,
      chapter: stop.chapter, narration: stop.narration, seconds: stop.seconds, route: stop.route,
      plannedSoFar: totalSeconds(stops.slice(0, index)), plannedTotal: totalSeconds(stops),
    };
    w.postMessage(msg, "*");
  }, [index, stop, stops]);
  useEffect(send, [send]);

  useEffect(() => {
    const onMessage = (e: MessageEvent<PresenterMessage>) => {
      if (!notesWin.current || e.source !== notesWin.current) return;
      if (e.data?.type === "btc:ready") send();
      if (e.data?.type === "btc:go") go(e.data.delta);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [go, send]);

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const key = e.key.toLowerCase();
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Presentation clickers send PageUp / PageDown: those always move between stops.
      if (kind && (key === "pagedown" || key === "pageup")) {
        e.preventDefault();
        return go(key === "pagedown" ? 1 : -1);
      }
      if (chooser && key === "escape") return setChooser(false);
      // Interactive widgets (the game, sliders, demos) keep their own keys.
      if (target.closest("input, textarea, select, [contenteditable], [data-keys-local], [role=dialog]")) return;
      if (key === "p") return kind ? stop_() : setChooser(true);
      if (key === "n") return openNotes();
      if (!kind) return;
      if (["arrowright", "arrowdown", " "].includes(key)) { e.preventDefault(); go(1); }
      else if (["arrowleft", "arrowup"].includes(key)) { e.preventDefault(); go(-1); }
      else if (key === "s") skipChapter();
      else if (key === "r") returnToStop();
      else if (key === "c") setCaptions((c) => !c);
      else if (key === "escape") stop_();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, kind, chooser, go, stop_, skipChapter, returnToStop, openNotes]);

  return {
    presenting: !!kind, kind, index, stops, current: stop, captions, away, chooser, resumable, notesBlocked,
    openChooser: () => setChooser(true), closeChooser: () => setChooser(false),
    start, exit: stop_, go, skipChapter, returnToStop, toggleCaptions: () => setCaptions((c) => !c), openNotes,
    dismissNotesBlocked: () => setNotesBlocked(false),
  };
}
