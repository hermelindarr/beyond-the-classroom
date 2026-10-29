import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { VideoPlayer } from "../components/VideoPlayer";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { mediaFor } from "../lib/media";
import { KeyframeLab } from "./animation/KeyframeLab";
import { RigLab } from "./animation/RigLab";
import { ShortcutMap } from "./animation/ShortcutMap";
import keyframesPhoto from "../assets/evidence/harmony-keyframes.webp";
import walkRigPhoto from "../assets/evidence/harmony-walk-rig.webp";
import blenderNotes from "../assets/notebook/blender.webp";

// What I can read on my own photos, pinned to where it appears (percentages).
const keyframeNotes = [
  { x: 40, y: 50, text: "A simple drawing on its own layer" },
  { x: 27, y: 80, text: "Translate: the Transform tool moves it" },
  { x: 74, y: 84, text: "Frame 7, at 24 frames per second" },
  { x: 48, y: 93, text: "A keyframe on frame 60" },
];
const rigNotes = [
  { x: 48, y: 40, text: "A character rig: body parts joined at pivots" },
  { x: 54, y: 78, text: "60 frames at 24 fps: 2.5 seconds of walk" },
  { x: 86, y: 63, text: "The node view shows how the parts connect" },
];

function AnnotatedPhoto({ src, alt, notes, caption }: { src: string; alt: string; notes: { x: number; y: number; text: string }[]; caption: string }) {
  return (
    <figure>
      <div className="relative overflow-hidden rounded-evidence">
        <img src={src} alt={alt} loading="lazy" className="w-full" />
        {notes.map((n, i) => (
          <span key={i} className="absolute grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-navy/85 font-display text-sm text-teal-soft ring-2 ring-teal" style={{ left: `${n.x}%`, top: `${n.y}%` }} aria-hidden="true">
            {i + 1}
          </span>
        ))}
      </div>
      <figcaption className="mt-4">
        <Provenance tone="student">{caption}</Provenance>
        <ol className="mt-3 space-y-1.5 text-[15px] text-ivory/85">
          {notes.map((n, i) => (
            <li key={i} className="grid grid-cols-[24px_1fr]"><span className="font-display text-teal-soft">{i + 1}</span>{n.text}</li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

export function AnimationPage() {
  const videos = [...mediaFor("harmony"), ...mediaFor("blender")];
  return (
    <>
      <section id="an-top" tabIndex={-1} className="relative pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="an-title">
        <div className="shell">
          <Breadcrumb current="Animation" />
          <h1 id="an-title" className="display mt-10 text-[clamp(64px,13vw,190px)]">Animation</h1>
          {/* A frame ruler: the page's own timeline motif. */}
          <div className="mt-6 overflow-hidden" aria-hidden="true">
            <div className="flex items-end gap-[3px]">
              {Array.from({ length: 60 }, (_, i) => i + 1).map((f) => (
                <span key={f} className={`w-full ${f === 7 ? "h-6 bg-teal" : f === 60 ? "h-6 bg-ivory" : f % 12 === 0 ? "h-4 bg-mist/70" : "h-2 bg-rule"}`} />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-mist"><span>1</span><span>24 fps</span><span>60</span></div>
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-8">
            <p className="max-w-measure text-lg text-ivory/85 md:col-span-5">
              Two workshops about bringing drawings to life: 2D animation and rigging in Toon Boom Harmony, and an
              introduction to 3D in Blender.
            </p>
            <div className="md:col-span-6 md:col-start-7">
              <Facts items={[["2D", "Harmony sessions from Oct 21"], ["3D", "Blender sessions from Oct 20"], ["Frame rate", "24 fps"], ["Next sessions", "Nov 3 and 4"]]} />
            </div>
          </div>
        </div>
      </section>

      <Section id="an-evidence" title="From my screen" intro={<p>Two photos I took in the Harmony workshop. The numbers point to what each one shows.</p>}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <AnnotatedPhoto src={keyframesPhoto} alt="Harmony camera view with a pink circle, the Translate tool and a timeline with a keyframe at frame 60." notes={keyframeNotes} caption="My first keyframes in Harmony" />
          </div>
          <div className="md:col-span-7">
            <AnnotatedPhoto src={walkRigPhoto} alt="Harmony on a drawing tablet: a green rigged character mid-step, a 60-frame timeline and the node view." notes={rigNotes} caption="My photo: walk cycle practice on a rigged character" />
            <Internal></Internal>
          </div>
        </div>
      </Section>

      <Section id="an-keys" title="Keyframes and timing" intro={<p>Recreate the exercise from my photo: drag the circle to set keys, then play it. Compare how Harmony fills the frames in between.</p>}>
        <KeyframeLab />
        <div className="mt-14 grid gap-6 border-l-2 border-violet pl-5 md:grid-cols-12">
          <div className="md:col-span-4">
            <Provenance tone="class">Class material · Harmony set-up sheet</Provenance>
            <p className="mt-3 text-ivory/85">Before animating, the class configured Harmony the same way on every computer.</p>
          </div>
          <ul className="grid gap-x-8 gap-y-2 text-[15px] text-ivory/80 sm:grid-cols-2 md:col-span-8">
            {["Save the scene automatically", "Separate position pegs by default", "Stop-motion keyframes by default", "Onion skin in original colours", "Double-click a node to open its editor", "Support overlay and underlay art"].map((s) => (
              <li key={s} className="border-t border-rule py-2">{s}</li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="an-rig" title="Rigs: FK and IK" intro={<p>A rig moves a character by its joints. My notes list the two ways to pose a chain of bones. Try both.</p>}>
        <RigLab />
      </Section>

      <Section id="an-keys-map" title="Harmony to Blender" intro={<p>Moving from 2D to 3D, the tools stay the same but the keys change. I wrote the map down so I would not mix them up.</p>}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7"><ShortcutMap /></div>
          <figure className="md:col-span-4 md:col-start-9">
            <img src={blenderNotes} alt="My notebook page titled Blender: Harmony and Blender shortcuts side by side, and FK and IK written out." loading="lazy" className="w-full -rotate-1 rounded-evidence" />
            <figcaption className="mt-3"><Provenance tone="student">My notes, Blender workshop</Provenance></figcaption>
          </figure>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            {videos.length ? (
              <div className="space-y-10">{videos.map((v) => <VideoPlayer key={v.id} item={v} />)}</div>
            ) : (
              <Internal block></Internal>
            )}
          </div>
          <div className="md:col-span-5">
            <Reflection topic="animation" label="animation" />
          </div>
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
