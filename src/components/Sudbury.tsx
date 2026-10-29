import { identity } from "../content/program";
import { Internal } from "./Internal";
import { Reflection } from "./Reflection";

// Equirectangular sketch of the trip, from real coordinates.
const QRO = { lat: 20.59, lon: -100.39 };
const SUD = { lat: 46.49, lon: -80.99 };
const box = { lat0: 14, lat1: 52, lon0: -108, lon1: -72, w: 360, h: 380 };
const px = (p: { lat: number; lon: number }) => ({
  x: ((p.lon - box.lon0) / (box.lon1 - box.lon0)) * box.w,
  y: ((box.lat1 - p.lat) / (box.lat1 - box.lat0)) * box.h,
});

/** Great-circle distance in km (haversine). */
function distanceKm(a: typeof QRO, b: typeof SUD) {
  const r = Math.PI / 180;
  const h = Math.sin(((b.lat - a.lat) * r) / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(((b.lon - a.lon) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function Sudbury() {
  const a = px(QRO);
  const b = px(SUD);
  const km = Math.round(distanceKm(QRO, SUD) / 10) * 10;
  const mid = { x: (a.x + b.x) / 2 + 70, y: (a.y + b.y) / 2 };

  return (
    <section id="sudbury" tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="sudbury-title">
      <div className="shell grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6">
          <h2 id="sudbury-title" className="display text-[clamp(52px,7.5vw,112px)]">Greater Sudbury, Ontario</h2>
          <p className="mt-8 max-w-measure text-lg text-ivory/85">
            {identity.host} is in {identity.city}, in Northern Ontario. It is about {km.toLocaleString("en-CA")} km from
            Querétaro in a straight line. For four weeks, it was my campus.
          </p>
          <div className="mt-10 grid gap-6 md:max-w-[520px]">
            <Reflection topic="final" label="the whole exchange (closing takeaways)" />
            <Internal block></Internal>
            <Internal block></Internal>
          </div>
        </div>

        <figure className="md:col-span-5 md:col-start-8">
          <svg viewBox={`0 0 ${box.w} ${box.h}`} className="w-full" role="img" aria-label={`Route from Querétaro, Mexico to Greater Sudbury, Canada: about ${km} kilometres.`}>
            {Array.from({ length: 7 }, (_, i) => (
              <line key={i} x1={0} x2={box.w} y1={(i * box.h) / 6} y2={(i * box.h) / 6} stroke="#2C3544" strokeWidth={1} />
            ))}
            <path d={`M${a.x},${a.y} Q${mid.x},${mid.y} ${b.x},${b.y}`} fill="none" stroke="#1FA7A5" strokeWidth={1.5} strokeDasharray="4 5" />
            <circle cx={a.x} cy={a.y} r={5} fill="#F1EEE8" />
            <circle cx={b.x} cy={b.y} r={7} fill="#1FA7A5" />
            <text x={a.x + 12} y={a.y + 5} fill="#F1EEE8" fontSize={15} fontFamily="Atkinson Hyperlegible">Querétaro</text>
            <text x={b.x - 12} y={b.y - 14} fill="#F1EEE8" fontSize={15} fontFamily="Atkinson Hyperlegible" textAnchor="end">Greater Sudbury</text>
          </svg>
          <figcaption className="mt-4 flex justify-between text-sm text-mist">
            <span>20.59° N, 100.39° W</span>
            <span>{identity.coordinates}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
