/**
 * Generate static HTML preview files for every registered template.
 *
 * Usage (requires a library build first):
 *   npm run build && node scripts/generate-previews.mjs
 *
 * Output: examples/previews/<template-id>.html
 */
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const outDir = join(projectRoot, "examples", "previews");

// Import from the compiled library bundle (requires npm run build first).
const { templateRegistry, renderEmailHtml } = await import(
  join(projectRoot, "dist/email-builder.js")
);

await mkdir(outDir, { recursive: true });

const templates = templateRegistry.list();
let generated = 0;

for (const tpl of templates) {
  const doc = tpl.build();
  const rawHtml = renderEmailHtml(doc);

  // Wrap with a minimal browser shell that adds a preview bar at the top.
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${tpl.name} — Email Preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #f5f5f5; }
  .preview-bar {
    position: sticky; top: 0; z-index: 999;
    display: flex; align-items: center; gap: 12px;
    background: #111827; color: #f9fafb;
    padding: 8px 16px; font-size: 12px;
  }
  .preview-bar strong { font-size: 13px; }
  .preview-bar .meta { color: #9ca3af; }
  .preview-bar .badge {
    background: #374151; border-radius: 4px;
    padding: 2px 8px; font-size: 11px;
  }
  .preview-wrap { padding: 24px 0; }
</style>
</head>
<body>
<div class="preview-bar">
  <strong>${tpl.name}</strong>
  <span class="badge">${tpl.category}</span>
  <span class="meta">${tpl.description}</span>
</div>
<div class="preview-wrap">
${rawHtml}
</div>
</body>
</html>`;

  const outPath = join(outDir, `${tpl.id}.html`);
  await writeFile(outPath, html, "utf8");
  console.log(`  ✓ ${tpl.id}.html`);
  generated++;
}

console.log(`\nGenerated ${generated} preview(s) → examples/previews/`);
