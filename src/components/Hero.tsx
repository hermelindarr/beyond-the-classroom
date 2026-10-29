import { useLayoutEffect, useRef } from "react";
import { identity } from "../content/program";
import { gsap } from "../lib/motion";
import { prefersReducedMotion } from "../lib/env";
import { Internal } from "./Internal";
import padletCard from "../assets/evidence/padlet-card.webp";

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);

  // The page's one orchestrated entrance, after the intro hands over.
  useLayoutEffect(() => {
    if (!ready || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power4.out" } })
        .from("[data-line]", { yPercent: 105, duration: 1.1, stagger: 0.12 })
        .from("[data-after]", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, 0.5);
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" ref={root} tabIndex={-1} className="relative pb-24 pt-28 outline-none md:pb-32 md:pt-36" aria-labelledby="hero-title">
      <div className="shell">
        <p data-after className="mb-10 flex flex-wrap justify-between gap-x-8 gap-y-1 text-sm text-mist md:mb-14">
          <span>An academic exchange portfolio, autumn 2026</span>
          <span>{identity.coordinates}</span>
        </p>

        <h1 id="hero-title" className="display text-[clamp(64px,12.5vw,184px)]">
          <span className="block overflow-hidden pb-[0.06em]"><span data-line className="block">Beyond the</span></span>
          <span className="block overflow-hidden pb-[0.06em]"><span data-line className="block">Classroom</span></span>
        </h1>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5" data-after>
            <p className="font-display text-2xl font-light tracking-tight text-ivory/90 md:text-3xl">My Canadian Tech Journey</p>
            <p className="mt-6 max-w-measure text-lg text-ivory/80">
              I'm {identity.student}, an {identity.studies} student from {identity.from}. For four weeks I studied at{" "}
              {identity.host} in {identity.city}, Ontario. This portfolio shows what I learned, through the work I made.
            </p>
            <Internal></Internal>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 self-end text-[15px] md:col-span-4 md:col-start-7 md:grid-cols-1" data-after>
            {[
              ["Host college", identity.host],
              ["Location", `${identity.city}, ${identity.region}`],
              ["Program", identity.program],
              ["Duration", identity.span],
            ].map(([k, v]) => (
              <div key={k} className="border-t border-rule pt-3">
                <dt className="text-sm text-mist">{k}</dt>
                <dd className="mt-1 font-display text-lg font-medium leading-snug tracking-tight">{v}</dd>
              </div>
            ))}
          </dl>

          <figure className="self-end md:col-span-2 md:col-start-11" data-after>
            <img src={padletCard} alt="My card on the class welcome board: a drawing of a cat, with the text 'I am study TI. My videogame favorite is Mortal Kombat'." className="w-40 -rotate-2 rounded-evidence shadow-[0_24px_40px_-18px_rgba(0,0,0,0.7)] md:w-full" />
            <figcaption className="mt-4 text-sm text-mist">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-teal align-middle" aria-hidden="true" />
              My first post on the class welcome board
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
