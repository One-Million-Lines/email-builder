// Voucher Select plugin.
//
// Registers a VoucherProvider that loads a list of vouchers/discount codes from
// a configured backend endpoint. On voucher blocks (any module containing a
// `voucherCode` text element — e.g. the built-in "Voucher Code" module), the
// editor shows a "Select voucher" dropdown; picking one fills the code (and the
// text stays editable afterwards).
//
// See ./README.md for the wire protocol and server examples.

import type {
  Plugin,
  BuilderHandle,
  Voucher,
  VoucherProvider,
} from "../../core/plugins";
import { loadVouchers } from "./state";

export type { Voucher, VoucherProvider } from "../../core/plugins";
export {
  getVoucherProvider as getActiveVoucherProvider,
  setVoucherProvider as setActiveVoucherProvider,
  loadVouchers,
} from "./state";
export { VoucherPanel } from "./VoucherPanel";
export { useVouchers } from "./useVouchers";
export { isVoucherAware, findVoucherCodeElement, readSelectedVoucher } from "./logic";

export interface VoucherOptions {
  /** Absolute or same-origin URL that returns the voucher list. Required. */
  endpoint: string;
  /** HTTP method. Default: "GET". */
  method?: "GET" | "POST";
  /** Extra headers (e.g. Authorization). */
  headers?: Record<string, string>;
  /** Send cookies with the request. Default: false. */
  withCredentials?: boolean;
  /** Abort the request after this many ms. Default: 15000. */
  timeoutMs?: number;
  /**
   * Fetch the list eagerly when the plugin is registered (at editor start)
   * rather than lazily when the first voucher block is selected. Default: false.
   */
  preload?: boolean;
  /**
   * Map a raw server JSON body to `Voucher[]`. The default handles a bare array
   * or an envelope (`{ vouchers | results | items | data: [...] }`) and both
   * camelCase and snake_case field names (`voucher_code`, `coupon`, `label`, …).
   */
  transformResponse?: (body: unknown) => Voucher[];
}

// ---------------------------------------------------------------------------
// Default response mapping
// ---------------------------------------------------------------------------

function toArray(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const obj = body as Record<string, unknown>;
    for (const key of ["vouchers", "results", "items", "data", "coupons"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function pickString(rec: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.trim() !== "") return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

const defaultTransform = (body: unknown): Voucher[] => {
  const out: Voucher[] = [];
  for (const raw of toArray(body)) {
    if (!raw || typeof raw !== "object") continue;
    const rec = raw as Record<string, unknown>;
    const code = pickString(rec, [
      "code",
      "voucher_code",
      "voucherCode",
      "coupon",
      "coupon_code",
      "couponCode",
      "value",
    ]);
    const id = pickString(rec, ["id", "voucher_id", "voucherId", "uid"]) ?? code;
    if (!id && !code) continue;
    const title =
      pickString(rec, ["title", "name", "label"]) ?? code ?? id ?? "Voucher";
    out.push({
      id: id ?? title,
      title,
      code: code ?? id ?? title,
      description: pickString(rec, ["description", "desc", "summary"]),
    });
  }
  return out;
};

// ---------------------------------------------------------------------------
// HTTP provider
// ---------------------------------------------------------------------------

/**
 * Create a {@link VoucherProvider} backed by an HTTP endpoint.
 *
 * @example
 *   const provider = createVoucherProvider({ endpoint: "/api/vouchers" });
 *   const vouchers = await provider.list();
 */
export function createVoucherProvider(opts: VoucherOptions): VoucherProvider {
  const method = opts.method ?? "GET";
  const timeoutMs = opts.timeoutMs ?? 15000;
  const transform = opts.transformResponse ?? defaultTransform;

  return {
    async list(): Promise<Voucher[]> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(opts.endpoint, {
          method,
          headers: { ...(opts.headers ?? {}) },
          credentials: opts.withCredentials ? "include" : "same-origin",
          signal: controller.signal,
        });

        let parsed: unknown = null;
        const raw = await res.text();
        try {
          parsed = raw ? JSON.parse(raw) : null;
        } catch {
          // leave parsed null; handled below
        }

        if (!res.ok) {
          const msg =
            (parsed && typeof parsed === "object" && "error" in parsed &&
            typeof (parsed as { error: unknown }).error === "string"
              ? (parsed as { error: string }).error
              : null) ?? `Voucher request failed (HTTP ${res.status})`;
          throw new Error(msg);
        }

        return transform(parsed);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(`Voucher request timed out after ${timeoutMs}ms`);
        }
        throw err instanceof Error ? err : new Error(String(err));
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Plugin factory. Pass to `registerPlugin()` exported by the builder.
 *
 * @example
 *   import { registerPlugin, voucherPlugin } from "@one-million-lines/email-builder";
 *   registerPlugin(voucherPlugin({ endpoint: "http://localhost:3001/vouchers" }));
 */
export function voucherPlugin(opts: VoucherOptions): Plugin {
  const provider = createVoucherProvider(opts);
  return {
    name: "voucher-select",
    type: "voucher-provider",
    setup(b: BuilderHandle) {
      b.registerVoucherProvider(provider);
      if (opts.preload) void loadVouchers();
    },
  };
}
