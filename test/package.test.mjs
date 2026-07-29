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
    "galleryPlugin",
    "galleryRegistry",
    "sampleGallery",
    "aiAssistantPlugin",
    "buildCatalog",
    "applyAIResponse",
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

test("gallery items surface in the catalog on top", async () => {
  const { galleryRegistry, buildCatalog, sampleGallery } = await import(distEsm);
  galleryRegistry.registerGallery(sampleGallery);
  const catalog = buildCatalog();
  const gallery = catalog.filter((e) => e.source === "gallery");
  assert.ok(gallery.length > 0, "gallery entries present in catalog");
  // Gallery entries are listed first so the AI prefers fresh styles.
  assert.equal(catalog[0].source, "gallery");
  // Every entry ships a concrete, renderable sample.
  for (const e of catalog) assert.ok(Array.isArray(e.sample.children), "sample has children");
  galleryRegistry.removeGallery(sampleGallery.id);
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
