import process from "node:process";
import { Ollama } from "ollama";

const ollama = new Ollama();

export async function analyzeWithOllama(
  transcript: string,
  systemPrompt: string,
  model: string,
): Promise<void> {
  const response = await ollama.chat({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
    stream: true,
  });

  for await (const part of response) {
    if (!part.message.content) {
      continue;
    }

    process.stdout.write(part.message.content);
  }
}
