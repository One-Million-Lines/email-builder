"""
Voucher list service for the OpenPostcards email builder.

A tiny, dependency-free demo backend for the builder's voucher-select dropdown.
Exposes a `list()` function returning the vouchers/discount codes a user can pick
from. The wire shape matches the client's default mapping
(`src/plugins/voucherSelect`), which accepts snake_case field names:

    {
      "id":          str,   # stable identifier
      "title":       str,   # label shown in the dropdown
      "code":        str,   # code (or merge tag) inserted into the block
      "description": str    # optional
    }

Swap `VOUCHERS` for a real database query in production.
"""

from __future__ import annotations

from typing import Any


# --------------------------------------------------------------------------- #
# Demo vouchers. Replace with your own source in production.
# --------------------------------------------------------------------------- #

VOUCHERS: list[dict[str, Any]] = [
    {
        "id": "voucher_welcome10",
        "title": "Welcome — 10% off first order",
        "code": "WELCOME10",
        "description": "10% off for new subscribers.",
    },
    {
        "id": "voucher_save20",
        "title": "Spring Sale — 20% off",
        "code": "SAVE20",
        "description": "20% off sitewide during the spring sale.",
    },
    {
        "id": "voucher_freeship",
        "title": "Free shipping over $50",
        "code": "FREESHIP",
        "description": "Free standard shipping on orders over $50.",
    },
    {
        "id": "voucher_79jq",
        "title": "VIP personal code",
        # Personalized per-recipient merge tag resolved by your ESP at send time.
        "code": "**|voucher_79jq|**",
        "description": "Unique per-recipient code injected at send time.",
    },
]


def list_vouchers() -> list[dict[str, Any]]:
    """Return the vouchers a user can choose from."""
    return VOUCHERS
