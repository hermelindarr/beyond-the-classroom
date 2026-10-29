import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { BackToWorkshops, Breadcrumb, Facts, Provenance, Section } from "../components/CaseStudy";
import { OsiLab, osi } from "./networking/OsiLab";
import { PacketJourney } from "./networking/PacketJourney";
import { CiaLab } from "./networking/CiaLab";
import { CipherLab } from "./networking/CipherLab";
import osiNotes from "../assets/notebook/osi.webp";
import habitsNotes from "../assets/notebook/security-habits.webp";
import integrityNotes from "../assets/notebook/integrity.webp";
import cipherNotes from "../assets/notebook/cipher.webp";

const habits = [
  ["Phishing", "Verify the sender and the request"],
  ["Weak passwords", "Unique passphrases and MFA"],
  ["Unpatched software", "Apply updates"],
  ["Unsecured Wi-Fi", "Connect with caution"],
  ["Excessive access", "Least privilege"],
];

function NotesFigure({ src, alt, caption, tilt = "-rotate-1" }: { src: string; alt: string; caption: string; tilt?: string }) {
  return (
    <figure>
      <img src={src} alt={alt} loading="lazy" className={`w-full rounded-evidence ${tilt}`} />
      <figcaption className="mt-3"><Provenance tone="student">{caption}</Provenance></figcaption>
    </figure>
  );
}

export function NetworkingPage() {
  return (
    <>
      <section id="net-top" tabIndex={-1} className="relative pb-16 pt-28 outline-none md:pb-24 md:pt-36" aria-labelledby="net-title">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-7">
            <Breadcrumb current="Networking and Cybersecurity" />
            <h1 id="net-title" className="display mt-10 text-[clamp(56px,9vw,136px)]">Networking</h1>
            <p className="mt-3 font-display text-2xl font-light tracking-tight text-ivory/80 md:text-3xl">and Cybersecurity</p>
            <p className="mt-10 max-w-measure text-lg text-ivory/85">
              How a message crosses a network, and how defenders keep it private, unchanged and available. Built from my
              handwritten notes; the diagrams follow the class slides.
            </p>
          </div>
          {/* The page's motif: the seven-layer stack, read top to bottom. */}
          <ol className="flex flex-col justify-end gap-1 md:col-span-4 md:col-start-9" aria-hidden="true">
            {osi.map((l, i) => (
              <li key={l.n} className="flex items-center gap-3 rounded-[2px] border border-rule px-3 py-1.5 text-sm" style={{ marginLeft: `${i * 6}px` }}>
                <span className="font-display text-teal-soft">{l.n}</span>
                <span className="text-ivory/80">{l.name}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="shell mt-14">
          <Facts items={[["Format", "One 3-hour workshop"], ["Topics", "OSI, TCP/IP, CIA triad"], ["Class labs", "Wireshark, Windows encryption"], ["My evidence", "3 pages of notes"]]} />
          <Internal></Internal>
        </div>
      </section>

      <Section id="net-osi" title="Seven layers" intro={<p>Each layer has one job and serves the layer above it. Select a layer, or switch to the four-layer TCP/IP model used on the internet.</p>}>
        <OsiLab />
        <div className="mt-16 grid items-center gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4"><NotesFigure src={osiNotes} alt="My handwritten notes listing the seven OSI layers and an example of loading a web page." caption="My notes: the OSI layers" /></div>
          <blockquote className="md:col-span-7 md:col-start-6">
            <p className="font-display text-2xl font-light leading-snug tracking-tight md:text-3xl">
              “When your browser loads a webpage, Layer 7 sends an HTTP GET request, Layer 6 handles TLS encryption and Layer 5
              keeps the session alive across multiple requests.”
            </p>
            <footer className="mt-4"><Provenance tone="student">My example, from my notes (spelling tidied)</Provenance></footer>
          </blockquote>
        </div>
      </Section>

      <Section id="net-journey" title="A packet's journey" intro={<p>Going down the stack, each layer wraps the message in its own header. Going up on the other side, each layer removes it.</p>}>
        <PacketJourney />
      </Section>

      <Section id="net-cia" title="Private, unchanged, available" intro={<p>The class told one story: a nurse sends an urgent instruction. It can be read, changed or blocked. Each harm breaks one part of the CIA triad.</p>}>
        <CiaLab />
        <div className="mt-16 grid gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <div className="grid grid-cols-2 gap-4 md:col-span-5">
            <NotesFigure src={integrityNotes} alt="My notes on multi-factor authentication, integrity and tampering, and controls such as cryptographic hashes." caption="My notes: integrity" />
            <NotesFigure src={habitsNotes} alt="My notes on availability, threats and safe habits, and why inspect network traffic." caption="My notes: safe habits" tilt="rotate-1" />
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h3 className="heading text-2xl">Five safe habits</h3>
            <p className="mt-2 text-ivory/75">Every person who uses a computer is part of the defence. I wrote these down in class.</p>
            <ul className="mt-6 divide-y divide-rule border-y border-rule">
              {habits.map(([threat, habit]) => (
                <li key={threat} className="grid grid-cols-[1fr_24px_1fr] items-center gap-3 py-3 text-[15px]">
                  <span className="text-amber">{threat}</span>
                  <span className="text-mist" aria-hidden="true">→</span>
                  <span className="text-ivory/90">{habit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="net-cipher" title="Ciphers from my notebook" intro={<p>Encryption turns plaintext into ciphertext. These are the three ciphers I wrote down: one shift, a shuffled alphabet, and a moving shift.</p>}>
        <CipherLab />
        <div className="mt-16 grid items-center gap-10 border-t border-rule pt-12 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-4"><NotesFigure src={cipherNotes} alt="My notebook page on the Caesar cipher, a shuffled alphabet key, its weakness, and the Vigenère cipher." caption="My notes, Micro:bits cryptography session" /></div>
          <div className="md:col-span-7 md:col-start-6">
            <p className="text-[15px] text-ivory/85">
              I took these notes in the Micro:bits cryptography session (Oct 19). They belong here because encryption is how the
              confidentiality in the CIA triad is protected.
            </p>
          </div>
        </div>
      </Section>

      <Section
        id="net-labs"
        title="Inside the class labs"
        tone="class"
        intro={
          <>
            <Provenance tone="class">Class material</Provenance>
            <p className="mt-3">The workshop included a Wireshark lab and a Windows encryption lab. This is what the slides taught. No capture or encryption result of mine is shown.</p>
          </>
        }
      >
        <div className="grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule md:grid-cols-3">
          {[
            ["Packet list", "One row per packet: time, source, destination, protocol, length."],
            ["Packet details", "A tree of decoded fields: Ethernet, IP, TCP, HTTP."],
            ["Packet bytes", "The raw hexadecimal and ASCII of the selected packet."],
          ].map(([t, d]) => (
            <div key={t} className="bg-navy p-6">
              <p className="font-display text-lg font-semibold tracking-tight">{t}</p>
              <p className="mt-2 text-[15px] text-ivory/75">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-8">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">Read a packet like an analyst</h3>
            <ol className="mt-4 space-y-2 text-[15px] text-ivory/85">
              {["Who sent it?", "Who received it?", "What protocol?", "What happened?", "What can't you see? With TLS, the payload is encrypted."].map((q, i) => (
                <li key={q} className="grid grid-cols-[24px_1fr]"><span className="font-display text-violet-soft">{i + 1}</span>{q}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">Display filters from the slides</h3>
            <ul className="mt-4 flex flex-wrap gap-2 font-code text-[13px]">
              {["dns", "tcp", "icmp", "tls", "tcp.port == 443", "ip.addr == 8.8.8.8", "!tcp"].map((f) => <li key={f} className="rounded-evidence border border-rule px-3 py-1.5 text-violet-soft">{f}</li>)}
            </ul>
            <p className="mt-4 text-sm text-mist">Source: class slides “Networking + Cybersecurity”.</p>
          </div>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-8">
          <Internal block></Internal>
          <Reflection topic="networking" label="networking and security" />
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
