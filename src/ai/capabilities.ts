// Capability surface shared with the AI backend (and MCP agents).
//
// `buildCatalog()` only describes the available *modules*. To let the AI act like
// a human editor it needs the whole picture: which element types exist and their
// editable fields, the themes it can apply, the email settings it can change
// (width, background colours), the merge tags and special links it can insert, the
// recommendation algorithms and product feeds it can pull real products from, and
// the structured actions it is allowed to emit. `buildCapabilities()` assembles
// all of that into one JSON object that travels in `AIRequest.context.capabilities`.
//
// Nothing here is model-specific: the same payload is consumed by the Python
// backend and advertised through the MCP tool manifest (see `mcp.ts`).

import { buildCatalog, type CatalogEntry } from "./catalog";
import { getProductFeeds, DEFAULT_PRODUCT_FEEDS, type ProductFeed } from "./productFeeds";
import { useEmailStore } from "../store/emailStore";
import { useMergeTagsStore } from "../plugins/mergeTags/state";
import { useRecommendationsStore } from "../plugins/recommendations/state";
import {
  ALGORITHMS,
  FALLBACK_OPTIONS,
  MAX_STACK,
} from "../plugins/recommendations/logic";
import { SPECIAL_LINK_PLACEHOLDERS, type MergeTag, type Theme } from "../core/types";

/** One editable element type and the fields the AI may set on it. */
export interface ElementCapability {
  type: string;
  description: string;
  /** Editable top-level fields (besides `id`/`type`). */
  fields: string[];
  /** Editable `style.*` fields. */
  styleFields?: string[];
}

/** A single supported structured action the AI may emit. */
export interface ActionCapability {
  type: string;
  description: string;
}

/** A compact theme descriptor (tokens only, no helpers). */
export interface ThemeCapability {
  id: string;
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

export interface CapabilitiesContext {
  /** Extra product feeds to advertise (merged with the configured/default set). */
  productFeeds?: ProductFeed[];
}

export interface Capabilities {
  /** Schema version of this capability payload. */
  version: string;
  /** Every available module, with a concrete renderable sample. */
  modules: CatalogEntry[];
  /** Editable element types and their fields. */
  elements: ElementCapability[];
  /** Themes the AI may apply (`apply_theme`). */
  themes: ThemeCapability[];
  /** Current email-level settings + their editable schema. */
  settings: {
    current: Record<string, unknown>;
    schema: {
      width: string;
      backgroundColor: string;
      contentBackgroundColor: string;
    };
  };
  /** Personalisation tokens available to insert into text. */
  mergeTags: MergeTag[];
  /** Well-known system links the AI can attach to buttons / links. */
  specialLinks: Array<{ type: string; placeholder: string }>;
  /** Product recommendation engine surface (algorithms, fallbacks, feeds). */
  recommendations: {
    enabled: boolean;
    maxStack: number;
    algorithms: Array<{ id: string; label: string; group?: string }>;
    fallbacks: Array<{ value: string; label: string }>;
    feeds: Array<{ id: string; title: string }>;
  };
  /** Named, backend-resolved product sources (top purchased, most viewed…). */
  productFeeds: ProductFeed[];
  /** The structured actions the AI is allowed to emit, in a readable form. */
  actions: ActionCapability[];
}

const ELEMENTS: ElementCapability[] = [
  {
    type: "text",
    description:
      "Rich text with an optional semantic role (headline, subheadline, body, caption). May contain limited inline HTML (b, i, a).",
    fields: ["role", "content"],
    styleFields: [
      "fontFamily", "fontSize", "lineHeight", "letterSpacing", "fontWeight",
      "color", "link", "linkType", "align", "backgroundColor",
      "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
    ],
  },
  {
    type: "image",
    description: "An image with alt text and an optional link.",
    fields: ["src", "alt", "link", "linkType"],
    styleFields: ["width", "height", "align", "borderRadius",
      "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"],
  },
  {
    type: "button",
    description: "A call-to-action button with a label and link.",
    fields: ["label", "link", "linkType"],
    styleFields: ["backgroundColor", "color", "fontSize", "fontFamily",
      "fontWeight", "borderRadius", "align",
      "paddingTop", "paddingBottom", "paddingLeft", "paddingRight"],
  },
  { type: "spacer", description: "Vertical spacing.", fields: ["height"] },
  {
    type: "divider",
    description: "A horizontal rule.",
    fields: [],
    styleFields: ["color", "thickness", "paddingTop", "paddingBottom"],
  },
  {
    type: "productGrid",
    description:
      "A grid of product cards (1–3 columns). Fill `products` with real items from a product feed; each product has name, image, finalPrice, optional oldPrice/description/link/stars.",
    fields: ["products", "columns", "showOldPrice", "showButton",
      "showDescription", "showStars", "buttonLabel"],
    styleFields: ["nameColor", "finalPriceColor", "oldPriceColor",
      "buttonBackgroundColor", "buttonColor", "gap", "cardBackgroundColor",
      "borderRadius", "align"],
  },
];

const ACTIONS: ActionCapability[] = [
  { type: "update_meta", description: "Change the email name / preview text." },
  { type: "update_settings", description: "Change width or background colours." },
  { type: "apply_theme", description: "Apply one of the available themes." },
  { type: "insert_module", description: "Insert a module (from the catalog) at an index." },
  { type: "delete_module", description: "Remove a module by id." },
  { type: "update_module", description: "Patch a module's name, style or data." },
  { type: "move_module", description: "Reorder a module to a new index." },
  { type: "duplicate_module", description: "Duplicate a module (fresh ids)." },
  { type: "update_element", description: "Patch an element's content / fields / style." },
  { type: "set_recommendations", description: "Attach recommendation logic to a product module." },
];

function toThemeCapability(t: Theme): ThemeCapability {
  return {
    id: t.id,
    name: t.name,
    colors: t.tokens.colors,
    fonts: t.tokens.fonts,
  };
}

/**
 * Build the full capability surface advertised to the AI backend. Reads live
 * state from the editor stores so the AI always sees the current themes,
 * settings, merge tags and feeds.
 */
export function buildCapabilities(ctx: CapabilitiesContext = {}): Capabilities {
  const store = useEmailStore.getState();
  const mergeTags = useMergeTagsStore.getState().mergeTags;
  const rec = useRecommendationsStore.getState();

  const configuredFeeds = getProductFeeds();
  const extra = ctx.productFeeds ?? [];
  // Prefer explicitly configured feeds; fall back to defaults so the AI always
  // has something to pull products from. De-dupe by id (extra wins).
  const byId = new Map<string, ProductFeed>();
  for (const f of (configuredFeeds.length ? configuredFeeds : DEFAULT_PRODUCT_FEEDS)) {
    byId.set(f.id, f);
  }
  for (const f of extra) byId.set(f.id, f);

  return {
    version: "1.0",
    modules: buildCatalog(),
    elements: ELEMENTS,
    themes: store.themes.map(toThemeCapability),
    settings: {
      current: store.doc.settings as unknown as Record<string, unknown>,
      schema: {
        width: "number — content width in px (typically 480–700).",
        backgroundColor: "hex or {colors.*} token — outer email background.",
        contentBackgroundColor: "hex or {colors.*} token — inner content background.",
      },
    },
    mergeTags,
    specialLinks: Object.entries(SPECIAL_LINK_PLACEHOLDERS).map(
      ([type, placeholder]) => ({ type, placeholder })
    ),
    recommendations: {
      enabled: rec.enabled,
      maxStack: MAX_STACK,
      algorithms: ALGORITHMS.map((a) => ({ id: a.id, label: a.label, group: a.group })),
      fallbacks: FALLBACK_OPTIONS.map((f) => ({ value: f.value, label: f.label })),
      feeds: rec.feeds,
    },
    productFeeds: Array.from(byId.values()),
    actions: ACTIONS,
  };
}
