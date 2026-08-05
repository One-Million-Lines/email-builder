// Package-consumption tests for the BUILT library (dist/), not the source.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const distEsm = resolve(here, "../dist/email-builder.js");
const distCjs = resolve(here, "../dist/email-builder.cjs");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://example.test/",
    pretendToBeVisual: true,
  });
  const w = dom.window;
  globalThis.window = w;
  globalThis.document = w.document;
  globalThis.HTMLElement = w.HTMLElement;
  globalThis.Node = w.Node;
  globalThis.Event = w.Event;
  globalThis.CustomEvent = w.CustomEvent;
  globalThis.getComputedStyle = w.getComputedStyle.bind(w);
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  // localStorage (used by the store's autosave).
  Object.defineProperty(globalThis, "navigator", { value: w.navigator, configurable: true });
  globalThis.localStorage = w.localStorage;
  // jsdom lacks these; dnd-kit / responsive code may reference them.
  if (!w.ResizeObserver) {
    w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
    globalThis.ResizeObserver = w.ResizeObserver;
  }
  if (!w.matchMedia) {
    w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  }
  globalThis.matchMedia = w.matchMedia;
  return dom;
}

test("ESM build exposes the public API", async () => {
  const mod = await import(distEsm);
  for (const name of [
    "EmailBuilder",
    "createEmailBuilder",
    "renderEmailHtml",
    "documentSchema",
    "templateRegistry",
    "registerPlugin",
    "imageUploaderPlugin",
    "aiAssistantPlugin",
    "buildCatalog",
    "applyAIResponse",
    "productSearchPlugin",
    "createProductSearchProvider",
    "voucherPlugin",
    "createVoucherProvider",
    "isVoucherAware",
  ]) {
    assert.ok(mod[name], `missing export: ${name}`);
  }
});

test("CommonJS build is requireable", () => {
  const require = createRequire(import.meta.url);
  const mod = require(distCjs);
  assert.equal(typeof mod.EmailBuilder, "function");
  assert.equal(typeof mod.createEmailBuilder, "function");
});

test("importing the package does not require browser globals (SSR-safe)", () => {
  // The builds were imported above with NO window/document defined. Reaching
  // this assertion proves module evaluation did not touch browser globals.
  assert.equal(typeof globalThis.window, "undefined");
});

test("renderEmailHtml turns a template document into HTML (pure, no DOM)", async () => {
  const { renderEmailHtml, templateRegistry, documentSchema } = await import(distEsm);
  assert.equal(typeof documentSchema.safeParse, "function", "documentSchema is a usable Zod schema");
  const tpl = templateRegistry.list()[0];
  assert.ok(tpl, "at least one template registered on import");
  const doc = tpl.build();
  const html = renderEmailHtml(doc);
  assert.equal(typeof html, "string");
  assert.match(html, /<table|<html|<!doctype/i);
});

test("createEmailBuilder mounts a React editor and unmounts cleanly", async () => {
  installDom();
  const { createEmailBuilder, templateRegistry } = await import(distEsm);
  const container = document.createElement("div");
  document.body.appendChild(container);

  const doc = templateRegistry.list()[0].build();
  let changed = 0;
  const instance = createEmailBuilder({
    container,
    initialDocument: doc,
    onChange: () => changed++,
  });
  await sleep(250);

  assert.ok(container.children.length > 0, "editor rendered DOM into container");
  const live = instance.getDocument();
  assert.equal(typeof live.version, "string");
  assert.equal(typeof instance.exportHtml(), "string");
  assert.match(instance.exportJson(), /\{/);

  instance.destroy();
  await sleep(80);
  assert.equal(container.children.length, 0, "destroy() unmounts and clears the container");
});

test("multiple instances coexist and clean up independently", async () => {
  installDom();
  const { createEmailBuilder } = await import(distEsm);
  const a = document.createElement("div");
  const b = document.createElement("div");
  document.body.append(a, b);

  const i1 = createEmailBuilder({ container: a });
  const i2 = createEmailBuilder({ container: b });
  await sleep(250);
  assert.ok(a.children.length > 0);
  assert.ok(b.children.length > 0);

  i1.destroy();
  await sleep(80);
  assert.equal(a.children.length, 0, "first instance cleaned up");
  assert.ok(b.children.length > 0, "second instance still mounted");
  i2.destroy();
});

test("shipped stylesheet is non-empty and includes utilities", () => {
  const css = readFileSync(resolve(here, "../dist/styles.css"), "utf8");
  assert.ok(css.length > 0);
  assert.match(css, /\.flex|\.grid|contenteditable/);
});

test("buildCatalog includes all registered modules with renderable samples", async () => {
  const { buildCatalog } = await import(distEsm);
  const catalog = buildCatalog();
  assert.ok(catalog.length > 0, "catalog has entries");
  // Every entry ships a concrete, renderable sample.
  for (const e of catalog) assert.ok(Array.isArray(e.sample.children), "sample has children");
  // Feature modules should be present.
  const feature = catalog.filter((e) => e.category === "feature");
  assert.ok(feature.length > 0, "feature modules present in catalog");
});

test("applyAIResponse validates, regenerates ids, and applies actions", async () => {
  const { templateRegistry, applyAIResponse, documentSchema } = await import(distEsm);
  const doc = templateRegistry.list()[0].build();
  const before = doc.modules.length;
  const sample = doc.modules[0];
  const res = {
    actions: [{ type: "insert_module", index: 0, module: sample }],
    text: "added a block",
  };
  const out = applyAIResponse(doc, res);
  assert.ok(out.ok, "response applied");
  assert.equal(out.result.document.modules.length, before + 1, "module inserted");
  // Inserted module gets a fresh id (no collision with the source module).
  assert.notEqual(out.result.document.modules[0].id, sample.id);
  assert.ok(documentSchema.safeParse(out.result.document).success, "result is valid");
});

test("applyAIResponse rejects an invalid document", async () => {
  const { applyAIResponse, templateRegistry } = await import(distEsm);
  const doc = templateRegistry.list()[0].build();
  const bad = applyAIResponse(doc, { document: { version: "1.0" } });
  assert.equal(bad.ok, false, "invalid document is rejected");
});

test("product search provider maps a backend response to a product", async () => {
  const { createProductSearchProvider } = await import(distEsm);

  const captured = {};
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    captured.url = String(url);
    return {
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          name: "Linen Tote Bag",
          final_price: "$39.00",
          old_price: "$59.00",
          description: "Heavyweight natural linen.",
          image_url: "https://img.test/tote.png",
          link: "https://shop.test/tote",
          rating: 4.5,
          sku: "TOTE-01",
        }),
    };
  };

  try {
    const provider = createProductSearchProvider({ endpoint: "https://api.test/products/search" });
    const result = await provider.search("linen tote");
    assert.equal(result.name, "Linen Tote Bag");
    assert.equal(result.finalPrice, "$39.00");
    assert.equal(result.oldPrice, "$59.00");
    assert.equal(result.image, "https://img.test/tote.png");
    assert.equal(result.link, "https://shop.test/tote");
    assert.equal(result.stars, 4.5);
    assert.match(captured.url, /[?&]q=linen(\+|%20)tote/, "query sent as ?q=");

    // Empty query short-circuits without a request.
    assert.equal(await provider.search("   "), null);
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("renderEmailHtml renders star glyphs when a grid shows stars", async () => {
  const { renderEmailHtml, templateRegistry } = await import(distEsm);
  // Find a template that contains a product grid.
  let doc, grid;
  for (const tpl of templateRegistry.list()) {
    const d = tpl.build();
    for (const m of d.modules) {
      const g = m.children.find((c) => c.type === "productGrid");
      if (g) {
        doc = d;
        grid = g;
        break;
      }
    }
    if (grid) break;
  }
  assert.ok(grid, "found a product grid template");
  grid.showStars = true;
  grid.products[0].stars = 4;
  const html = renderEmailHtml(doc);
  assert.match(html, /★/, "rendered HTML contains filled star glyphs");
});

test("voucher provider maps a backend list to vouchers", async () => {
  const { createVoucherProvider } = await import(distEsm);
  const prevFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        vouchers: [
          { id: "v1", title: "Welcome 10%", voucher_code: "WELCOME10" },
          { name: "Free shipping", code: "FREESHIP" },
          { coupon: "SAVE20" }, // title + id fall back to the code
        ],
      }),
  });
  try {
    const provider = createVoucherProvider({ endpoint: "https://api.test/vouchers" });
    const list = await provider.list();
    assert.equal(list.length, 3);
    assert.equal(list[0].code, "WELCOME10");
    assert.equal(list[0].title, "Welcome 10%");
    assert.equal(list[1].code, "FREESHIP");
    assert.equal(list[1].title, "Free shipping");
    assert.equal(list[2].code, "SAVE20");
    assert.equal(list[2].title, "SAVE20");
  } finally {
    globalThis.fetch = prevFetch;
  }
});

test("ecom.voucher module is registered and voucher-aware", async () => {
  const { buildCatalog, isVoucherAware } = await import(distEsm);
  const entry = buildCatalog().find((e) => e.type === "ecom.voucher");
  assert.ok(entry, "voucher module registered");
  assert.ok(isVoucherAware(entry.sample), "voucher module is voucher-aware");
  const code = entry.sample.children.find((c) => c.role === "voucherCode");
  assert.ok(code, "has a voucherCode text element");
});
