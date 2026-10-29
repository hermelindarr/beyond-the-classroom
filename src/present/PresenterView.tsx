import { useEffect, useState } from "react";
import { loadNotes, type Notes } from "./notes.es";
import type { PresenterMessage } from "./stops";

type Current = Extract<PresenterMessage, { type: "btc:stop" }>;
const mmss = (sec: number) => `${sec < 0 ? "-" : ""}${Math.floor(Math.abs(sec) / 60)}:${String(Math.round(Math.abs(sec) % 60)).padStart(2, "0")}`;

/** The private window: Spanish notes, the English narration to read, timing. */
export default function PresenterView() {
  const [notes, setNotes] = useState<Notes>({});
  const [notesError, setNotesError] = useState("");
  const [current, setCurrent] = useState<Current | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(Date.now());
  const opener = window.opener as Window | null;

  useEffect(() => {
    document.title = "Notas del presentador";
    loadNotes().then(setNotes, (e: Error) => setNotesError(e.message));
    const onMessage = (e: MessageEvent<PresenterMessage>) => {
      if (e.source === opener && e.data?.type === "btc:stop") setCurrent(e.data);
    };
    window.addEventListener("message", onMessage);
    opener?.postMessage({ type: "btc:ready" } satisfies PresenterMessage, "*");
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(t);
    };
  }, [opener]);

  const go = (delta: 1 | -1) => opener?.postMessage({ type: "btc:go", delta } satisfies PresenterMessage, "*");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") go(1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const elapsed = Math.floor((now - startedAt) / 1000);
  const drift = current ? elapsed - current.plannedSoFar : 0; // positive: behind plan

  return (
    <main lang="es" className="min-h-screen bg-graphite p-8 text-ivory">
      <div className="flex flex-wrap items-baseline justify-between gap-4 text-sm text-mist">
        <span>{current ? `Parada ${current.index + 1} de ${current.total} · ${current.chapter}` : "Esperando al portafolio… presiona P para empezar"} · solo tú ves esta ventana</span>
        <span className="flex items-baseline gap-4">
          {current && (
            <span className={drift > 20 ? "text-amber" : "text-teal-soft"}>
              {drift > 20 ? `vas ${mmss(drift)} atrasada` : "a tiempo"} · plan {mmss(current.plannedTotal)}
            </span>
          )}
          <span className="font-display text-2xl text-ivory">{mmss(elapsed)}</span>
        </span>
      </div>
      {current && (
        <>
          <h1 className="heading mt-8 text-4xl">{current.title}</h1>
          <p className="mt-1 text-sm text-mist">Tiempo sugerido para esta parada: {current.seconds} s</p>
          {current.narration && (
            <section className="mt-6 rounded-evidence border border-teal/50 p-5">
              <p className="text-sm text-teal-soft">Texto en inglés para leer (también aparece en pantalla)</p>
              <p lang="en" className="mt-2 text-2xl leading-snug">{current.narration}</p>
            </section>
          )}
          <ul className="mt-6 max-w-[70ch] space-y-3 text-xl leading-relaxed">
            {(notes[current.id] ?? ["(Sin notas para esta parada.)"]).map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </>
      )}
      {notesError && <p className="mt-6 text-amber">No se pudieron cargar las notas: {notesError}</p>}
      <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-rule pt-6">
        <button type="button" className="btn" onClick={() => go(-1)}>Anterior</button>
        <button type="button" className="btn" onClick={() => go(1)}>Siguiente</button>
        {current?.next && <span className="text-mist">Después: {current.next}</span>}
      </div>
      <p className="mt-6 text-sm text-mist">Teclas en la ventana del proyector: S salta la demostración · R regresa a la parada · C oculta o muestra el texto · Esc termina.</p>
    </main>
  );
}
