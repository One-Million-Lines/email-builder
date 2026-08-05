"""
Product search service for the OpenPostcards email builder.

A tiny, dependency-free demo backend for the builder's product-search modal.
It exposes a single `search(query)` function over an in-memory catalog and
returns **one** best-matching product as a plain dict.

The wire shape matches the client's default response mapping
(`src/plugins/productSearch`), which accepts snake_case field names:

    {
      "name":        str,   # product title
      "final_price": str,   # current price, e.g. "$39.00"
      "old_price":   str,   # optional pre-discount price
      "description": str,   # optional short description
      "link":        str,   # optional product URL
      "image":       str,   # optional image URL
      "stars":       float, # optional 0-5 rating
      "sku":         str    # optional identifier
    }

Swap `CATALOG` for a real database/search query in production. Returning
`None` (→ HTTP 404 handled by the caller) signals "no match".
"""

from __future__ import annotations

from typing import Any, Optional


# --------------------------------------------------------------------------- #
# Demo catalog. Replace with your own product source in production.
# --------------------------------------------------------------------------- #

CATALOG: list[dict[str, Any]] = [
    {
        "sku": "TOTE-LIN-01",
        "name": "Linen Tote Bag",
        "final_price": "$39.00",
        "old_price": "$59.00",
        "description": "Heavyweight natural linen, made in Portugal.",
        "link": "https://example.com/products/linen-tote-bag",
        "image": "https://placehold.co/560x400?text=Linen+Tote",
        "stars": 4.5,
        "keywords": ["tote", "bag", "linen", "canvas"],
    },
    {
        "sku": "MUG-CER-02",
        "name": "Ceramic Mug",
        "final_price": "$24.00",
        "description": "Stoneware mug with a matte reactive glaze. 350ml.",
        "link": "https://example.com/products/ceramic-mug",
        "image": "https://placehold.co/560x400?text=Ceramic+Mug",
        "stars": 4.0,
        "keywords": ["mug", "cup", "ceramic", "coffee", "tea"],
    },
    {
        "sku": "LAMP-BR-03",
        "name": "Brass Table Lamp",
        "final_price": "$129.00",
        "old_price": "$149.00",
        "description": "Solid brass base with a linen shade. Dimmable.",
        "link": "https://example.com/products/brass-table-lamp",
        "image": "https://placehold.co/560x400?text=Brass+Lamp",
        "stars": 5.0,
        "keywords": ["lamp", "light", "brass", "lighting", "table"],
    },
    {
        "sku": "SKIL-CI-04",
        "name": "Cast Iron Skillet",
        "final_price": "$89.00",
        "old_price": "$119.00",
        "description": "Pre-seasoned, lifetime-guarantee. Made in USA.",
        "link": "https://example.com/products/cast-iron-skillet",
        "image": "https://placehold.co/560x400?text=Skillet",
        "stars": 4.5,
        "keywords": ["skillet", "pan", "cast iron", "cook", "kitchen"],
    },
]


def _score(product: dict[str, Any], query: str) -> int:
    """Very small relevance score: exact SKU > name match > keyword match."""
    q = query.strip().lower()
    if not q:
        return 0
    if product.get("sku", "").lower() == q:
        return 100
    name = product.get("name", "").lower()
    score = 0
    if q == name:
        score += 60
    elif q in name:
        score += 40
    elif name in q:
        score += 20
    for kw in product.get("keywords", []):
        if kw in q or q in kw:
            score += 10
    # Token overlap between the query and the product name.
    name_tokens = set(name.split())
    query_tokens = set(q.split())
    score += 3 * len(name_tokens & query_tokens)
    return score


def _public(product: dict[str, Any]) -> dict[str, Any]:
    """Strip internal fields (e.g. `keywords`) before sending to the client."""
    return {k: v for k, v in product.items() if k != "keywords"}


def search(query: str) -> Optional[dict[str, Any]]:
    """Return the single best-matching product for `query`, or None."""
    if not query or not query.strip():
        return None
    ranked = sorted(CATALOG, key=lambda p: _score(p, query), reverse=True)
    best = ranked[0]
    if _score(best, query) <= 0:
        return None
    return _public(best)
