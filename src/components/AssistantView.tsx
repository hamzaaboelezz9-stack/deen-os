import { useEffect, useRef, useState } from "react";
import { AlertCircle, Send, Trash2 } from "lucide-react";
import { ChatMessage } from "../types/deenos";

const SUGGESTED_QUESTIONS = [
  "What are the conditions for shortening and combining prayers while traveling (Qasr & Jam')?",
  "Summarize the major turning points of the Seerah in Madinah.",
  "How do scholars approach Zakat on long-term equity investments?",
  "Explain the etiquette and supplication of Salat al-Istikhara.",
];

export function AssistantView() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("deenos_assistant_history") || "[]");
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    localStorage.setItem("deenos_assistant_history", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendQuestion(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to receive a response.");
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reach the Islamic Knowledge Assistant."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header + Scholarly Disclaimer */}
      <div className="rounded-xl border border-[#E5E7E2] bg-white p-6 dark:border-[#1D2E26] dark:bg-[#111C17]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111815] dark:text-[#EEF2EF]">
              Islamic Knowledge Assistant
            </h1>
            <p className="mt-1 text-xs text-[#526058] dark:text-[#98A89E]">
              Educational exploration of Fiqh, Seerah, Hadith sciences, and Quranic context
            </p>
          </div>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E5E7E2] px-3 text-xs font-medium text-[#526058] hover:text-[#111815] dark:border-[#1D2E26] dark:text-[#98A89E]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear Chat
            </button>
          )}
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] p-3.5 text-xs text-[#526058] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#98A89E]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#B8860B] dark:text-[#D4AF37]" />
          <p className="leading-relaxed">
            <span className="font-semibold text-[#111815] dark:text-[#EEF2EF]">
              Scholarly Disclaimer:{" "}
            </span>
            Responses summarize general classical Islamic literature for educational study and do not constitute formal legal verdicts (fatwa). Always consult a qualified local scholar or mufti for personal rulings.
          </p>
        </div>
      </div>

      {/* Conversation Viewport */}
      <div className="flex min-h-[420px] flex-col justify-between rounded-xl border border-[#E5E7E2] bg-white dark:border-[#1D2E26] dark:bg-[#111C17]">
        <div className="flex-1 space-y-4 overflow-y-auto p-6 max-h-[540px]">
          {messages.length === 0 ? (
            <div className="py-6">
              <p className="text-xs font-semibold text-[#526058] dark:text-[#98A89E]">
                Suggested Topics in Fiqh &amp; Seerah
              </p>
              <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendQuestion(q)}
                    className="rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] p-3.5 text-left text-xs leading-relaxed text-[#111815] transition-colors hover:border-[#065F46] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#065F46] text-white dark:bg-[#059669]"
                      : "border border-[#E5E7E2] bg-[#FAFAF7] text-[#111815] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <p
                    className={`mt-1.5 text-[10px] ${
                      msg.role === "user" ? "text-white/70" : "text-[#6B7A71]"
                    }`}
                  >
                    {msg.role === "user" ? "You" : "DeenOS Knowledge Assistant"} ·{" "}
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="rounded-xl border border-[#E5E7E2] bg-[#FAFAF7] px-4 py-3 text-xs text-[#526058] dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#98A89E]">
                Consulting classical references...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion(input);
          }}
          className="flex items-center gap-2 border-t border-[#E5E7E2] p-4 dark:border-[#1D2E26]"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about Fiqh, Seerah, Hadith, or daily worship..."
            className="h-11 flex-1 rounded-lg border border-[#E5E7E2] bg-[#FAFAF7] px-4 text-sm text-[#111815] placeholder:text-[#6B7A71] focus:border-[#065F46] focus:outline-none dark:border-[#1D2E26] dark:bg-[#0A110E] dark:text-[#EEF2EF]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg bg-[#065F46] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#047857] disabled:opacity-40 dark:bg-[#059669]"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
}
