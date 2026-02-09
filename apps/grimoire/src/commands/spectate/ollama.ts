import { open } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { Ollama } from "ollama";
import { getContext } from "./context.ts";

const ollama = new Ollama();

export async function analyzeWithOllama(
  transcript: string,
  systemPrompt: string,
  debugFileName?: string | null,
): Promise<void> {
  const { model, debugDir } = getContext();

  if (debugDir && !debugFileName) {
    throw new Error("Debug mode is enabled but no debug filename was provided");
  }

  const response = await ollama.chat({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
    stream: true,
  });

  const fileHandle =
    debugDir && debugFileName
      ? await open(join(debugDir, debugFileName), "w")
      : null;

  try {
    for await (const part of response) {
      if (!part.message.content) {
        continue;
      }

      process.stdout.write(part.message.content);
      await fileHandle?.write(part.message.content);
    }
  } finally {
    await fileHandle?.close();
  }
}
