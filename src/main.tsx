import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { builder } from "./core/plugins";
import { createHttpAIProvider } from "./ai/provider";
import { createProductSearchProvider } from "./plugins/productSearch";
import { createVoucherProvider, loadVouchers } from "./plugins/voucherSelect";

// --- Standalone demo wiring (not part of the embeddable library) ---

// Optionally enable the AI assistant when a backend endpoint is configured.
// Set VITE_AI_ENDPOINT in a .env file to point at the Python service in backend/.
const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
if (aiEndpoint) {
  builder.setAIProvider(createHttpAIProvider({ endpoint: aiEndpoint }));
}

// Optionally enable product search (the "Find product" modal on product cards).
// Set VITE_PRODUCT_ENDPOINT to the Python service's /products/search route.
const productEndpoint = import.meta.env.VITE_PRODUCT_ENDPOINT as string | undefined;
if (productEndpoint) {
  builder.registerProductProvider(createProductSearchProvider({ endpoint: productEndpoint }));
}

// Optionally enable voucher select (the "Select voucher" dropdown on voucher blocks).
// Set VITE_VOUCHER_ENDPOINT to the Python service's /vouchers route.
const voucherEndpoint = import.meta.env.VITE_VOUCHER_ENDPOINT as string | undefined;
if (voucherEndpoint) {
  builder.registerVoucherProvider(createVoucherProvider({ endpoint: voucherEndpoint }));
  void loadVouchers(); // preload the list at editor start
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
