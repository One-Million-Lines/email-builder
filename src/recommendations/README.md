# Recommendations Plugin

The recommendations module ports the Vibetrace logic-builder concept into the
email builder. It lets you configure **which products** to show in a
`productGrid` element — via a ranked algorithm stack, fallback strategy,
product filters, and manual overrides — without touching the email template.

---

## Activation

The panel is **opt-in**. It is hidden by default and only appears when your
host application explicitly enables it.

### React prop

```tsx
<EmailBuilder enableRecommendations />
```

### Plugin registration

```ts
import { registerPlugin, recommendationsPlugin } from "@one-million-lines/email-builder";
registerPlugin(recommendationsPlugin);
```

### Builder handle (advanced)

```ts
import { builder } from "@one-million-lines/email-builder";
builder.registerRecommendationsPlugin();
```

---

## Where the data lives

Recommendations logic is stored as free-form JSON on the `EmailModule.data`
field under the key `"recommendations"`:

```json
{
  "id": "module_abc123",
  "type": "ecom.featured_grid",
  "name": "Featured products",
  "children": [...],
  "data": {
    "recommendations": {
      "mode": "recommender",
      "noProducts": 3,
      "stack": [
        { "algorithm": "abandoned-cart" },
        { "algorithm": "bestseller-units", "params": { "days": 7 } }
      ],
      "fallback": "smart-reccs",
      "filters": {
        "includeProducts": [],
        "excludeProducts": [],
        "includeCategories": ["shoes"],
        "excludeCategories": [],
        "minStock": 1,
        "minPrice": 0,
        "mainOnly": false,
        "salesPrice": false,
        "sameCategory": false,
        "matchTitle": false,
        "sameField": ""
      },
      "manualProducts": [],
      "sourceFeed": ""
    }
  }
}
```

The `data` field is preserved verbatim in exported JSON/HTML, so your backend
processor can read it during email personalisation.

---

## RecommendationsLogic schema

```ts
interface RecommendationsLogic {
  /** "recommender" uses the algorithm stack; "manual" uses manualProducts. */
  mode: "manual" | "recommender";

  /** Total product slots to fill. */
  noProducts: number;

  /** Source feed id (optional, used by some backends). */
  sourceFeed?: string;

  /** Explicitly-picked product IDs (mode === "manual"). */
  manualProducts: string[];

  /**
   * Ordered algorithm stack (max 3). The engine tries each entry in order
   * until enough products are found.
   */
  stack: Array<{
    algorithm: string;             // algorithm id from ALGORITHMS catalog
    params?: Record<string, string | number | boolean>;
  }>;

  /** Strategy when all stack entries return fewer products than noProducts. */
  fallback: "smart-reccs" | "random" | "ignore" | "stop";

  filters: RecommendationFilters;
}

interface RecommendationFilters {
  includeProducts:   string[];   // product IDs / SKUs to boost / force-include
  excludeProducts:   string[];   // product IDs / SKUs to exclude
  includeCategories: string[];
  excludeCategories: string[];
  minStock?:    number;
  minPrice?:    number;
  mainOnly?:    boolean;          // only main/parent variants
  higherPrice?: boolean;
  salesPrice?:  boolean;          // only items currently on sale
  sameCategory?: boolean;         // contextual: same category as trigger product
  matchTitle?:  boolean;
  sameField?:   string;           // comma-separated attribute keys, e.g. "brand,color"
  advanced?:    Record<string, unknown>; // backend-specific overrides
}
```

---

## Algorithm catalog

Exported as `ALGORITHMS` (array) and `ALGORITHM_BY_ID` (keyed object).

| ID | Label | Group |
|---|---|---|
| `abandoned-cart` | Abandoned basket products | behavioral |
| `bestseller-conversion` | Best seller by Conversion | catalog |
| `bestseller-units` | Best seller by Units | catalog |
| `new-products` | New items added | catalog |
| `cross-sell` | Products Cross-Sell | contextual |
| `upsell` | Products Upsell | contextual |
| `viewed-categories` | Items from viewed categories | behavioral |
| `viewed-items` | Items viewed | behavioral |
| `similar-basket` | Similar to basket items | behavioral |
| `bought-together` | Items bought together | contextual |
| `best-discount` | Items with the best discount | catalog |
| `match-data` | Items matching specific attributes | catalog |
| `last-purchased` | Last purchased items | personal |
| `similar-to-purchased` | Similar to last purchase | personal |
| `cross-sell-purchased` | Cross-sell to last purchase | personal |
| `similar-items` | Similar items | contextual |

---

## Reading logic in your backend processor

```ts
import { readRecommendationsLogic } from "@one-million-lines/email-builder";

// doc is an EmailDocument parsed from the editor JSON export
for (const mod of doc.modules) {
  const logic = readRecommendationsLogic(mod.data);
  if (!logic) continue;

  // Call your recommendations engine with the logic parameters
  const products = await myEngine.resolve(logic);
  // Replace the productGrid element in the module with real products
}
```

---

## Backend interop — legacy shape

`toLegacyShape()` (exported as `recommendationsToLegacyShape`) converts a
`RecommendationsLogic` object to the shape expected by the original Vibetrace
API:

```ts
import { recommendationsToLegacyShape, readRecommendationsLogic } from "@one-million-lines/email-builder";

const logic = readRecommendationsLogic(mod.data);
if (logic) {
  const payload = recommendationsToLegacyShape(logic);
  await fetch("/api/recommendations", { method: "POST", body: JSON.stringify(payload) });
}
```

---

## Trigger detection

A module is considered "product-aware" (and therefore eligible for the
recommendations panel) when it contains at least one `productGrid` child
element. This is determined by `isProductAware(module)` from `logic.ts`.

```ts
import { isProductAware } from "@one-million-lines/email-builder";
// true when any m.children has type === "productGrid"
```

---

## Data lifecycle

```
Editor JSON export
  └── module.data.recommendations  ← written by the Recommendations panel
        │
        ▼
Backend processor reads doc JSON
  └── readRecommendationsLogic(module.data)
        │
        ▼
Engine resolves products
  └── productGrid elements updated with real product data
        │
        ▼
HTML rendered and sent
```
