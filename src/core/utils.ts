export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeUrl(url: string | undefined): string {
  if (!url) return "#";
  // Allow placeholder/merge-tag URLs, e.g. {{unsubscribe_url}}, *|UNSUB|*, [UNSUB].
  if (url.startsWith("{{") || url.startsWith("*|") || url.startsWith("[")) return url;
  try {
    const u = new URL(url, "https://example.com");
    if (!["http:", "https:", "mailto:"].includes(u.protocol)) return "#";
    return url;
  } catch {
    return "#";
  }
}

/** Default gold used for product star ratings. */
export const STAR_COLOR = "#F5A623";

/**
 * Build a 5-glyph star string for a 0–5 rating (rounded to the nearest whole
 * star). Uses ★ (full) and ☆ (empty) so it renders in any email client.
 */
export function starGlyphs(rating: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(filled) + "☆".repeat(5 - filled);
}

// ── Editable slots ────────────────────────────────────────────────────────────

import type { EditableSlot } from "./types";

/**
 * Substitute editable slot values into an htmlOverride HTML string.
 *
 * Slots are marked in the HTML with `data-slot="key"`:
 *   - text  slot → el.textContent = value
 *   - html  slot → el.innerHTML   = value
 *   - image slot → img.src = value, img.alt = alt (if set)
 *   - href  slot → el.href = value  (or setAttribute("href", value))
 *
 * Works in both browser (DOMParser) and Node / test environments (regex fallback).
 * Returns the original `html` unchanged when `slots` is empty or undefined.
 */
export function applyEditableSlots(
  html: string,
  slots: Record<string, EditableSlot> | undefined
): string {
  if (!html || !slots || Object.keys(slots).length === 0) return html;

  // ── Browser path (DOMParser) ──────────────────────────────────────────────
  if (typeof window !== "undefined" && typeof window.DOMParser !== "undefined") {
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    const body = doc.body;

    for (const [key, slot] of Object.entries(slots)) {
      const els = Array.from(body.querySelectorAll(`[data-slot="${CSS.escape(key)}"]`));
      for (const el of els) {
        if (slot.type === "image" && el instanceof HTMLImageElement) {
          el.src = slot.value;
          if (slot.alt !== undefined) el.alt = slot.alt;
        } else if (slot.type === "href") {
          el.setAttribute("href", slot.value);
        } else if (slot.type === "html") {
          el.innerHTML = slot.value;
        } else {
          // text
          el.textContent = slot.value;
        }
      }
    }
    return body.innerHTML;
  }

  // ── Regex fallback (Node / server-side) ───────────────────────────────────
  let result = html;
  for (const [key, slot] of Object.entries(slots)) {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (slot.type === "image") {
      // Replace src="…" on the img with data-slot
      result = result.replace(
        new RegExp(`(<img[^>]*data-slot="${escapedKey}"[^>]*?)src="[^"]*"`, "gi"),
        `$1src="${escapeHtml(slot.value)}"`
      );
      if (slot.alt !== undefined) {
        result = result.replace(
          new RegExp(`(<img[^>]*data-slot="${escapedKey}"[^>]*?)alt="[^"]*"`, "gi"),
          `$1alt="${escapeHtml(slot.alt)}"`
        );
      }
    } else if (slot.type === "href") {
      // Replace href="…" on the element with data-slot
      result = result.replace(
        new RegExp(`(<[^>]+data-slot="${escapedKey}"[^>]*?)href="[^"]*"`, "gi"),
        `$1href="${escapeHtml(slot.value)}"`
      );
    } else {
      // text or html: replace content between the opening and first closing tag
      // Pattern: <tag ... data-slot="key" ...>CONTENT</tag>
      result = result.replace(
        new RegExp(
          `(<[a-zA-Z][^>]*data-slot="${escapedKey}"[^>]*>)(?:[\\s\\S]*?)(<\\/[a-zA-Z][^>]*>)`,
          "gi"
        ),
        `$1${slot.type === "html" ? slot.value : escapeHtml(slot.value)}$2`
      );
    }
  }
  return result;
}

// ── Theme token resolution for htmlOverride strings ───────────────────────────

import type { Theme } from "./types";

/**
 * Replace all `{group.key}` token references in an HTML string with their
 * resolved values from the email document's theme.
 *
 * Example: `{colors.primary}` → `#3024F4` (or whatever the active theme sets it to).
 *
 * This is the HTML-string equivalent of `resolveToken()` (which works on individual
 * style property values).  It is applied to `htmlOverride` content:
 *   - in the renderer before exporting HTML
 *   - in the canvas before displaying a preview
 *
 * Token groups: `colors`, `fonts`, `spacing`, `radius`.
 * Any key in the theme tokens can be referenced: `{colors.muted}`, `{fonts.heading}`, etc.
 *
 * Unknown references (not found in the theme) are left unchanged so they remain
 * visible if a token is accidentally misspelled.
 */
export function applyThemeTokens(html: string, theme: Theme | null | undefined): string {
  if (!html || !theme?.tokens) return html;
  const tokens = theme.tokens as unknown as Record<string, Record<string, unknown>>;
  return html.replace(/\{(\w+)\.(\w+)\}/g, (match, group, key) => {
    const val = tokens[group]?.[key];
    return val !== undefined ? String(val) : match;
  });
}
