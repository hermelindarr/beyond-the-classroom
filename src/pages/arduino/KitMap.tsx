import { useState } from "react";
import deskPhoto from "../../assets/evidence/arduino-desk.webp";

// The parts I can identify on my own photo of the Arduino kit, pinned to where
// they appear (percent of the cropped photo) and sorted by role.
type Role = "Controller" | "Input" | "Output" | "Power" | "Connection";
const parts: { x: number; y: number; name: string; role: Role; what: string }[] = [
  { x: 25, y: 55, name: "Arduino UNO", role: "Controller", what: "The microcontroller board. It runs the program and reads and drives the pins." },
  { x: 27, y: 43, name: "Red LED", role: "Output", what: "Plugged into the board's pin header. It lights when its pin is set HIGH." },
  { x: 64, y: 78, name: "HC-SR04 ultrasonic sensor", role: "Input", what: "Sends a sound pulse and times the echo, so the board can work out a distance." },
  { x: 49, y: 23, name: "Piezo buzzer", role: "Output", what: "An actuator that turns an electrical signal into sound." },
  { x: 11, y: 78, name: "9 V battery", role: "Power", what: "Powers the board through the barrel jack, without the USB cable." },
  { x: 51, y: 70, name: "Breadboard", role: "Connection", what: "Lets you build a circuit without soldering; holes in a row are connected." },
  { x: 59, y: 44, name: "Resistors", role: "Connection", what: "Limit the current, for example so an LED does not burn out." },
  { x: 46, y: 94, name: "Spare LEDs", role: "Output", what: "Green, yellow and blue LEDs ready for the next circuit." },
  { x: 86, y: 50, name: "Jumper wires", role: "Connection", what: "Connect the board's pins to the breadboard." },
];
const roles: Role[] = ["Controller", "Input", "Output", "Power", "Connection"];
const roleColour: Record<Role, string> = {
  Controller: "bg-ivory text-navy",
  Input: "bg-teal text-navy",
  Output: "bg-amber text-navy",
  Power: "bg-violet text-ivory",
  Connection: "bg-graphite text-ivory ring-1 ring-ivory/40",
};

export function KitMap() {
  const [active, setActive] = useState(2);
  const [filter, setFilter] = useState<Role | null>(null);
  const p = parts[active];
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <figure className="md:col-span-8">
        <div className="relative overflow-hidden rounded-evidence">
          <img src={deskPhoto} alt="My Arduino kit on a white table: an Arduino UNO with a red LED lit, a breadboard, an ultrasonic sensor, a buzzer, a 9 V battery, resistors, LEDs and jumper wires." className="w-full" />
          {parts.map((q, i) => {
            const dim = filter && q.role !== filter;
            return (
              <button
                key={q.name}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`${q.name} (${q.role})`}
                aria-pressed={i === active}
                className={`absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-sm font-semibold transition-all duration-300 ${roleColour[q.role]} ${i === active ? "scale-125 ring-4 ring-navy/70" : ""} ${dim ? "opacity-20" : ""}`}
                style={{ left: `${q.x}%`, top: `${q.y}%` }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <figcaption className="mt-3 flex items-center gap-2 text-sm text-mist">
          <span className="h-2 w-2 rounded-full bg-teal" aria-hidden="true" />
          My photo of the kit in the Arduino workshop. Numbers added for this portfolio.
        </figcaption>
      </figure>
      <div className="md:col-span-4">
        <div role="group" aria-label="Show parts by role" className="flex flex-wrap gap-2">
          {roles.map((r) => (
            <button key={r} type="button" aria-pressed={filter === r} onClick={() => setFilter(filter === r ? null : r)} className={`rounded-full border px-3 py-1 text-sm transition-colors ${filter === r ? "border-ivory bg-ivory/10 text-ivory" : "border-rule text-mist hover:text-ivory"}`}>
              {r}
            </button>
          ))}
        </div>
        <div className="mt-8" aria-live="polite">
          <span className={`inline-block rounded-full px-3 py-0.5 text-sm ${roleColour[p.role]}`}>{p.role}</span>
          <p className="heading mt-3 text-3xl">{p.name}</p>
          <p className="mt-3 text-lg text-ivory/85">{p.what}</p>
        </div>
        <p className="mt-10 border-t border-rule pt-4 text-[15px] text-ivory/75">
          Inputs bring information in (a sensor). Outputs act on the world (a light, a sound). The controller decides, using the
          program, what each output does with each input.
        </p>
      </div>
    </div>
  );
}
