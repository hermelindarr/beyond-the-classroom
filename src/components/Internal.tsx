import type { ReactNode } from "react";
import { REVIEW } from "../lib/env";

/**
 * An internal placeholder for something not yet verified (date, ownership,
 * permission). Rendered only in review mode, never in the public build.
 */
export function Internal({ children, block = false }: { children?: ReactNode; block?: boolean }) {
  if (!REVIEW) return null;
  const Tag = block ? "div" : "span";
  return (
    <Tag
      data-internal
      className={`${block ? "flex min-h-[120px] items-center justify-center p-6 text-center" : "mt-1 inline-block px-2 py-[2px]"} rounded-evidence border border-dashed border-amber/70 bg-amber/5 text-sm text-amber`}
    >
      Internal · {children}
    </Tag>
  );
}
