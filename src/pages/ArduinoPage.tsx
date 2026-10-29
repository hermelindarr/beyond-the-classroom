import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { href, queueSection } from "../lib/router";
import { KitMap } from "./arduino/KitMap";
import { UltrasonicDemo } from "./arduino/UltrasonicDemo";
import { MicrobitLab } from "./arduino/MicrobitLab";
import tinkercadPhoto from "../assets/evidence/tinkercad-ultrasonic-demo.webp";
import microbitPhoto from "../assets/evidence/microbit-radio-demo.webp";

// A breadboard-style dot grid: this page's own visual motif.
const dots = { backgroundImage: "radial-gradient(rgba(241,238,232,0.16) 1px, transparent 1.4px)", backgroundSize: "18px 18px" };

function ClassPhoto({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure>
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-evidence" />
      <figcaption className="mt-3"><Provenance tone="class">{caption}</Provenance></figcaption>
    </figure>
  );
}

export function ArduinoPage() {
  return (
    <>
      <section id="ar-top" tabIndex={-1} className="relative pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="ar-title">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 top-24 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" style={dots} aria-hidden="true" />
        <div className="shell relative">
          <Breadcrumb current="Arduino and Micro:bits" />
          <h1 id="ar-title" className="display mt-10 text-[clamp(56px,10vw,150px)]">Arduino</h1>
          <p className="mt-2 font-display text-[clamp(28px,4vw,56px)] font-light tracking-tight text-ivory/80">and Micro:bits</p>
          <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-8">
            <p className="max-w-measure text-lg text-ivory/85 md:col-span-5">
              Small computers that sense and act. A sensor gives an input, the program decides, an output changes the world: a
              light, a sound, a radio message.
            </p>
            <div className="md:col-span-6 md:col-start-7">
              <Facts items={[["Arduino", "Tinkercad, Oct 14"], ["Micro:bits", "Cryptography, Oct 19"], ["Tools", "Tinkercad, MakeCode"], ["My evidence", "Kit photo, cipher notes"]]} />
            </div>
          </div>
        </div>
      </section>

      <Section id="ar-kit" title="The kit, part by part" intro={<p>My photo of the Arduino kit in the workshop. Select a number, or filter by role, to see what each part does.</p>}>
        <KitMap />
      </Section>

      <Section
        id="ar-sensor"
        title="Distance in, light out"
        intro={
          <>
            <Provenance tone="class">Class demonstration</Provenance>
            <p className="mt-3">On the projector, the class built a circuit in Tinkercad: an ultrasonic sensor controls the LEDs. The blocks below match my photo.</p>
          </>
        }
        tone="class"
      >
        <UltrasonicDemo />
        <div className="mt-16 grid items-center gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-6">
            <ClassPhoto src={tinkercadPhoto} alt="The projector showing Tinkercad: an Arduino UNO, three LEDs and an HC-SR04 sensor on a breadboard, with block code beside it." caption="Class demonstration in Tinkercad, photographed Oct 14" />
          </div>
          <div className="md:col-span-5 md:col-start-8">
            <h3 className="heading text-2xl">How the sensor measures</h3>
            <p className="mt-3 text-ivory/80">The HC-SR04 sends an ultrasonic pulse from one “eye” and listens for the echo with the other. Sound travels out and back, so:</p>
            <p className="mt-4 rounded-evidence bg-graphite px-4 py-3 font-code text-[14px] text-teal-soft">distance = echo time × speed of sound ÷ 2</p>
            <p className="mt-4 text-sm text-mist">The photo was taken while the code was still being written; the second condition was being edited.</p>
          </div>
        </div>
      </Section>

      <Section
        id="ar-microbit"
        title="Two micro:bits talking"
        tone="class"
        intro={
          <>
            <Provenance tone="class">Class activity</Provenance>
            <p className="mt-3">In the micro:bit session, devices in the same radio group sent emoji to each other. Press the buttons to run the class code.</p>
          </>
        }
      >
        <MicrobitLab />
        <div className="mt-16 grid items-center gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-5">
            <ClassPhoto src={microbitPhoto} alt="The projector showing Tinkercad blocks for micro:bit radio: radio set group 1, send number on buttons A and B, show an icon when a number is received." caption="Class code on the projector" />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h3 className="heading text-2xl">Then: secret messages</h3>
            <p className="mt-3 text-ivory/80">
              The same session moved to cryptography: a micro:bit receiver that deciphers messages with a substitution alphabet. My notes
              from that part, with a Caesar wheel and the ciphers I wrote down, are in the networking case study.
            </p>
            <a href={href("networking")} onClick={() => queueSection("net-cipher")} className="btn mt-6">Open my cipher notes</a>
          </div>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8">
          <Internal block></Internal>
          <Reflection topic="arduino" label="hardware and code" />
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
