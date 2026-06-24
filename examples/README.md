# Examples

These examples consume the **built, published** package — the realistic npm path.

## Local development against the package

```bash
# In the email-builder repo
npm install
npm run build
npm pack            # -> @one-million-lines/email-builder-0.1.0.tgz

# In your example/consumer app
npm install react react-dom
npm install /absolute/path/to/@one-million-lines/email-builder-0.1.0.tgz
```

> `react` and `react-dom` are **peer dependencies** — install them in the
> consuming app (they are not shipped inside the package).

## What's here

| Folder      | Stack    | Entry file                          |
| ----------- | -------- | ----------------------------------- |
| `react/`    | React    | `App.jsx`                           |
| `vue/`      | Vue 3    | `EmailBuilder.vue`                  |
| `angular/`  | Angular  | `email-builder.component.ts`        |
| `plain/`    | Plain JS | `index.html` (uses an import map)   |

## Stylesheet

Load the stylesheet once per app:

```js
import "@one-million-lines/email-builder/styles.css";
```

See the main README "Styling & isolation" for notes on Tailwind Preflight when
embedding into an existing design system.

## Next.js / SSR

The editor is client-only. Import it dynamically with SSR disabled:

```tsx
import dynamic from "next/dynamic";

const EmailBuilder = dynamic(
  () => import("@one-million-lines/email-builder").then((m) => m.EmailBuilder),
  { ssr: false }
);
```
