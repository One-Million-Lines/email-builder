"""Product search endpoint — Flask example.

Implements GET|POST /products/search for the builder's productSearchPlugin.
Returns a single best-matching product; 404 when nothing matches.

    pip install flask flask-cors
    python python.py

Connect the editor:
    registerPlugin(productSearchPlugin({ endpoint: "http://localhost:3001/products/search" }))

A fuller version (with SKU matching and token scoring) ships in
``backend/product_service.py`` + ``backend/app.py``.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # restrict origins in production

# Replace this with a real database / search query.
CATALOG = [
    {
        "sku": "TOTE-LIN-01",
        "name": "Linen Tote Bag",
        "final_price": "$39.00",
        "old_price": "$59.00",
        "description": "Heavyweight natural linen, made in Portugal.",
        "link": "https://example.com/products/linen-tote-bag",
        "image": "https://placehold.co/560x400?text=Linen+Tote",
        "stars": 4.5,
        "keywords": ["tote", "bag", "linen"],
    },
    {
        "sku": "MUG-CER-02",
        "name": "Ceramic Mug",
        "final_price": "$24.00",
        "description": "Stoneware mug with a matte reactive glaze.",
        "link": "https://example.com/products/ceramic-mug",
        "image": "https://placehold.co/560x400?text=Ceramic+Mug",
        "stars": 4,
        "keywords": ["mug", "cup", "coffee", "tea"],
    },
]


def _score(product, q):
    if product["sku"].lower() == q:
        return 100
    name = product["name"].lower()
    if name == q:
        return 60
    if q in name:
        return 40
    return sum(10 for k in product["keywords"] if k in q or q in k)


def search(query):
    q = (query or "").strip().lower()
    if not q:
        return None
    best = max(CATALOG, key=lambda p: _score(p, q))
    if _score(best, q) <= 0:
        return None
    return {k: v for k, v in best.items() if k != "keywords"}


@app.route("/products/search", methods=["GET", "POST"])
def products_search():
    if request.method == "GET":
        query = request.args.get("q", "")
    else:
        body = request.get_json(silent=True) or {}
        query = body.get("query") or body.get("q") or ""
    if not query.strip():
        return jsonify(error="A non-empty query is required."), 400
    product = search(query)
    if product is None:
        return jsonify(error=f"No product matched '{query}'."), 404
    return jsonify(product)


if __name__ == "__main__":
    app.run(port=3001)
