import { useCallback, useEffect, useState } from "react";
import { Intro } from "./intro/Intro";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { GameDesignPage } from "./pages/GameDesignPage";
import { AnimationPage } from "./pages/AnimationPage";
import { DrawingPage } from "./pages/DrawingPage";
import { AiAgentsPage } from "./pages/AiAgentsPage";
import { NetworkingPage } from "./pages/NetworkingPage";
import { ArduinoPage } from "./pages/ArduinoPage";
import { ItbaPage } from "./pages/ItbaPage";
import type { CaseRoute } from "./lib/router";

const titles: Record<CaseRoute, string> = {
  "game-design": "StarFall — Game Design",
  animation: "Animation — Harmony and Blender",
  drawing: "Drawing and Character Development",
  "ai-agents": "AI Agents and Generative AI",
  networking: "Networking and Cybersecurity",
  arduino: "Arduino and Micro:bits",
  itba: "IT Business Analysis",
};

const casePages: Record<CaseRoute, () => JSX.Element> = {
  "game-design": GameDesignPage,
  animation: AnimationPage,
  drawing: DrawingPage,
  "ai-agents": AiAgentsPage,
  networking: NetworkingPage,
  arduino: ArduinoPage,
  itba: ItbaPage,
};

function CasePage({ route }: { route: CaseRoute }) {
  const Page = casePages[route];
  return <Page />;
}
import { hasWebGL, prefersReducedMotion, store, REVIEW } from "./lib/env";
import { ScrollTrigger, scrollToElement, startSmoothScroll } from "./lib/motion";
import { takePendingSection, useRoute } from "./lib/router";
import { usePresentation } from "./present/usePresentation";
import { stopsFor } from "./present/stops";
import { PresentChooser, PresentationHud } from "./present/PresentationUI";

const SEEN_KEY = "btc-intro-seen";
const introPossible = () => hasWebGL() && !prefersReducedMotion();

export default function App() {
  const route = useRoute();
  // The intro plays on the first visit to the homepage only; ?intro forces it, ?nointro skips it.
  const [intro, setIntro] = useState(() => {
    const q = new URLSearchParams(location.search);
    if (route !== "home" || q.has("nointro") || !introPossible()) return false;
    return store.get(SEEN_KEY) !== "1" || q.has("intro");
  });
  const stops = stopsFor(route);
  const presentation = usePresentation(!intro, route);
  const { presenting, notesBlocked, dismissNotesBlocked } = presentation;

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  // On every page change: start at the top (or at a requested section) and move focus for screen readers.
  useEffect(() => {
    const pending = takePendingSection();
    window.scrollTo(0, 0);
    const timers: number[] = [];
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const target = document.getElementById(pending ?? stops[0].id);
      target?.focus({ preventScroll: true });
      if (!pending || !target) return;
      // Images above the target load lazily and push it down: re-align a few times.
      [0, 250, 700, 1400].forEach((ms) => timers.push(window.setTimeout(() => scrollToElement(target, true), ms)));
    });
    document.title = route === "home" ? "Beyond the Classroom — My Canadian Tech Journey" : `${titles[route]} · Beyond the Classroom`;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [route, stops]);

  const endIntro = useCallback(() => {
    store.set(SEEN_KEY, "1");
    setIntro(false);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <a href={`#${stops[1]?.id ?? ""}`} onClick={(e) => { e.preventDefault(); const el = document.getElementById(stops[1].id); if (el) { scrollToElement(el); el.focus({ preventScroll: true }); } }} className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-ivory focus:px-4 focus:py-2 focus:text-navy">
        Skip to content
      </a>
      <div className="ruling" aria-hidden="true" />
      <Header route={route} onPresent={presentation.openChooser} />
      <main key={route} className="relative z-10" aria-hidden={intro || undefined}>
        {route === "home" ? <HomePage introDone={!intro} /> : <CasePage route={route} />}
      </main>
      <Footer onReplay={() => setIntro(true)} canReplay={route === "home" && introPossible()} />
      {intro && <Intro onDone={endIntro} />}

      <PresentationHud p={presentation} />
      {presentation.chooser && <PresentChooser p={presentation} />}
      {notesBlocked && (
        <div role="alert" className="fixed bottom-16 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-amber/60 bg-navy px-5 py-2 text-sm text-ivory">
          The notes window was blocked. Allow pop-ups for this page, then press N again.
          <button type="button" className="text-mist underline" onClick={dismissNotesBlocked}>Dismiss</button>
        </div>
      )}
      {REVIEW && !presenting && (
        <p className="fixed bottom-5 left-5 z-40 rounded-full border border-dashed border-amber/70 bg-navy/90 px-3 py-1 text-xs text-amber">
          Review mode · internal notes visible
        </p>
      )}
    </>
  );
}
