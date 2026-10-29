import { useEffect, useState } from "react";

// Hash routes work from file:// (no server rewrites). "#presenter" is not a
// route; it is reserved for the speaker notes window.
export const caseRoutes = ["game-design", "animation", "drawing", "ai-agents", "networking", "arduino", "itba"] as const;
export type CaseRoute = (typeof caseRoutes)[number];
export type Route = "home" | CaseRoute;

const parse = (hash: string): Route => caseRoutes.find((r) => hash.startsWith(`#/${r}`)) ?? "home";

export const href = (route: Route) => (route === "home" ? "#/" : `#/${route}`);

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parse(location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parse(location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

/** Go to the homepage, then (optionally) to one of its sections. */
export function goHome(sectionId?: string) {
  if (sectionId) sessionStorageSet("btc-scroll-to", sectionId);
  location.hash = "#/";
}

/** Ask the next page to scroll to one of its sections after it opens. */
export function queueSection(sectionId: string) {
  sessionStorageSet("btc-scroll-to", sectionId);
}

export function takePendingSection(): string | null {
  try {
    const id = sessionStorage.getItem("btc-scroll-to");
    sessionStorage.removeItem("btc-scroll-to");
    return id;
  } catch {
    return null;
  }
}

function sessionStorageSet(k: string, v: string) {
  try {
    sessionStorage.setItem(k, v);
  } catch {
    /* ignore */
  }
}
