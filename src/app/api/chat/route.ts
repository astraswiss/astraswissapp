export const runtime = "nodejs";

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";
import { CHAT_TOOLS, CHAT_MODEL } from "@/lib/chat/tools";
import { SYSTEM_PROMPT } from "@/lib/chat/system-prompt";

const client = new Anthropic();

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: MessageParam[] };

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY ist nicht gesetzt." },
      { status: 500 },
    );
  }

  try {
    const response = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: CHAT_TOOLS,
      messages,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Anfrage an Claude fehlgeschlagen." }, { status: 500 });
  }
}
