import { identity } from "../content/program";
import { Internal } from "./Internal";
import { Reflection } from "./Reflection";
import bellPath from "../assets/canada/bell-park-path.webp";
import bellTrees from "../assets/canada/bell-park-trees.webp";
import bellBoardwalk from "../assets/canada/bell-park-boardwalk.webp";
import bellLake from "../assets/canada/bell-park-lake.webp";
import tunnel from "../assets/canada/outing-tunnel.webp";
import farmHoney from "../assets/canada/farm-honey.webp";
import farmTrail from "../assets/canada/farm-trail.webp";
import farmBottles from "../assets/canada/farm-bottles.webp";
import wonderland from "../assets/canada/wonderland.webp";
import bracelets from "../assets/canada/bracelets.webp";

type Shot = { src: string; alt: string; caption: string; area: string };

// My own photos from outside class. Photos where classmates' faces show are left out on purpose.
const outings: { place: string; note: string; shots: Shot[] }[] = [
  {
    place: "Bell Park",
    note: "Autumn on the boardwalk by the lake.",
    shots: [
      { src: bellBoardwalk, alt: "Classmates seen from behind, walking on a wooden boardwalk over a lake, with red and orange trees on the far shore.", caption: "The boardwalk over the lake", area: "md:col-span-3" },
      { src: bellLake, alt: "A wooden boardwalk with a metal railing next to dark rock, under a grey sky, with autumn trees across the water.", caption: "Rock, water and autumn colours", area: "md:col-span-3" },
      { src: bellPath, alt: "A brick path covered in yellow leaves, next to a fence and tall autumn trees.", caption: "A path covered in leaves", area: "md:col-span-3" },
      { src: bellTrees, alt: "Classmates seen from behind on a wooden path under yellow and orange trees.", caption: "Walking under the trees", area: "md:col-span-3" },
    ],
  },
  {
    place: "Maple Hill Farms",
    note: "A sunny day at the farm.",
    shots: [
      { src: farmTrail, alt: "Two classmates seen from behind on a gravel trail through bare trees, under a bright blue sky with thin clouds.", caption: "The trail, under a blue sky", area: "md:col-span-4" },
      { src: farmHoney, alt: "A golden, sticky treat on a wooden stick, held up against grass and fallen leaves.", caption: "A golden treat on a stick", area: "md:col-span-4" },
      { src: farmBottles, alt: "Bottles of different sizes on a black table, with dried flowers and steel equipment behind them.", caption: "Bottles from the farm", area: "md:col-span-4" },
    ],
  },
  {
    place: "More moments",
    note: "",
    shots: [
      { src: wonderland, alt: "An artificial mountain with a waterfall falling into a turquoise pool, under a clear blue sky.", caption: "Canada's Wonderland", area: "md:col-span-4" },
      { src: tunnel, alt: "A rock tunnel lit in red and orange, with a glass-walled walkway lit in blue running through it.", caption: "A lit tunnel on one of our outings", area: "md:col-span-4" },
      { src: bracelets, alt: "A table with a purple cloth, covered in boxes of colourful beads, threads and scissors.", caption: "Making bracelets", area: "md:col-span-4" },
    ],
  },
];

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

      <div className="shell mt-24 border-t border-rule pt-12">
        <h3 className="heading text-3xl md:text-4xl">Outside the classroom</h3>
        <p className="mt-3 max-w-measure text-ivory/80">My own photos from the weeks in Canada. I left out the ones where my classmates' faces show.</p>
        {outings.map((o) => (
          <div key={o.place} className="mt-14">
            <h4 className="heading text-xl">{o.place}</h4>
            {o.note && <p className="mt-1 text-sm text-mist">{o.note}</p>}
            <div className="mt-6 grid gap-x-6 gap-y-10 md:grid-cols-12">
              {o.shots.map((s) => (
                <figure key={s.src} className={s.area}>
                  <div className="overflow-hidden rounded-evidence bg-graphite">
                    <img src={s.src} alt={s.alt} loading="lazy" className="aspect-[3/4] w-full object-cover" />
                  </div>
                  <figcaption className="mt-3 text-[15px]">
                    {s.caption}
                    <span className="mt-1 flex items-center gap-2 text-sm text-mist">
                      <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                      My photo
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
