import type { CaseRoute } from "../lib/router";

// The student's weekly reflections, read from public/reflections.js so she can
// edit them with Notepad. One reflection per week, written after the week ends;
// a week without one simply shows "Reflection coming soon".

export type WeekPart = { heading: string; page?: CaseRoute; text: string[]; echo?: string };
export type WeekReflection = {
  week: number;
  title: string;
  summary: string;
  quote: string;
  opening: string[];
  parts: WeekPart[];
  closing: string[];
};

declare global {
  interface Window {
    BTC_WEEKS?: unknown;
  }
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string" && !!s.trim()) : []);

/** Tolerates a half-edited file: incomplete entries are dropped, never shown broken. */
export function weekReflections(): WeekReflection[] {
  const raw = Array.isArray(window.BTC_WEEKS) ? (window.BTC_WEEKS as Record<string, unknown>[]) : [];
  return raw
    .filter((w) => w && typeof w.week === "number" && typeof w.title === "string" && w.title.trim())
    .map((w) => ({
      week: w.week as number,
      title: (w.title as string).trim(),
      summary: typeof w.summary === "string" ? w.summary.trim() : "",
      quote: typeof w.quote === "string" ? w.quote.trim() : "",
      opening: strings(w.opening),
      parts: (Array.isArray(w.parts) ? (w.parts as Record<string, unknown>[]) : [])
        .filter((p) => p && typeof p.heading === "string")
        .map((p) => ({
          heading: p.heading as string,
          page: typeof p.page === "string" ? (p.page as CaseRoute) : undefined,
          text: strings(p.text),
          echo: typeof p.echo === "string" && p.echo.trim() ? p.echo.trim() : undefined,
        })),
      closing: strings(w.closing),
    }))
    .sort((a, b) => a.week - b.week);
}

/** The lines a workshop page quotes from the weekly reflections. */
export function echoesFor(page: CaseRoute) {
  return weekReflections().flatMap((w) =>
    w.parts.filter((p) => p.page === page && p.echo).map((p) => ({ week: w.week, title: w.title, heading: p.heading, echo: p.echo! })),
  );
}

export const weekAnchor = (n: number) => `week-${n}`;
