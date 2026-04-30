import { useEmailStore } from "../store/emailStore";
import type {
  EmailModule,
  EmailElement,
  TextElement,
  ImageElement,
  ButtonElement,
  SpacerElement,
  DividerElement,
  ProductGridElement,
  Theme,
} from "../core/types";
import { resolveStyle, resolveToken } from "../core/theme";
import { Copy, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";

const MOBILE_WIDTH = 375;

function mergeMobile(
  style: Record<string, unknown> | undefined,
  viewMode: "desktop" | "mobile"
): Record<string, unknown> {
  const base = (style ?? {}) as Record<string, unknown>;
  if (viewMode !== "mobile") return base;
  const mobile = (base.mobile as Record<string, unknown> | undefined) ?? {};
  return { ...base, ...mobile };
}

export function Canvas() {
  const {
    doc,
    selection,
    setSelection,
    reorderModules,
    deleteModule,
    duplicateModule,
    viewMode,
  } = useEmailStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = doc.modules.findIndex((m) => m.id === active.id);
    const to = doc.modules.findIndex((m) => m.id === over.id);
    if (from === -1 || to === -1) return;
    reorderModules(from, to);
  };

  // Keyboard delete
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selection?.kind === "module") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
          return;
        deleteModule(selection.moduleId);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selection, deleteModule]);

  const bg = resolveToken(doc.settings.backgroundColor, doc.theme) as string;
  const cbg = resolveToken(doc.settings.contentBackgroundColor, doc.theme) as string;

  const reorderedIds = doc.modules.map((m) => m.id);
  const canvasWidth = viewMode === "mobile" ? MOBILE_WIDTH : doc.settings.width;

  return (
    <div
      className="flex-1 overflow-y-auto"
      style={{ background: bg }}
      onClick={() => setSelection({ kind: "email" })}
    >
      <div className="py-8 flex justify-center">
        <div
          className={`shadow-lg transition-all duration-200 ${viewMode === "mobile" ? "rounded-[28px] border-[10px] border-gray-800" : ""}`}
          style={{ width: canvasWidth, background: cbg, minHeight: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {doc.modules.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-sm">
              Add modules from the left sidebar to start building your email.
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={reorderedIds} strategy={verticalListSortingStrategy}>
              {doc.modules.map((m, i) => (
                <SortableModule
                  key={m.id}
                  mod={m}
                  index={i}
                  viewMode={viewMode}
                  selected={selection?.kind === "module" && selection.moduleId === m.id}
                  selectionEl={
                    selection?.kind === "element" && selection.moduleId === m.id
                      ? selection.elementId
                      : null
                  }
                  theme={doc.theme}
                  onSelectModule={() => setSelection({ kind: "module", moduleId: m.id })}
                  onSelectElement={(elId) =>
                    setSelection({ kind: "element", moduleId: m.id, elementId: elId })
                  }
                  onDuplicate={() => duplicateModule(m.id)}
                  onDelete={() => deleteModule(m.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

function SortableModule(props: {
  mod: EmailModule;
  index: number;
  viewMode: "desktop" | "mobile";
  selected: boolean;
  selectionEl: string | null;
  theme: Theme;
  onSelectModule: () => void;
  onSelectElement: (id: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.mod.id,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
  };
  return (
    <div ref={setNodeRef} style={style}>
      <ModuleView
        mod={props.mod}
        viewMode={props.viewMode}
        selected={props.selected}
        selectionEl={props.selectionEl}
        theme={props.theme}
        onSelectModule={props.onSelectModule}
        onSelectElement={props.onSelectElement}
        onDuplicate={props.onDuplicate}
        onDelete={props.onDelete}
        dragHandle={
          <button
            {...attributes}
            {...listeners}
            className="bg-blue-600 text-white p-1 rounded cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={14} />
          </button>
        }
      />
    </div>
  );
}

function ModuleView({
  mod,
  viewMode,
  selected,
  selectionEl,
  theme,
  onSelectModule,
  onSelectElement,
  onDuplicate,
  onDelete,
  dragHandle,
}: {
  mod: EmailModule;
  viewMode: "desktop" | "mobile";
  selected: boolean;
  selectionEl: string | null;
  theme: Theme;
  onSelectModule: () => void;
  onSelectElement: (id: string) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  dragHandle: React.ReactNode;
}) {
  const rawStyle = (mod.style ?? {}) as Record<string, unknown>;
  const hideOn = rawStyle.hideOn as "mobile" | "desktop" | undefined;
  if (hideOn === viewMode) return null;
  const merged = mergeMobile(rawStyle, viewMode);
  const s = resolveStyle(merged, theme);
  const moduleStyle: React.CSSProperties = {
    backgroundColor: s.backgroundColor as string,
    paddingTop: (s.paddingTop as number) ?? 0,
    paddingBottom: (s.paddingBottom as number) ?? 0,
    paddingLeft: (s.paddingLeft as number) ?? 0,
    paddingRight: (s.paddingRight as number) ?? 0,
    borderRadius: s.borderRadius as number,
    position: "relative",
    outline: selected ? "2px solid #2563eb" : "1px dashed transparent",
    outlineOffset: -2,
    cursor: "pointer",
  };

  return (
    <div
      style={moduleStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelectModule();
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.outline = "1px dashed #93c5fd";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.outline = "1px dashed transparent";
      }}
    >
      {selected && (
        <div className="absolute -top-3 left-2 z-10 flex gap-1">
          {dragHandle}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="bg-blue-600 text-white p-1 rounded"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="bg-red-600 text-white p-1 rounded"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
            {mod.name}
          </span>
        </div>
      )}
      {mod.children.map((c) => (
        <ElementView
          key={c.id}
          el={c}
          viewMode={viewMode}
          theme={theme}
          moduleId={mod.id}
          selected={selectionEl === c.id}
          onSelect={() => onSelectElement(c.id)}
        />
      ))}
    </div>
  );
}

function ElementView({
  el,
  viewMode,
  theme,
  moduleId,
  selected,
  onSelect,
}: {
  el: EmailElement;
  viewMode: "desktop" | "mobile";
  theme: Theme;
  moduleId: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const elStyle = (el as { style?: Record<string, unknown> }).style;
  const hideOn = elStyle?.hideOn as "mobile" | "desktop" | undefined;
  if (hideOn === viewMode) return null;
  const wrapStyle: React.CSSProperties = {
    outline: selected ? "2px solid #f59e0b" : "1px dashed transparent",
    outlineOffset: -2,
    position: "relative",
  };
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  switch (el.type) {
    case "text":
      return (
        <div style={wrapStyle} onClick={handle}>
          <TextRender el={el} viewMode={viewMode} theme={theme} moduleId={moduleId} />
        </div>
      );
    case "image":
      return (
        <div style={wrapStyle} onClick={handle}>
          <ImageRender el={el} viewMode={viewMode} theme={theme} />
        </div>
      );
    case "button":
      return (
        <div style={wrapStyle} onClick={handle}>
          <ButtonRender el={el} viewMode={viewMode} theme={theme} />
        </div>
      );
    case "spacer":
      return (
        <div style={wrapStyle} onClick={handle}>
          <SpacerRender el={el} />
        </div>
      );
    case "divider":
      return (
        <div style={wrapStyle} onClick={handle}>
          <DividerRender el={el} viewMode={viewMode} theme={theme} />
        </div>
      );
    case "productGrid":
      return (
        <div style={wrapStyle} onClick={handle}>
          <ProductGridRender el={el} viewMode={viewMode} theme={theme} />
        </div>
      );
  }
}

function TextRender({
  el,
  viewMode,
  theme,
  moduleId,
}: {
  el: TextElement;
  viewMode: "desktop" | "mobile";
  theme: Theme;
  moduleId: string;
}) {
  const updateElement = useEmailStore((s) => s.updateElement);
  const merged = mergeMobile(el.style as Record<string, unknown>, viewMode);
  const s = resolveStyle(merged, theme);
  const style: React.CSSProperties = {
    fontFamily: s.fontFamily as string,
    fontSize: s.fontSize as number,
    lineHeight: s.lineHeight as number,
    letterSpacing: s.letterSpacing as number,
    fontWeight: s.fontWeight as React.CSSProperties["fontWeight"],
    color: s.color as string,
    textAlign: s.align as React.CSSProperties["textAlign"],
    paddingTop: (s.paddingTop as number) ?? 8,
    paddingBottom: (s.paddingBottom as number) ?? 8,
    paddingLeft: (s.paddingLeft as number) ?? 16,
    paddingRight: (s.paddingRight as number) ?? 16,
    margin: 0,
    minHeight: "1.5em",
  };
  return (
    <div
      style={style}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const next = e.currentTarget.innerHTML;
        if (next !== el.content) {
          updateElement(moduleId, el.id, { content: next } as Partial<TextElement>);
        }
      }}
      dangerouslySetInnerHTML={{ __html: el.content }}
    />
  );
}

function ImageRender({ el, viewMode, theme }: { el: ImageElement; viewMode: "desktop" | "mobile"; theme: Theme }) {
  const merged = mergeMobile(el.style as Record<string, unknown>, viewMode);
  const s = resolveStyle(merged, theme);
  const wrap: React.CSSProperties = {
    textAlign: (s.align as React.CSSProperties["textAlign"]) ?? "center",
    paddingTop: (s.paddingTop as number) ?? 0,
    paddingBottom: (s.paddingBottom as number) ?? 0,
    paddingLeft: (s.paddingLeft as number) ?? 0,
    paddingRight: (s.paddingRight as number) ?? 0,
  };
  const img: React.CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    width: s.width as number,
    height: (s.height as number) || "auto",
    borderRadius: s.borderRadius as number,
  };
  return (
    <div style={wrap}>
      <img src={el.src} alt={el.alt ?? ""} style={img} />
    </div>
  );
}

function ButtonRender({ el, viewMode, theme }: { el: ButtonElement; viewMode: "desktop" | "mobile"; theme: Theme }) {
  const merged = mergeMobile(el.style as Record<string, unknown>, viewMode);
  const s = resolveStyle(merged, theme);
  const wrap: React.CSSProperties = {
    textAlign: (s.align as React.CSSProperties["textAlign"]) ?? "center",
    paddingTop: (s.paddingTop as number) ?? 12,
    paddingBottom: (s.paddingBottom as number) ?? 12,
    paddingLeft: (s.paddingLeft as number) ?? 16,
    paddingRight: (s.paddingRight as number) ?? 16,
  };
  const btn: React.CSSProperties = {
    display: "inline-block",
    backgroundColor: (s.backgroundColor as string) ?? "#3A7D52",
    color: (s.color as string) ?? "#fff",
    fontFamily: s.fontFamily as string,
    fontSize: (s.fontSize as number) ?? 16,
    fontWeight: (s.fontWeight as React.CSSProperties["fontWeight"]) ?? "bold",
    borderRadius: (s.borderRadius as number) ?? 6,
    padding: "12px 24px",
    textDecoration: "none",
  };
  return (
    <div style={wrap}>
      <span style={btn}>{el.label}</span>
    </div>
  );
}

function SpacerRender({ el }: { el: SpacerElement }) {
  return <div style={{ height: el.height, background: "rgba(0,0,0,0.02)" }} />;
}

function DividerRender({ el, viewMode, theme }: { el: DividerElement; viewMode: "desktop" | "mobile"; theme: Theme }) {
  const merged = mergeMobile(el.style as Record<string, unknown>, viewMode);
  const s = resolveStyle(merged, theme);
  return (
    <div
      style={{
        paddingTop: (s.paddingTop as number) ?? 8,
        paddingBottom: (s.paddingBottom as number) ?? 8,
      }}
    >
      <hr
        style={{
          border: 0,
          borderTop: `${(s.thickness as number) ?? 1}px solid ${(s.color as string) ?? "#E5E7EB"}`,
          margin: 0,
        }}
      />
    </div>
  );
}

function ProductGridRender({
  el,
  viewMode,
  theme,
}: {
  el: ProductGridElement;
  viewMode: "desktop" | "mobile";
  theme: Theme;
}) {
  const merged = mergeMobile(el.style as Record<string, unknown>, viewMode);
  const s = resolveStyle(merged, theme);
  const isMobile = viewMode === "mobile";
  const cols = el.columns;
  const cardBg =
    (s.cardBackgroundColor as string) ?? (s.backgroundColor as string) ?? "transparent";
  const nameColor = (s.nameColor as string) ?? "#111827";
  const finalColor = (s.finalPriceColor as string) ?? "#3A7D52";
  const oldColor = (s.oldPriceColor as string) ?? "#9CA3AF";
  const btnBg = (s.buttonBackgroundColor as string) ?? "#3A7D52";
  const btnColor = (s.buttonColor as string) ?? "#FFFFFF";
  const radius = (s.borderRadius as number) ?? 0;

  const wrapStyle: React.CSSProperties = {
    paddingTop: (s.paddingTop as number) ?? 16,
    paddingBottom: (s.paddingBottom as number) ?? 16,
    paddingLeft: (s.paddingLeft as number) ?? 16,
    paddingRight: (s.paddingRight as number) ?? 16,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  };

  return (
    <div style={wrapStyle}>
      {el.products.map((p) => {
        const cellStyle: React.CSSProperties = {
          width: isMobile ? "100%" : `calc(${100 / cols}% - 8px)`,
          background: cardBg,
          borderRadius: radius,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        };
        return (
          <div key={p.id} style={cellStyle}>
            <img
              src={p.image}
              alt={p.imageAlt ?? p.name}
              style={{ display: "block", width: "100%", height: "auto", borderRadius: radius }}
            />
            <div
              style={{
                padding: "12px 12px 4px 12px",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: 15,
                fontWeight: "bold",
                color: nameColor,
                lineHeight: 1.3,
              }}
            >
              {p.name}
            </div>
            <div style={{ padding: "0 12px 8px 12px", fontFamily: "Arial, Helvetica, sans-serif" }}>
              {el.showOldPrice && p.oldPrice && (
                <span
                  className="old_price"
                  style={{
                    color: oldColor,
                    textDecoration: "line-through",
                    fontSize: 14,
                    marginRight: 8,
                  }}
                >
                  {p.oldPrice}
                </span>
              )}
              <span
                className="final_price"
                style={{ color: finalColor, fontWeight: "bold", fontSize: 18 }}
              >
                {p.finalPrice}
              </span>
            </div>
            {el.showDescription && p.description && (
              <div
                style={{
                  padding: "0 12px 8px 12px",
                  fontFamily: "Arial, Helvetica, sans-serif",
                  fontSize: 13,
                  color: "#6B7280",
                  lineHeight: 1.5,
                }}
              >
                {p.description}
              </div>
            )}
            {el.showButton && (
              <div style={{ padding: "4px 12px 12px 12px", textAlign: "center", marginTop: "auto" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 18px",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: 13,
                    fontWeight: "bold",
                    color: btnColor,
                    backgroundColor: btnBg,
                    borderRadius: 6,
                  }}
                >
                  {p.buttonLabel ?? el.buttonLabel ?? "Shop now"}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
