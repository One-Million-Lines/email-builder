// Tests for the core AI assistant surface (capabilities, MCP, actions) added in
// 0.10.0. Runs against the BUILT library (dist/), like package.test.mjs.
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const distEsm = resolve(here, "../dist/email-builder.js");

test("ESM build exposes the core AI surface", async () => {
  const mod = await import(distEsm);
  for (const name of [
    "buildCapabilities",
    "buildCatalog",
    "AI_MCP_TOOLS",
    "buildMcpManifest",
    "DEFAULT_PRODUCT_FEEDS",
    "getProductFeeds",
    "setProductFeeds",
    "applyAIActions",
    "validateAIDocument",
    "mockAIProvider",
  ]) {
    assert.ok(mod[name] !== undefined, `missing export: ${name}`);
  }
});

test("buildCapabilities describes the full editor surface", async () => {
  const { buildCapabilities } = await import(distEsm);
  const caps = buildCapabilities();
  assert.ok(Array.isArray(caps.modules) && caps.modules.length > 0, "modules present");
  assert.ok(caps.modules[0].sample, "module entries carry a concrete sample");
  assert.ok(caps.elements.some((e) => e.type === "productGrid"), "productGrid element advertised");
  assert.ok(caps.elements.some((e) => e.type === "text"), "text element advertised");
  assert.ok(Array.isArray(caps.themes) && caps.themes.length > 0, "themes present");
  assert.ok(caps.settings.schema.width, "settings schema describes width");
  assert.ok(Array.isArray(caps.recommendations.algorithms), "recommendation algorithms present");
  assert.ok(caps.specialLinks.some((l) => l.type === "unsubscribe"), "special links present");
  const actionTypes = caps.actions.map((a) => a.type);
  for (const t of ["insert_module", "move_module", "duplicate_module", "set_recommendations"]) {
    assert.ok(actionTypes.includes(t), `action advertised: ${t}`);
  }
});

test("product feeds default and are configurable", async () => {
  const { DEFAULT_PRODUCT_FEEDS, setProductFeeds, getProductFeeds, buildCapabilities } =
    await import(distEsm);
  assert.ok(DEFAULT_PRODUCT_FEEDS.some((f) => f.id === "top_purchased"), "top_purchased default");
  assert.ok(DEFAULT_PRODUCT_FEEDS.some((f) => f.id === "most_viewed"), "most_viewed default");

  setProductFeeds([{ id: "vip", name: "VIP picks", description: "hand picked" }]);
  assert.equal(getProductFeeds().length, 1);
  const caps = buildCapabilities();
  assert.ok(caps.productFeeds.some((f) => f.id === "vip"), "configured feed surfaces in capabilities");
  setProductFeeds([]); // reset for other tests
});

test("MCP manifest wraps tools + live capabilities", async () => {
  const { AI_MCP_TOOLS, buildMcpManifest, buildCapabilities } = await import(distEsm);
  const names = AI_MCP_TOOLS.map((t) => t.name);
  for (const n of ["email_generate", "email_insert_products", "email_apply_theme", "email_list_capabilities"]) {
    assert.ok(names.includes(n), `MCP tool present: ${n}`);
  }
  for (const t of AI_MCP_TOOLS) {
    assert.equal(t.inputSchema.type, "object", `${t.name} has an object input schema`);
  }
  const manifest = buildMcpManifest(buildCapabilities());
  assert.equal(manifest.name, "email-builder");
  assert.ok(manifest.tools.length === AI_MCP_TOOLS.length, "manifest carries the tools");
  assert.ok(manifest.capabilities.modules.length > 0, "manifest embeds capabilities");
});

test("applyAIActions supports move, duplicate and recommendations", async () => {
  const { applyAIActions, validateAIDocument, templateRegistry } = await import(distEsm);
  const doc = templateRegistry.list()[0].build();
  assert.ok(doc.modules.length >= 2, "template has at least two modules");

  // move: send the first module to the end.
  const firstId = doc.modules[0].id;
  const moved = applyAIActions(doc, [{ type: "move_module", moduleId: firstId, toIndex: doc.modules.length - 1 }]);
  assert.equal(moved.modules[moved.modules.length - 1].id, firstId, "module moved to end");
  assert.equal(moved.modules.length, doc.modules.length, "move does not change count");

  // duplicate: clone gets a fresh id and sits right after the original.
  const dup = applyAIActions(doc, [{ type: "duplicate_module", moduleId: firstId }]);
  assert.equal(dup.modules.length, doc.modules.length + 1, "duplicate adds one module");
  assert.notEqual(dup.modules[1].id, dup.modules[0].id, "clone has a fresh id");
  assert.ok(validateAIDocument(JSON.parse(JSON.stringify(dup))).ok, "duplicated doc is valid");

  // set_recommendations: attaches logic under module.data.recommendations.
  const rec = applyAIActions(doc, [{ type: "set_recommendations", moduleId: firstId, logic: { mode: "recommender" } }]);
  assert.equal(rec.modules[0].data.recommendations.mode, "recommender", "recommendation logic attached");
});
