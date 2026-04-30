import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode === "production" ? "/demo/email-builder/" : "/",
  server: { port: 5315 },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
