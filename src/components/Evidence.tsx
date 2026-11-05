import drawing from "../assets/evidence/drawing-pose.webp";
import thumbnails from "../assets/evidence/thumbnails.webp";
import walkRig from "../assets/evidence/harmony-walk-rig.webp";
import arduino from "../assets/evidence/arduino-desk.webp";
import cipherNotes from "../assets/notebook/cipher.webp";
import database from "../assets/evidence/database-sqlite.webp";
import basket from "../assets/evidence/business-prize-basket.webp";
import lifeDrawing1 from "../assets/evidence/life-drawing-1.webp";
import lifeDrawing2 from "../assets/evidence/life-drawing-2.webp";
import blender from "../assets/evidence/blender-model.webp";
import hockey from "../assets/evidence/hockey-game.webp";
import pumpkin from "../assets/evidence/pumpkin-workshop.webp";

type Piece = { src: string; alt: string; caption: string; subject: string; area: string; fit?: "contain"; mine?: boolean };

// Every piece here is the student's own drawing or photo. Layout areas vary by piece so the
// strip reads like a contact sheet, not a grid of identical cards.
const pieces: Piece[] = [
  { src: drawing, alt: "Purple digital sketch of a figure in a dynamic pose, built from circles and boxes.", caption: "Pose study, built from simple shapes", subject: "Drawing", area: "md:col-span-4 md:row-span-2", fit: "contain" },
  { src: walkRig, alt: "Harmony on a drawing tablet, showing a green rigged character mid-step on a 60-frame timeline.", caption: "Walk cycle practice on a rigged character", subject: "Animation in Harmony", area: "md:col-span-5" },
  { src: thumbnails, alt: "Five small thumbnail sketches on sticky notes, each divided by composition lines.", caption: "Thumbnail sketches on sticky notes", subject: "Drawing", area: "md:col-span-3 md:row-span-2" },
  { src: arduino, alt: "An Arduino UNO with a red LED lit, a breadboard, an ultrasonic sensor and jumper wires on a white table.", caption: "An Arduino UNO, LED and ultrasonic sensor, in my photo from the workshop", subject: "Arduino and Micro:bits", area: "md:col-span-5" },
];

// Weeks 3 and 4. The photos carry no date, so the week comes from the program schedule.
const later: Piece[] = [
  { src: database, alt: "My laptop screen in DB Browser for SQLite: SELECT queries on Movie and Category tables, with a JOIN, and three results: Ice Age, Toy Story and Spirit.", caption: "My database, Categoria.db: tables, SQL and a JOIN query", subject: "Database Bootcamp", area: "md:col-span-7", mine: true },
  { src: basket, alt: "A wrapped gift basket on a table.", caption: "The basket our team won with our business idea", subject: "Entrepreneurship workshop", area: "md:col-span-5" },
  { src: lifeDrawing1, alt: "Quick pencil gesture sketches of a seated figure on paper clipped to a board.", caption: "Gesture sketches from life drawing", subject: "Drawing", area: "md:col-span-4", mine: true },
  { src: lifeDrawing2, alt: "Several quick pencil gesture sketches of standing and bending figures on paper.", caption: "More gesture sketches from the same session", subject: "Drawing", area: "md:col-span-4", mine: true },
  { src: pumpkin, alt: "A carved pumpkin with a glowing face on a table.", caption: "“Build a pumpkin that bites back”: we programmed LED lights, and a sensor that made a sound when someone came close", subject: "Program event", area: "md:col-span-4" },
  { src: blender, alt: "Blender on a tablet screen: a 3D model of a four-legged object next to a wood texture.", caption: "A 3D model in Blender, Nov 3", subject: "3D Animation in Blender", area: "md:col-span-6" },
  { src: hockey, alt: "An ice hockey game seen from the stands of an indoor arena.", caption: "Sudbury Wolves hockey game", subject: "Program event", area: "md:col-span-6" },
];

export function Evidence() {
  return (
    <section id="evidence" tabIndex={-1} className="relative border-t border-rule py-24 outline-none md:py-32" aria-labelledby="evidence-title">
      <div className="shell">
        <div className="grid gap-8 md:grid-cols-12">
          <h2 id="evidence-title" className="heading text-3xl md:col-span-6 md:text-4xl">From my desk</h2>
          <p className="max-w-measure text-ivory/80 md:col-span-5 md:col-start-8">
            Photos and files from the workshops, as I made them. Nothing here is staged or recreated.
          </p>
        </div>

        <div className="mt-14 grid gap-x-6 gap-y-10 md:grid-cols-12 md:grid-rows-[auto_auto]">
          {pieces.map((p) => (
            <figure key={p.src} className={p.area}>
              <div className={`overflow-hidden rounded-evidence ${p.fit === "contain" ? "bg-ivory" : "bg-graphite"}`}>
                <img src={p.src} alt={p.alt} loading="lazy" className={`w-full ${p.fit === "contain" ? "max-h-[640px] object-contain p-4" : "aspect-[16/10] object-cover"}`} />
              </div>
              <figcaption className="mt-3 text-[15px]">
                {p.caption}
                <span className="mt-1 flex items-center gap-2 text-sm text-mist">
                  <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                  {p.subject === "Drawing" || p.mine ? "My work" : "My photo"} · {p.subject}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <h3 className="heading mt-20 border-t border-rule pt-10 text-2xl">Weeks 3 and 4</h3>
        <p className="mt-2 text-sm text-mist">These photos have no date stamp; the week comes from the program schedule.</p>
        <div className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-12">
          {later.map((p) => (
            <figure key={p.src} className={p.area}>
              <div className="overflow-hidden rounded-evidence bg-graphite">
                <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
              </div>
              <figcaption className="mt-3 text-[15px]">
                {p.caption}
                <span className="mt-1 flex items-center gap-2 text-sm text-mist">
                  <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
                  {p.mine ? "My work" : "My photo"} · {p.subject}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <figure className="mt-16 grid items-center gap-8 border-t border-rule pt-10 md:grid-cols-12">
          <img src={cipherNotes} alt="My handwritten notebook page on the Caesar cipher, its weakness, and the Vigenère cipher." loading="lazy" className="w-full max-w-[360px] -rotate-1 rounded-evidence md:col-span-4" />
          <figcaption className="md:col-span-6 md:col-start-6">
            <p className="font-display text-2xl font-light leading-tight tracking-tight md:text-3xl">
              “Weakness: about 400 septillion possible keys, but letter frequencies (E is the most common) still give it…”
            </p>
            <p className="mt-4 flex items-center gap-2 text-sm text-mist">
              <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
              My notes · Micro:bits cryptography, week 2
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
