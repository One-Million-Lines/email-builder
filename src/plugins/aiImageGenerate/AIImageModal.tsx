import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  X, Sparkles, Loader2, Send, RotateCcw, Check, Download,
  Wand2, ChevronDown,
} from "lucide-react";
import { getAIImageProvider, subscribeAIImageProvider } from "./state";
import type { AIImageMessage, AIImageResult } from "./index";

// ---------------------------------------------------------------------------
// Model / size options shown in the modal controls
// ---------------------------------------------------------------------------

const MODEL_OPTIONS = [
  { value: "gpt-image-2.5-flare", label: "GPT Image 2.5 Flare", provider: "OpenAI" },
  { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image", provider: "Google" },
] as const;

const SIZE_OPTIONS = [
  // Standard & Universal Ratios
  { value: "1024x1024", label: "Square (1:1)", aspectRatio: "1:1" },
  { value: "1792x1024", label: "Landscape Widescreen (16:9)", aspectRatio: "16:9" },
  { value: "1024x1792", label: "Portrait Story (9:16)", aspectRatio: "9:16" },

  // Classic Photography & Social Media Ratios
  { value: "1536x1024", label: "Classic Landscape (3:2)", aspectRatio: "3:2" },
  { value: "1024x1536", label: "Classic Portrait (2:3)", aspectRatio: "2:3" },
  { value: "1365x1024", label: "Standard Display (4:3)", aspectRatio: "4:3" },
  { value: "1024x1365", label: "Standard Document (3:4)", aspectRatio: "3:4" },

  // Ultrawide Banner
  { value: "1792x768", label: "Cinematic Banner (21:9)", aspectRatio: "21:9" },
] as const;

const QUALITY_OPTIONS = [
  { value: "auto",   label: "Auto" },
  { value: "low",    label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high",   label: "High" },
  { value: "xhigh",  label: "Extra high" },
  { value: "max",    label: "Max" },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called when the user accepts an image and it has been saved to S3. */
  onSave: (url: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AIImageModal({ open, onClose, onSave }: Props) {
  const provider = useSyncExternalStore(subscribeAIImageProvider, getAIImageProvider);

  const [prompt, setPrompt]       = useState("");
  const [model,  setModel]        = useState<string>("gpt-image-2.5-flare");
  const [size,   setSize]         = useState<string>("1024x1024");
  const [quality, setQuality]     = useState<string>("auto");
  const [messages, setMessages]   = useState<AIImageMessage[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null); // base64
  const [generating, setGenerating]     = useState(false);
  const [saving,     setSaving]         = useState(false);
  const [error,  setError]         = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const promptRef    = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (!open) return;
    setPrompt("");
    setMessages([]);
    setCurrentImage(null);
    setError(null);
    setGenerating(false);
    setSaving(false);
    setShowSettings(false);
    const t = setTimeout(() => promptRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  // Auto-scroll conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentImage]);

  if (!open) return null;

  const isFirstGeneration = messages.length === 0;

  const handleGenerate = async () => {
    if (!provider || !prompt.trim() || generating) return;
    const userPrompt = prompt.trim();
    setError(null);
    setGenerating(true);

    // Append user message immediately for snappy UX
    const newUserMsg: AIImageMessage = { role: "user", content: userPrompt };
    const nextMessages = [...messages, newUserMsg];
    setMessages(nextMessages);
    

    try {
      let result: AIImageResult;

      if (isFirstGeneration) {
        result = await provider.generate(userPrompt, { model, size, quality });
      } else {
        result = await provider.chat({ messages: nextMessages, model, size, quality });
      }

      if (!result.image_b64) throw new Error("No image returned from server.");
      setPrompt("");
      setCurrentImage(result.image_b64);
      // Append assistant placeholder
      setMessages((prev) => [...prev, { role: "assistant", content: "__IMAGE__" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // Remove the optimistic user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!provider || !currentImage || saving) return;
    setSaving(true);
    setError(null);
    try {
      const { url } = await provider.save(currentImage, "png");
      if (!url) throw new Error("Server did not return a URL.");
      onSave(url);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setCurrentImage(null);
    setError(null);
    setPrompt("");
    promptRef.current?.focus();
  };

  const imageSrc = currentImage
    ? `data:image/png;base64,${currentImage}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-violet-600" />
            <h2 className="text-base font-semibold text-neutral-900">
              Generate Image with AI
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                title="Start over"
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Settings bar ──────────────────────────────────────────────── */}
        <div className="border-b border-neutral-100 px-5 py-2">
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700"
          >
            <ChevronDown
              size={12}
              className={`transition-transform ${showSettings ? "rotate-180" : ""}`}
            />
            Settings
          </button>
          {showSettings && (
            <div className="mt-2 flex flex-wrap gap-4 pb-1">
              {/* Model */}
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="rounded border border-neutral-200 px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                >
                  {MODEL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} ({m.provider})
                    </option>
                  ))}
                </select>
              </label>
              {/* Size */}
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Size</span>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="rounded border border-neutral-200 px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </label>
              {/* Quality is available for the OpenAI model. */}
              {model === "gpt-image-2.5-flare" && <label className="flex flex-col gap-1">
                <span className="text-[11px] text-neutral-500">Quality</span>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="rounded border border-neutral-200 px-2 py-1 text-xs focus:border-violet-500 focus:outline-none"
                >
                  {QUALITY_OPTIONS.map((q) => (
                    <option key={q.value} value={q.value}>{q.label}</option>
                  ))}
                </select>
              </label>}
            </div>
          )}
        </div>

        {/* ── Conversation + image area ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Empty state */}
          {messages.length === 0 && !generating && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <Wand2 size={36} className="text-violet-300" />
              <p className="text-sm text-neutral-500 max-w-xs">
                Describe the image you want for your email and click Generate.
                You can refine it with follow-up instructions.
              </p>
            </div>
          )}

          {/* Conversation thread */}
          {messages.map((msg, idx) => {
            if (msg.role === "assistant" && msg.content === "__IMAGE__") {
              // Show the latest image only for the most recent assistant turn
              const isLatest = idx === messages.length - 1;
              if (!isLatest || !imageSrc) return null;
              return (
                <div key={idx} className="flex justify-start">
                  <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm max-w-md">
                    <img
                      src={imageSrc}
                      alt="AI generated"
                      className="block w-full object-contain"
                    />
                  </div>
                </div>
              );
            }
            if (msg.role === "user") {
              return (
                <div key={idx} className="flex justify-end">
                  <div className="max-w-sm rounded-2xl rounded-br-sm bg-violet-600 px-4 py-2.5 text-sm text-white shadow-sm">
                    {msg.content}
                  </div>
                </div>
              );
            }
            return null;
          })}

          {/* Generating skeleton */}
          {generating && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-500 shadow-sm">
                <Loader2 size={16} className="animate-spin text-violet-500" />
                Generating image…
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Prompt input ──────────────────────────────────────────────── */}
        <div className="border-t border-neutral-200 px-5 py-3">
          <form
            className="flex gap-2 items-end"
            onSubmit={(e) => { e.preventDefault(); void handleGenerate(); }}
          >
            <textarea
              ref={promptRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleGenerate();
                }
              }}
              placeholder={
                isFirstGeneration
                  ? "Describe the image you want to generate…"
                  : "Describe the changes you want to make…"
              }
              rows={2}
              className="flex-1 resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 placeholder:text-neutral-400"
            />
            <button
              type="submit"
              disabled={generating || !prompt.trim() || !provider}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              {generating
                ? <Loader2 size={15} className="animate-spin" />
                : <Send size={15} />
              }
              {isFirstGeneration ? "Generate" : "Refine"}
            </button>
          </form>
        </div>

        {/* ── Footer actions ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-5 py-3">
          <p className="text-xs text-neutral-400">
            {currentImage ? "Image ready — click Use Image to insert it." : "Enter a prompt above to get started."}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!currentImage || saving || generating}
              className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving
                ? <Loader2 size={14} className="animate-spin" />
                : <Check size={14} />
              }
              {saving ? "Saving…" : "Use Image"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
