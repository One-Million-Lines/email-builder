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

<EmailBuilder
  initialDocument={emailJson}
  onChange={(doc) => console.log(doc)}
  onExportHtml={(html) => console.log(html)}
/>;
```

Vanilla JS:

```ts
import { createEmailBuilder } from "openpostcards-builder";

createEmailBuilder({
  container: document.getElementById("builder")!,
  initialDocument,
  onChange(doc) {
    console.log(doc);
  },
});
```

## Development

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

There is currently no automated test suite in the repository.

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
