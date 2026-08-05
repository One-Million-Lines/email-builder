import { RefreshCw, Loader2, AlertTriangle, Ticket } from "lucide-react";
import { useEmailStore } from "../../store/emailStore";
import type { EmailModule } from "../../core/types";
import { useVouchers } from "./useVouchers";
import { findVoucherCodeElement, readSelectedVoucher, toSelected } from "./logic";
import type { Voucher } from "../../core/plugins";

/**
 * Module-level panel: a "Select voucher" dropdown populated from the backend.
 * Rendered by the right sidebar for any voucher-aware module (one containing a
 * `voucherCode` text element). Picking a voucher fills the code — which stays
 * editable in the text block afterwards.
 */
export function VoucherPanel({ mod }: { mod: EmailModule }) {
  const updateElement = useEmailStore((s) => s.updateElement);
  const updateModule = useEmailStore((s) => s.updateModule);
  const { available, status, vouchers, error, reload } = useVouchers();

  const codeEl = findVoucherCodeElement(mod);
  const selected = readSelectedVoucher(mod);
  const currentValue =
    selected && vouchers.some((v) => v.id === selected.id) ? selected.id : "";

  const applyVoucher = (voucher: Voucher | null) => {
    if (!voucher) {
      updateModule(mod.id, { data: { ...(mod.data ?? {}), voucher: undefined } });
      return;
    }
    if (codeEl) updateElement(mod.id, codeEl.id, { content: voucher.code });
    updateModule(mod.id, { data: { ...(mod.data ?? {}), voucher: toSelected(voucher) } });
  };

  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <Ticket size={13} className="text-blue-600" /> Voucher
        </h3>
        {available && (
          <button
            type="button"
            onClick={reload}
            disabled={status === "loading"}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            title="Reload vouchers"
          >
            {status === "loading" ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <RefreshCw size={12} />
            )}
            Reload
          </button>
        )}
      </div>

      {!available ? (
        <p className="text-[11px] text-gray-400">
          Register a voucher provider (<code>voucherPlugin</code>) to pick codes from
          your catalog. You can still edit the code text directly.
        </p>
      ) : (
        <>
          <label className="block mb-2">
            <span className="block text-xs text-gray-600 mb-1">Select voucher</span>
            <select
              value={currentValue}
              disabled={status === "loading" && vouchers.length === 0}
              onChange={(e) => {
                const v = vouchers.find((x) => x.id === e.target.value) ?? null;
                applyVoucher(v);
              }}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded bg-white focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
            >
              <option value="">
                {status === "loading" && vouchers.length === 0
                  ? "Loading vouchers…"
                  : "Please select a voucher…"}
              </option>
              {vouchers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </label>

          {status === "error" && (
            <p className="flex items-start gap-1 text-[11px] text-red-600 mb-2">
              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
              {error ?? "Failed to load vouchers."}
            </p>
          )}

          {status === "loaded" && vouchers.length === 0 && (
            <p className="text-[11px] text-gray-400 mb-2">No vouchers found.</p>
          )}

          {selected && (
            <div className="rounded border border-green-200 bg-green-50 px-2.5 py-2 text-[12px] text-green-800">
              Voucher code: <span className="font-semibold">{selected.code}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
