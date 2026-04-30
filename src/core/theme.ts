// Theme token resolution. Tokens use {colors.primary} or {spacing.md} syntax.
import type { Theme } from "./types";

export function resolveToken(value: unknown, theme: Theme): unknown {
  if (typeof value !== "string") return value;
  const m = value.match(/^\{([\w.]+)\}$/);
  if (!m) return value;
  const path = m[1].split(".");
  let cur: unknown = theme.tokens;
  for (const p of path) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return value;
    }
  }
  return cur;
}

export function resolveStyle(
  style: Record<string, unknown> | undefined | null,
  theme: Theme
): Record<string, unknown> {
  if (!style) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(style)) {
    out[k] = resolveToken(v, theme);
  }
  return out;
}
