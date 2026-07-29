import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { builder } from "./core/plugins";
import { createHttpAIProvider } from "./ai/provider";

// --- Standalone demo wiring (not part of the embeddable library) ---

// Optionally enable the AI assistant when a backend endpoint is configured.
// Set VITE_AI_ENDPOINT in a .env file to point at the Python service in backend/.
const aiEndpoint = import.meta.env.VITE_AI_ENDPOINT as string | undefined;
if (aiEndpoint) {
  builder.setAIProvider(createHttpAIProvider({ endpoint: aiEndpoint }));
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
