// Image Uploader plugin.
// Registers an AssetProvider that POSTs the picked file to a configured
// HTTP endpoint and returns the public URL the server responds with.
//
// See ./README.md for the wire protocol and server examples.

import type { Plugin, AssetProvider, BuilderHandle } from "../../core/plugins";

export interface ImageUploaderOptions {
  /** Absolute or same-origin URL the file is POSTed to. Required. */
  endpoint: string;
  /** Form field name for the file. Default: "file". */
  fieldName?: string;
  /** Extra headers (e.g. Authorization). Cookies/credentials are sent if `withCredentials` is true. */
  headers?: Record<string, string>;
  /** Send credentials (cookies). Default: false. */
  withCredentials?: boolean;
  /** Max file size in MB. Default: 10. */
  maxSizeMB?: number;
  /** Comma-separated MIME types accepted by the file picker. Default: "image/*". */
  accept?: string;
  /**
   * Map a successful server JSON body to `{ url, alt? }`.
   * Default expects `{ url: string, alt?: string }`.
   */
  transformResponse?: (body: unknown) => { url: string; alt?: string };
  /** Optional progress callback for the active upload. */
  onProgress?: (percent: number) => void;
}

const defaultTransform = (body: unknown): { url: string; alt?: string } => {
  if (body && typeof body === "object" && "url" in body && typeof (body as { url: unknown }).url === "string") {
    const b = body as { url: string; alt?: string };
    return { url: b.url, alt: typeof b.alt === "string" ? b.alt : undefined };
  }
  throw new Error('Server response missing "url" string field.');
};

export function createImageUploaderProvider(opts: ImageUploaderOptions): AssetProvider {
  const fieldName = opts.fieldName ?? "file";
  const maxSize = (opts.maxSizeMB ?? 10) * 1024 * 1024;
  const transform = opts.transformResponse ?? defaultTransform;

  return {
    upload(file: File) {
      if (!file.type.startsWith("image/")) {
        return Promise.reject(new Error(`Not an image: ${file.type || "unknown"}`));
      }
      if (file.size > maxSize) {
        return Promise.reject(
          new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB > ${opts.maxSizeMB ?? 10} MB`)
        );
      }

      return new Promise<{ url: string; alt?: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append(fieldName, file, file.name);

        xhr.open("POST", opts.endpoint, true);
        xhr.withCredentials = !!opts.withCredentials;
        if (opts.headers) {
          for (const [k, v] of Object.entries(opts.headers)) xhr.setRequestHeader(k, v);
        }

        if (opts.onProgress && xhr.upload) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) opts.onProgress!(Math.round((e.loaded / e.total) * 100));
          };
        }

        xhr.onload = () => {
          const ok = xhr.status >= 200 && xhr.status < 300;
          let body: unknown = null;
          try {
            body = xhr.responseText ? JSON.parse(xhr.responseText) : null;
          } catch {
            // not JSON
          }
          if (!ok) {
            const msg =
              (body && typeof body === "object" && "error" in body && typeof (body as { error: unknown }).error === "string"
                ? (body as { error: string }).error
                : null) ?? `Upload failed (HTTP ${xhr.status})`;
            return reject(new Error(msg));
          }
          try {
            resolve(transform(body));
          } catch (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));
        xhr.send(fd);
      });
    },
  };
}

/**
 * Plugin factory. Pass to `registerPlugin()` exported by the builder.
 *
 * @example
 *   import { registerPlugin } from "@one-million-lines/email-builder";
 *   import { imageUploaderPlugin } from "@one-million-lines/email-builder";
 *   registerPlugin(imageUploaderPlugin({ endpoint: "/api/upload" }));
 */
export function imageUploaderPlugin(opts: ImageUploaderOptions): Plugin {
  return {
    name: "image-uploader",
    type: "asset-provider",
    setup(b: BuilderHandle) {
      b.registerAssetProvider(createImageUploaderProvider(opts));
    },
  };
}

export const ACCEPT_DEFAULT = "image/*";
