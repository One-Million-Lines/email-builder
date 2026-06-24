# Changelog

All notable changes to this package are documented here.
This project adheres to [Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format.

## [Unreleased]

### Added
- npm library build (`dist/email-builder.js` ESM, `dist/email-builder.cjs` CommonJS).
- Generated TypeScript declarations (`dist/index.d.ts` + per-module `.d.ts`).
- Compiled stylesheet at `dist/styles.css`, imported via `@one-million-lines/email-builder/styles.css`.
- `exports` map, `files` allowlist, and publishing metadata in `package.json`.
- Library-only stylesheet (`src/lib.css`) that omits app `html/body/#root` globals.

### Changed
- `react` and `react-dom` are now **peer dependencies** (no longer bundled).
- Runtime dependencies (`@dnd-kit/*`, `lucide-react`, `zod`, `zustand`) are
  externalized from the bundle and declared as `dependencies`.

## [0.1.0]

### Added
- Initial visual email builder: JSON document model, modules, templates, themes,
  table-based HTML renderer, plugin hooks, React component, and vanilla factory.
