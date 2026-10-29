import { useEffect, useState } from "react";

// The class demonstration on the projector (Tinkercad, Oct 14), reproduced
// block by block as it appears in my photo:
//   set dis to read ultrasonic distance sensor on trigger pin 6
//   if dis < 200 then set pin 11 to HIGH
//   if dis < 100 then set pin 11 to HIGH      (being edited when I took the photo)
// LEDs are wired red → 13, yellow → 12, green → 11 on the board.

function Block({ children, tone, on, indent = 0 }: { children: React.ReactNode; tone: "var" | "ctrl" | "out"; on?: boolean; indent?: number }) {
  const c = { var: "bg-[#A33ED1]", ctrl: "bg-[#E2A02F] text-navy", out: "bg-[#2E8BDB]" }[tone];
  return (
    <div className={`w-max rounded-[4px] px-3 py-1.5 font-body text-[13px] font-bold text-white transition-shadow ${c} ${on ? "shadow-[0_0_0_3px_#101827]" : "opacity-60"}`} style={{ marginLeft: indent * 22 }}>
      {children}
    </div>
  );
}
const Pill = ({ children }: { children: React.ReactNode }) => <span className="mx-1 rounded-full bg-white/90 px-2 text-navy">{children}</span>;

export function UltrasonicDemo() {
  const [distance, setDistance] = useState(250);
  const [pin11, setPin11] = useState(false);
  const [withElse, setWithElse] = useState(false);

  // One pass of the loop, every time the reading changes.
  const first = distance < 200;
  const second = distance < 100;
  useEffect(() => {
    if (first || second) setPin11(true);
    else if (withElse) setPin11(false);
  }, [first, second, withElse]);

  const led = (pin: number, colour: string, on: boolean) => (
    <div className="flex flex-col items-center gap-2">
      <span className="h-10 w-7 rounded-t-full border border-ivory/30 transition-all duration-300" style={{ background: on ? colour : "#2C3544", boxShadow: on ? `0 0 26px ${colour}` : "none" }} />
      <span className="font-code text-xs text-mist">pin {pin}</span>
    </div>
  );

  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-6">
        <div className="space-y-1.5 rounded-stage border border-rule bg-[#F4F5F7] p-5" aria-label="The class code as Tinkercad blocks">
          <Block tone="var" on>set <Pill>dis</Pill> to read ultrasonic distance sensor on trigger pin <Pill>6</Pill></Block>
          <Block tone="ctrl" on={first}>if <Pill>dis &lt; 200</Pill> then</Block>
          <Block tone="out" indent={1} on={first}>set pin <Pill>11</Pill> to <Pill>HIGH</Pill></Block>
          {/* My exploration attaches the else to the first "if", so it covers every distance of 200 or more. */}
          {withElse && (
            <>
              <Block tone="ctrl" on={!first}>else</Block>
              <Block tone="out" indent={1} on={!first}>set pin <Pill>11</Pill> to <Pill>LOW</Pill></Block>
            </>
          )}
          <Block tone="ctrl" on={second}>if <Pill>dis &lt; 100</Pill> then</Block>
          <Block tone="out" indent={1} on={second}>set pin <Pill>11</Pill> to <Pill>HIGH</Pill></Block>
        </div>
        <p className="mt-3 text-sm text-mist">The highlighted blocks are the ones that run for the current distance.</p>
      </div>

      <div className="md:col-span-5 md:col-start-8">
        <div className="flex items-end justify-between rounded-stage border border-rule bg-graphite p-6">
          <div className="flex gap-5">
            {led(13, "#E5484D", false)}
            {led(12, "#E2C044", false)}
            {led(11, "#3FCB6B", pin11)}
          </div>
          <div className="text-right">
            <p className="text-sm text-mist">dis</p>
            <p className="font-display text-4xl font-semibold tabular-nums">{distance}</p>
          </div>
        </div>
        <label className="mt-6 block text-sm text-mist">
          Move an object in front of the sensor
          <input type="range" min={10} max={330} value={distance} onChange={(e) => setDistance(+e.target.value)} className="mt-2 block w-full accent-teal" aria-valuetext={`${distance}, units as set in the sensor block`} />
        </label>
        <p className="mt-4 text-[15px] text-ivory/85" aria-live="polite">
          {first
            ? "Closer than 200: pin 11 goes HIGH and the green LED lights."
            : withElse
              ? "Nothing is close: my else block sets pin 11 LOW, so the LED is off."
              : pin11
                ? "The object moved away, but the LED stays on: nothing in this code ever sets pin 11 LOW."
                : "Nothing is close: no condition is true, so no block changes pin 11."}
        </p>
        <div className="mt-6 border-t border-rule pt-4">
          <button type="button" className={`btn ${withElse ? "border-teal/70 bg-teal/10" : ""}`} aria-pressed={withElse} onClick={() => setWithElse(!withElse)}>
            {withElse ? "Remove my else block" : "Add an else block"}
          </button>
          <p className="mt-3 text-sm text-mist">My exploration, not part of the class code: an else that sets pin 11 LOW makes the LED turn off again.</p>
        </div>
      </div>
    </div>
  );
}
