// Product search endpoint — Node.js + Express example.
//
// Implements GET|POST /products/search for the builder's productSearchPlugin.
// Returns a single best-matching product; 404 when nothing matches.
//
//   npm i express cors
//   node nodejs.js
//
// Connect the editor:
//   registerPlugin(productSearchPlugin({ endpoint: "http://localhost:3001/products/search" }));

import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // restrict `origin` in production
app.use(express.json());

// Replace this with a real database / search query.
const CATALOG = [
  {
    sku: "TOTE-LIN-01",
    name: "Linen Tote Bag",
    final_price: "$39.00",
    old_price: "$59.00",
    description: "Heavyweight natural linen, made in Portugal.",
    link: "https://example.com/products/linen-tote-bag",
    image: "https://placehold.co/560x400?text=Linen+Tote",
    stars: 4.5,
    keywords: ["tote", "bag", "linen"],
  },
  {
    sku: "MUG-CER-02",
    name: "Ceramic Mug",
    final_price: "$24.00",
    description: "Stoneware mug with a matte reactive glaze.",
    link: "https://example.com/products/ceramic-mug",
    image: "https://placehold.co/560x400?text=Ceramic+Mug",
    stars: 4,
    keywords: ["mug", "cup", "coffee", "tea"],
  },
];

function search(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return null;
  const score = (p) => {
    if (p.sku.toLowerCase() === q) return 100;
    if (p.name.toLowerCase() === q) return 60;
    if (p.name.toLowerCase().includes(q)) return 40;
    return p.keywords.reduce((s, k) => s + (q.includes(k) || k.includes(q) ? 10 : 0), 0);
  };
  const best = [...CATALOG].sort((a, b) => score(b) - score(a))[0];
  if (!best || score(best) <= 0) return null;
  const { keywords, ...pub } = best; // strip internal fields
  return pub;
}

app.all("/products/search", (req, res) => {
  const query = req.method === "GET" ? req.query.q : req.body?.query ?? req.body?.q;
  if (!query || !String(query).trim()) {
    return res.status(400).json({ error: "A non-empty query is required." });
  }
  const product = search(query);
  if (!product) return res.status(404).json({ error: `No product matched '${query}'.` });
  res.json(product);
});

app.listen(3001, () => console.log("Product search on http://localhost:3001/products/search"));
