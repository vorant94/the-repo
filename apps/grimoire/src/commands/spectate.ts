import console from "node:console";
import process from "node:process";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { Ollama } from "ollama";
import { z } from "zod";
import { execFile } from "../shared/exec.ts";
import { accent } from "../shared/logger.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const { url, model } = argsSchema.parse(values);

  const srtContent = await fetchTranscript(url);

  await analyzeWithOllama(srtContent, model);
}

const argsSchema = z.object({
  url: z.string(),
  model: z.string().default("llama3.2"),
});

const options = {
  url: { type: "string" },
  model: { type: "string" },
} as const satisfies ParseArgsOptionsConfig;

async function fetchTranscript(url: string): Promise<string> {
  console.info(`Fetching transcript from ${accent(url)}...`);

  const metadata = await fetchYtDlpMetadata(url);
  const srtUrl = findSrtUrl(metadata);

  if (!srtUrl) {
    throw new Error("No English SRT subtitles found for this video");
  }

  const srtContent = await fetchSrt(srtUrl);
  console.info("Transcript fetched successfully");

  return srtContent;
}

const subtitleEntrySchema = z.object({
  ext: z.string(),
  url: z.string(),
});

const ytDlpMetadataSchema = z.object({
  subtitles: z.record(z.string(), z.array(subtitleEntrySchema)).optional(),
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  automatic_captions: z
    .record(z.string(), z.array(subtitleEntrySchema))
    .optional(),
});

type YtDlpMetadata = z.infer<typeof ytDlpMetadataSchema>;

async function fetchYtDlpMetadata(url: string): Promise<YtDlpMetadata> {
  const { stdout } = await execFile("yt-dlp", [
    "--dump-json",
    "--skip-download",
    url,
  ]);

  const metadata = JSON.parse(stdout);
  return ytDlpMetadataSchema.parse(metadata);
}

function findSrtUrl(metadata: YtDlpMetadata): string | null {
  const manualSubs = metadata.subtitles?.en;
  if (manualSubs) {
    const srtEntry = manualSubs.find((entry) => entry.ext === "srt");
    if (srtEntry) {
      return srtEntry.url;
    }
  }

  const autoCaptions = metadata.automatic_captions?.en;
  if (autoCaptions) {
    const srtEntry = autoCaptions.find((entry) => entry.ext === "srt");
    if (srtEntry) {
      return srtEntry.url;
    }
  }

  return null;
}

async function fetchSrt(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SRT: ${response.status}`);
  }

  return await response.text();
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
