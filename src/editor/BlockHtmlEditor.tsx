import { useState } from "react";
import { X, Code2, RotateCcw, AlertTriangle } from "lucide-react";
import { useEmailStore } from "../store/emailStore";
import { renderModuleInner } from "../core/renderer";

interface Props {
  moduleId: string;
  onClose: () => void;
}

function validateHtml(html: string): { ok: true } | { ok: false; error: string } {
  if (!html.trim()) return { ok: false, error: "HTML cannot be empty." };
  if (/<script[\s>]/i.test(html)) {
    return { ok: false, error: "Script tags are not allowed in email HTML." };
  }
  return { ok: true };
}

/** Formats HTML with basic indentation for readability in the textarea. */
function prettyHtml(html: string): string {
  // Minimal formatter: add newline after block-level closing tags
  return html
    .replace(/></g, ">\n<")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function BlockHtmlEditor({ moduleId, onClose }: Props) {
  const { doc, updateModule } = useEmailStore();
  const module = doc.modules.find((m) => m.id === moduleId);

  const [html, setHtml] = useState<string>(() => {
    if (!module) return "";
    return prettyHtml(renderModuleInner(module, doc.theme));
  });
  const [error, setError] = useState<string | null>(null);

  if (!module) return null;

  const hasOverride = !!module.htmlOverride;

  const handleSave = () => {
    const validation = validateHtml(html);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    updateModule(moduleId, { htmlOverride: html.trim() });
    onClose();
  };

  const handleResetToVisual = () => {
    if (!window.confirm("Remove HTML override and restore visual editing for this block?")) return;
    updateModule(moduleId, { htmlOverride: undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[720px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0">
          <Code2 size={18} className="text-blue-600 shrink-0" />
          <span className="font-semibold text-sm">Edit HTML — {module.name}</span>
          {hasOverride && (
            <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[10px] rounded font-medium shrink-0">
              HTML Override Active
            </span>
          )}
          <div className="ml-auto flex items-center gap-2">
            {hasOverride && (
              <button
                onClick={handleResetToVisual}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Remove HTML override and restore visual editing"
              >
                <RotateCcw size={12} /> Reset to visual
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-500"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-100 shrink-0">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Editing HTML directly overrides the visual editor for this block. The outer block wrapper
            (background, padding) is still applied from the block style. Ensure the HTML is valid
            email-compatible markup. Script tags are not allowed.
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-4">
          <textarea
            className="w-full h-72 font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent leading-relaxed"
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              setError(null);
            }}
            spellCheck={false}
            placeholder="Enter HTML for this block…"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={12} /> {error}
            </p>
          )}
          <p className="mt-2 text-[11px] text-gray-400">
            This HTML is injected as the inner content of the block's table cell in the final email.
            Use table-based markup for best email client compatibility.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-200 shrink-0">
          <div className="text-xs text-gray-400">
            {html.trim().length} characters
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              Apply HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
