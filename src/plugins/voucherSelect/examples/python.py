"""Voucher list endpoint — Flask example.

Implements GET /vouchers for the builder's voucherPlugin. Returns a JSON array
of vouchers the user can pick from.

    pip install flask flask-cors
    python python.py

Connect the editor:
    registerPlugin(voucherPlugin({ endpoint: "http://localhost:3001/vouchers" }))

A version wired into the demo app ships in ``backend/voucher_service.py`` +
``backend/app.py``.
"""

from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # restrict origins in production

# Replace this with a real database query.
VOUCHERS = [
    {"id": "voucher_welcome10", "title": "Welcome — 10% off first order", "code": "WELCOME10"},
    {"id": "voucher_save20", "title": "Spring Sale — 20% off", "code": "SAVE20"},
    {"id": "voucher_freeship", "title": "Free shipping over $50", "code": "FREESHIP"},
    # A per-recipient merge tag resolved by your ESP at send time:
    {"id": "voucher_79jq", "title": "VIP personal code", "code": "**|voucher_79jq|**"},
]


@app.get("/vouchers")
def vouchers():
    return jsonify(VOUCHERS)


if __name__ == "__main__":
    app.run(port=3001)
