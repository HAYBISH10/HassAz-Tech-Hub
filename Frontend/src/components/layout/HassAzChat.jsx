import { useEffect, useRef, useState } from "react";
import { sendChat } from "../../services/api";

const WELCOME =
  "Hello, I am HassAz AI.\n\nAsk me anything: HassAz courses, applying, study help, research, writing, or a problem to solve. I will think it through and answer step by step.";

const THINKING_LABELS = ["Thinking…", "Searching…", "Working through this step by step…"];

function ThinkingStatus() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % THINKING_LABELS.length);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm shadow-sm" role="status" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
      </span>
      <span className="font-semibold text-gold">{THINKING_LABELS[index]}</span>
    </div>
  );
}

export default function HassAzChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, open, sending]);

  async function onSubmit(event) {
    event.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const data = await sendChat(next.filter((item) => item.role !== "assistant" || item.content !== WELCOME));
      setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: error.message || "I could not reply just now. Please try again, or use Contact Us.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed right-3 bottom-6 z-50 sm:right-5 sm:bottom-6">
      {open ? (
        <div className="mb-3 flex h-[min(72vh,560px)] w-[min(calc(100vw-1.5rem),400px)] flex-col overflow-hidden rounded-2xl border border-navy/15 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-navy px-3 py-2.5 text-white">
            <img src="/brand/logo-icon.png?v=4" alt="" className="h-8 w-8 rounded-full bg-white object-contain p-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">HassAz AI</p>
              <p className="text-[11px] text-white/70">Thinks, searches, and answers step by step</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-2 py-1 text-lg leading-none text-white/80 hover:bg-white/10"
              aria-label="Close HassAz AI"
            >
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-soft px-3 py-3">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === "user" ? "bg-navy text-white" : "bg-white text-navy shadow-sm"
                  }`}
                >
                  {message.content}
                </p>
              </div>
            ))}
            {sending ? <ThinkingStatus /> : null}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-navy/10 bg-white p-2.5">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              maxLength={4000}
              placeholder="Ask HassAz AI…"
              rows={1}
              className="min-h-10 max-h-24 min-w-0 flex-1 resize-none rounded-2xl border border-navy/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="self-end rounded-full bg-gold px-3 py-2 text-sm font-semibold text-white hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="ml-auto flex items-center gap-2 rounded-full bg-navy px-3 py-2 text-xs font-semibold text-white shadow-lg sm:px-4 sm:py-2.5 sm:text-sm"
        aria-expanded={open}
        aria-label={open ? "Close HassAz AI" : "Open HassAz AI"}
      >
        <img src="/brand/logo-icon.png?v=4" alt="" className="h-6 w-6 rounded-full bg-white object-contain p-0.5" />
        HassAz AI
      </button>
    </div>
  );
}
