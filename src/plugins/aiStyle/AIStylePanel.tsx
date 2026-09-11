/**
 * AIStylePanel — left sidebar panel for the AI Style plugin.
 *
 * Lets users generate or restyle a complete email in the editor by:
 *   - Uploading a reference image (drag & drop or file picker)
 *   - Typing a text description
 *   - Optionally combining both
 *
 * The panel calls the configured backend endpoint with:
 *   { description, image_base64, catalog, document }
 *
 * The backend returns an AIResponse (full document replacement) that is
 * validated and applied through the standard applyAIResponse pipeline.
 *
 * Provider is injected at plugin registration time via setStyleProvider().
 */

import { useCallback, useRef, useState } from "react";
import { Wand2, Upload, X, Loader2, AlertTriangle, CheckCircle2, RefreshCcw } from "lucide-react";
import { useEmailStore } from "../../store/emailStore";
import { buildCatalog } from "../../ai/catalog";
import { applyAIResponse } from "../../ai/applyResponse";
import type { AIStyleProvider } from "./index";
import { getStyleProvider } from "./index";

// ── Colour swatch preview ──────────────────────────────────────────────────

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-6 h-6 rounded border border-gray-200"
        style={{ background: color }}
        title={`${label}: ${color}`}
      />
      <span className="text-[9px] text-gray-400 leading-none">{label}</span>
    </div>
  );
}

// ── Image drop zone ────────────────────────────────────────────────────────

function ImageDropZone({
  preview,
  onFile,
  onClear,
}: {
  preview: string | null;
  onFile: (dataUrl: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") onFile(result);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (preview) {
    return (
      <div className="relative rounded border border-gray-200 overflow-hidden">
        <img src={preview} alt="Reference" className="w-full h-28 object-cover object-top" />
        <button
          onClick={onClear}
          title="Remove image"
          className="absolute top-1 right-1 rounded-full bg-black/60 text-white p-0.5 hover:bg-black/80 transition-colors"
        >
          <X size={12} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-2 py-1">
          Reference image loaded
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`cursor-pointer rounded border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 p-4 select-none ${
        dragging ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
      }`}
    >
      <Upload size={20} className="text-gray-400" />
      <p className="text-xs text-gray-500 text-center">
        Drop a design screenshot here<br />
        <span className="text-purple-600">or click to browse</span>
      </p>
      <p className="text-[10px] text-gray-400">JPG, PNG, WEBP</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────

type Status =
  | { kind: "idle" }
  | { kind: "loading"; phase: string }
  | { kind: "success"; summary: string; palette?: Record<string, string> }
  | { kind: "error"; message: string };

export function AIStylePanel() {
  const { doc, applyDoc } = useEmailStore();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const canGenerate = (imageDataUrl !== null || description.trim().length > 0) &&
    status.kind !== "loading";

  const generate = async () => {
    const provider = getStyleProvider();
    if (!provider) return;

    setStatus({ kind: "loading", phase: "Sending to AI…" });

    try {
      const catalog = buildCatalog();
      const res = await provider.generate({
        description: description.trim() || undefined,
        image_base64: imageDataUrl
          ? imageDataUrl.replace(/^data:[^;]+;base64,/, "")
          : undefined,
        catalog,
        document: doc,
      });

      const applied = applyAIResponse(doc, res);
      if (!applied.ok) {
        setStatus({ kind: "error", message: `Validation failed: ${applied.error}` });
        return;
      }

      const { document: nextDoc, summary } = applied.result;
      if (nextDoc !== doc) applyDoc(nextDoc);

      // Extract palette from theme for display
      const palette = nextDoc.theme?.tokens?.colors as Record<string, string> | undefined;
      setStatus({ kind: "success", summary: summary || "Style applied.", palette });
    } catch (err) {
      setStatus({
        kind: "error",
        message: (err as Error).message || "AI style generation failed.",
      });
    }
  };

  const reset = () => {
    setImageDataUrl(null);
    setDescription("");
    setStatus({ kind: "idle" });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Wand2 size={14} className="text-purple-600" />
        <p className="text-xs text-gray-500 leading-tight">
          Generate a complete email style from a reference image or description.
          AI applies colors, fonts, spacing, and layout to your current blocks.
        </p>
      </div>

      {/* Image upload */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Reference image (optional)
        </p>
        <ImageDropZone
          preview={imageDataUrl}
          onFile={setImageDataUrl}
          onClear={() => setImageDataUrl(null)}
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Style description
        </p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="E.g. Dark navy background, gold accent buttons, serif heading font, minimal spacious layout…"
          className="w-full resize-none text-xs rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-purple-500 transition-colors"
          disabled={status.kind === "loading"}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={!canGenerate}
        className="flex items-center justify-center gap-2 w-full py-2 rounded bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
      >
        {status.kind === "loading" ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            {(status as { kind: "loading"; phase: string }).phase}
          </>
        ) : (
          <>
            <Wand2 size={13} />
            Generate style
          </>
        )}
      </button>

      {/* Status / result */}
      {status.kind === "error" && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          <AlertTriangle size={12} className="mt-0.5 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      {status.kind === "success" && (
        <div className="rounded border border-green-200 bg-green-50 p-2 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <CheckCircle2 size={13} />
            {status.summary}
          </div>
          {status.palette && Object.keys(status.palette).length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(status.palette)
                .filter(([, v]) => typeof v === "string" && v.startsWith("#"))
                .slice(0, 8)
                .map(([k, v]) => (
                  <ColorSwatch key={k} color={v} label={k} />
                ))}
            </div>
          )}
        </div>
      )}

      {/* Reset */}
      {(imageDataUrl || description || status.kind !== "idle") && (
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-gray-600 transition-colors self-start"
        >
          <RefreshCcw size={11} /> Reset
        </button>
      )}

      {/* Tips */}
      {status.kind === "idle" && !imageDataUrl && !description && (
        <div className="mt-1 space-y-1.5 rounded bg-gray-50 border border-gray-100 p-2.5">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Style ideas
          </p>
          {[
            "Warm coral + cream, rounded cards, friendly sans-serif",
            "Deep purple gradient, white text, bold geometric shapes",
            "Minimal white, dark text, thin dividers, editorial serif",
            "Vibrant birthday theme with confetti colors",
          ].map((tip) => (
            <button
              key={tip}
              onClick={() => setDescription(tip)}
              className="block w-full text-left text-[11px] text-gray-500 hover:text-purple-700 px-1.5 py-1 rounded hover:bg-purple-50 transition-colors"
            >
              "{tip}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
