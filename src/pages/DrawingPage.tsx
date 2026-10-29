import { useState } from "react";
import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { LayerViewer } from "./drawing/LayerViewer";
import { Counterbalance, ShapeLanguage } from "./drawing/ClassIdeas";
import pose from "../assets/evidence/drawing-pose.webp";
import thumbnails from "../assets/evidence/thumbnails.webp";
import screenA from "../assets/evidence/photoshop-screen-a.webp";
import screenB from "../assets/evidence/photoshop-screen-b.webp";

// Where the class's construction ideas are visible in my pose study (percent of the image).
const construction = [
  { x: 62, y: 43, text: "A sphere for the head, with centre lines" },
  { x: 56, y: 53, text: "Ellipses mark the shoulder joint" },
  { x: 68, y: 60, text: "A box for the ribcage, drawn in perspective" },
  { x: 86, y: 69, text: "Ellipses at the knees" },
  { x: 72, y: 88, text: "Cylinders for the lower leg and foot" },
];

function PoseStudy() {
  const [show, setShow] = useState(true);
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <figure className="md:col-span-6">
        <div className="relative overflow-hidden rounded-evidence bg-ivory">
          <img src={pose} alt="My digital pose study in purple line: a figure built from a sphere, boxes, cylinders and joint ellipses, in a twisting pose." className="w-full" />
          {construction.map((c, i) => (
            <span
              key={i}
              className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy font-display text-sm text-teal-soft ring-2 ring-teal transition-opacity duration-300"
              style={{ left: `${c.x}%`, top: `${c.y}%`, opacity: show ? 1 : 0 }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
          ))}
        </div>
        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <Provenance tone="student">My pose study, exported from Photoshop</Provenance>
          <button type="button" className={`btn ${show ? "border-teal/70 bg-teal/10" : "text-mist"}`} aria-pressed={show} onClick={() => setShow(!show)}>
            Construction notes
          </button>
        </figcaption>
      </figure>
      <div className="md:col-span-5 md:col-start-8">
        <ol className="divide-y divide-rule border-y border-rule">
          {construction.map((c, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] py-3 text-[15px] text-ivory/85">
              <span className="font-display text-teal-soft">{i + 1}</span>
              {c.text}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-mist">Numbers added for this portfolio; the drawing itself is unchanged.</p>
        <div className="mt-10 grid grid-cols-2 gap-4">
          <figure>
            <img src={screenA} alt="Photoshop on a monitor: the same canvas with several overlapping pose sketches and seven layers." loading="lazy" className="w-full rounded-evidence" />
            <figcaption className="mt-2 text-sm text-mist">On screen: overlapping sketches on seven layers</figcaption>
          </figure>
          <figure>
            <img src={screenB} alt="A closer photo of the pose study on the Photoshop canvas." loading="lazy" className="w-full rounded-evidence" />
            <figcaption className="mt-2 text-sm text-mist">A closer look at the pose</figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}

export function DrawingPage() {
  return (
    <>
      <section id="dr-top" tabIndex={-1} className="relative overflow-hidden pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="dr-title">
        <div className="shell grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <Breadcrumb current="Drawing" />
            <h1 id="dr-title" className="display mt-10 text-[clamp(60px,11vw,168px)]">Drawing</h1>
            <p className="mt-4 font-display text-2xl font-light tracking-tight text-ivory/80 md:text-3xl">and Character Development</p>
            <p className="mt-10 max-w-measure text-lg text-ivory/85">
              Before any animation, a character has to be designed and posed. These are my sketches from the drawing
              workshops, with every layer and step kept.
            </p>
          </div>
          <figure className="md:col-span-4 md:col-start-9">
            <img src={thumbnails} alt="Five small thumbnail sketches on sticky notes, each divided by composition lines." className="w-full rotate-1 rounded-evidence" />
            <figcaption className="mt-3"><Provenance tone="student">My thumbnails on sticky notes</Provenance></figcaption>
          </figure>
        </div>
        <div className="shell mt-14">
          <Facts items={[["Workshops", "Character posing · Life drawing"], ["Tools", "Photoshop, paper"], ["Schedule", "Oct 21, Oct 29, Nov 5"], ["Pieces", "Sketch sheet, pose study, thumbnails"]]} />
          <Internal></Internal>
        </div>
      </section>

      <Section id="dr-sheet" title="A character sheet in two passes" intro={<p>My Photoshop file keeps each round of sketching on its own layer. Turn them on and off to see how the page was built.</p>}>
        <LayerViewer />
      </Section>

      <Section id="dr-pose" title="A pose built from shapes" intro={<p>The posing class taught us to start with simple 3D shapes and add the details later. Here is where those shapes are in my pose.</p>}>
        <PoseStudy />
      </Section>

      <Section
        id="dr-ideas"
        title="What the class taught"
        tone="class"
        intro={
          <>
            <Provenance tone="class">Class material</Provenance>
            <p className="mt-3">Two ideas from the slides, as small experiments. The slides and their examples belong to the instructor.</p>
          </>
        }
      >
        <div className="grid gap-14 md:grid-cols-2 md:gap-8">
          <div>
            <h3 className="heading text-2xl">Shape language</h3>
            <p className="mt-2 max-w-measure text-ivory/75">The base shape of a character tells the audience who it is before they know anything else.</p>
            <div className="mt-6"><ShapeLanguage /></div>
          </div>
          <div>
            <h3 className="heading text-2xl">Counterbalance</h3>
            <p className="mt-2 max-w-measure text-ivory/75">Weight, balance and tilt make a pose look alive.</p>
            <div className="mt-6"><Counterbalance /></div>
          </div>
        </div>
        <p className="mt-8 text-sm text-mist">Sources: class slides “Character Design and Development” and “Character Posing!”.</p>
        <div className="mt-16 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6"><Reflection topic="drawing" label="drawing" /></div>
          <div className="md:col-span-6"><Internal block></Internal></div>
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
