// Shared helpers for the voucher-select plugin.

import type { EmailModule, TextElement } from "../../core/types";
import type { Voucher } from "../../core/plugins";

/** Persisted on `module.data.voucher` once a voucher is picked. */
export interface SelectedVoucher {
  id: string;
  title: string;
  code: string;
}

/** The text element that holds the voucher code (role "voucherCode"). */
export function findVoucherCodeElement(m: EmailModule): TextElement | undefined {
  return m?.children?.find(
    (c): c is TextElement => c.type === "text" && c.role === "voucherCode"
  );
}

/** A module is "voucher-aware" if it contains a voucher-code text element. */
export function isVoucherAware(m: EmailModule): boolean {
  return !!findVoucherCodeElement(m);
}

/** Read the currently-selected voucher stored on the module, if any. */
export function readSelectedVoucher(m: EmailModule): SelectedVoucher | null {
  const raw = m?.data?.["voucher"];
  if (raw && typeof raw === "object" && "code" in raw) return raw as SelectedVoucher;
  return null;
}

/** Normalize a provider voucher into the persisted selection shape. */
export function toSelected(v: Voucher): SelectedVoucher {
  return { id: v.id, title: v.title, code: v.code };
}
