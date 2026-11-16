/**
 * FullHtmlEditor — renders when the user has switched the editor to raw HTML
 * mode. Replaces the LeftSidebar + Canvas + RightSidebar trio with a full-
 * height textarea. The visual builder is fully disabled in this mode; the user
 * must Reset (TopBar ↺) to return to the builder.
 */
import { useEmailStore } from "../store/emailStore";
import { FileCode, Wand2 } from "lucide-react";
import { formatHtml } from "./BlockHtmlEditor";

export function FullHtmlEditor() {
  const { rawHtml, setRawHtml } = useEmailStore();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-orange-50 border-b border-orange-200 shrink-0">
        <FileCode size={16} className="shrink-0 text-orange-600" />
        <span className="text-sm font-semibold text-orange-700">HTML mode is active.</span>
        <span className="text-sm text-orange-600 flex-1">
          Visual builder disabled — use Reset&nbsp;↺ in the toolbar to start fresh.
        </span>
        <button
          type="button"
          onClick={() => setRawHtml(formatHtml(rawHtml))}
          title="Reformat HTML with indentation for easier reading"
          className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors shrink-0"
        >
          <Wand2 size={13} /> Prettify
        </button>
      </div>

      {/* Raw HTML textarea */}
      <textarea
        className="flex-1 w-full font-mono text-xs p-4 bg-white outline-none resize-none border-0"
        value={rawHtml}
        onChange={(e) => setRawHtml(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        placeholder="Paste or type your HTML here…"
      />
    </div>
  );
}
