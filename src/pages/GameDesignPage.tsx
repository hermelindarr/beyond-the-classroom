import { Internal } from "../components/Internal";
import { Reflection } from "../components/Reflection";
import { VideoPlayer } from "../components/VideoPlayer";
import { BackToWorkshops, Breadcrumb, Dot, Facts, Section } from "../components/CaseStudy";
import { mediaFor } from "../lib/media";
import { sprites } from "../starfall/engine";
import { PlayStage } from "./game-design/PlayStage";
import { ProjectAnatomy } from "./game-design/ProjectAnatomy";
import { ExplodedRoom } from "./game-design/ExplodedRoom";
import { MechanicsLab } from "./game-design/MechanicsLab";
import gamePsychology from "../assets/notebook/game-psychology.webp";
import gameOverview from "../assets/notebook/game-overview.webp";
import v3Play from "../assets/game/starfall3-play.webp";
import v3Eye from "../assets/game/starfall3-eye.webp";

// Ideas from my notes, matched to the exact line of StarFall that uses them.
const links = [
  { idea: "Chance", note: "chance = uncertainty = surprise", game: "random_range picks every star's speed, colour, angle and position.", code: "speed = random_range(2.5, 7.5)" },
  { idea: "Skill", note: "physical skills: strength, dexterity, coordination", game: "The player has to click a moving target before it lands.", code: "Left Pressed → instance_destroy()" },
  { idea: "Time", note: "mechanics of space and time", game: "A new wave starts as soon as the last star is gone, and every wave brings one more star.", code: "for (var i = 0; i < wave; i += 1)" },
  { idea: "Competence", note: "games are full of competency markers, like scores and progress bars", game: "Every pop adds one point, and the wave number shows how far you got. Both are always on screen.", code: "obj_gameManager.gameScore++" },
];

const original = [
  "Game rules: all eleven GML events of version 2.0, line for line",
  "Room1 layout: size, background, the seven ground tiles and the six explosions that play at the start",
  "The explosion's 9 frames at 30 fps (sprites shown here are placeholders: the workshop's asset pack and the instructor's Game Over image are not redistributed)",
  "Four sounds: looping music, pop, sad whistle and Game Over (placeholders in this public version)",
  "Rectangle collision masks and their sizes",
  "60 steps per second, as set in the project options",
  "Score font: Sitka Small Semibold, 12 pt",
];
// Dated by the GameMaker files on my USB drive.
const versions = [
  { name: "First session", date: "Oct 19 · week 2", file: "Linda.yyz", what: "One object, obj_star. Three stars placed in the room fall with a random speed and colour, spin, and disappear when clicked. No ground, score or sound yet." },
  { name: "Version 1", date: "Oct 22 · week 2", file: "juego Herme", what: "The full game loop: a game manager, the ground and its collisions, the explosion, the score, music and sounds, and a new star every 60 steps." },
  { name: "Version 2.0", date: "Nov 2 · week 4", file: "2.0", what: "Waves instead of the timer, each one star bigger. Three stars on the ground mean Game Over, with its own sign and sound; R or a click on the sign starts again. This is the version you can play above." },
  { name: "Version 3.0", date: "Nov 5 · week 4", file: "3.0", ai: true, what: "A horror version with abstract art: the stars became eyes that blink and tremble, over a background of red and purple stains, with strange sounds. It adds a title screen, combos, ten waves to win and a final boss, the Giant Eye." },
] as { name: string; date: string; file?: string; upcoming?: boolean; ai?: boolean; what: string }[];

const adapted = [
  "Runs on an HTML canvas instead of the GameMaker runner",
  "A Start button, because browsers only play sound after a click",
  "Pause, restart, sound, collision-box and full-screen controls, added for this portfolio (the R key restarts at any time, not only after Game Over)",
  "The game scales to fit the screen; GameMaker uses a fixed 1366 × 768 window",
  "Touch works like a mouse click on phones and tablets",
  "On slow computers it draws at a lower resolution; positions, speeds and collisions do not change",
  "Sitka is a Windows font: other systems show a similar serif",
];

export function GameDesignPage() {
  const videos = mediaFor("game-design");
  return (
    <>
      <section id="gd-top" tabIndex={-1} className="relative pb-20 pt-28 outline-none md:pb-28 md:pt-36" aria-labelledby="gd-title">
        <div className="shell">
          <Breadcrumb current="Game Design" />
          <div className="mt-10 grid items-end gap-10 md:grid-cols-12">
            <div className="md:col-span-8">
              <p className="font-display text-xl font-light tracking-tight text-ivory/80 md:text-2xl">Game Design · Case study</p>
              <h1 id="gd-title" className="display mt-4 text-[clamp(72px,14vw,200px)]">StarFall</h1>
            </div>
            <div className="hidden md:col-span-4 md:flex md:justify-end" aria-hidden="true">
              {/* Turns at the game's own speed: 1° per step, 360 steps per turn. */}
              <img src={sprites.star} alt="" className="w-40 animate-[spin_6s_linear_infinite_reverse] opacity-90 [image-rendering:pixelated] motion-reduce:animate-none lg:w-52" />
            </div>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-12 md:gap-8">
            <p className="max-w-measure text-lg text-ivory/85 md:col-span-5">
              My first video game. I built it in GameMaker during the Game Design workshop at Cambrian College: stars fall
              from the night sky, and you click them before they hit the ground. In version 2.0 they come in waves, and three stars on
              the ground end the game.
            </p>
            <div className="md:col-span-6 md:col-start-7">
              <Facts items={[["Workshop", "Game Design, weeks 2 and 4"], ["Engine", "GameMaker 2026"], ["Language", "GML"], ["Scope", "5 objects, 11 events"]]} />
            </div>
          </div>
          <Internal></Internal>
        </div>
      </section>

      <section id="gd-play" tabIndex={-1} className="relative border-t border-rule py-16 outline-none md:py-20" aria-label="Play StarFall">
        <div className="shell">
          <PlayStage />
        </div>
      </section>

      <Section
        id="gd-brief"
        title="The workshop"
        tone="class"
        intro={
          <>
            <p className="flex items-center gap-2 text-sm text-mist"><Dot tone="class" /> Class material</p>
            <p className="mt-3">
              The workshop started with how games are designed and why people play them, then moved into a game engine to
              build something real.
            </p>
          </>
        }
      >
        <ol className="grid gap-px overflow-hidden rounded-evidence border border-rule bg-rule md:grid-cols-3">
          {[
            ["Game design", "Four parts of every game: aesthetics, narrative, technology and mechanics. Mechanics such as space, time, skill and chance."],
            ["Game psychology", "Self-determination theory: people play to feel competent, to make meaningful choices and to feel connected."],
            ["Game engines", "Software that handles graphics, collisions, sound and input, so you can focus on the game itself. In class: GameMaker."],
          ].map(([t, d], i) => (
            <li key={t} className="bg-navy p-6 md:p-8">
              <span className="font-display text-sm text-violet-soft">{i + 1}</span>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight">{t}</p>
              <p className="mt-3 text-ivory/75">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-mist">Source: class slides, “A very quick introduction to Game Design, Querétaro Exchange Edition”.</p>
      </Section>

      <Section id="gd-inside" title="Inside the project" intro={<p>Everything the game is made of, taken straight from the GameMaker project. Press play to hear the real sounds.</p>}>
        <ProjectAnatomy />
      </Section>

      <Section id="gd-layers" title="One room, three layers" intro={<p>Room1 stacks a background, the game objects and an interface layer for the score. Scroll to pull them apart.</p>}>
        <ExplodedRoom />
      </Section>

      <Section id="gd-how" title="How it works" intro={<p>Version 2.0 of the game is eleven short events. Choose one to see the code from my project and try what it does.</p>}>
        <MechanicsLab />
      </Section>

      <Section id="gd-versions" title="From stars to eyes" intro={<p>The project files on my USB drive show how the game grew, session by session.</p>}>
        <ol className="border-b border-rule">
          {versions.map((v) => (
            <li key={v.date} className={`grid gap-3 border-t border-rule py-7 md:grid-cols-12 md:gap-8 ${v.upcoming ? "text-ivory/60" : ""}`}>
              <div className="md:col-span-3">
                <p className="font-display text-2xl font-semibold tracking-tight">{v.name}</p>
                <p className="mt-1 text-sm text-mist">{v.date}</p>
              </div>
              <p className="max-w-measure text-ivory/85 md:col-span-6">{v.what}</p>
              <p className="text-sm text-mist md:col-span-3">
                {v.upcoming ? <span className="chip chip-upcoming">Upcoming</span> : <span className="flex items-center gap-2"><Dot tone="student" /> {v.file}</span>}
                {v.ai && <span className="mt-2 block">Made with AI help</span>}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid items-center gap-8 md:grid-cols-12">
          <figure className="md:col-span-8">
            <div className="overflow-hidden rounded-evidence bg-graphite">
              <img src={v3Play} alt="StarFall 3.0: abstract eyes falling over a dark background of red and purple stains and rings, above ground that drips red." loading="lazy" className="aspect-[16/9] w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-[15px]">Version 3.0 running in GameMaker</figcaption>
          </figure>
          <div className="md:col-span-4">
            <img src={v3Eye} alt="The eye that replaced the star: bone white, with red veins and a slit pupil." loading="lazy" className="h-32 w-32" />
            <p className="mt-4 max-w-measure text-ivory/85">
              I made version 3.0 with the help of an AI assistant (Claude), following my ideas: horror, abstract art and strange sounds.
              The new art and sounds were generated with code.
            </p>
          </div>
        </div>
      </Section>

      <Section id="gd-notes" title="From my notes to my game" intro={<p>What I wrote down in the workshop, and where it shows up in StarFall.</p>}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          <div className="grid grid-cols-2 gap-4 md:col-span-4">
            {[[gameOverview, "My notes: game design overview, mechanics, skill and chance."], [gamePsychology, "My notes: game psychology and self-determination theory."]].map(([src, alt], i) => (
              <figure key={src} className={i ? "mt-10" : ""}>
                <img src={src} alt={alt} loading="lazy" className={`w-full rounded-evidence ${i ? "rotate-1" : "-rotate-1"}`} />
                <figcaption className="mt-3 flex items-center gap-2 text-sm text-mist"><Dot tone="student" /> My notes</figcaption>
              </figure>
            ))}
          </div>
          <ol className="md:col-span-7 md:col-start-6">
            {links.map((l) => (
              <li key={l.idea} className="grid gap-2 border-t border-rule py-6 sm:grid-cols-[210px_1fr] sm:gap-6">
                <p className="font-display text-2xl font-semibold tracking-tight">{l.idea}</p>
                <div>
                  <p className="text-sm text-mist">From my notes: {l.note}</p>
                  <p className="mt-2 text-ivory/90">{l.game}</p>
                  <p className="mt-2 font-code text-[13px] text-teal-soft">{l.code}</p>
                </div>
              </li>
            ))}
          </ol>
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
            <Reflection topic="game-design" label="game design" />
          </div>
        </div>
      </Section>

      <Section id="gd-adaptations" title="Original and adapted" intro={<p>What comes straight from my GameMaker project, and what had to change so it runs in a web browser.</p>}>
        <div className="grid gap-10 md:grid-cols-2 md:gap-8">
          {[["From my GameMaker project", original, "student"], ["Adapted for the browser", adapted, "class"]].map(([title, items, tone]) => (
            <div key={title as string}>
              <h3 className="flex items-center gap-3 font-display text-xl font-semibold tracking-tight">
                {tone === "student" ? <Dot tone="student" /> : <span className="inline-block h-2 w-2 rounded-full border border-ivory/50" aria-hidden="true" />}
                {title as string}
              </h3>
              <ul className="mt-4 border-b border-rule">
                {(items as string[]).map((it) => <li key={it} className="border-t border-rule py-3 text-ivory/85">{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <BackToWorkshops />
      </Section>
    </>
  );
}
