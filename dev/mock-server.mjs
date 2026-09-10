/**
 * Development mock server for the email-builder plugins.
 *
 * Run from the project root:
 *   node dev/mock-server.mjs
 *
 * Then open: http://localhost:3001/dev/
 *
 * Endpoints exposed
 *   POST /api/upload            — image uploader (accepts multipart, returns placeholder URL)
 *   GET  /api/products/search   — product search (?q=query)
 *   POST /api/products/search   — product search ({"query":"…"})
 *   GET  /api/vouchers          — voucher list
 *   POST /api/ai/generate       — AI assistant mock
 *
 * All other paths are served as static files from the project root.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.PORT ?? 3001);

// ─────────────────────────────────────────────────────────────────────────────
// Static file helpers
// ─────────────────────────────────────────────────────────────────────────────

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".cjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? "application/octet-stream";
  res.setHeader("Content-Type", mime);
  res.writeHead(200);
  fs.createReadStream(filePath).pipe(res);
}

// ─────────────────────────────────────────────────────────────────────────────
// Request helpers
// ─────────────────────────────────────────────────────────────────────────────

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

async function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function json(res, status, body) {
  res.setHeader("Content-Type", "application/json");
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    sku: "TOTE-LIN-01",
    name: "Linen Tote Bag",
    final_price: "$39.00",
    old_price: "$59.00",
    description: "Heavyweight natural linen, made in Portugal.",
    link: "https://example.com/products/linen-tote-bag",
    image: "https://placehold.co/560x400/e2d9ce/5c4a2a?text=Linen+Tote",
    stars: 4.5,
    keywords: ["tote", "bag", "linen", "canvas", "carry"],
  },
  {
    sku: "MUG-CER-02",
    name: "Ceramic Mug",
    final_price: "$24.00",
    description: "Stoneware mug with a matte reactive glaze. 350 ml.",
    link: "https://example.com/products/ceramic-mug",
    image: "https://placehold.co/560x400/d4e4e6/2d5f63?text=Ceramic+Mug",
    stars: 4.0,
    keywords: ["mug", "cup", "ceramic", "coffee", "tea", "drink"],
  },
  {
    sku: "LAMP-BR-03",
    name: "Brass Table Lamp",
    final_price: "$129.00",
    old_price: "$149.00",
    description: "Solid brass base with a linen shade. Dimmable.",
    link: "https://example.com/products/brass-table-lamp",
    image: "https://placehold.co/560x400/f5e6c8/7a5c00?text=Brass+Lamp",
    stars: 5.0,
    keywords: ["lamp", "light", "brass", "lighting", "table", "desk"],
  },
  {
    sku: "SKIL-CI-04",
    name: "Cast Iron Skillet",
    final_price: "$89.00",
    old_price: "$119.00",
    description: "Pre-seasoned, lifetime guarantee. Made in USA.",
    link: "https://example.com/products/cast-iron-skillet",
    image: "https://placehold.co/560x400/d0cfc9/3c3b38?text=Cast+Iron",
    stars: 4.5,
    keywords: ["skillet", "pan", "cast iron", "cook", "kitchen", "frying"],
  },
  {
    sku: "CHAIR-WD-05",
    name: "Walnut Dining Chair",
    final_price: "$249.00",
    old_price: "$319.00",
    description: "Solid walnut frame, upholstered seat. Set of 2.",
    link: "https://example.com/products/walnut-chair",
    image: "https://placehold.co/560x400/d9c9b0/5c3d1e?text=Walnut+Chair",
    stars: 4.5,
    keywords: ["chair", "walnut", "dining", "furniture", "seat"],
  },
  {
    sku: "CANDLE-SOY-06",
    name: "Soy Wax Candle",
    final_price: "$28.00",
    description: "Hand-poured, 40-hour burn time. Cedar & amber scent.",
    link: "https://example.com/products/soy-candle",
    image: "https://placehold.co/560x400/f5e8d8/6b4c2a?text=Soy+Candle",
    stars: 4.8,
    keywords: ["candle", "soy", "wax", "scent", "home", "fragrance", "cedar", "amber"],
  },
  {
    sku: "THROW-WO-07",
    name: "Merino Wool Throw",
    final_price: "$79.00",
    old_price: "$99.00",
    description: "Extra-fine 100% merino wool, 130 × 180 cm.",
    link: "https://example.com/products/merino-throw",
    image: "https://placehold.co/560x400/e4ddd6/4a3728?text=Merino+Throw",
    stars: 4.7,
    keywords: ["throw", "blanket", "merino", "wool", "cozy", "warm", "soft"],
  },
  {
    sku: "VASE-BL-08",
    name: "Blue Ceramic Vase",
    final_price: "$45.00",
    description: "Hand-thrown, cobalt blue glaze. 28 cm tall.",
    link: "https://example.com/products/blue-vase",
    image: "https://placehold.co/560x400/b8d1e6/1a3d5c?text=Blue+Vase",
    stars: 4.6,
    keywords: ["vase", "ceramic", "blue", "flower", "decor", "pot"],
  },
];

const VOUCHERS = [
  {
    id: "voucher_welcome10",
    title: "Welcome — 10% off first order",
    code: "WELCOME10",
    description: "10% off for new subscribers. One-time use.",
  },
  {
    id: "voucher_save20",
    title: "Spring Sale — 20% off",
    code: "SAVE20",
    description: "20% off sitewide. Valid through end of month.",
  },
  {
    id: "voucher_freeship",
    title: "Free shipping over $50",
    code: "FREESHIP",
    description: "Free standard shipping on orders over $50.",
  },
  {
    id: "voucher_flash30",
    title: "Flash sale — 30% off (today only)",
    code: "FLASH30",
    description: "30% off everything. Midnight deadline.",
  },
  {
    id: "voucher_79jq",
    title: "VIP personal code",
    code: "**|voucher_79jq|**",
    description: "Unique per-recipient code injected at send time by your ESP.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Scoring helper for product search
// ─────────────────────────────────────────────────────────────────────────────

function scoreProduct(product, query) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  if (product.sku.toLowerCase() === q) return 100;
  const name = product.name.toLowerCase();
  let score = 0;
  if (q === name) score += 60;
  else if (name.includes(q)) score += 40;
  else if (q.includes(name)) score += 20;
  for (const kw of product.keywords) {
    if (kw.includes(q) || q.includes(kw)) score += 10;
  }
  const nameTokens = new Set(name.split(/\s+/));
  const queryTokens = new Set(q.split(/\s+/));
  for (const t of queryTokens) if (nameTokens.has(t)) score += 3;
  return score;
}

function stripKeywords(p) {
  const { keywords: _, ...rest } = p; // eslint-disable-line no-unused-vars
  return rest;
}

// ─────────────────────────────────────────────────────────────────────────────
// API handlers
// ─────────────────────────────────────────────────────────────────────────────

async function handleUpload(req, res) {
  await readBody(req); // drain (we don't actually save anything)
  const seed = Date.now().toString(36);
  json(res, 200, {
    url: `https://placehold.co/600x400/e8e8e8/888888?text=Uploaded+${seed}`,
    alt: "Uploaded image",
  });
  console.log("  [upload] returned placeholder URL");
}

async function handleProductSearch(req, res, url) {
  let query = url.searchParams.get("q") ?? "";
  if (req.method === "POST") {
    const body = await readBody(req);
    try {
      const parsed = JSON.parse(body.toString());
      query = parsed.query ?? parsed.q ?? "";
    } catch { /* ignore */ }
  }
  if (!query.trim()) {
    return json(res, 400, { error: "A non-empty query is required." });
  }
  const ranked = [...PRODUCTS].sort(
    (a, b) => scoreProduct(b, query) - scoreProduct(a, query)
  );
  const best = ranked[0];
  if (scoreProduct(best, query) <= 0) {
    console.log(`  [products] no match for "${query}"`);
    return json(res, 404, { error: `No product matched "${query}".` });
  }
  console.log(`  [products] "${query}" → ${best.name}`);
  json(res, 200, stripKeywords(best));
}

async function handleVouchers(_req, res) {
  console.log("  [vouchers] served list");
  json(res, 200, VOUCHERS);
}

async function handleAI(req, res) {
  const raw = (await readBody(req)).toString();
  let parsed = {};
  try { parsed = JSON.parse(raw); } catch { /* ignore */ }

  const task = parsed.task ?? "create_email";
  const instruction = parsed.instruction ?? "";
  const catalog = parsed.context?.catalog ?? [];

  console.log(`  [ai] task="${task}" instruction="${instruction.slice(0, 60)}"`);

  let response;

  if (task === "create_email") {
    // Use catalog samples to build a simple email.
    const wantedTypes = [
      "header.hero",
      "content.headline_body",
      "ecom.product_grid_2col",
      "cta.simple",
      "footer.simple",
    ];
    const actions = [];
    for (const type of wantedTypes) {
      const entry = catalog.find((c) => c.type === type);
      if (entry?.sample) {
        actions.push({ type: "insert_module", module: entry.sample });
      }
    }
    if (actions.length === 0) {
      // Fallback: try any available catalog entries
      for (const entry of catalog.slice(0, 4)) {
        if (entry?.sample) actions.push({ type: "insert_module", module: entry.sample });
      }
    }
    if (actions.length > 0) {
      response = {
        actions,
        text: `✓ Mock AI created a ${actions.length}-block email using your module catalog.`,
      };
    } else {
      response = { text: "⚠ No catalog entries found. Build the project (npm run build) and reload." };
    }
  } else if (task === "rewrite_text") {
    const hint = instruction || "Hello! This is mock-rewritten content.";
    response = { text: `[Mock AI] ${hint}` };
  } else if (task === "generate_subject") {
    const subjects = [
      "✨ Your exclusive offer expires tonight",
      "Don't miss this — last chance to save",
      "We picked these just for you 🎁",
      "Your cart is waiting (and so is your discount)",
      "Flash sale starts now — up to 40% off",
    ];
    response = { text: subjects[Math.floor(Date.now() / 1000) % subjects.length] };
  } else if (task === "generate_preview") {
    const previews = [
      "Take a peek at what we've been saving for you.",
      "This week only — the deals you've been waiting for.",
      "Your personalized picks are ready.",
      "Open for a surprise we think you'll love.",
    ];
    response = { text: previews[Math.floor(Date.now() / 1000) % previews.length] };
  } else if (task === "translate") {
    response = { text: "⚠ Translation requires a real AI backend (set AI_API_KEY)." };
  } else if (task === "adapt_tone") {
    response = { text: "⚠ Tone adaptation requires a real AI backend (set AI_API_KEY)." };
  } else {
    response = { actions: [] };
  }

  json(res, 200, response);
}

// ─────────────────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────────────────

const ROUTES = {
  "POST /api/upload": handleUpload,
  "GET /api/products/search": handleProductSearch,
  "POST /api/products/search": handleProductSearch,
  "GET /api/vouchers": handleVouchers,
  "POST /api/ai/generate": handleAI,
};

const server = http.createServer(async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const routeKey = `${req.method} ${url.pathname}`;

  if (ROUTES[routeKey]) {
    try {
      await ROUTES[routeKey](req, res, url);
    } catch (err) {
      console.error("  [error]", err.message);
      json(res, 500, { error: err.message });
    }
    return;
  }

  // Redirect / → /dev/
  if (url.pathname === "/") {
    res.writeHead(302, { Location: "/dev/" });
    res.end();
    return;
  }

  // Index page for /dev/ (no trailing slash yet) → redirect
  if (url.pathname === "/dev") {
    res.writeHead(302, { Location: "/dev/" });
    res.end();
    return;
  }

  // /dev/ → serve dev/index.html
  if (url.pathname === "/dev/") {
    const indexPath = path.join(ROOT, "dev", "index.html");
    if (fs.existsSync(indexPath)) {
      serveFile(res, indexPath);
      return;
    }
  }

  // Static file serving from project root
  const filePath = path.join(ROOT, url.pathname);
  try {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      serveFile(res, filePath);
      return;
    }
    // Serve index.html for directories
    const indexPath = path.join(filePath, "index.html");
    if (stat.isDirectory() && fs.existsSync(indexPath)) {
      serveFile(res, indexPath);
      return;
    }
  } catch { /* not found */ }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end(`404 Not Found: ${url.pathname}`);
});

server.listen(PORT, () => {
  console.log(`\n  🚀  Email Builder dev server`);
  console.log(`  ┌──────────────────────────────────────────`);
  console.log(`  │  Local:   http://localhost:${PORT}/dev/`);
  console.log(`  │`);
  console.log(`  │  API endpoints:`);
  console.log(`  │    POST /api/upload`);
  console.log(`  │    GET  /api/products/search?q=`);
  console.log(`  │    GET  /api/vouchers`);
  console.log(`  │    POST /api/ai/generate`);
  console.log(`  └──────────────────────────────────────────`);
  console.log(`  Press Ctrl+C to stop\n`);
});
