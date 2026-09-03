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
