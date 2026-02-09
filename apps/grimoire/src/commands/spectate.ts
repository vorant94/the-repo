import console from "node:console";
import process from "node:process";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import {
  type TranscriptResponse,
  YoutubeTranscript,
} from "@danielxceron/youtube-transcript";
import { format } from "date-fns";
import { Ollama } from "ollama";
import { z } from "zod";
import { accent } from "../logger/text.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const { url, model } = argsSchema.parse(values);

  const transcript = await fetchTranscript(url);

  const formattedTranscript = formatTranscript(transcript);

  await analyzeWithOllama(formattedTranscript, model);
}

const argsSchema = z.object({
  url: z.string(),
  model: z.string().default("llama3.2"),
});

const options = {
  url: { type: "string" },
  model: { type: "string" },
} as const satisfies ParseArgsOptionsConfig;

async function fetchTranscript(url: string) {
  console.info(`Fetching transcript from ${accent(url)}...`);
  const transcript = await YoutubeTranscript.fetchTranscript(url);
  console.info(`Found ${accent(transcript.length)} transcript segments`);
  return transcript;
}

function formatTranscript(transcript: Array<TranscriptResponse>): string {
  console.info("Formatting transcript...");
  return transcript
    .map((segment) => `[${formatTimestamp(segment.offset)}] ${segment.text}`)
    .join("\n");
}

function formatTimestamp(offsetValue: number): string {
  // The youtube-transcript package returns offset in different units:
  // - HTML scraping: milliseconds
  // - InnerTube API (fallback): seconds
  // Detect unit by magnitude: if >= 100000, assume milliseconds (27+ hours would be unusual)
  const totalMilliseconds =
    offsetValue >= 100_000
      ? Math.floor(offsetValue)
      : Math.floor(offsetValue * 1_000);

  return format(
    totalMilliseconds,
    totalMilliseconds > 3_600_000 ? "hh:mm:ss" : "mm:ss",
  );
}

const systemPrompt = `
You are analyzing a transcript from a Magic: The Gathering Pauper format gameplay video.

Extract the match-up information for each game played. For each game, identify:
1. The player's deck archetype
2. The opponent's deck archetype
3. Game/match numbers
4. Result (win/loss) if mentioned

Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

Format your response clearly with each game on a separate line or section.`;

async function analyzeWithOllama(
  transcript: string,
  model: string,
): Promise<void> {
  const ollama = new Ollama();

  console.info(`Analyzing transcript with ${accent(model)}...\n`);

  try {
    const response = await ollama.chat({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcript },
      ],
      stream: true,
    });

    for await (const part of response) {
      if (part.message.content) {
        process.stdout.write(part.message.content);
      }
    }

    console.info("\n\nDone!");
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("connect ECONNREFUSED")
    ) {
      console.error(
        "\nError: Could not connect to Ollama. Make sure Ollama is running:",
      );
      console.error(`  ${accent("ollama serve")}`);
      process.exit(1);
    }

    if (error instanceof Error && error.message.includes("not found")) {
      console.error(`\nError: Model '${model}' not found. Install it with:`);
      console.error(`  ${accent(`ollama pull ${model}`)}`);
      process.exit(1);
    }

    throw error;
  }
}
