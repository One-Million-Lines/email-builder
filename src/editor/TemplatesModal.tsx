import { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import { useEmailStore } from "../store/emailStore";
import {
  templateRegistry,
  TEMPLATE_CATEGORY_LABELS,
  type TemplateCategory,
  type TemplateDefinition,
} from "../templates";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TemplatesModal({ open, onClose }: Props) {
  const loadTemplate = useEmailStore((s) => s.loadTemplate);
  const hasContent = useEmailStore((s) => s.doc.modules.length > 0);

  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const all = useMemo(() => templateRegistry.list(), [open]);

  const filtered = useMemo(() => {
    let list = all;
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [all, category, query]);

  if (!open) return null;

  const handlePick = (def: TemplateDefinition) => {
    if (
      hasContent &&
      !window.confirm(
        `Loading "${def.name}" will replace your current email. Continue?`
      )
    ) {
      return;
    }
    loadTemplate(def);
    onClose();
  };

  const categories: Array<{ key: TemplateCategory | "all"; label: string }> = [
    { key: "all", label: "All templates" },
    ...(Object.entries(TEMPLATE_CATEGORY_LABELS) as Array<
      [TemplateCategory, string]
    >).map(([key, label]) => ({ key, label })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm">
      <div className="m-auto flex h-[92vh] w-[96vw] max-w-350 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Start from a template
            </h2>
            <p className="text-sm text-neutral-500">
              Pick a fully-built email and tweak from there.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-56 shrink-0 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-3">
            <div className="relative mb-3">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-md border border-neutral-200 bg-white py-1.5 pl-7 pr-2 text-sm outline-none focus:border-neutral-400"
              />
            </div>
            <ul className="space-y-0.5">
              {categories.map((c) => {
                const active = c.key === category;
                return (
                  <li key={c.key}>
                    <button
                      onClick={() => setCategory(c.key)}
                      className={
                        "block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition " +
                        (active
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-700 hover:bg-neutral-200")
                      }
                    >
                      {c.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Grid */}
          <main className="flex-1 overflow-y-auto p-6">
            {filtered.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-neutral-500">
                No templates match.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filtered.map((t) => (
                  <TemplateCard
                    key={t.id}
                    def={t}
                    onPick={() => handlePick(t)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  def,
  onPick,
}: {
  def: TemplateDefinition;
  onPick: () => void;
}) {
  return (
    <button
      onClick={onPick}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-lg"
    >
      <div className="aspect-3/4 w-full overflow-hidden bg-neutral-100">
        {def.thumbnail ? (
          <img
            src={def.thumbnail}
            alt={def.name}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-neutral-400">
            No preview
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="text-xs uppercase tracking-wider text-neutral-500">
          {TEMPLATE_CATEGORY_LABELS[def.category]}
        </div>
        <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
          {def.name}
        </div>
        <div className="line-clamp-2 text-xs text-neutral-500">
          {def.description}
        </div>
      </div>
    </button>
  );
}
