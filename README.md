# OpenPostcards AI Builder

OpenPostcards AI Builder is a visual email builder for composing modular marketing emails from a JSON document model and exporting table-based HTML. It can run as a standalone app or be embedded into other products through a React component or a vanilla JavaScript wrapper.

## What it does

It gives users a drag-and-drop editor with reusable modules, themes, HTML export, and plugin hooks for extending the builder.

## Why it exists

Marketing teams often need a reusable editor that produces email-safe HTML without tying the editor to a specific CMS or backend. This project separates the editing experience, the JSON document model, and the final HTML renderer so it can be embedded elsewhere.

## Features

- Visual editor with top bar, left sidebar, canvas, and right sidebar
- JSON-first email document model
- Built-in modules, templates, and themes
- Table-based HTML rendering for email output
- Local autosave via Zustand store
- React component API and vanilla JS factory
- Plugin registration for modules and integrations
- AI action pipeline that validates structured output with Zod before applying changes

## How it works

1. The app registers default modules and starter templates at load time.
2. The email document lives in a Zustand store with import, export, and autosave support.
3. The canvas and sidebars edit that shared document model.
4. `renderEmailHtml()` converts the JSON document into table-based email HTML.
5. Embedders can mount the editor with `EmailBuilder` or `createEmailBuilder()` and subscribe to document or HTML changes.

## Tech stack

- React
- TypeScript
- Vite
- Zustand
- Zod
- dnd-kit

## Project structure

```text
src/
  core/             document types, renderer, validation, AI actions, plugins
  editor/           top bar, sidebars, canvas
  modules/          module registry and built-in modules
  recommendations/  recommendation and fallback logic
  store/            editor state and persistence
  templates/        built-in email templates
  themes/           theme definitions
  plugins/          extension points, including image uploader helpers
  index.ts          public API for embedding
```

## Install

```bash
npm install openpostcards-builder react react-dom
```

`react` and `react-dom` (v18 or v19) are **peer dependencies** — install them in
your app; they are never bundled into the package.

> **MANUAL ACTION REQUIRED:** `openpostcards-builder` is a placeholder package
> name. Check availability and choose/reserve your own npm name before publishing,
> then update `package.json` `name`, `repository`, `homepage`, and `bugs`.

## Getting started

```bash
git clone <repo-url>
cd email-builder
npm install
npm run dev
```

Open `http://localhost:5315`.

## Configuration

This project does not require environment variables for local development.

The production build uses `/demo/email-builder/` as the Vite base path.

## Usage

React:

```tsx
import { EmailBuilder } from "openpostcards-builder";
import "openpostcards-builder/styles.css";

<EmailBuilder
  initialDocument={emailJson}
  onChange={(doc) => console.log(doc)}
  onExportHtml={(html) => console.log(html)}
/>;
```

Vanilla JS:

```ts
import { createEmailBuilder } from "openpostcards-builder";
import "openpostcards-builder/styles.css";

const instance = createEmailBuilder({
  container: document.getElementById("builder")!,
  initialDocument,
  onChange(doc) {
    console.log(doc);
  },
});

// instance.getDocument(); instance.exportHtml(); instance.exportJson(); instance.destroy();
```

Always import the stylesheet once per app: `import "openpostcards-builder/styles.css";`

### Framework integration

Thin wrappers for each framework live in [`examples/`](./examples):

- **React** — `examples/react/App.jsx`
- **Vue 3** — `examples/vue/EmailBuilder.vue`
- **Angular** — `examples/angular/email-builder.component.ts`
- **Plain JS** — `examples/plain/index.html`

Vue and Angular mount the React-based editor through the framework-neutral
`createEmailBuilder()` factory (`getDocument` / `exportHtml` / `exportJson` /
`destroy`). React and ReactDOM remain peer dependencies in all cases.

### Styling & isolation

The stylesheet at `openpostcards-builder/styles.css` includes Tailwind
**Preflight**, a global CSS reset that normalizes `margin`, `box-sizing`,
headings, lists, etc. When embedding into an existing design system this can
affect host styles. Mitigations:

- Load the editor in a dedicated route/page where the reset is acceptable, or
- Scope/encapsulate it (e.g., render inside an iframe or a Shadow DOM host), or
- Build your own Tailwind stylesheet without Preflight if your app already
  provides resets.

The editor root uses `h-screen w-screen`; place it in a full-size container.

### Server-side rendering

The package does not access `window`/`document` at import time, so it is safe to
import in SSR frameworks. The editor itself is client-only — render it in an
effect, or dynamically import it with SSR disabled in Next.js:

```tsx
import dynamic from "next/dynamic";

const EmailBuilder = dynamic(
  () => import("openpostcards-builder").then((m) => m.EmailBuilder),
  { ssr: false }
);
```

## Development

```bash
npm run dev           # standalone app
npm run build         # build the library into dist/ (ESM + CJS + CSS + d.ts)
npm test              # package-consumption tests (jsdom + React)
npm run lint          # eslint
npm run validate:pack # build + npm pack --dry-run
npm run build:demo    # build the standalone demo app
```

## Building & publishing

```bash
npm run build              # produces dist/
npm pack --dry-run         # inspect the tarball contents
npm pack                   # create the .tgz to test in a consumer app
```

To publish (run manually):

```bash
# MANUAL ACTION REQUIRED — choose a real package name first, then:
npm login
npm publish --access public
```

`prepublishOnly` rebuilds the library automatically before publish.

## Roadmap

- Add persistence adapters beyond local storage
- Add more production-ready media upload integrations
- Add automated tests for document validation and HTML export
- Add richer framework wrappers and packaging docs

## Contributing

This project is public and open for collaboration. If you’re interested in contributing, improving the project, or discussing ideas, feel free to reach out.

LinkedIn: https://linkedin.com/in/alexrada

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Open a pull request

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
