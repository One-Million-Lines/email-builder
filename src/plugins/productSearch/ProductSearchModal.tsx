import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2, Check, Star, ExternalLink, PackageSearch } from "lucide-react";
import { getProductProvider } from "./state";
import type { ProductSearchResult } from "../../core/plugins";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the picked product when the user saves. */
  onSave: (result: ProductSearchResult) => void;
  /** Prefill the search box (e.g. the current product name). */
  initialQuery?: string;
  /** Copy shown in the header — "Add product" vs "Replace product". */
  title?: string;
}

export function ProductSearchModal({ open, onClose, onSave, initialQuery, title }: Props) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductSearchResult | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset + focus whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery ?? "");
    setResult(null);
    setError(null);
    setSearched(false);
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, initialQuery, onClose]);

  if (!open) return null;

  const runSearch = async () => {
    const provider = getProductProvider();
    const q = query.trim();
    if (!provider || !q || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const found = await provider.search(q);
      setResult(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    onSave(result);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm p-4">
      <div className="m-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <PackageSearch size={18} className="text-blue-600" />
            <h2 className="text-base font-semibold text-neutral-900">
              {title ?? "Find a product"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search bar */}
        <div className="border-b border-neutral-100 px-5 py-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void runSearch();
            }}
          >
            <div className="relative flex-1">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your catalog by name or SKU…"
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={busy || !query.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-neutral-300"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Search
            </button>
          </form>
        </div>

        {/* Body / preview */}
        <div className="min-h-[220px] flex-1 overflow-y-auto p-5">
          {busy && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-sm text-neutral-500">
              <Loader2 size={22} className="animate-spin" />
              Searching…
            </div>
          )}

          {!busy && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!busy && !error && searched && !result && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-neutral-500">
              <PackageSearch size={22} className="text-neutral-300" />
              No product matched “{query.trim()}”. Try another name or SKU.
            </div>
          )}

          {!busy && !error && !searched && (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-neutral-400">
              <PackageSearch size={22} className="text-neutral-300" />
              Search your catalog, then preview and save the product.
            </div>
          )}

          {!busy && result && <ProductPreview result={result} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!result}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-neutral-300"
          >
            <Check size={15} /> Save product
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductPreview({ result }: { result: ProductSearchResult }) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <div className="aspect-video w-full overflow-hidden bg-neutral-100">
        {result.image ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img
            src={result.image}
            alt={result.imageAlt ?? result.name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-neutral-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="text-sm font-semibold text-neutral-900">{result.name}</div>

        {result.stars != null && (
          <div className="flex items-center gap-0.5" aria-label={`${result.stars} out of 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(result.stars ?? 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300"
                }
              />
            ))}
            <span className="ml-1 text-xs text-neutral-500">{result.stars}</span>
          </div>
        )}

        <div className="flex items-baseline gap-2">
          {result.oldPrice && (
            <span className="text-sm text-neutral-400 line-through">{result.oldPrice}</span>
          )}
          <span className="text-lg font-bold text-blue-600">{result.finalPrice}</span>
        </div>

        {result.description && (
          <p className="text-xs leading-relaxed text-neutral-600">{result.description}</p>
        )}

        {result.link && (
          <a
            href={result.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink size={12} /> View source
          </a>
        )}
      </div>
    </div>
  );
}
