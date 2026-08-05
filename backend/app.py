"""
Flask HTTP service for the OpenPostcards email builder AI assistant.

    pip install -r requirements.txt
    python app.py                       # offline heuristic mode (no API key)
    AI_API_KEY=sk-... python app.py     # model-backed mode

Endpoints
    GET  /health           -> {"status": "ok", "model": <name>, "mode": "model"|"offline"}
    POST /ai/generate       -> AIResponse   (accepts an AIRequest JSON body)
    GET  /products/search    -> Product      (?q=<query>; single best match, 404 if none)
    POST /products/search    -> Product      ({"query": <query>}; single best match)
    GET  /vouchers           -> [Voucher]    (list of selectable discount codes)

The wire protocol matches src/core/aiActions.ts (AIRequest / AIResponse). The
client provides a module catalog in `context.catalog`; the service replies with
structured `actions` (or a `document`, or `text`) that the editor validates with
Zod and applies. See README.md for the full protocol and security notes.
"""

from __future__ import annotations

import os

from flask import Flask, jsonify, request
from flask_cors import CORS


def _load_dotenv() -> None:
    """Load backend/.env into os.environ if present (no external dependency).

    Existing environment variables always take precedence over the file.
    """
    path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key, value = key.strip(), value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


# Load .env before importing ai_service, which reads config at import time.
_load_dotenv()

import ai_service  # noqa: E402 — must follow _load_dotenv()
import product_service  # noqa: E402
import voucher_service  # noqa: E402

app = Flask(__name__)
# Restrict the origin in production via CORS_ORIGINS (comma-separated).
_origins = os.environ.get("CORS_ORIGINS", "*")
CORS(
    app,
    resources={
        r"/ai/*": {"origins": _origins},
        r"/products/*": {"origins": _origins},
        r"/vouchers": {"origins": _origins},
    },
    max_age=600,
)


@app.get("/health")
def health():
    return jsonify(
        status="ok",
        model=ai_service.MODEL,
        mode="model" if ai_service.API_KEY else "offline",
    )


@app.post("/ai/generate")
def generate():
    req = request.get_json(silent=True)
    if not isinstance(req, dict):
        return jsonify(error="Request body must be a JSON object."), 400
    try:
        return jsonify(ai_service.generate(req))
    except ai_service.AIServiceError as exc:
        return jsonify(error=str(exc)), 422
    except Exception as exc:  # noqa: BLE001 — return a readable message to the client
        app.logger.exception("AI generation failed")
        return jsonify(error=f"Internal error: {exc}"), 500


@app.route("/products/search", methods=["GET", "POST"])
def products_search():
    """Return a single best-matching product for a free-text query.

    Accepts the query as `?q=` (GET) or `{"query": ...}` / `{"q": ...}` (POST).
    Responds with the product object, or 404 `{"error": ...}` when nothing
    matched — both of which the client's default mapping understands.
    """
    if request.method == "GET":
        query = request.args.get("q", "")
    else:
        body = request.get_json(silent=True) or {}
        query = body.get("query") or body.get("q") or ""

    if not isinstance(query, str) or not query.strip():
        return jsonify(error="A non-empty query is required."), 400

    try:
        product = product_service.search(query)
    except Exception as exc:  # noqa: BLE001
        app.logger.exception("Product search failed")
        return jsonify(error=f"Internal error: {exc}"), 500

    if product is None:
        return jsonify(error=f"No product matched '{query}'."), 404
    return jsonify(product)


@app.get("/vouchers")
def vouchers_list():
    """Return the list of vouchers the user can choose from."""
    try:
        return jsonify(voucher_service.list_vouchers())
    except Exception as exc:  # noqa: BLE001
        app.logger.exception("Voucher listing failed")
        return jsonify(error=f"Internal error: {exc}"), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port)
