import { identity } from "../content/program";

/** How every piece in the portfolio is labelled. */
export function ProvenanceKey() {
  return (
    <ul className="grid gap-x-8 gap-y-2 text-sm text-mist sm:grid-cols-2 lg:grid-cols-4">
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />My work: my files, notes and photos</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet" aria-hidden="true" />Class material from the instructors</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rotate-45 border border-ivory/70" aria-hidden="true" />Interactive demonstration built for this portfolio</li>
      <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full border border-dashed border-mist" aria-hidden="true" />Upcoming: no evidence yet</li>
    </ul>
  );
}

export function Footer({ onReplay, canReplay }: { onReplay: () => void; canReplay: boolean }) {
  return (
    <footer className="site-footer relative border-t border-rule py-14 text-sm text-mist">
      <div className="shell space-y-10">
        <ProvenanceKey />
        <div className="flex flex-wrap items-start justify-between gap-8 border-t border-rule pt-8">
          <div className="max-w-measure space-y-2">
            <p className="text-ivory">{identity.student}, {identity.program}, 2026.</p>
            <p>Class materials belong to their instructors and are credited where shown. Northstar Services Group is a fictional classroom case.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {canReplay && <button type="button" className="btn" onClick={onReplay}>Replay intro</button>}
          </div>
        </div>
      </div>
    </footer>
  );
}
