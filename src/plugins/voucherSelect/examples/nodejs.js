// Voucher list endpoint — Node.js + Express example.
//
// Implements GET /vouchers for the builder's voucherPlugin. Returns a JSON
// array of vouchers the user can pick from.
//
//   npm i express cors
//   node nodejs.js
//
// Connect the editor:
//   registerPlugin(voucherPlugin({ endpoint: "http://localhost:3001/vouchers" }));

import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // restrict `origin` in production

// Replace this with a real database query.
const VOUCHERS = [
  { id: "voucher_welcome10", title: "Welcome — 10% off first order", code: "WELCOME10" },
  { id: "voucher_save20", title: "Spring Sale — 20% off", code: "SAVE20" },
  { id: "voucher_freeship", title: "Free shipping over $50", code: "FREESHIP" },
  // A per-recipient merge tag resolved by your ESP at send time:
  { id: "voucher_79jq", title: "VIP personal code", code: "**|voucher_79jq|**" },
];

app.get("/vouchers", (_req, res) => {
  res.json(VOUCHERS);
});

app.listen(3001, () => console.log("Vouchers on http://localhost:3001/vouchers"));
