import { useEffect, useState } from "react";
import { scrollToElement } from "../lib/motion";
import { goHome, href, type Route } from "../lib/router";

const homeLinks = [
  ["journey", "Journey"],
  ["reflections", "In my words"],
  ["workshops", "Workshops"],
  ["starfall", "StarFall"],
  ["sudbury", "Sudbury"],
] as const;

export function Header({ route, onPresent }: { route: Route; onPresent: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the homepage, links scroll to a section; elsewhere they return home first.
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (route !== "home") return goHome(id);
    const el = document.getElementById(id);
    if (!el) return;
    scrollToElement(el);
    el.focus({ preventScroll: true });
  };

  return (
    <header className={`site-header fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${scrolled ? "bg-navy/85 backdrop-blur-md" : ""}`}>
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href={href("home")} onClick={route === "home" ? go("top") : undefined} className="font-display text-[17px] font-semibold tracking-tight">
          Beyond the Classroom
        </a>
        <nav aria-label="Sections" className="hidden items-center gap-8 text-sm text-mist md:flex">
          {homeLinks.map(([id, label]) => (
            <a key={id} href={`${href("home")}`} onClick={go(id)} className="transition-colors hover:text-ivory">
              {label}
            </a>
          ))}
        </nav>
        <button type="button" onClick={onPresent} className="btn hidden sm:inline-flex" aria-keyshortcuts="P">
          Present
          <kbd className="font-body text-mist">P</kbd>
        </button>
      </div>
    </header>
  );
}
