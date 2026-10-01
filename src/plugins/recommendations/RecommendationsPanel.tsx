import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronUp, ChevronDown, Loader2, Pencil, Search, Trash2, Plus, X, Sparkles, Hash } from "lucide-react";
import { useEmailStore } from "../../store/emailStore";
import type { EmailModule } from "../../core/types";
import {
  ALGORITHMS,
  ALGORITHM_BY_ID,
  FALLBACK_OPTIONS,
  MAX_STACK,
  defaultLogic,
  readLogic,
  productSlotCount,
  nextVtproduct,
  type RecommendationsLogic,
  type StackEntry,
} from "./logic";
import { useRecommendationsStore } from "./state";
import type { SuggesterFn } from "./state";
import {
  getRecommendationCategorySuggester,
} from "./state";
import { getProductProvider } from "../productSearch/state";
import type { ProductSearchResult } from "../../core/plugins";

interface Props {
  mod: EmailModule;
}

export function RecommendationsPanel({ mod }: Props) {
  const doc = useEmailStore((s) => s.doc);
  const updateModule = useEmailStore((s) => s.updateModule);
  const slots = productSlotCount(mod) || 2;
  const logic = readLogic(mod.data) ?? defaultLogic(slots);

  // Auto-assign a unique vtproduct position ID (e.g. "pos01") the first time
  // this panel opens for a module. Handles fresh modules and duplicates that
  // share an ID with their original.
  useEffect(() => {
    const current = mod.data?.vtproduct as string | undefined;
    if (current) {
      // Check for collision with another module (e.g. after duplication).
      const conflict = doc.modules.some(
        (m) => m.id !== mod.id && (m.data?.vtproduct as string | undefined) === current
      );
      if (!conflict) return;
    }
    const vtproduct = nextVtproduct(doc.modules, mod.id);
    updateModule(mod.id, { data: { ...(mod.data ?? {}), vtproduct } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod.id]);

  const update = (patch: Partial<RecommendationsLogic>) => {
    const next = { ...logic, ...patch };
    updateModule(mod.id, { data: { ...(mod.data ?? {}), recommendations: next } });
  };

  const updateFilters = (patch: Partial<RecommendationsLogic["filters"]>) =>
    update({ filters: { ...logic.filters, ...patch } });

  const vtproduct = mod.data?.vtproduct as string | undefined;

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50/40 mt-4 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-blue-200 bg-blue-50">
        <Sparkles size={14} className="text-blue-700" />
        <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide flex-1">
          Products Source
        </div>
        {vtproduct && (
          <span
            className="flex items-center gap-1 text-[10px] font-mono bg-blue-100 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded"
            title="Backend position identifier (vtproduct HTML attribute)"
          >
            <Hash size={9} />
            {vtproduct}
          </span>
        )}
      </div>

      {/* Step 1 — choose how products are sourced */}
      <div className="p-3 bg-white border-b border-blue-100">
        <div className="grid grid-cols-2 gap-2">
          <ModeCard
            active={logic.mode === "manual"}
            title="Select Items"
            subtitle="Hand-pick from a feed"
            onClick={() => update({ mode: "manual" })}
          />
          <ModeCard
            active={logic.mode === "recommender"}
            title="Recommender"
            subtitle="Algorithms + filters"
            onClick={() => update({ mode: "recommender" })}
          />
        </div>
      </div>

      {/* Step 2 — per-mode body */}
      <div className="p-3 bg-white space-y-3">
        <Field label="Number of products">
          <DeferredInput
            type="number"
            min={1}
            max={20}
            value={logic.noProducts}
            onCommit={(v) => update({ noProducts: Math.max(1, Number(v) || 1) })}
            className={inputCls}
          />
          <div className="text-[11px] text-gray-500 mt-1">
            Block has {slots} slot{slots === 1 ? "" : "s"} in the design.
          </div>
        </Field>

        {logic.mode === "manual" ? (
          <ManualSection logic={logic} update={update} />
        ) : (
          <RecommenderSection
            logic={logic}
            update={update}
            updateFilters={updateFilters}
          />
        )}

        <details className="border border-gray-200 rounded">
          <summary className="px-2 py-1.5 text-[11px] font-medium text-gray-600 cursor-pointer select-none">
            View saved JSON
          </summary>
          <pre className="text-[10px] bg-gray-900 text-gray-100 p-2 overflow-auto max-h-60 leading-tight">
            {JSON.stringify(logic, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

// ---------- Sections ----------

function ManualSection({
  logic,
  update,
}: {
  logic: RecommendationsLogic;
  update: (p: Partial<RecommendationsLogic>) => void;
}) {
  const feeds = useRecommendationsStore((s) => s.feeds);

  return (
    <>
      {/* Source feed — only show when multiple feeds are available */}
      {feeds.length > 1 && (
        <Field label="Source feed">
          <select
            value={logic.sourceFeed ?? ""}
            onChange={(e) => update({ sourceFeed: e.target.value })}
            className={inputCls}
          >
            <option value="">main</option>
            {feeds.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Items to include (product IDs / SKUs)">
        <SuggestListField
          title="Select items to include"
          entityType="item"
          ids={logic.manualProducts}
          labels={logic.manualProductLabels ?? {}}
          onChange={(newIds, newLabels) =>
            update({ manualProducts: newIds, manualProductLabels: newLabels })
          }
          placeholder="No items selected — click to add"
        />
      </Field>
      <div className="text-[11px] text-gray-500">
        Items are sent to the renderer as-is in the order shown.
      </div>
    </>
  );
}

function RecommenderSection({
  logic,
  update,
  updateFilters,
}: {
  logic: RecommendationsLogic;
  update: (p: Partial<RecommendationsLogic>) => void;
  updateFilters: (p: Partial<RecommendationsLogic["filters"]>) => void;
}) {
  const [advanced, setAdvanced] = useState(false);

  const filterLabelsProduct = logic.filterProductLabels ?? {};
  const filterLabelsCategory = logic.filterCategoryLabels ?? {};

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-gray-700">
            Algorithms (max {MAX_STACK})
          </label>
          <AddAlgorithmDropdown
            disabled={logic.stack.length >= MAX_STACK}
            existing={logic.stack.map((s) => s.algorithm)}
            onPick={(id) => update({ stack: [...logic.stack, { algorithm: id }] })}
          />
        </div>
        <StackList stack={logic.stack} onChange={(stack) => update({ stack })} />
      </div>

      <Field label="Fallback">
        <select
          value={logic.fallback}
          onChange={(e) =>
            update({ fallback: e.target.value as RecommendationsLogic["fallback"] })
          }
          className={inputCls}
        >
          {FALLBACK_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <div className="text-[11px] text-gray-500 mt-1">
          {FALLBACK_OPTIONS.find((f) => f.value === logic.fallback)?.description}
        </div>
      </Field>

      <SectionHeader
        title="Include & Exclude filters"
        right={
          <div className="flex items-center gap-1">
            <Pill active={!advanced} onClick={() => setAdvanced(false)}>
              Basic
            </Pill>
            <Pill active={advanced} onClick={() => setAdvanced(true)}>
              Advanced
            </Pill>
          </div>
        }
      />

      <Field label="Exclude products">
        <SuggestListField
          title="Exclude products"
          entityType="item"
          ids={logic.filters.excludeProducts}
          labels={filterLabelsProduct}
          onChange={(newIds, newLabels) => update({
            filters: { ...logic.filters, excludeProducts: newIds },
            filterProductLabels: newLabels,
          })}
          placeholder="None — click to add"
        />
      </Field>
      <Field label="Include products">
        <SuggestListField
          title="Include products"
          entityType="item"
          ids={logic.filters.includeProducts}
          labels={filterLabelsProduct}
          onChange={(newIds, newLabels) => update({
            filters: { ...logic.filters, includeProducts: newIds },
            filterProductLabels: newLabels,
          })}
          placeholder="None — click to add"
        />
      </Field>
      <Field label="Exclude categories">
        <SuggestListField
          title="Exclude categories"
          entityType="category"
          ids={logic.filters.excludeCategories}
          labels={filterLabelsCategory}
          onChange={(newIds, newLabels) => update({
            filters: { ...logic.filters, excludeCategories: newIds },
            filterCategoryLabels: newLabels,
          })}
          placeholder="None — click to add"
        />
      </Field>
      <Field label="Include categories">
        <SuggestListField
          title="Include categories"
          entityType="category"
          ids={logic.filters.includeCategories}
          labels={filterLabelsCategory}
          onChange={(newIds, newLabels) => update({
            filters: { ...logic.filters, includeCategories: newIds },
            filterCategoryLabels: newLabels,
          })}
          placeholder="None — click to add"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Minimum stock">
          <DeferredInput
            type="number"
            min={0}
            value={logic.filters.minStock ?? 0}
            onCommit={(v) => updateFilters({ minStock: Math.max(0, Number(v) || 0) })}
            className={inputCls}
          />
        </Field>
        <Field label="Minimum price">
          <DeferredInput
            type="number"
            min={0}
            value={logic.filters.minPrice ?? 0}
            onCommit={(v) => updateFilters({ minPrice: Math.max(0, Number(v) || 0) })}
            className={inputCls}
          />
        </Field>
      </div>

      <ToggleRow
        label="Only main items"
        checked={!!logic.filters.mainOnly}
        onChange={(v) => updateFilters({ mainOnly: v })}
      />
      <ToggleRow
        label="Higher price than current item (upsell)"
        checked={!!logic.filters.higherPrice}
        onChange={(v) => updateFilters({ higherPrice: v })}
      />
      <ToggleRow
        label="On sale only"
        checked={!!logic.filters.salesPrice}
        onChange={(v) => updateFilters({ salesPrice: v })}
      />
      <ToggleRow
        label="Same category as current"
        checked={!!logic.filters.sameCategory}
        onChange={(v) => updateFilters({ sameCategory: v })}
      />
      <ToggleRow
        label="Match title keywords"
        checked={!!logic.filters.matchTitle}
        onChange={(v) => updateFilters({ matchTitle: v })}
      />
      <Field label="Match same fields (comma-separated)">
        <DeferredInput
          type="text"
          placeholder="brand, color"
          value={logic.filters.sameField ?? ""}
          onCommit={(v) => updateFilters({ sameField: v })}
          className={inputCls}
        />
      </Field>

      {advanced && (
        <Field label="Advanced JSON overrides">
          <JsonEdit
            value={logic.filters.advanced ?? {}}
            onChange={(v) => updateFilters({ advanced: v })}
          />
        </Field>
      )}
    </>
  );
}

// ---------- Subcomponents ----------

const inputCls =
  "w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none bg-white";

function ModeCard({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex flex-col items-start gap-0.5 p-2.5 rounded border text-left transition " +
        (active
          ? "border-teal-600 bg-teal-50 ring-1 ring-teal-600"
          : "border-gray-200 bg-white hover:border-gray-300")
      }
    >
      <div className={"flex items-center gap-1.5 " + (active ? "text-teal-700" : "text-gray-700")}>
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <span className="text-[10px] text-gray-500">{subtitle}</span>
    </button>
  );
}

function SectionHeader({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
        {title}
      </div>
      {right}
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide " +
        (active ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")
      }
    >
      {children}
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 text-xs text-gray-700 py-1">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-teal-600"
      />
    </label>
  );
}

function StackList({
  stack,
  onChange,
}: {
  stack: StackEntry[];
  onChange: (s: StackEntry[]) => void;
}) {
  if (stack.length === 0) {
    return (
      <div className="text-[11px] text-gray-500 italic border border-dashed border-gray-300 rounded px-2 py-3 text-center">
        No algorithms yet. Click <b>Add algorithm</b> to start.
      </div>
    );
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= stack.length) return;
    const next = stack.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(stack.filter((_, k) => k !== i));
  const setParam = (i: number, key: string, value: string | number) => {
    const next = stack.slice();
    next[i] = { ...next[i], params: { ...(next[i].params ?? {}), [key]: value } };
    onChange(next);
  };
  return (
    <div className="space-y-1.5">
      {stack.map((s, i) => {
        const def = ALGORITHM_BY_ID[s.algorithm];
        return (
          <div
            key={i}
            className="border border-gray-200 rounded px-2 py-1.5 bg-white flex flex-col gap-1"
          >
            <div className="flex items-center gap-1">
              <span className="flex-1 text-xs text-gray-800 truncate">
                {def?.label ?? s.algorithm}
              </span>
              <button
                title="Move up"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronUp size={13} />
              </button>
              <button
                title="Move down"
                onClick={() => move(i, 1)}
                disabled={i === stack.length - 1}
                className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronDown size={13} />
              </button>
              <button
                title="Remove"
                onClick={() => remove(i)}
                className="p-1 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
            {def?.params?.map((p) => (
              <div key={p.key} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-20 shrink-0">{p.label}</span>
                {p.type === "select" ? (
                  <select
                    value={String(s.params?.[p.key] ?? p.default ?? "")}
                    onChange={(e) => setParam(i, p.key, e.target.value)}
                    className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                  >
                    {p.options?.map((o) => (
                      <option key={String(o.value)} value={String(o.value)}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <DeferredInput
                    type={p.type === "number" ? "number" : "text"}
                    value={String(s.params?.[p.key] ?? p.default ?? "")}
                    onCommit={(v) =>
                      setParam(i, p.key, p.type === "number" ? Number(v) : v)
                    }
                    className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1"
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function AddAlgorithmDropdown({
  disabled,
  existing,
  onPick,
}: {
  disabled: boolean;
  existing: string[];
  onPick: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState<{ top: number; right: number } | null>(null);

  // Calculate portal position when opening
  const handleOpen = () => {
    if (disabled) return;
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        disabled={disabled}
        onClick={handleOpen}
        className={
          "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold uppercase " +
          (disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-teal-600 text-white hover:bg-teal-700")
        }
      >
        <Plus size={12} /> Add
      </button>
      {open && !disabled && dropPos &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
            <div
              style={{ top: dropPos.top, right: dropPos.right }}
              className="fixed w-64 max-h-80 overflow-auto bg-white border border-gray-200 rounded shadow-lg z-[9999]"
            >
              {ALGORITHMS.map((a) => {
                const used = existing.includes(a.id);
                return (
                  <button
                    key={a.id}
                    disabled={used}
                    onClick={() => {
                      onPick(a.id);
                      setOpen(false);
                    }}
                    className={
                      "block w-full text-left px-2.5 py-1.5 text-xs " +
                      (used
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-teal-50 hover:text-teal-700")
                    }
                  >
                    {a.label}
                    {used && <span className="ml-1 text-[10px]">· added</span>}
                  </button>
                );
              })}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

function TokenInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v) return;
    if (value.includes(v)) return;
    onChange([...value, v]);
    setDraft("");
  };

  const truncate = (s: string) => s.length > 30 ? s.slice(0, 30) + "…" : s;

  return (
    <div className="border border-gray-200 rounded bg-white p-1 flex flex-wrap items-center gap-1 focus-within:border-blue-500">
      {value.map((tok) => (
        <span
          key={tok}
          className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] rounded px-1.5 py-0.5"
          title={tok}
        >
          {truncate(tok)}
          <button
            onClick={() => onChange(value.filter((x) => x !== tok))}
            className="text-gray-500 hover:text-red-600"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-20 outline-none text-xs bg-transparent px-1 py-0.5"
      />
    </div>
  );
}

/** Token input that shows a live suggestion dropdown when a suggester is registered. */
/** Compact inline field — shows a pill preview, opens a management modal on click. */
function SuggestListField({
  ids,
  labels,
  onChange,
  placeholder,
  entityType,
  title,
}: {
  ids: string[];
  labels: Record<string, string>;
  /** Single atomic callback receiving the new (ids, labels) pair. */
  onChange: (newIds: string[], newLabels: Record<string, string>) => void;
  placeholder?: string;
  entityType: "item" | "category";
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const MAX_PREVIEW = 4;
  const truncate = (s: string) => s.length > 30 ? s.slice(0, 30) + "…" : s;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full border border-gray-200 rounded bg-white px-2 py-1.5 min-h-[34px] flex items-start gap-1 flex-wrap text-left hover:border-teal-400 focus:outline-none focus:border-teal-500 transition"
      >
        {ids.length === 0 ? (
          <span className="text-xs text-gray-400 leading-5">{placeholder ?? "Click to add…"}</span>
        ) : (
          <>
            {ids.slice(0, MAX_PREVIEW).map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-0.5 bg-teal-50 border border-teal-200 text-teal-800 text-[11px] rounded px-1.5 py-0.5 leading-none"
                title={labels[id] ?? id}
              >
                {truncate(labels[id] ?? id)}
              </span>
            ))}
            {ids.length > MAX_PREVIEW && (
              <span className="text-[11px] text-gray-500 leading-5 px-0.5">
                +{ids.length - MAX_PREVIEW} more
              </span>
            )}
          </>
        )}
        <span className="ml-auto shrink-0 text-gray-400 mt-0.5">
          <Pencil size={11} />
        </span>
      </button>

      {open && createPortal(
        <SuggestListModal
          title={title}
          entityType={entityType}
          ids={ids}
          labels={labels}
          onChange={onChange}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

/** Full-screen portal modal for searching and managing a list of items/categories. */
function SuggestListModal({
  title,
  entityType,
  ids,
  labels,
  onChange,
  onClose,
}: {
  title: string;
  entityType: "item" | "category";
  ids: string[];
  labels: Record<string, string>;
  onChange: (newIds: string[], newLabels: Record<string, string>) => void;
  onClose: () => void;
}) {
  // Use module-level getters — more reliable than Zustand hooks across Vite
  // chunk boundaries. The getter returns whatever was last registered via
  // setRecommendationItemSuggester / setRecommendationCategorySuggester.
  const entityLabel = entityType === "category" ? "category" : "product";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [searched, setSearched] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a local copy so removes are immediate without waiting for parent re-render
  const [localIds, setLocalIds] = useState<string[]>(ids);
  const [localLabels, setLocalLabels] = useState<Record<string, string>>(labels);

  // Sync in when parent re-renders (e.g. undo/redo from outside)
  useEffect(() => { setLocalIds(ids); }, [ids]);
  useEffect(() => { setLocalLabels(labels); }, [labels]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live search — reads suggester at call time from the module singleton
  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); setSearched(false); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setBusy(true);
      setSearched(true);
      try {
        let found: { id: string; name: string }[] = [];
        if (entityType === "item") {
          // Reuse the same ProductProvider already registered by productSearchPlugin.
          const provider = getProductProvider();
          if (provider) {
            const raw = await provider.search(q);
            const items: ProductSearchResult[] = Array.isArray(raw) ? raw : raw ? [raw] : [];
            found = items
              .filter((r) => r && r.name)
              .map((r) => ({ id: r.sku || r.name, name: r.name }));
          }
        } else {
          const suggester = getRecommendationCategorySuggester();
          if (suggester) {
            found = await suggester(q);
          }
        }
        setResults(found.filter((x) => !localIds.includes(x.id)));
      } catch {
        setResults([]);
      } finally {
        setBusy(false);
      }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, entityType]);

  const add = (id: string, name?: string) => {
    if (localIds.includes(id)) return;
    const newIds = [...localIds, id];
    const newLabels = name ? { ...localLabels, [id]: name } : localLabels;
    setLocalIds(newIds);
    setLocalLabels(newLabels);
    onChange(newIds, newLabels);
    setResults((r) => r.filter((x) => x.id !== id));
  };

  const remove = (id: string) => {
    const newIds = localIds.filter((x) => x !== id);
    const newLabels = { ...localLabels };
    delete newLabels[id];
    setLocalIds(newIds);
    setLocalLabels(newLabels);
    onChange(newIds, newLabels);
  };

  const truncate = (s: string) => s.length > 30 ? s.slice(0, 30) + "…" : s;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 shrink-0">
          <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="border-b border-neutral-100 px-4 py-3 shrink-0">
          <div className="relative flex items-center gap-2">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${entityLabel}s by name or ID…`}
              className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-teal-500"
            />
            {busy && <Loader2 size={14} className="shrink-0 animate-spin text-neutral-400" />}
          </div>

          {/* Live results */}
          {query.trim() && (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
              {busy && results.length === 0 && (
                <div className="px-4 py-3 text-xs text-neutral-400">Searching…</div>
              )}
              {!busy && searched && results.length === 0 && (
                <div className="px-4 py-3 text-xs text-neutral-400">
                  No {entityLabel}s matched &ldquo;{query.trim()}&rdquo;.
                </div>
              )}
              {results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-teal-50 border-b border-neutral-100 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-800">{r.name}</div>
                    {r.id !== r.name && (
                      <div className="truncate text-[10px] text-neutral-400">{r.id}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => add(r.id, r.name)}
                    className="shrink-0 flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Manual entry — always available as fallback */}
          <div className="mt-2 flex gap-2">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const v = manualInput.trim();
                  if (v) { add(v); setManualInput(""); }
                }
              }}
              placeholder={`Or enter ${entityLabel} ID directly`}
              className="flex-1 rounded-lg border border-neutral-200 py-1.5 px-3 text-sm outline-none focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => { const v = manualInput.trim(); if (v) { add(v); setManualInput(""); } }}
              className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected items — scrollable */}
        <div className="overflow-y-auto px-4 py-3" style={{ maxHeight: "280px" }}>
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            Selected ({localIds.length})
          </div>
          {localIds.length === 0 ? (
            <div className="text-xs text-gray-400 italic py-2">
              No {entityLabel}s selected yet.
            </div>
          ) : (
            <div className="space-y-1">
              {localIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-neutral-800" title={localLabels[id] ?? id}>
                      {truncate(localLabels[id] ?? id)}
                    </div>
                    {localLabels[id] && localLabels[id] !== id && (
                      <div className="text-[10px] text-neutral-400 truncate">{id}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); remove(id); }}
                    className="shrink-0 rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remove ${localLabels[id] ?? id}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex justify-end border-t border-neutral-200 px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Input that keeps its own local state while focused and commits the value to
 * the store only on blur. Prevents update storms when the host React app
 * observes every document change.
 */
function DeferredInput({
  value,
  onCommit,
  className,
  type = "text",
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onBlur"> & {
  value: string | number;
  onCommit: (v: string) => void;
}) {
  const [local, setLocal] = useState(String(value));
  const focusedRef = useRef(false);

  // Sync from outside when not focused (e.g., undo/redo, programmatic updates)
  useEffect(() => {
    if (!focusedRef.current) {
      setLocal(String(value));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type={type}
      value={local}
      className={className}
      onFocus={() => { focusedRef.current = true; }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={(e) => {
        focusedRef.current = false;
        onCommit(e.target.value);
      }}
      {...rest}
    />
  );
}

function JsonEdit({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  const focusedRef = useRef(false);

  // Sync from outside when not focused (e.g., undo/redo)
  useEffect(() => {
    if (!focusedRef.current) {
      setText(JSON.stringify(value, null, 2));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const tryCommit = (t: string) => {
    try {
      const parsed = JSON.parse(t || "{}") as Record<string, unknown>;
      setError(null);
      onChange(parsed);
    } catch (err) {
      setError(String((err as Error).message));
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onFocus={() => { focusedRef.current = true; }}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          // Show parse errors inline while typing, but don't commit until blur
          try {
            JSON.parse(t || "{}");
            setError(null);
          } catch (err) {
            setError(String((err as Error).message));
          }
        }}
        onBlur={(e) => {
          focusedRef.current = false;
          tryCommit(e.target.value);
        }}
        rows={6}
        spellCheck={false}
        className="w-full font-mono text-[11px] border border-gray-200 rounded p-2 bg-gray-50 focus:border-blue-500 focus:outline-none"
      />
      {error && <div className="text-[10px] text-red-600 mt-1">{error}</div>}
    </div>
  );
}
