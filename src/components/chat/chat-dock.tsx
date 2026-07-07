"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessageView } from "@/components/chat/chat-message";
import { useChatAgent } from "@/lib/chat/use-chat-agent";
import { useDocumentPreview } from "@/lib/chat/document-preview-context";
import { DocumentLivePreview } from "@/components/documents/live-preview";

function ChatBody({
  messages,
  busy,
  error,
  input,
  onInputChange,
  onSubmit,
}: {
  messages: ReturnType<typeof useChatAgent>["messages"];
  busy: boolean;
  error: string | null;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
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
      <form onSubmit={onSubmit} className="flex gap-2 border-t border-line p-3">
        <Input
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Nachricht…"
          disabled={busy}
        />
        <ButtonEl type="submit" disabled={busy || !input.trim()} className="px-4">
          Senden
        </ButtonEl>
      </form>
    </>
  );
}

/**
 * Persists across navigation between Rechnungen/Offerten/Kunden: mounted once in
 * the service layout, so React state (and thus chat history) survives page
 * changes and only clears on a full reload. Doubles as a live PDF preview:
 * saving a Rechnung/Offerte (DocumentForm) swaps this card into a preview of
 * the document just created, via DocumentPreviewContext — the chat resumes
 * once the preview is dismissed.
 */
export function ChatDock() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, send, busy, error } = useChatAgent();
  const { preview, clearPreview } = useDocumentPreview();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || busy) return;
    send(input.trim());
    setInput("");
  }

  const header = preview ? (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="flex min-w-0 items-center gap-2 text-sm font-semibold tracking-tight text-ink">
        <span className="text-base leading-none">📄</span>
        <span className="truncate">Vorschau: {preview.document.number}</span>
      </span>
      <button
        type="button"
        onClick={clearPreview}
        className="shrink-0 text-ink-faint hover:text-ink"
        aria-label="Vorschau schliessen"
      >
        ✕
      </button>
    </div>
  ) : (
    <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
      <span className="text-base leading-none">✨</span> Astra-Assistent
    </span>
  );

  const body = preview ? (
    <DocumentLivePreview key={preview.document.id} preview={preview} />
  ) : (
    <ChatBody
      messages={messages}
      busy={busy}
      error={error}
      input={input}
      onInputChange={setInput}
      onSubmit={handleSubmit}
    />
  );

  return (
    <>
      {/* Desktop: docked, always-open card with an "AI surface" treatment
          (gradient ring + soft glow) to visually set it apart from regular
          product cards. */}
      <aside className="hidden h-full min-h-0 w-full rounded-[1.25rem] bg-gradient-to-br from-accent/50 via-accent/10 to-transparent p-px shadow-[0_12px_40px_-12px_rgba(52,84,209,0.35)] lg:flex">
        <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[calc(1.25rem-1px)] bg-paper">
          <div className="flex items-center gap-2 border-b border-line bg-gradient-to-r from-accent-soft to-transparent px-4 py-3.5">
            {header}
          </div>
          {body}
        </div>
      </aside>

      {/* Mobile/tablet: floating toggle + panel */}
      <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6 lg:hidden">
        {mobileOpen && (
          <div className="mb-3 h-[min(28rem,70vh)] min-h-0 w-[min(20rem,calc(100vw-2rem))] rounded-[1.25rem] bg-gradient-to-br from-accent/50 via-accent/10 to-transparent p-px shadow-[0_12px_40px_-12px_rgba(52,84,209,0.35)]">
            <div className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[calc(1.25rem-1px)] bg-paper">
              <div className="flex items-center justify-between gap-2 border-b border-line bg-gradient-to-r from-accent-soft to-transparent px-4 py-3">
                {header}
                {!preview && (
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="shrink-0 text-ink-faint hover:text-ink"
                    aria-label="Schliessen"
                  >
                    ✕
                  </button>
                )}
              </div>
              {body}
            </div>
          </div>
        )}
        <ButtonEl
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="h-12 w-12 rounded-full p-0 shadow-[0_12px_40px_-12px_rgba(52,84,209,0.35)]"
          aria-label="Chat öffnen"
        >
          {mobileOpen ? "✕" : preview ? "📄" : "💬"}
        </ButtonEl>
      </div>
    </>
  );
}
