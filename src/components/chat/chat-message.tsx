import { cn } from "@/lib/utils";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

export function ChatMessageView({ message }: { message: MessageParam }) {
  if (typeof message.content === "string") {
    return <Bubble role={message.role}>{message.content}</Bubble>;
  }

  const textBlocks = message.content.filter((block) => block.type === "text");
  const toolUseBlocks = message.content.filter((block) => block.type === "tool_use");

  if (textBlocks.length === 0 && toolUseBlocks.length === 0) return null;

  return (
    <>
      {textBlocks.map((block, i) => (
        <Bubble key={i} role={message.role}>
          {block.text}
        </Bubble>
      ))}
      {toolUseBlocks.length > 0 && (
        <p className="px-1 text-xs text-ink-faint">
          ⚙ {toolUseBlocks.map((block) => block.name).join(", ")}
        </p>
      )}
    </>
  );
}

function Bubble({ role, children }: { role: MessageParam["role"]; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm",
          role === "user" ? "bg-accent text-white" : "bg-paper-raised text-ink",
        )}
      >
        {children}
      </div>
    </div>
  );
}
