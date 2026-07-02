# Changelog

All notable changes to this package are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

## [0.1.4] — 2026-07-02

### Changed
- **Dependencies upgraded to latest releases** (no public API changes):
  - `@dnd-kit/core` `^6.1.0` → `^6.3.1`
  - `@dnd-kit/sortable` `^8.0.0` → `^10.0.0`
  - `lucide-react` `^0.460.0` → `^1.23.0`
  - `zod` `^3.23.8` → `^4.4.3` (v4 is API-compatible for the schemas used here)
  - `zustand` `^5.0.2` → `^5.0.14`
- **Dev dependencies upgraded to latest releases**:
  - `react` / `react-dom` (dev) `^19.0.0` → `^19.2.7`
  - `@types/react` `^19.0.0` → `^19.2.17`
  - `@types/react-dom` `^19.0.0` → `^19.2.3`
  - `@tailwindcss/vite` `^4.1.0` → `^4.3.2`
  - `tailwindcss` `^4.1.0` → `^4.3.2`
  - `@vitejs/plugin-react-swc` `^3.5.0` → `^4.3.1`
  - `typescript` `^5.5.3` → `^6.0.3`
  - `vite-plugin-dts` `^4.0.0` → `^5.0.3`
  - `jsdom` `^25.0.1` → `^29.1.1`
  - `eslint` `^9.x` → `^10.6.0`
- `engines.node` bumped to `>=22` in line with supported LTS range.

## [0.1.2] — 2026-06-30

### Added
- npm library build (`dist/email-builder.js` ESM, `dist/email-builder.cjs` CommonJS).
- Generated TypeScript declarations (`dist/index.d.ts` + per-module `.d.ts`).
- Compiled stylesheet at `dist/styles.css`, imported via `@one-million-lines/email-builder/styles.css`.
- `exports` map, `files` allowlist, and publishing metadata in `package.json`.
- Library-only stylesheet (`src/lib.css`) that omits app `html/body/#root` globals.

### Fixed
- **CSS isolation** — `src/lib.css` no longer imports Tailwind Preflight
  (`@import "tailwindcss"` → `@import "tailwindcss/theme"` + `@import
  "tailwindcss/utilities"`). The global CSS reset no longer leaks into the host
  application.
- Added `.oml-email-builder` as the root class on the `<App>` element. All
  builder styles are now nested under this class in the DOM.
- Scoped minimal reset (`box-sizing`, `button`, `input`, `img` defaults) applied
  only inside `.oml-email-builder` via `@layer base`, replacing the Preflight
  rules that were previously global.
- `[contenteditable="true"]:focus` selector is now scoped to
  `.oml-email-builder` and no longer affects host page content.
- Replaced `h-screen w-screen` on the builder root with `h-full w-full` so the
  builder fills its container rather than always taking up the full viewport. The
  host is responsible for sizing the container (e.g., `height: 100vh`).

### Changed
- `react` and `react-dom` are now **peer dependencies** (no longer bundled).
- Runtime dependencies (`@dnd-kit/*`, `lucide-react`, `zod`, `zustand`) are
  externalized from the bundle and declared as `dependencies`.

## [0.1.0]

### Added
- Initial visual email builder: JSON document model, modules, templates, themes,
  table-based HTML renderer, plugin hooks, React component, and vanilla factory.
