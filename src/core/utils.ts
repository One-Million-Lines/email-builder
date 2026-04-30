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
  try {
    const u = new URL(url, "https://example.com");
    if (!["http:", "https:", "mailto:"].includes(u.protocol)) return "#";
    return url;
  } catch {
    return "#";
  }
}
