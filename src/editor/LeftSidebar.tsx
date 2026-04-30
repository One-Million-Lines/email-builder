import { useState } from "react";
import { useEmailStore } from "../store/emailStore";
import { moduleRegistry, CATEGORY_LABELS, type ModuleCategory } from "../modules/registry";
import {
  Square,
  Menu,
  LayoutTemplate,
  Type,
  Star,
  MousePointerClick,
  ShoppingCart,
  Receipt,
  Share2,
  AlignVerticalJustifyEnd,
  Palette,
  Layers,
  ArrowUp,
  ArrowDown,
  Trash2,
  Copy,
} from "lucide-react";

const CATEGORIES: { id: ModuleCategory; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "basic", icon: Square },
  { id: "menu", icon: Menu },
  { id: "header", icon: LayoutTemplate },
  { id: "content", icon: Type },
  { id: "feature", icon: Star },
  { id: "call_to_action", icon: MousePointerClick },
  { id: "ecommerce", icon: ShoppingCart },
  { id: "transactional", icon: Receipt },
  { id: "social", icon: Share2 },
  { id: "footer", icon: AlignVerticalJustifyEnd },
];

export function LeftSidebar() {
  const [active, setActive] = useState<ModuleCategory | "themes" | "layers">("layers");
  const { addModule, themes, applyTheme, doc } = useEmailStore();

  return (
    <div className="flex h-full bg-white border-r border-gray-200 shrink-0">
      {/* Category rail */}
      <div className="w-16 border-r border-gray-200 flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => setActive("layers")}
          title="Layout overview"
          className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded text-[10px] transition-colors ${
            active === "layers" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Layers size={20} />
          <span>Layers</span>
        </button>
        <div className="h-px w-10 bg-gray-200 my-1" />
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              title={CATEGORY_LABELS[c.id]}
              className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded text-[10px] transition-colors ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              <span className="leading-tight text-center">{CATEGORY_LABELS[c.id]}</span>
            </button>
          );
        })}
        <div className="mt-auto">
          <button
            onClick={() => setActive("themes")}
            title="Themes"
            className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded text-[10px] transition-colors ${
              active === "themes" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Palette size={20} />
            <span>Themes</span>
          </button>
        </div>
      </div>

      {/* Module list panel */}
      <div className="w-64 overflow-y-auto p-3">
        {active === "layers" ? (
          <LayersPanel />
        ) : active === "themes" ? (
          <>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Themes
            </h3>
            <div className="flex flex-col gap-2">
              {themes.map((t) => {
                const isActive = doc.theme.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t)}
                    className={`text-left p-3 rounded border transition-colors ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: t.tokens.colors.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded border border-gray-200"
                        style={{ background: t.tokens.colors.surface }}
                      />
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: t.tokens.colors.text }}
                      />
                    </div>
                    <div className="text-sm font-medium">{t.name}</div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              {CATEGORY_LABELS[active]}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {moduleRegistry.byCategory(active).map((def) => (
                <button
                  key={def.type}
                  onClick={() => addModule(def.create())}
                  className="text-left p-3 rounded border border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <div className="h-12 bg-gray-50 rounded mb-2 flex items-center justify-center text-xs text-gray-400">
                    {def.name}
                  </div>
                  <div className="text-xs font-medium text-gray-700">{def.name}</div>
                </button>
              ))}
              {moduleRegistry.byCategory(active).length === 0 && (
                <div className="text-xs text-gray-400 italic py-4 text-center">
                  No modules in this category yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Layers (layout overview) panel ----------

function LayersPanel() {
  const { doc, selection, setSelection, reorderModules, deleteModule, duplicateModule } =
    useEmailStore();

  if (doc.modules.length === 0) {
    return (
      <>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Layout
        </h3>
        <p className="text-xs text-gray-400 italic">
          No blocks yet. Pick a category from the rail to add modules.
        </p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
        Layout
      </h3>
      <p className="text-[10px] text-gray-400 mb-3">
        {doc.modules.length} block{doc.modules.length === 1 ? "" : "s"} · click to select
      </p>
      <ul className="flex flex-col gap-1">
        {doc.modules.map((m, i) => {
          const active = selection?.kind !== "email" && selection?.moduleId === m.id;
          return (
            <li
              key={m.id}
              className={`flex items-center gap-1 rounded border px-2 py-1.5 text-xs cursor-pointer transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => setSelection({ kind: "module", moduleId: m.id })}
            >
              <span className="text-[10px] text-gray-400 w-4 shrink-0">{i + 1}</span>
              <span className="flex-1 truncate">
                {m.name}
                <span className="text-[10px] text-gray-400 ml-1">
                  ({m.children.length})
                </span>
              </span>
              <button
                disabled={i === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  reorderModules(i, i - 1);
                }}
                className="p-0.5 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                title="Move up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                disabled={i === doc.modules.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  reorderModules(i, i + 1);
                }}
                className="p-0.5 text-gray-500 hover:text-blue-600 disabled:opacity-30"
                title="Move down"
              >
                <ArrowDown size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateModule(m.id);
                }}
                className="p-0.5 text-gray-500 hover:text-blue-600"
                title="Duplicate"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteModule(m.id);
                }}
                className="p-0.5 text-gray-500 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
