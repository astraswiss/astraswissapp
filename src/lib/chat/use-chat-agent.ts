"use client";

import { useCallback, useState } from "react";
import type { ContentBlockParam, MessageParam, ToolResultBlockParam, ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { executeTool } from "@/lib/chat/execute-tool";

type ChatApiMessage = { content: ContentBlockParam[]; stop_reason: string };

export function useChatAgent() {
  const [messages, setMessages] = useState<MessageParam[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      setBusy(true);
      setError(null);
      let history: MessageParam[] = [...messages, { role: "user", content: text }];
      setMessages(history);

      try {
        for (let round = 0; round < 8; round++) {
          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: history }),
          });
          if (!res.ok) throw new Error("Anfrage an den Chat-Assistenten fehlgeschlagen.");
          const message = (await res.json()) as ChatApiMessage;

          history = [...history, { role: "assistant", content: message.content }];
          setMessages(history);

          if (message.stop_reason !== "tool_use") break;

          const toolUseBlocks = message.content.filter(
            (block): block is ToolUseBlock => block.type === "tool_use",
          );
          const toolResults: ToolResultBlockParam[] = toolUseBlocks.map((block) => {
            try {
              const result = executeTool(block.name, block.input as Record<string, unknown>);
              return { type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) };
            } catch (err) {
              return {
                type: "tool_result",
                tool_use_id: block.id,
                content: err instanceof Error ? err.message : "Unbekannter Fehler.",
                is_error: true,
              };
            }
          });

          history = [...history, { role: "user", content: toolResults }];
          setMessages(history);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
      } finally {
        setBusy(false);
      }
    },
    [messages],
  );

  return { messages, send, busy, error };
}
