import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

/**
 * Library build configuration.
 *
 * Produces an embeddable package in `dist/`:
 *   - dist/email-builder.js    (ESM)
 *   - dist/email-builder.cjs   (CommonJS)
 *   - dist/styles.css          (compiled Tailwind + component styles)
 *   - dist/index.d.ts (+ per-file .d.ts)
 *
 * React and ReactDOM are externalized (peer dependencies) so the package never
 * ships or duplicates a copy of React. The standalone app build lives in
 * vite.config.ts.
 */
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ["src"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts"],
      insertTypesEntry: true,
      tsconfigPath: "./tsconfig.json",
    }),
  ],
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "email-builder.js" : "email-builder.cjs"),
    },
    rollupOptions: {
      // Externalize React and all runtime dependencies so the package never
      // bundles or duplicates them. They are declared as peer/regular deps.
      external: (id) =>
        /^(react|react-dom|@dnd-kit\/|lucide-react|zod|zustand)($|\/)/.test(id),
      output: {
        assetFileNames: (asset) =>
          asset.name && asset.name.endsWith(".css") ? "styles.css" : "assets/[name][extname]",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-dom/client": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
});
