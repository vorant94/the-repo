import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import {
  type TranscriptResponse,
  YoutubeTranscript,
} from "@danielxceron/youtube-transcript";
import { format } from "date-fns";
import { outputFile } from "fs-extra";
import { z } from "zod";
import { accent } from "../logger/text.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const { url, outputPath } = argsSchema.parse(values);

  const transcript = await fetchTranscript(url);

  const output = formatOutput(transcript);

  console.info(`Writing to ${accent(outputPath)}...`);
  await outputFile(outputPath, output, "utf-8");
  console.info("Done!");
}

const argsSchema = z.object({
  url: z.string(),
  outputPath: z.string().default("transcript.txt"),
});

const options = {
  url: { type: "string" },
  outputPath: { type: "string" },
} as const satisfies ParseArgsOptionsConfig;

async function fetchTranscript(url: string) {
  console.info(`Fetching transcript from ${accent(url)}...`);
  const transcript = await YoutubeTranscript.fetchTranscript(url);
  console.info(`Found ${accent(transcript.length)} transcript segments`);
  return transcript;
}

function formatOutput(transcript: Array<TranscriptResponse>): string {
  console.info("Formatting output...");
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
