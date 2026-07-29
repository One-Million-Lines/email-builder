import { useState, useSyncExternalStore } from "react";
import { useEmailStore } from "../store/emailStore";
import { moduleRegistry, CATEGORY_LABELS, type ModuleCategory } from "../modules/registry";
import { galleryRegistry, type GalleryItem } from "../gallery/registry";
import type { EmailModule } from "../core/types";
import { AIChatPanel, useAIAvailable } from "../ai/AIChatPanel";
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
  Images,
  Sparkles,
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
  const [active, setActive] = useState<
    ModuleCategory | "themes" | "layers" | "gallery" | "ai"
  >("layers");
  const { addModule, themes, applyTheme, doc } = useEmailStore();
  const aiAvailable = useAIAvailable();

  // Re-render when galleries are (un)registered at runtime.
  useSyncExternalStore(
    galleryRegistry.subscribe,
    galleryRegistry.getSnapshot,
    galleryRegistry.getSnapshot
  );

  const hasGallery = galleryRegistry.list().length > 0;

  return (
    <div className="flex h-full bg-white border-r border-gray-200 shrink-0">
      {/* Category rail */}
      <div className="w-16 border-r border-gray-200 flex flex-col items-center py-2 gap-1 overflow-y-auto">
        {aiAvailable && (
          <>
            <RailButton
              id="ai"
              label="AI"
              icon={Sparkles}
              active={active === "ai"}
              onClick={() => setActive("ai")}
              accent
            />
            <div className="h-px w-10 bg-gray-200 my-1" />
          </>
        )}
        <RailButton
          id="layers"
          label="Layers"
          icon={Layers}
          active={active === "layers"}
          onClick={() => setActive("layers")}
        />
        {hasGallery && (
          <RailButton
            id="gallery"
            label="Gallery"
            icon={Images}
            active={active === "gallery"}
            onClick={() => setActive("gallery")}
          />
        )}
        <div className="h-px w-10 bg-gray-200 my-1" />
        {CATEGORIES.map((c) => (
          <RailButton
            key={c.id}
            id={c.id}
            label={CATEGORY_LABELS[c.id]}
            icon={c.icon}
            active={active === c.id}
            onClick={() => setActive(c.id)}
          />
        ))}
        <div className="mt-auto">
          <RailButton
            id="themes"
            label="Themes"
            icon={Palette}
            active={active === "themes"}
            onClick={() => setActive("themes")}
          />
        </div>
      </div>

      {/* Module list panel */}
      <div className="w-64 overflow-y-auto p-3">
        {active === "layers" ? (
          <LayersPanel />
        ) : active === "ai" ? (
          <AIChatPanel />
        ) : active === "gallery" ? (
          <GalleryPanel onAdd={(item) => addModule(item.create())} />
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
          <CategoryPanel category={active} onAdd={(create) => addModule(create())} />
        )}
      </div>
    </div>
  );
}

// ---------- Category rail button ----------

function RailButton({
  label,
  icon: Icon,
  active,
  onClick,
  accent,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  active: boolean;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded text-[10px] transition-colors ${
        active
          ? "bg-blue-50 text-blue-700"
          : accent
          ? "text-blue-600 hover:bg-blue-50"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon size={20} />
      <span className="leading-tight text-center">{label}</span>
    </button>
  );
}

// ---------- Category panel (gallery items on top, then built-ins) ----------

function CategoryPanel({
  category,
  onAdd,
}: {
  category: ModuleCategory;
  onAdd: (create: () => EmailModule) => void;
}) {
  const galleryItems = galleryRegistry.byCategory(category);
  const modules = moduleRegistry.byCategory(category);

  return (
    <>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
        {CATEGORY_LABELS[category]}
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {galleryItems.map((item) => (
          <ModuleCard
            key={item.type}
            name={item.name}
            badge={item.badge ?? "New"}
            onClick={() => onAdd(item.create)}
          />
        ))}
        {modules.map((def) => (
          <ModuleCard key={def.type} name={def.name} onClick={() => onAdd(def.create)} />
        ))}
        {galleryItems.length === 0 && modules.length === 0 && (
          <div className="text-xs text-gray-400 italic py-4 text-center">
            No modules in this category yet.
          </div>
        )}
      </div>
    </>
  );
}

// ---------- Gallery panel (all gallery items grouped by category) ----------

function GalleryPanel({ onAdd }: { onAdd: (item: GalleryItem) => void }) {
  const galleries = galleryRegistry.listGalleries();
  const items = galleryRegistry.list();

  if (items.length === 0) {
    return (
      <>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
          Gallery
        </h3>
        <p className="text-xs text-gray-400 italic">No galleries loaded.</p>
      </>
    );
  }

  return (
    <>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
        Gallery
      </h3>
      <p className="text-[10px] text-gray-400 mb-3">
        {items.length} element{items.length === 1 ? "" : "s"} across {galleries.length}{" "}
        {galleries.length === 1 ? "gallery" : "galleries"}
      </p>
      <div className="flex flex-col gap-4">
        {galleries.map((g) => {
          const gItems = items.filter((i) => i.galleryId === g.id);
          if (gItems.length === 0) return null;
          return (
            <div key={g.id}>
              <div className="text-[11px] font-medium text-gray-600 mb-1.5">{g.name}</div>
              <div className="grid grid-cols-1 gap-2">
                {gItems.map((item) => (
                  <ModuleCard
                    key={item.type}
                    name={item.name}
                    badge={item.badge ?? "New"}
                    sub={CATEGORY_LABELS[item.category]}
                    onClick={() => onAdd(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------- Shared module card ----------

function ModuleCard({
  name,
  onClick,
  badge,
  sub,
}: {
  name: string;
  onClick: () => void;
  badge?: string;
  sub?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left p-3 rounded border border-gray-200 bg-white hover:border-blue-400 hover:shadow-sm transition-all"
    >
      {badge && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold uppercase tracking-wide bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
      <div className="h-12 bg-gray-50 rounded mb-2 flex items-center justify-center text-xs text-gray-400 px-2 text-center">
        {name}
      </div>
      <div className="text-xs font-medium text-gray-700">{name}</div>
      {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
    </button>
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
