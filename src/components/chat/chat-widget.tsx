"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageView } from "@/components/chat/chat-message";
import { useChatAgent } from "@/lib/chat/use-chat-agent";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, send, busy, error } = useChatAgent();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy) return;
    send(input.trim());
    setInput("");
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-xl border border-line bg-paper shadow-sm">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="text-sm font-semibold tracking-tight text-ink">Astra-Assistent</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ink-faint hover:text-ink"
              aria-label="Schliessen"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-ink-faint">
                Frag mich z.B. „Erstelle einen neuen Kunden Müller Sanitär GmbH“.
              </p>
            )}
            {messages.map((message, i) => (
              <ChatMessageView key={i} message={message} />
            ))}
            {busy && <p className="px-1 text-xs text-ink-faint">…denkt nach</p>}
            {error && <p className="px-1 text-xs text-danger">{error}</p>}
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-line p-3">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nachricht…"
              disabled={busy}
            />
            <ButtonEl type="submit" disabled={busy || !input.trim()} className="px-4">
              Senden
            </ButtonEl>
          </form>
        </div>
      )}
      <ButtonEl
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-12 w-12 rounded-full p-0 shadow-sm"
        aria-label="Chat öffnen"
      >
        {open ? "✕" : "💬"}
      </ButtonEl>
    </div>
  );
}
