# Image Uploader Plugin

Adds an **Upload** button next to every Image URL field in the builder. The picked file is `POST`ed to your server and the returned URL replaces the image URL in the email document.

This document also serves as the canonical guide for **building plugins** for the email builder.

---

## 1. Plugin model (general)

The builder exposes one entry point:

```ts
import { registerPlugin, type Plugin } from "openpostcards-builder";
```

A plugin is a plain object:

```ts
interface Plugin {
  name: string;                                        // unique id, e.g. "image-uploader"
  type: "modules" | "themes" | "asset-provider" | "ai-provider";
  setup: (builder: BuilderHandle) => void;             // called once on registration
}
```

`BuilderHandle` exposes the registration surface:

```ts
interface BuilderHandle {
  registerModule(def: ModuleDefinition): void;         // add a content block
  registerTheme(theme: Theme): void;                   // add a theme preset
  registerAssetProvider(provider: AssetProvider): void;// add a file uploader
  setAIProvider(provider: AIProvider): void;           // wire AI generation
}
```

Plugins are pure: call `setup()` once, register what you need, and return. They run in the browser and have no privileged access; anything that touches a server must use `fetch` / `XMLHttpRequest` against an endpoint you operate.

---

## 2. Image Uploader — usage

```ts
import { registerPlugin } from "openpostcards-builder";
import { imageUploaderPlugin } from "openpostcards-builder/plugins/imageUploader";

registerPlugin(
  imageUploaderPlugin({
    endpoint: "/api/uploads",         // required
    fieldName: "file",                // optional, default "file"
    maxSizeMB: 10,                    // optional, default 10
    accept: "image/*",                // optional file picker filter
    headers: { Authorization: "Bearer …" }, // optional
    withCredentials: false,           // optional, sends cookies if true
    transformResponse: (body) => ({ url: body.location }), // optional, custom mapping
    onProgress: (p) => console.log(p),// optional 0–100
  })
);
```

Once registered, every image URL field in the right sidebar gets an upload button.

---

## 3. Wire protocol the server must implement

### Request

- Method: `POST`
- Content-Type: `multipart/form-data`
- One file field. Default name is `file`. Override with `fieldName`.
- Optional headers from `headers` are forwarded verbatim.
- Cookies are only sent if `withCredentials: true`.

### Successful response

- Status: `200` (or any `2xx`).
- Content-Type: `application/json`.
- Body:

  ```json
  { "url": "https://cdn.example.com/u/abcd1234.jpg", "alt": "Optional alt text" }
  ```

  - `url` *(required, string)* — the publicly reachable URL the email client will fetch the image from. Must be `https://` for production emails.
  - `alt` *(optional, string)* — if present and the field has no alt text, it is auto-filled.

  You can return any shape you like and adapt it client-side via `transformResponse`.

### Failure response

- Status: any non-2xx (`400` validation, `401` auth, `413` too large, `415` wrong type, `500` server error, etc.).
- Body (recommended):

  ```json
  { "error": "Human-readable message shown in the sidebar" }
  ```

- If the body is not JSON or has no `error`, the UI falls back to `Upload failed (HTTP <status>)`.

### Status code conventions

| Code  | Meaning                                                     |
|------:|-------------------------------------------------------------|
| `200` | Success, JSON body with `url`.                              |
| `400` | Bad request (missing file field, malformed multipart).      |
| `401` | Unauthorized (token missing/invalid).                       |
| `403` | Forbidden (auth ok, not allowed to upload).                 |
| `413` | Payload too large.                                          |
| `415` | Unsupported media type (not an image).                      |
| `500` | Server failure.                                             |

Client-side guards (size, MIME prefix `image/`) run **before** the request, but the server **must** re-validate.

### Security checklist for the server

- Validate MIME by reading magic bytes, not by trusting `Content-Type` or the filename.
- Cap upload size at the proxy/web-server layer too (Nginx `client_max_body_size`, etc.).
- Generate a random filename; never echo the user-supplied name into the URL path.
- Strip EXIF if you care about privacy.
- Store outside the document root and serve via a CDN, or restrict served file types.
- If `withCredentials: true`, set `Access-Control-Allow-Credentials: true` and a specific `Access-Control-Allow-Origin` (not `*`).
- Apply rate limiting per session/IP.

---

## 4. CORS (when builder and server are different origins)

Server must respond to preflight `OPTIONS` and the actual `POST` with:

```
Access-Control-Allow-Origin: https://app.yourbuilder.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 600
```

---

## 5. Server examples

Three minimal, dependency-light reference servers that satisfy the protocol live in [`./examples`](./examples):

- [`examples/php.php`](./examples/php.php) — single-file PHP endpoint.
- [`examples/nodejs.js`](./examples/nodejs.js) — Node.js with `express` + `multer`.
- [`examples/python.py`](./examples/python.py) — Flask app using `werkzeug` for the multipart parsing.

Each example: validates MIME (image/*), caps size at 10 MB, writes to `./uploads`, returns `{ "url": "/uploads/<random>.<ext>" }` on success and `{ "error": "..." }` with a non-2xx code on failure.
