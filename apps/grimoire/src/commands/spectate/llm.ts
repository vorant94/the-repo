import { open } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { streamText } from "ai";
import { ollama } from "ollama-ai-provider";
import { getContext } from "./context.ts";

export async function analyzeWithLlm(
  transcript: string,
  systemPrompt: string,
  debugFileName?: string | null,
): Promise<void> {
  const { model, debugDir } = getContext();

  if (debugDir && !debugFileName) {
    throw new Error("Debug mode is enabled but no debug filename was provided");
  }

  const { textStream } = streamText({
    model: ollama(model),
    system: systemPrompt,
    prompt: transcript,
  });

  const fileHandle =
    debugDir && debugFileName
      ? await open(join(debugDir, debugFileName), "w")
      : null;

  try {
    for await (const chunk of textStream) {
      process.stdout.write(chunk);
      await fileHandle?.write(chunk);
    }
  } finally {
    await fileHandle?.close();
  }
}
