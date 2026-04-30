import { useEffect, useRef, useState } from "react";
import { useEmailStore } from "../store/emailStore";
import { resolveToken } from "../core/theme";
import { getAssetProvider } from "../core/plugins";
import { RecommendationsPanel } from "./RecommendationsPanel";
import { isProductAware } from "../recommendations/logic";
import type {
  EmailElement,
  EmailModule,
  TextElement,
  ImageElement,
  ButtonElement,
  SpacerElement,
  DividerElement,
  ProductGridElement,
  Product,
} from "../core/types";
import { Smartphone, Monitor, Trash2, Plus, RotateCcw, Upload, Loader2 } from "lucide-react";

export function RightSidebar() {
  const { selection, doc, viewMode } = useEmailStore();

  return (
    <div className="w-72 bg-white border-l border-gray-200 shrink-0 overflow-y-auto">
      <div className={`px-4 py-2 text-[11px] flex items-center gap-1.5 border-b ${viewMode === "mobile" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-100"}`}>
        {viewMode === "mobile" ? <Smartphone size={12} /> : <Monitor size={12} />}
        Editing {viewMode} styles
      </div>
      <div className="p-4">
        {!selection || selection.kind === "email" ? (
          <EmailSettingsPanel />
        ) : selection.kind === "module" ? (
          (() => {
            const m = doc.modules.find((x) => x.id === selection.moduleId);
            return m ? <ModulePanel mod={m} /> : <Empty />;
          })()
        ) : (
          (() => {
            const m = doc.modules.find((x) => x.id === selection.moduleId);
            const el = m?.children.find((c) => c.id === selection.elementId);
            return m && el ? <ElementPanel mod={m} el={el} /> : <Empty />;
          })()
        )}
      </div>
    </div>
  );
}

function Empty() {
  return <div className="text-xs text-gray-400">Nothing selected.</div>;
}

// ---------- Mobile-aware style helpers ----------

// Read merged style: in mobile view, base + mobile override; in desktop, just base.
function readStyle(rawStyle: Record<string, unknown>, viewMode: "desktop" | "mobile") {
  if (viewMode !== "mobile") return rawStyle;
  const mobile = (rawStyle.mobile as Record<string, unknown> | undefined) ?? {};
  return { ...rawStyle, ...mobile };
}

// Write a patch into the right slot depending on view mode.
function writeStylePatch(
  rawStyle: Record<string, unknown>,
  patch: Record<string, unknown>,
  viewMode: "desktop" | "mobile"
): Record<string, unknown> {
  if (viewMode !== "mobile") return { ...rawStyle, ...patch };
  const mobile = (rawStyle.mobile as Record<string, unknown> | undefined) ?? {};
  return { ...rawStyle, mobile: { ...mobile, ...patch } };
}

function MobileBadge({ overridden }: { overridden: boolean }) {
  if (!overridden) return null;
  return (
    <span className="ml-1 text-[9px] uppercase tracking-wide bg-amber-100 text-amber-800 px-1 rounded">
      mobile
    </span>
  );
}

function VisibilityField({
  hideOn,
  onChange,
}: {
  hideOn: "mobile" | "desktop" | undefined;
  onChange: (v: "mobile" | "desktop" | undefined) => void;
}) {
  return (
    <Field label="Visibility">
      <Select
        value={hideOn ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? undefined : (v as "mobile" | "desktop"));
        }}
      >
        <option value="">Show on all</option>
        <option value="mobile">Hide on mobile</option>
        <option value="desktop">Hide on desktop</option>
      </Select>
    </Field>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
      {children}
    </h3>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="flex items-center text-xs text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
    />
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput type="number" {...props} />;
}

function ImageUrlInput({
  value,
  onChange,
  onAlt,
}: {
  value: string;
  onChange: (url: string) => void;
  onAlt?: (alt: string) => void;
}) {
  const provider = getAssetProvider();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    if (!provider) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await provider.upload(file);
      onChange(res.url);
      if (res.alt && onAlt) onAlt(res.alt);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex gap-1">
        <TextInput value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
        {provider && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="shrink-0 px-2 py-1.5 text-xs border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
              title="Upload image"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            </button>
          </>
        )}
      </div>
      {err && <p className="text-[10px] text-red-600 mt-1">{err}</p>}
      {!provider && (
        <p className="text-[10px] text-gray-400 mt-1">
          Tip: register an image uploader plugin to enable file uploads.
        </p>
      )}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
  defaultValue,
}: {
  value: string;
  onChange: (v: string) => void;
  defaultValue?: string;
}) {
  const theme = useEmailStore((s) => s.doc.theme);
  const isToken = typeof value === "string" && value.startsWith("{");

  // Remember the most recent token seen so the user can reset back to it
  // even after picking a custom hex color.
  const lastTokenRef = useRef<string | undefined>(
    defaultValue && defaultValue.startsWith("{") ? defaultValue : isToken ? value : undefined
  );
  useEffect(() => {
    if (isToken) lastTokenRef.current = value;
    else if (defaultValue && defaultValue.startsWith("{")) lastTokenRef.current = defaultValue;
  }, [value, isToken, defaultValue]);

  // Hex shown in the native picker swatch (resolves tokens against theme).
  const swatchHex = (() => {
    const resolved = resolveToken(value, theme);
    if (typeof resolved === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(resolved)) {
      return resolved.length === 4
        ? "#" + resolved.slice(1).split("").map((c) => c + c).join("")
        : resolved;
    }
    return "#000000";
  })();

  const resetTarget = defaultValue ?? lastTokenRef.current;
  const canReset = !!resetTarget && resetTarget !== value;

  // Local text mirrors prop but lets user type freely (commits on blur/Enter).
  const [text, setText] = useState(value ?? "");
  useEffect(() => setText(value ?? ""), [value]);

  return (
    <div className="flex gap-1 items-center">
      <label
        className="relative w-9 h-8 border border-gray-200 rounded cursor-pointer overflow-hidden shrink-0"
        title={isToken ? `Token → ${swatchHex} (click to override)` : "Pick color"}
        style={{ background: swatchHex }}
      >
        <input
          type="color"
          value={swatchHex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {isToken && (
          <span
            className="absolute inset-0 pointer-events-none border-2 border-dashed rounded"
            style={{ borderColor: "rgba(255,255,255,0.6)" }}
          />
        )}
      </label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== value && onChange(text)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none font-mono"
      />
      {canReset && (
        <button
          type="button"
          onClick={() => onChange(resetTarget!)}
          className="shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title={`Reset to ${resetTarget}`}
        >
          <RotateCcw size={12} />
        </button>
      )}
    </div>
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none bg-white"
    />
  );
}

// ---------- Email-level panel ----------

function EmailSettingsPanel() {
  const { doc, updateMeta, updateSettings } = useEmailStore();
  return (
    <>
      <PanelTitle>Email</PanelTitle>
      <Field label="Name">
        <TextInput
          value={doc.meta.name}
          onChange={(e) => updateMeta({ name: e.target.value })}
        />
      </Field>
      <Field label="Preview text">
        <TextInput
          value={doc.meta.previewText}
          onChange={(e) => updateMeta({ previewText: e.target.value })}
        />
      </Field>
      <Field label="Width (px)">
        <NumberInput
          value={doc.settings.width}
          onChange={(e) => updateSettings({ width: Number(e.target.value) || 600 })}
        />
      </Field>
      <Field label="Background color">
        <ColorInput
          value={doc.settings.backgroundColor}
          onChange={(v) => updateSettings({ backgroundColor: v })}
        />
      </Field>
      <Field label="Content background color">
        <ColorInput
          value={doc.settings.contentBackgroundColor}
          onChange={(v) => updateSettings({ contentBackgroundColor: v })}
        />
      </Field>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <PanelTitle>Theme tokens (read-only preview)</PanelTitle>
        <div className="text-xs space-y-1">
          <div className="font-medium">{doc.theme.name}</div>
          <div className="grid grid-cols-2 gap-1 text-gray-500">
            {Object.entries(doc.theme.tokens.colors).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1">
                <span className="w-3 h-3 rounded" style={{ background: v }} />
                <span className="truncate">{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------- Module panel ----------

function ModulePanel({ mod }: { mod: EmailModule }) {
  const updateModule = useEmailStore((s) => s.updateModule);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (mod.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const mobileKeys = new Set(Object.keys((rawStyle.mobile as Record<string, unknown>) ?? {}));
  const set = (patch: Record<string, unknown>) =>
    updateModule(mod.id, { style: writeStylePatch(rawStyle, patch, viewMode) });
  return (
    <>
      <PanelTitle>{mod.name}</PanelTitle>
      <Field label={<>Background color<MobileBadge overridden={mobileKeys.has("backgroundColor")} /></>}>
        <ColorInput
          value={(style.backgroundColor as string) ?? ""}
          onChange={(v) => set({ backgroundColor: v })}
        />
      </Field>
      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={set} />
      <Field label={<>Border radius<MobileBadge overridden={mobileKeys.has("borderRadius")} /></>}>
        <NumberInput
          value={(style.borderRadius as number) ?? 0}
          onChange={(e) => set({ borderRadius: Number(e.target.value) })}
        />
      </Field>
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => updateModule(mod.id, { style: { ...rawStyle, hideOn: v } })}
      />
      {isProductAware(mod) && <RecommendationsPanel mod={mod} />}
    </>
  );
}

// ---------- Element panel ----------

function ElementPanel({ mod, el }: { mod: EmailModule; el: EmailElement }) {
  switch (el.type) {
    case "text":
      return <TextElementPanel mod={mod} el={el} />;
    case "image":
      return <ImageElementPanel mod={mod} el={el} />;
    case "button":
      return <ButtonElementPanel mod={mod} el={el} />;
    case "spacer":
      return <SpacerElementPanel mod={mod} el={el} />;
    case "divider":
      return <DividerElementPanel mod={mod} el={el} />;
    case "productGrid":
      return <ProductGridElementPanel mod={mod} el={el} />;
  }
}

function PaddingFields({
  style,
  mobileKeys,
  onSet,
}: {
  style: Record<string, unknown>;
  mobileKeys?: Set<string>;
  onSet: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {(["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"] as const).map((k) => (
        <Field key={k} label={<>{k.replace("padding", "Pad ")}<MobileBadge overridden={!!mobileKeys?.has(k)} /></>}>
          <NumberInput
            value={(style[k] as number) ?? 0}
            onChange={(e) => onSet({ [k]: Number(e.target.value) })}
          />
        </Field>
      ))}
    </div>
  );
}

function useElPatch<T extends EmailElement>(mod: EmailModule, el: T) {
  const updateElement = useEmailStore((s) => s.updateElement);
  return (patch: Partial<T>) => updateElement(mod.id, el.id, patch as Partial<EmailElement>);
}

function TextElementPanel({ mod, el }: { mod: EmailModule; el: TextElement }) {
  const patch = useElPatch(mod, el);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (el.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const mobileKeys = new Set(Object.keys((rawStyle.mobile as Record<string, unknown>) ?? {}));
  const setStyle = (p: Record<string, unknown>) =>
    patch({ style: writeStylePatch(rawStyle, p, viewMode) } as Partial<TextElement>);
  return (
    <>
      <PanelTitle>Text</PanelTitle>
      <Field label="Content">
        <textarea
          value={el.content.replace(/<br\s*\/?>/g, "\n")}
          onChange={(e) =>
            patch({ content: e.target.value.replace(/\n/g, "<br/>") } as Partial<TextElement>)
          }
          rows={3}
          className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 focus:outline-none"
        />
      </Field>
      <Field label="Font family">
        <TextInput
          value={(style.fontFamily as string) ?? ""}
          onChange={(e) => setStyle({ fontFamily: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font size">
          <NumberInput
            value={(style.fontSize as number) ?? 16}
            onChange={(e) => setStyle({ fontSize: Number(e.target.value) })}
          />
        </Field>
        <Field label="Weight">
          <TextInput
            value={String(style.fontWeight ?? "")}
            onChange={(e) => setStyle({ fontWeight: e.target.value || undefined })}
          />
        </Field>
        <Field label="Line height">
          <NumberInput
            step={0.1}
            value={(style.lineHeight as number) ?? 1.5}
            onChange={(e) => setStyle({ lineHeight: Number(e.target.value) })}
          />
        </Field>
        <Field label="Letter spacing">
          <NumberInput
            value={(style.letterSpacing as number) ?? 0}
            onChange={(e) => setStyle({ letterSpacing: Number(e.target.value) })}
          />
        </Field>
      </div>
      <Field label="Color">
        <ColorInput
          value={(style.color as string) ?? "#000000"}
          onChange={(v) => setStyle({ color: v })}
        />
      </Field>
      <Field label="Align">
        <Select
          value={(style.align as string) ?? "left"}
          onChange={(e) => setStyle({ align: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </Field>
      <Field label="Link URL">
        <TextInput
          value={(style.link as string) ?? ""}
          onChange={(e) => setStyle({ link: e.target.value })}
        />
      </Field>
      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={setStyle} />
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => patch({ style: { ...rawStyle, hideOn: v } } as Partial<TextElement>)}
      />
      <button
        onClick={() =>
          patch({ content: `${el.content} ✨` } as Partial<TextElement>)
        }
        className="w-full mt-2 px-3 py-2 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded hover:bg-purple-100"
      >
        ✨ AI rewrite (mock)
      </button>
    </>
  );
}

function ImageElementPanel({ mod, el }: { mod: EmailModule; el: ImageElement }) {
  const patch = useElPatch(mod, el);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (el.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const mobileKeys = new Set(Object.keys((rawStyle.mobile as Record<string, unknown>) ?? {}));
  const setStyle = (p: Record<string, unknown>) =>
    patch({ style: writeStylePatch(rawStyle, p, viewMode) } as Partial<ImageElement>);
  return (
    <>
      <PanelTitle>Image</PanelTitle>
      <Field label="Image URL">
        <ImageUrlInput
          value={el.src}
          onChange={(url) => patch({ src: url } as Partial<ImageElement>)}
          onAlt={(alt) => patch({ alt } as Partial<ImageElement>)}
        />
      </Field>
      <Field label="Alt text">
        <TextInput
          value={el.alt ?? ""}
          onChange={(e) => patch({ alt: e.target.value } as Partial<ImageElement>)}
        />
      </Field>
      <Field label="Link">
        <TextInput
          value={el.link ?? ""}
          onChange={(e) => patch({ link: e.target.value } as Partial<ImageElement>)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={<>Width<MobileBadge overridden={mobileKeys.has("width")} /></>}>
          <NumberInput
            value={(style.width as number) ?? 0}
            onChange={(e) => setStyle({ width: Number(e.target.value) })}
          />
        </Field>
        <Field label={<>Height<MobileBadge overridden={mobileKeys.has("height")} /></>}>
          <NumberInput
            value={(style.height as number) ?? 0}
            onChange={(e) => setStyle({ height: Number(e.target.value) || undefined })}
          />
        </Field>
      </div>
      <Field label="Border radius">
        <NumberInput
          value={(style.borderRadius as number) ?? 0}
          onChange={(e) => setStyle({ borderRadius: Number(e.target.value) })}
        />
      </Field>
      <Field label="Align">
        <Select
          value={(style.align as string) ?? "center"}
          onChange={(e) => setStyle({ align: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </Field>
      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={setStyle} />
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => patch({ style: { ...rawStyle, hideOn: v } } as Partial<ImageElement>)}
      />
    </>
  );
}

function ButtonElementPanel({ mod, el }: { mod: EmailModule; el: ButtonElement }) {
  const patch = useElPatch(mod, el);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (el.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const mobileKeys = new Set(Object.keys((rawStyle.mobile as Record<string, unknown>) ?? {}));
  const setStyle = (p: Record<string, unknown>) =>
    patch({ style: writeStylePatch(rawStyle, p, viewMode) } as Partial<ButtonElement>);
  return (
    <>
      <PanelTitle>Button</PanelTitle>
      <Field label="Label">
        <TextInput value={el.label} onChange={(e) => patch({ label: e.target.value } as Partial<ButtonElement>)} />
      </Field>
      <Field label="Link">
        <TextInput value={el.link} onChange={(e) => patch({ link: e.target.value } as Partial<ButtonElement>)} />
      </Field>
      <Field label="Background color">
        <ColorInput
          value={(style.backgroundColor as string) ?? ""}
          onChange={(v) => setStyle({ backgroundColor: v })}
        />
      </Field>
      <Field label="Text color">
        <ColorInput
          value={(style.color as string) ?? "#FFFFFF"}
          onChange={(v) => setStyle({ color: v })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Font size">
          <NumberInput
            value={(style.fontSize as number) ?? 16}
            onChange={(e) => setStyle({ fontSize: Number(e.target.value) })}
          />
        </Field>
        <Field label="Border radius">
          <NumberInput
            value={(style.borderRadius as number) ?? 6}
            onChange={(e) => setStyle({ borderRadius: Number(e.target.value) })}
          />
        </Field>
      </div>
      <Field label="Align">
        <Select
          value={(style.align as string) ?? "center"}
          onChange={(e) => setStyle({ align: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </Field>
      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={setStyle} />
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => patch({ style: { ...rawStyle, hideOn: v } } as Partial<ButtonElement>)}
      />
    </>
  );
}

function SpacerElementPanel({ mod, el }: { mod: EmailModule; el: SpacerElement }) {
  const patch = useElPatch(mod, el);
  return (
    <>
      <PanelTitle>Spacer</PanelTitle>
      <Field label="Height (px)">
        <NumberInput
          value={el.height}
          onChange={(e) => patch({ height: Number(e.target.value) || 0 } as Partial<SpacerElement>)}
        />
      </Field>
    </>
  );
}

function DividerElementPanel({ mod, el }: { mod: EmailModule; el: DividerElement }) {
  const patch = useElPatch(mod, el);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (el.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const mobileKeys = new Set(Object.keys((rawStyle.mobile as Record<string, unknown>) ?? {}));
  const setStyle = (p: Record<string, unknown>) =>
    patch({ style: writeStylePatch(rawStyle, p, viewMode) } as Partial<DividerElement>);
  return (
    <>
      <PanelTitle>Divider</PanelTitle>
      <Field label="Color">
        <ColorInput
          value={(style.color as string) ?? "#E5E7EB"}
          onChange={(v) => setStyle({ color: v })}
        />
      </Field>
      <Field label="Thickness">
        <NumberInput
          value={(style.thickness as number) ?? 1}
          onChange={(e) => setStyle({ thickness: Number(e.target.value) })}
        />
      </Field>
      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={setStyle} />
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => patch({ style: { ...rawStyle, hideOn: v } } as Partial<DividerElement>)}
      />
    </>
  );
}

// ---------- Product Grid panel ----------

function newProduct(seed = 0): Product {
  const i = seed + 1;
  return {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    image: `https://placehold.co/400x400?text=Product+${i}`,
    imageAlt: `Product ${i}`,
    name: `Product ${i}`,
    oldPrice: "$59",
    finalPrice: "$39",
    description: "Short product description.",
    link: "#",
  };
}

function ProductGridElementPanel({ mod, el }: { mod: EmailModule; el: ProductGridElement }) {
  const patch = useElPatch(mod, el);
  const viewMode = useEmailStore((s) => s.viewMode);
  const rawStyle = (el.style ?? {}) as Record<string, unknown>;
  const style = readStyle(rawStyle, viewMode);
  const setStyle = (p: Record<string, unknown>) =>
    patch({ style: writeStylePatch(rawStyle, p, viewMode) } as Partial<ProductGridElement>);

  const setProducts = (products: Product[]) =>
    patch({ products } as Partial<ProductGridElement>);

  const setColumns = (columns: 1 | 2 | 3) => {
    // Resize products array to a sensible default for the new column count.
    const target = columns;
    let products = el.products.slice();
    if (products.length < target) {
      while (products.length < target) products.push(newProduct(products.length));
    }
    patch({ columns, products } as Partial<ProductGridElement>);
  };

  return (
    <>
      <PanelTitle>Product Grid</PanelTitle>

      <Field label="Columns (desktop)">
        <div className="inline-flex bg-gray-100 rounded p-0.5 w-full">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setColumns(n as 1 | 2 | 3)}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                el.columns === n ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {n} {n === 1 ? "col" : "cols"}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Always stacks to 1 column on mobile.</p>
      </Field>

      <Field label="Show old price">
        <Toggle
          checked={el.showOldPrice}
          onChange={(v) => patch({ showOldPrice: v } as Partial<ProductGridElement>)}
        />
      </Field>
      <Field label="Show description">
        <Toggle
          checked={el.showDescription}
          onChange={(v) => patch({ showDescription: v } as Partial<ProductGridElement>)}
        />
      </Field>
      <Field label="Show button">
        <Toggle
          checked={el.showButton}
          onChange={(v) => patch({ showButton: v } as Partial<ProductGridElement>)}
        />
      </Field>
      {el.showButton && (
        <Field label="Default button label">
          <TextInput
            value={el.buttonLabel ?? ""}
            placeholder="Shop now"
            onChange={(e) => patch({ buttonLabel: e.target.value } as Partial<ProductGridElement>)}
          />
        </Field>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <PanelTitle>Products ({el.products.length})</PanelTitle>
          <button
            onClick={() => setProducts([...el.products, newProduct(el.products.length)])}
            className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded"
            title="Add product"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {el.products.map((p, idx) => (
          <ProductRow
            key={p.id}
            index={idx}
            product={p}
            showOldPrice={el.showOldPrice}
            showDescription={el.showDescription}
            showButton={el.showButton}
            onChange={(np) => {
              const next = [...el.products];
              next[idx] = np;
              setProducts(next);
            }}
            onDelete={() => setProducts(el.products.filter((_, i) => i !== idx))}
          />
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <PanelTitle>Style</PanelTitle>
        <Field label="Card background">
          <ColorInput
            value={(style.cardBackgroundColor as string) ?? ""}
            onChange={(v) => setStyle({ cardBackgroundColor: v })}
          />
        </Field>
        <Field label="Name color">
          <ColorInput
            value={(style.nameColor as string) ?? ""}
            onChange={(v) => setStyle({ nameColor: v })}
          />
        </Field>
        <Field label="Final price color">
          <ColorInput
            value={(style.finalPriceColor as string) ?? ""}
            onChange={(v) => setStyle({ finalPriceColor: v })}
          />
        </Field>
        <Field label="Old price color">
          <ColorInput
            value={(style.oldPriceColor as string) ?? ""}
            onChange={(v) => setStyle({ oldPriceColor: v })}
          />
        </Field>
        <Field label="Button background">
          <ColorInput
            value={(style.buttonBackgroundColor as string) ?? ""}
            onChange={(v) => setStyle({ buttonBackgroundColor: v })}
          />
        </Field>
        <Field label="Button text color">
          <ColorInput
            value={(style.buttonColor as string) ?? ""}
            onChange={(v) => setStyle({ buttonColor: v })}
          />
        </Field>
        <Field label="Card radius">
          <NumberInput
            value={(style.borderRadius as number) ?? 0}
            onChange={(e) => setStyle({ borderRadius: Number(e.target.value) })}
          />
        </Field>
        <PaddingFields style={style} onSet={setStyle} />
      </div>
    </>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ProductRow({
  index,
  product,
  showOldPrice,
  showDescription,
  showButton,
  onChange,
  onDelete,
}: {
  index: number;
  product: Product;
  showOldPrice: boolean;
  showDescription: boolean;
  showButton: boolean;
  onChange: (p: Product) => void;
  onDelete: () => void;
}) {
  const set = (p: Partial<Product>) => onChange({ ...product, ...p });
  return (
    <div className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-600">#{index + 1}</span>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600"
          title="Remove product"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <Field label="Name">
        <TextInput value={product.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <Field label="Image URL">
        <ImageUrlInput
          value={product.image}
          onChange={(url) => set({ image: url })}
          onAlt={(alt) => set({ imageAlt: alt })}
        />
      </Field>
      <Field label="Link">
        <TextInput
          value={product.link ?? ""}
          onChange={(e) => set({ link: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Final price">
          <TextInput
            value={product.finalPrice}
            onChange={(e) => set({ finalPrice: e.target.value })}
          />
        </Field>
        {showOldPrice && (
          <Field label="Old price">
            <TextInput
              value={product.oldPrice ?? ""}
              onChange={(e) => set({ oldPrice: e.target.value })}
            />
          </Field>
        )}
      </div>
      {showDescription && (
        <Field label="Description">
          <TextInput
            value={product.description ?? ""}
            onChange={(e) => set({ description: e.target.value })}
          />
        </Field>
      )}
      {showButton && (
        <Field label="Button label (override)">
          <TextInput
            value={product.buttonLabel ?? ""}
            placeholder="Inherit default"
            onChange={(e) => set({ buttonLabel: e.target.value || undefined })}
          />
        </Field>
      )}
    </div>
  );
}
