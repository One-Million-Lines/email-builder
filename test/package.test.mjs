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
