/**
 * Floating inline rich-text toolbar.
 *
 * Shows whenever a [data-email-text] contenteditable element has focus.
 * Positions itself above the text selection (or above the element when there
 * is no selection). All interactive controls use onMouseDown + preventDefault
 * so the contenteditable never loses focus during formatting.
 *
 * Supported actions:
 *   Bold · Italic · Underline · Font family · Font size · Text color ·
 *   Insert link (with optional special-link role) · Emoji picker ·
 *   Merge-tag inserter (when mergeTags are configured)
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useRichTextStore } from "./richTextState";
import { useMergeTagsStore } from "../plugins/mergeTags/state";
import type { SpecialLinkType } from "../core/types";
import { SPECIAL_LINK_PLACEHOLDERS } from "../core/types";
import { Link2, Smile, ChevronDown, Tag, X } from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────

/** Email-safe font stacks. Label shown in the toolbar, value applied inline. */
const FONT_FAMILIES = [
  { label: "Default",       value: "" },
  { label: "Arial",         value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia",       value: "Georgia, 'Times New Roman', serif" },
  { label: "Tahoma",        value: "Tahoma, Geneva, sans-serif" },
  { label: "Trebuchet MS",  value: "'Trebuchet MS', Helvetica, sans-serif" },
  { label: "Verdana",       value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New",   value: "'Courier New', Courier, monospace" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
];

const FONT_SIZES = ["10","11","12","13","14","15","16","18","20","22","24","28","32","36","48"];

const PRESET_COLORS = [
  "#111827","#374151","#6B7280","#9CA3AF","#D1D5DB","#F3F4F6","#FFFFFF",
  "#DC2626","#F97316","#EAB308","#22C55E","#3B82F6","#8B5CF6","#EC4899",
  "#B91C1C","#C2410C","#A16207","#15803D","#1D4ED8","#6D28D9","#BE185D",
];

const EMOJIS = [
  "😀","😊","😍","🥰","😎","🤩","👋","🙌","👍","💪","❤️","💙","💚","💛","🧡","💜",
  "🎉","🔥","✨","⭐","🏆","🥇","🎁","🎯","🚀","💡","📧","💌","📱","💻",
  "✅","❌","⚠️","🔔","📊","📈","💰","💳","🛒","🏷️","📍","🗓️","⚡","🌟",
];

const SPECIAL_LINK_LABELS: Record<SpecialLinkType, string> = {
  unsubscribe: "Unsubscribe",
  view_in_browser: "View in browser",
  manage_preferences: "Manage preferences",
  user_profile: "User profile",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSelectionInnerHtml(): string {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return "";
  const range = sel.getRangeAt(0);
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);
  return div.innerHTML;
}

function execCmd(cmd: string, value?: string) {
  document.execCommand(cmd, false, value);
}

function insertHtml(html: string) {
  document.execCommand("insertHTML", false, html);
}

function wrapSelectionWithStyle(cssProperty: string, cssValue: string) {
  const innerHtml = getSelectionInnerHtml();
  if (!innerHtml) return;
  insertHtml(`<span style="${cssProperty}:${cssValue}">${innerHtml}</span>`);
}

function saveRange(): Range | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0).cloneRange();
}

function restoreRange(range: Range) {
  const sel = window.getSelection();
  if (!sel) return;
  sel.removeAllRanges();
  sel.addRange(range);
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function TBtn({
  title,
  active,
  disabled,
  onMouseDown,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onMouseDown={onMouseDown}
      className={`flex items-center justify-center w-7 h-7 rounded text-xs transition-colors leading-none ${
        active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-100 disabled:opacity-30"
      }`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" />;
}

// ─── Link popover ─────────────────────────────────────────────────────────

/** State captured at the moment the link button is clicked. */
interface LinkInitial {
  selectedText: string;
  href: string;
  linkType: SpecialLinkType | "";
  isEditing: boolean; // true when cursor was inside an existing <a>
}

const EMPTY_LINK_INITIAL: LinkInitial = { selectedText: "", href: "", linkType: "", isEditing: false };

/** Reverse-lookup: given an href, return the matching SpecialLinkType if any. */
function hrefToLinkType(href: string): SpecialLinkType | "" {
  const entry = (Object.entries(SPECIAL_LINK_PLACEHOLDERS) as [SpecialLinkType, string][])
    .find(([, ph]) => ph === href);
  return entry?.[0] ?? "";
}

function LinkPopover({
  savedRange,
  initial,
  onClose,
}: {
  savedRange: Range | null;
  initial: LinkInitial;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(initial.href);
  const [linkType, setLinkType] = useState<SpecialLinkType | "">(initial.linkType);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the URL input (slight delay lets the popover render first)
    setTimeout(() => inputRef.current?.focus(), 20);
  }, []);

  const handleUrlChange = (v: string) => {
    setUrl(v);
    // Auto-detect if user types a placeholder URL
    setLinkType(hrefToLinkType(v));
  };

  const handleLinkTypeChange = (lt: SpecialLinkType | "") => {
    setLinkType(lt);
    // Auto-fill URL with the placeholder so users see what goes in the href
    setUrl(lt ? SPECIAL_LINK_PLACEHOLDERS[lt] : "");
  };

  const apply = () => {
    const href = url.trim();
    if (!href) { onClose(); return; }

    // Re-focus the contenteditable and restore the saved selection
    if (savedRange) {
      const container = savedRange.commonAncestorContainer;
      const textEl = (
        container.nodeType === Node.ELEMENT_NODE
          ? (container as HTMLElement)
          : container.parentElement
      )?.closest<HTMLElement>("[data-email-text]");
      if (textEl) {
        textEl.focus();
        restoreRange(savedRange);
      }
    }

    // Build the inner HTML — use the original selection or the href as fallback text
    const innerHtml = (() => {
      if (!savedRange) return href;
      const div = document.createElement("div");
      div.appendChild(savedRange.cloneContents());
      return div.innerHTML || div.textContent || href;
    })();

    const typeAttr = linkType ? ` data-link-type="${linkType}"` : "";
    insertHtml(
      `<a href="${href}"${typeAttr} style="color:inherit;text-decoration:underline">${innerHtml}</a>`
    );
    onClose();
  };

  const isSpecialPlaceholder = linkType !== "";
  const canApply = url.trim().length > 0;

  return (
    <div
      className="absolute bottom-full left-0 mb-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl"
      style={{ width: 320 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-sm font-semibold text-gray-900">
          {initial.isEditing ? "Edit link" : "Insert link"}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded p-0.5">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* Linked text preview */}
        {initial.selectedText && (
          <div className="flex items-start gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
            <span className="text-gray-500 shrink-0 mt-0.5">Text:</span>
            <span className="text-gray-700 font-medium truncate">{initial.selectedText}</span>
          </div>
        )}

        {/* URL input */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canApply) apply();
              if (e.key === "Escape") onClose();
            }}
          />
          {isSpecialPlaceholder && (
            <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1">
              <span>↳ This placeholder will be replaced with the real URL at send time.</span>
            </p>
          )}
        </div>

        {/* Special link type */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Link type <span className="text-gray-400 font-normal">(optional — for system links)</span>
          </label>
          <select
            value={linkType}
            onChange={(e) => handleLinkTypeChange(e.target.value as SpecialLinkType | "")}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">— Custom URL (no special type) —</option>
            {(Object.keys(SPECIAL_LINK_LABELS) as SpecialLinkType[]).map((k) => (
              <option key={k} value={k}>
                {SPECIAL_LINK_LABELS[k]} — {SPECIAL_LINK_PLACEHOLDERS[k]}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={apply}
            disabled={!canApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {initial.isEditing ? "Update link" : "Insert link"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Color popover ─────────────────────────────────────────────────────────

function ColorPopover({ onClose }: { onClose: () => void }) {
  const [custom, setCustom] = useState("");
  const apply = (hex: string) => {
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, hex);
    onClose();
  };
  return (
    <div
      className="absolute bottom-full left-0 mb-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3"
      style={{ width: 196 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            title={c}
            onClick={() => apply(c)}
            className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform shrink-0"
            style={{ background: c }}
          />
        ))}
      </div>
      <div className="flex gap-1">
        <input
          type="text"
          placeholder="#hex or color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom) apply(custom);
            if (e.key === "Escape") onClose();
          }}
          className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none font-mono"
        />
        <button
          onClick={() => custom && apply(custom)}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ✓
        </button>
      </div>
    </div>
  );
}

// ─── Emoji popover ─────────────────────────────────────────────────────────

function EmojiPopover({ onClose }: { onClose: () => void }) {
  const insert = (emoji: string) => {
    insertHtml(emoji);
    onClose();
  };
  return (
    <div
      className="absolute bottom-full right-0 mb-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2"
      style={{ width: 260 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-0.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => insert(e)}
            className="w-8 h-8 text-lg hover:bg-gray-100 rounded flex items-center justify-center"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Merge tag popover ──────────────────────────────────────────────────────

function MergeTagPopover({ onClose }: { onClose: () => void }) {
  const mergeTags = useMergeTagsStore((s) => s.mergeTags);
  const insert = (attr: string) => {
    insertHtml(`{${attr}}`);
    onClose();
  };
  if (mergeTags.length === 0) return null;
  return (
    <div
      className="absolute bottom-full right-0 mb-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1"
      style={{ minWidth: 200 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {mergeTags.map((t) => (
        <button
          key={t.attribute}
          onClick={() => insert(t.attribute)}
          className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 flex items-center justify-between gap-2"
        >
          <span>{t.title}</span>
          <code className="text-[10px] text-gray-400">{`{${t.attribute}}`}</code>
        </button>
      ))}
    </div>
  );
}

// ─── Main toolbar ───────────────────────────────────────────────────────────

type Popover = "link" | "color" | "emoji" | "mergeTag" | null;

export function RichTextToolbar() {
  const activeEl = useRichTextStore((s) => s.activeEl);
  const mergeTags = useMergeTagsStore((s) => s.mergeTags);

  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });
  const [openPopover, setOpenPopover] = useState<Popover>(null);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [linkInitial, setLinkInitial] = useState<LinkInitial>(EMPTY_LINK_INITIAL);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closePopover = useCallback(() => setOpenPopover(null), []);

  // Position toolbar: above selection if any, otherwise above the element
  const updatePosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel) return;
    let rect: DOMRect | null = null;
    if (!sel.isCollapsed && sel.rangeCount > 0) {
      rect = sel.getRangeAt(0).getBoundingClientRect();
    } else if (activeEl) {
      rect = activeEl.getBoundingClientRect();
    }
    if (!rect || (rect.width === 0 && rect.height === 0)) return;

    // The toolbar uses `position: fixed` so coordinates must be viewport-relative.
    // getBoundingClientRect() already returns viewport-relative values —
    // do NOT add window.scrollY / scrollX here.
    const toolbarH = toolbarRef.current?.offsetHeight ?? 40;
    const toolbarW = toolbarRef.current?.offsetWidth ?? 440;

    // Prefer above the selection; flip below if not enough room above.
    let top = rect.top - toolbarH - 6;
    if (top < 8) top = rect.bottom + 6;
    // Clamp to viewport so it never overflows bottom (e.g. when text is at page bottom).
    top = Math.min(top, window.innerHeight - toolbarH - 8);
    top = Math.max(top, 8);

    // Horizontally centre over the selection / element, clamped to viewport.
    let left = rect.left + rect.width / 2 - toolbarW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - toolbarW - 8));

    setPos({ top, left });
  }, [activeEl]);

  const updateFormats = useCallback(() => {
    setFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  // Show toolbar when activeEl is set
  useEffect(() => {
    if (!activeEl) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setVisible(false), 150);
      return;
    }
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setVisible(true);
    updatePosition();
    updateFormats();
  }, [activeEl, updatePosition, updateFormats]);

  // Track selection changes while editing
  useEffect(() => {
    const handler = () => {
      if (!activeEl) return;
      updatePosition();
      updateFormats();
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [activeEl, updatePosition, updateFormats]);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closePopover]);

  if (!visible || !activeEl) return null;

  // Every toolbar action needs to preventDefault to keep contenteditable focused
  const md = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    fn();
  };

  const togglePopover = (name: Popover) => {
    if (name === "link") {
      // Capture everything we need from the current selection
      const range = saveRange();
      setSavedRange(range);

      // Extract selected text, existing href, and link type
      let selectedText = "";
      let existingHref = "";
      let existingLinkType: SpecialLinkType | "" = "";
      let isEditing = false;

      if (range) {
        // Selected text for display
        const div = document.createElement("div");
        div.appendChild(range.cloneContents());
        selectedText = (div.textContent || "").trim();

        // Detect if cursor/selection is inside an existing <a>
        const sel = window.getSelection();
        const focusNode = sel?.focusNode;
        const anchorEl = focusNode
          ? (focusNode.nodeType === Node.ELEMENT_NODE
              ? (focusNode as HTMLElement).closest("a")
              : focusNode.parentElement?.closest("a"))
          : null;

        if (anchorEl) {
          isEditing = true;
          existingHref = anchorEl.getAttribute("href") || "";
          const lt = anchorEl.getAttribute("data-link-type") || "";
          existingLinkType = hrefToLinkType(existingHref) || (lt as SpecialLinkType | "");
          // If it's a known special link, keep the canonical placeholder as the href
          if (existingLinkType) existingHref = SPECIAL_LINK_PLACEHOLDERS[existingLinkType];
        }
      }

      setLinkInitial({ selectedText, href: existingHref, linkType: existingLinkType, isEditing });
      setOpenPopover((cur) => (cur === "link" ? null : "link"));
      return;
    }
    setOpenPopover((cur) => (cur === name ? null : name));
  };

  const hasSelection = () => {
    const sel = window.getSelection();
    return sel && !sel.isCollapsed;
  };

  return (
    <div
      ref={toolbarRef}
      data-rich-toolbar="true"
      className="fixed z-[9999] flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg px-1.5 py-1 select-none"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* ── Format ─────────────────────────────────── */}
      <TBtn title="Bold (Ctrl+B)" active={formats.bold} onMouseDown={md(() => execCmd("bold"))}>
        <b style={{ fontSize: 13, fontFamily: "inherit" }}>B</b>
      </TBtn>
      <TBtn title="Italic (Ctrl+I)" active={formats.italic} onMouseDown={md(() => execCmd("italic"))}>
        <i style={{ fontSize: 13, fontFamily: "Georgia, serif" }}>I</i>
      </TBtn>
      <TBtn title="Underline (Ctrl+U)" active={formats.underline} onMouseDown={md(() => execCmd("underline"))}>
        <u style={{ fontSize: 13 }}>U</u>
      </TBtn>

      <Sep />

      {/* ── Font family ─────────────────────────────── */}
      <select
        title="Font family"
        className="h-7 px-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none bg-white max-w-[110px]"
        defaultValue=""
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          if (!hasSelection()) { activeEl?.focus(); return; }
          wrapSelectionWithStyle("font-family", v);
          activeEl?.focus();
        }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>

      {/* ── Font size ───────────────────────────────── */}
      <select
        title="Font size"
        className="h-7 px-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none bg-white w-14"
        defaultValue=""
        onMouseDown={(e) => e.stopPropagation()}
        onChange={(e) => {
          const v = e.target.value;
          if (!v) return;
          if (!hasSelection()) { activeEl?.focus(); return; }
          wrapSelectionWithStyle("font-size", `${v}px`);
          activeEl?.focus();
        }}
      >
        <option value="">Size</option>
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <Sep />

      {/* ── Color ───────────────────────────────────── */}
      <div className="relative">
        <TBtn
          title="Text color"
          onMouseDown={md(() => togglePopover("color"))}
        >
          <span className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-bold leading-none" style={{ fontFamily: "serif" }}>A</span>
            <span className="w-4 h-1 rounded-sm bg-current" />
          </span>
        </TBtn>
        {openPopover === "color" && <ColorPopover onClose={closePopover} />}
      </div>

      <Sep />

      {/* ── Link ────────────────────────────────────── */}
      <div className="relative">
        <TBtn title="Insert link" onMouseDown={md(() => togglePopover("link"))}>
          <Link2 size={13} />
        </TBtn>
        {openPopover === "link" && (
          <LinkPopover savedRange={savedRange} initial={linkInitial} onClose={closePopover} />
        )}
      </div>

      <Sep />

      {/* ── Emoji ───────────────────────────────────── */}
      <div className="relative">
        <TBtn title="Insert emoji" onMouseDown={md(() => togglePopover("emoji"))}>
          <Smile size={13} />
        </TBtn>
        {openPopover === "emoji" && <EmojiPopover onClose={closePopover} />}
      </div>

      {/* ── Merge tags (conditional) ─────────────────── */}
      {mergeTags.length > 0 && (
        <>
          <Sep />
          <div className="relative">
            <TBtn title="Insert merge tag" onMouseDown={md(() => togglePopover("mergeTag"))}>
              <span className="flex items-center gap-0.5 text-[10px] font-mono">
                <Tag size={11} />
                <ChevronDown size={10} />
              </span>
            </TBtn>
            {openPopover === "mergeTag" && <MergeTagPopover onClose={closePopover} />}
          </div>
        </>
      )}
    </div>
  );
}
