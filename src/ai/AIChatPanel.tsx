import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Sparkles, Send, Loader2, AlertTriangle } from "lucide-react";
import { useEmailStore } from "../store/emailStore";
import type { AIRequest } from "../core/aiActions";
import { getAIProvider, subscribeAIProvider, getAIProviderVersion } from "./state";
import { buildCatalog } from "./catalog";
import { applyAIResponse } from "./applyResponse";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  error?: boolean;
}

const SUGGESTIONS = [
  "Create a welcome email for new subscribers",
  "Build a flash sale announcement with a product grid",
  "Write a weekly newsletter with a lead story and footer",
];

/** Hook: is an AI provider currently configured? Reactive. */
export function useAIAvailable(): boolean {
  // Re-render whenever the provider version changes, then read current state.
  useSyncExternalStore(subscribeAIProvider, getAIProviderVersion, getAIProviderVersion);
  return getAIProvider() !== null;
}

export function AIChatPanel() {
  const { doc, applyDoc } = useEmailStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy]);

  const send = async (prompt: string) => {
    const provider = getAIProvider();
    if (!provider || !prompt.trim() || busy) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: prompt };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBusy(true);

    const req: AIRequest = {
      task: "create_email",
      document: doc,
      instruction: prompt,
      context: { catalog: buildCatalog() },
    };

    try {
      const res = await provider.generate(req);
      const applied = applyAIResponse(doc, res);
      if (!applied.ok) {
        pushAssistant(`I produced an invalid document and stopped. (${applied.error})`, true);
      } else {
        const { document, text, summary } = applied.result;
        if (document !== doc) applyDoc(document);
        pushAssistant([text, summary].filter(Boolean).join("\n\n") || "Done.");
      }
    } catch (err) {
      pushAssistant((err as Error).message || "The AI request failed.", true);
    } finally {
      setBusy(false);
    }
  };

  const pushAssistant = (text: string, error = false) =>
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text, error }]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-blue-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          AI Assistant
        </h3>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
        {messages.length === 0 && (
          <div className="text-xs text-gray-500">
            <p className="mb-2">
              Describe the email you want and I&apos;ll assemble it from the available blocks.
            </p>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-xs px-2.5 py-2 rounded border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-xs rounded-lg px-3 py-2 whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-blue-600 text-white self-end max-w-[85%]"
                : m.error
                ? "bg-red-50 text-red-700 border border-red-200 self-start max-w-[95%]"
                : "bg-gray-100 text-gray-800 self-start max-w-[95%]"
            }`}
          >
            {m.error && (
              <AlertTriangle size={12} className="inline mr-1 -mt-0.5" aria-hidden />
            )}
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5 self-start">
            <Loader2 size={12} className="animate-spin" /> Thinking…
          </div>
        )}
      </div>

      <form
        className="mt-2 flex items-end gap-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={2}
          placeholder="Ask the AI to build or edit your email…"
          className="flex-1 resize-none text-xs rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          title="Send"
          className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
