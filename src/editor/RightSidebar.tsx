import { useEffect, useRef, useState } from "react";
import { useEmailStore } from "../store/emailStore";
import { resolveToken } from "../core/theme";
import { getAssetProvider } from "../core/plugins";
import type { ProductSearchResult } from "../core/plugins";
import { RecommendationsPanel } from "./RecommendationsPanel";
import { isProductAware } from "../recommendations/logic";
import { VoucherPanel } from "../plugins/voucherSelect/VoucherPanel";
import { isVoucherAware } from "../plugins/voucherSelect/logic";
import { product as makeProduct } from "../modules/helpers";
import { ProductSearchModal } from "../plugins/productSearch/ProductSearchModal";
import { useProductSearchAvailable } from "../plugins/productSearch/useProductSearch";
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
  SpecialLinkType,
} from "../core/types";
import { SPECIAL_LINK_PLACEHOLDERS } from "../core/types";
import { Smartphone, Monitor, Trash2, Plus, RotateCcw, Upload, Loader2, Check, Search, PanelRightClose, PanelRightOpen, Tag, ChevronsLeft, ChevronsRight } from "lucide-react";

const SPECIAL_LINK_LABELS: Record<SpecialLinkType, string> = {
  unsubscribe: "Unsubscribe",
  view_in_browser: "View in browser",
  manage_preferences: "Manage preferences",
  user_profile: "User profile",
};

export function RightSidebar() {
  const { selection, doc, viewMode } = useEmailStore();
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  // Collapsed state: a thin strip with a re-open button.
  if (!open) {
    return (
      <div className="flex flex-col items-center w-6 bg-white border-l border-gray-200 shrink-0">
        <button
          onClick={() => setOpen(true)}
          title="Show properties"
          className="flex items-center justify-center w-full py-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <PanelRightOpen size={14} />
        </button>
      </div>
    );
  }

  const panelWidth = expanded ? "w-[576px]" : "w-72";

  return (
    <div className={`${panelWidth} bg-white border-l border-gray-200 shrink-0 overflow-y-auto flex flex-col transition-all duration-200`}>
      {/* Header: view-mode badge + expand + collapse toggles */}
      <div className={`px-3 py-2 text-[11px] flex items-center gap-1.5 border-b shrink-0 ${viewMode === "mobile" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-100"}`}>
        {viewMode === "mobile" ? <Smartphone size={12} /> : <Monitor size={12} />}
        <span className="flex-1">Editing {viewMode} styles</span>
        {/* Expand / narrow toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Narrow panel" : "Expand panel"}
          className={`p-0.5 rounded hover:bg-black/10 transition-colors ${viewMode === "mobile" ? "text-amber-700 hover:text-amber-900" : "text-blue-700 hover:text-blue-900"}`}
        >
          {expanded ? <ChevronsRight size={13} /> : <ChevronsLeft size={13} />}
        </button>
        {/* Collapse to strip */}
        <button
          onClick={() => setOpen(false)}
          title="Hide properties"
          className={`p-0.5 rounded hover:bg-black/10 transition-colors ${viewMode === "mobile" ? "text-amber-700 hover:text-amber-900" : "text-blue-700 hover:text-blue-900"}`}
        >
          <PanelRightClose size={13} />
        </button>
      </div>
      <div className="p-4 flex-1">
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

// ---------- Special link role field ----------

function LinkRoleField({
  linkType,
  onChangeLinkType,
  onChangeLink,
}: {
  linkType: string | undefined;
  onChangeLinkType: (v: SpecialLinkType | undefined) => void;
  onChangeLink: (url: string) => void;
}) {
  return (
    <Field label="Link role">
      <Select
        value={linkType ?? ""}
        onChange={(e) => {
          const v = e.target.value as SpecialLinkType | "";
          if (v === "") {
            onChangeLinkType(undefined);
          } else {
            onChangeLinkType(v);
            onChangeLink(SPECIAL_LINK_PLACEHOLDERS[v]);
          }
        }}
      >
        <option value="">— None —</option>
        <option value="unsubscribe">Unsubscribe</option>
        <option value="view_in_browser">View in browser</option>
        <option value="manage_preferences">Manage preferences</option>
        <option value="user_profile">User profile</option>
      </Select>
      {linkType && (
        <p className="text-[10px] text-blue-600 mt-1 flex items-center gap-1">
          <Tag size={10} />
          Placeholder: <code className="font-mono">{SPECIAL_LINK_PLACEHOLDERS[linkType as SpecialLinkType]}</code>
        </p>
      )}
    </Field>
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
        <ThemeEditor />
      </div>
    </>
  );
}

// ---------- Theme editor ----------

function ThemeEditor() {
  const { doc, themes, applyTheme } = useEmailStore();
  const current = doc.theme;

  // Detect whether the current theme's colors have been customised vs the preset.
  const preset = themes.find((t) => t.id === current.id);
  const isCustomised =
    preset != null &&
    Object.entries(current.tokens.colors).some(([k, v]) => preset.tokens.colors[k] !== v);

  const updateColor = (key: string, hex: string) => {
    applyTheme({
      ...current,
      tokens: {
        ...current.tokens,
        colors: { ...current.tokens.colors, [key]: hex },
      },
    });
  };

  return (
    <>
      {/* ── Preset switcher ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2">
        <PanelTitle>Theme</PanelTitle>
        {isCustomised && (
          <button
            onClick={() => preset && applyTheme(preset)}
            className="text-[10px] text-blue-600 hover:underline mb-3"
            title="Discard color changes and restore the preset"
          >
            Reset to preset
          </button>
        )}
      </div>
      <div className="flex flex-col gap-1.5 mb-4">
        {themes.map((t) => {
          const active = t.id === current.id;
          return (
            <button
              key={t.id}
              onClick={() => applyTheme(t)}
              title={t.name}
              className={`flex items-center gap-2 px-2.5 py-2 rounded border text-xs transition-colors ${
                active
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
              }`}
            >
              {/* Three color chips */}
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                style={{ background: t.tokens.colors.primary }}
              />
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                style={{ background: t.tokens.colors.background }}
              />
              <span
                className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                style={{ background: t.tokens.colors.text }}
              />
              <span className="flex-1 text-left">{t.name}</span>
              {active && <Check size={12} className="text-blue-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* ── Editable color tokens ────────────────────────────────── */}
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Colors
        {isCustomised && (
          <span className="ml-2 normal-case font-normal text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
            customised
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(current.tokens.colors).map(([key, value]) => (
          <ThemeColorRow
            key={key}
            label={key}
            value={value}
            onChange={(hex) => updateColor(key, hex)}
          />
        ))}
      </div>
    </>
  );
}

function ThemeColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  // Keep a local text value so the user can type freely; commits on blur / Enter.
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);

  // The native color picker needs a valid 6-digit hex.
  const pickerHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
    ? value.length === 4
      ? "#" + value.slice(1).split("").map((c) => c + c).join("")
      : value
    : "#000000";

  const commit = (raw: string) => {
    const v = raw.trim();
    if (v) onChange(v);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-28 shrink-0 truncate" title={label}>
        {label}
      </span>
      <label
        className="relative w-7 h-7 rounded border border-gray-200 cursor-pointer overflow-hidden shrink-0"
        style={{ background: pickerHex }}
        title={`Pick ${label} color`}
      >
        <input
          type="color"
          value={pickerHex}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => commit(text)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none font-mono"
        spellCheck={false}
      />
    </div>
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
      {isVoucherAware(mod) && <VoucherPanel mod={mod} />}
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
      <PanelTitle>Text block</PanelTitle>

      <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
        Click the text in the canvas to edit it inline. Select words to apply
        bold, italic, colour, links and more using the floating toolbar.
      </p>

      <Field label="Default align">
        <Select
          value={(style.align as string) ?? "left"}
          onChange={(e) => setStyle({ align: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-2">
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

      <PaddingFields style={style} mobileKeys={mobileKeys} onSet={setStyle} />
      <VisibilityField
        hideOn={rawStyle.hideOn as "mobile" | "desktop" | undefined}
        onChange={(v) => patch({ style: { ...rawStyle, hideOn: v } } as Partial<TextElement>)}
      />
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
      <LinkRoleField
        linkType={el.linkType}
        onChangeLinkType={(v) => patch({ linkType: v } as Partial<ImageElement>)}
        onChangeLink={(url) => patch({ link: url } as Partial<ImageElement>)}
      />
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
      <LinkRoleField
        linkType={el.linkType}
        onChangeLinkType={(v) => patch({ linkType: v } as Partial<ButtonElement>)}
        onChangeLink={(url) => patch({ link: url } as Partial<ButtonElement>)}
      />
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

  const searchAvailable = useProductSearchAvailable();
  // null = closed; { index: null } = add new; { index } = replace that row.
  const [search, setSearch] = useState<{ index: number | null; query: string } | null>(null);

  // Apply a searched product. Auto-enables the matching visibility toggles so
  // the new data shows up immediately; every field stays editable afterwards.
  const applySearchResult = (r: ProductSearchResult) => {
    const built = makeProduct({
      name: r.name,
      finalPrice: r.finalPrice,
      oldPrice: r.oldPrice,
      description: r.description,
      link: r.link,
      image: r.image,
      imageAlt: r.imageAlt,
      stars: r.stars,
    });
    const flags: Partial<ProductGridElement> = {};
    if (r.oldPrice && !el.showOldPrice) flags.showOldPrice = true;
    if (r.description && !el.showDescription) flags.showDescription = true;
    if (r.stars != null && !el.showStars) flags.showStars = true;

    const products = el.products.slice();
    if (search?.index != null) {
      // Replace: keep the row's id and any per-product button override.
      const existing = products[search.index];
      products[search.index] = { ...built, id: existing.id, buttonLabel: existing.buttonLabel };
    } else {
      products.push(built);
    }
    patch({ products, ...flags } as Partial<ProductGridElement>);
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

      <ToggleRow
        label="Show old price"
        checked={el.showOldPrice}
        onChange={(v) => patch({ showOldPrice: v } as Partial<ProductGridElement>)}
      />
      <ToggleRow
        label="Show description"
        checked={el.showDescription}
        onChange={(v) => patch({ showDescription: v } as Partial<ProductGridElement>)}
      />
      <ToggleRow
        label="Show stars"
        checked={el.showStars ?? false}
        onChange={(v) => patch({ showStars: v } as Partial<ProductGridElement>)}
      />
      <ToggleRow
        label="Show button"
        checked={el.showButton}
        onChange={(v) => patch({ showButton: v } as Partial<ProductGridElement>)}
      />
      <Field label="Default button label">
        <TextInput
          value={el.buttonLabel ?? ""}
          placeholder="Shop now"
          onChange={(e) => patch({ buttonLabel: e.target.value } as Partial<ProductGridElement>)}
        />
      </Field>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <PanelTitle>Products ({el.products.length})</PanelTitle>
          <div className="flex items-center gap-1">
            {searchAvailable && (
              <button
                onClick={() => setSearch({ index: null, query: "" })}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded"
                title="Find a product from your catalog"
              >
                <Search size={12} /> Find
              </button>
            )}
            <button
              onClick={() => setProducts([...el.products, newProduct(el.products.length)])}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-blue-600 hover:bg-blue-50 rounded"
              title="Add product"
            >
              <Plus size={12} /> Add
            </button>
          </div>
        </div>
        {el.products.map((p, idx) => (
          <ProductRow
            key={p.id}
            index={idx}
            product={p}
            canSearch={searchAvailable}
            onSearch={() => setSearch({ index: idx, query: p.name })}
            onChange={(np) => {
              const next = [...el.products];
              next[idx] = np;
              setProducts(next);
            }}
            onDelete={() => setProducts(el.products.filter((_, i) => i !== idx))}
          />
        ))}
      </div>

      <ProductSearchModal
        open={search !== null}
        initialQuery={search?.query}
        title={search?.index != null ? "Replace product" : "Add product from search"}
        onClose={() => setSearch(null)}
        onSave={applySearchResult}
      />

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
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        // Guard against a wrapping <label> re-dispatching the click (double toggle).
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
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

// A toggle laid out as a single row (label left, switch right). Uses a <div>
// (not a <label>) so the switch button is the only click target — this avoids
// the label-forwards-click double toggle that made these switches feel broken.
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function ProductRow({
  index,
  product,
  canSearch,
  onSearch,
  onChange,
  onDelete,
}: {
  index: number;
  product: Product;
  canSearch: boolean;
  onSearch: () => void;
  onChange: (p: Product) => void;
  onDelete: () => void;
}) {
  const set = (p: Partial<Product>) => onChange({ ...product, ...p });
  return (
    <div className="border border-gray-200 rounded p-2 mb-2 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-gray-600">#{index + 1}</span>
        <div className="flex items-center gap-1.5">
          {canSearch && (
            <button
              type="button"
              onClick={onSearch}
              className="text-gray-400 hover:text-blue-600"
              title="Replace from product search"
            >
              <Search size={12} />
            </button>
          )}
          <button
            type="button"
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600"
            title="Remove product"
          >
            <Trash2 size={12} />
          </button>
        </div>
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
        <Field label="Old price">
          <TextInput
            value={product.oldPrice ?? ""}
            placeholder="Optional"
            onChange={(e) => set({ oldPrice: e.target.value || undefined })}
          />
        </Field>
      </div>
      <Field label="Description">
        <TextInput
          value={product.description ?? ""}
          onChange={(e) => set({ description: e.target.value || undefined })}
        />
      </Field>
      <Field label="Stars (0–5, optional)">
        <NumberInput
          value={product.stars ?? ""}
          min={0}
          max={5}
          step={0.5}
          placeholder="e.g. 4.5"
          onChange={(e) =>
            set({ stars: e.target.value === "" ? undefined : Number(e.target.value) })
          }
        />
      </Field>
      <Field label="Button label (override)">
        <TextInput
          value={product.buttonLabel ?? ""}
          placeholder="Inherit default"
          onChange={(e) => set({ buttonLabel: e.target.value || undefined })}
        />
      </Field>
    </div>
  );
}
