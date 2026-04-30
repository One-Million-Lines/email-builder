import { useState } from "react";
import { ChevronUp, ChevronDown, Trash2, Plus, X, Sparkles, Hand } from "lucide-react";
import { useEmailStore } from "../store/emailStore";
import type { EmailModule } from "../core/types";
import {
  ALGORITHMS,
  ALGORITHM_BY_ID,
  FALLBACK_OPTIONS,
  MAX_STACK,
  defaultLogic,
  readLogic,
  productSlotCount,
  type RecommendationsLogic,
  type StackEntry,
} from "../recommendations/logic";

interface Props {
  mod: EmailModule;
}

export function RecommendationsPanel({ mod }: Props) {
  const updateModule = useEmailStore((s) => s.updateModule);
  const slots = productSlotCount(mod) || 2;
  const logic = readLogic(mod.data) ?? defaultLogic(slots);

  const update = (patch: Partial<RecommendationsLogic>) => {
    const next = { ...logic, ...patch };
    updateModule(mod.id, { data: { ...(mod.data ?? {}), recommendations: next } });
  };

  const updateFilters = (patch: Partial<RecommendationsLogic["filters"]>) =>
    update({ filters: { ...logic.filters, ...patch } });

  return (
    <div className="border border-blue-200 rounded-lg bg-blue-50/40 mt-4 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2 border-b border-blue-200 bg-blue-50">
        <Sparkles size={14} className="text-blue-700" />
        <div className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
          Products Source
        </div>
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
          <input
            type="number"
            min={1}
            max={20}
            value={logic.noProducts}
            onChange={(e) => update({ noProducts: Number(e.target.value) || 1 })}
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
  return (
    <>
      <Field label="Source feed">
        <input
          type="text"
          placeholder="e.g. main-catalog"
          value={logic.sourceFeed ?? ""}
          onChange={(e) => update({ sourceFeed: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="Items to include (product IDs / SKUs)">
        <TokenInput
          value={logic.manualProducts}
          onChange={(v) => update({ manualProducts: v })}
          placeholder="Add product id"
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
        <TokenInput
          value={logic.filters.excludeProducts}
          onChange={(v) => updateFilters({ excludeProducts: v })}
          placeholder="Add product id"
        />
      </Field>
      <Field label="Include products">
        <TokenInput
          value={logic.filters.includeProducts}
          onChange={(v) => updateFilters({ includeProducts: v })}
          placeholder="Add product id"
        />
      </Field>
      <Field label="Exclude categories">
        <TokenInput
          value={logic.filters.excludeCategories}
          onChange={(v) => updateFilters({ excludeCategories: v })}
          placeholder="Add category"
        />
      </Field>
      <Field label="Include categories">
        <TokenInput
          value={logic.filters.includeCategories}
          onChange={(v) => updateFilters({ includeCategories: v })}
          placeholder="Add category"
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Minimum stock">
          <input
            type="number"
            min={0}
            value={logic.filters.minStock ?? 0}
            onChange={(e) => updateFilters({ minStock: Number(e.target.value) || 0 })}
            className={inputCls}
          />
        </Field>
        <Field label="Minimum price">
          <input
            type="number"
            min={0}
            value={logic.filters.minPrice ?? 0}
            onChange={(e) => updateFilters({ minPrice: Number(e.target.value) || 0 })}
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
        <input
          type="text"
          placeholder="brand, color"
          value={logic.filters.sameField ?? ""}
          onChange={(e) => updateFilters({ sameField: e.target.value })}
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
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon?: React.ReactNode;
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
        {icon}
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
                  <input
                    type={p.type === "number" ? "number" : "text"}
                    value={String(s.params?.[p.key] ?? p.default ?? "")}
                    onChange={(e) =>
                      setParam(
                        i,
                        p.key,
                        p.type === "number" ? Number(e.target.value) : e.target.value
                      )
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
  return (
    <div className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={
          "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold uppercase " +
          (disabled
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-teal-600 text-white hover:bg-teal-700")
        }
      >
        <Plus size={12} /> Add
      </button>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-64 max-h-80 overflow-auto bg-white border border-gray-200 rounded shadow-lg z-20">
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
        </>
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
  return (
    <div className="border border-gray-200 rounded bg-white p-1 flex flex-wrap items-center gap-1 focus-within:border-blue-500">
      {value.map((tok) => (
        <span
          key={tok}
          className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-[11px] rounded px-1.5 py-0.5"
        >
          {tok}
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

function JsonEdit({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => {
          const t = e.target.value;
          setText(t);
          try {
            const parsed = JSON.parse(t || "{}");
            setError(null);
            onChange(parsed);
          } catch (err) {
            setError(String((err as Error).message));
          }
        }}
        rows={6}
        spellCheck={false}
        className="w-full font-mono text-[11px] border border-gray-200 rounded p-2 bg-gray-50 focus:border-blue-500 focus:outline-none"
      />
      {error && <div className="text-[10px] text-red-600 mt-1">{error}</div>}
    </div>
  );
}
