import console from "node:console";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { createTempDir } from "../../shared/temp-dir.ts";
import { getOrPromptLlmApiKey } from "./config.ts";
import { getContext, runWithinContext } from "./context.ts";
import {
  promptForDebugCleanup,
  writeChapterTranscriptDebugFile,
  writeFullVideoTranscriptDebugFile,
} from "./debug.ts";
import { analyzeChapterWithLlm, analyzeFullVideoWithLlm } from "./llm.ts";
import { formatTimestamp, splitSrtByChapters } from "./srt.ts";
import type { Chapter } from "./transcript.ts";
import { fetchTranscript } from "./transcript.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const args = argsSchema.parse(values);
  const llmApiKey = await getOrPromptLlmApiKey();

  await using tempDir = args.debug
    ? await createTempDir("grimoire-spectate-debug")
    : null;
  const debugDir = tempDir?.path;

  if (debugDir) {
    console.info(
      `Debug mode enabled. Files will be saved to: ${accent(debugDir)}\n`,
    );
  }

  await runWithinContext({ ...args, llmApiKey, debugDir }, async () => {
    const { srtContent, title, chapters } = await fetchTranscript();

    void writeFullVideoTranscriptDebugFile(srtContent);

    const hasChapters = chapters && chapters.length > 0;

    await (hasChapters
      ? analyzeWithChapters(srtContent, chapters, title)
      : analyzeWithoutChapters(srtContent, title));

    await promptForDebugCleanup();
  });
}

async function analyzeWithChapters(
  srtContent: string,
  chapters: Array<Chapter>,
  videoTitle?: string,
): Promise<void> {
  const { model } = getContext();
  const chapterTranscripts = splitSrtByChapters(srtContent, chapters);

  for (let i = 0; i < chapterTranscripts.length; i++) {
    const chapterTranscript = chapterTranscripts[i];
    if (!chapterTranscript) {
      continue;
    }

    const chapter = chapters[i];
    if (!chapter) {
      continue;
    }

    const startTime = formatTimestamp(chapter.start_time);
    const endTime = formatTimestamp(chapter.end_time);
    const timeRange = `[${startTime} - ${endTime}]`;

    console.info(`\n--- ${accent(chapterTranscript.title)} ${timeRange} ---\n`);
    console.info(`Analyzing with ${accent(model)}...\n`);

    void writeChapterTranscriptDebugFile(i + 1, chapterTranscript);

    await analyzeChapterWithLlm(i + 1, chapterTranscript, videoTitle);

    console.info("\n");
  }

  console.info("Done!");
}

async function analyzeWithoutChapters(
  transcript: string,
  videoTitle?: string,
): Promise<void> {
  const { model } = getContext();
  console.info(`Analyzing transcript with ${accent(model)}...\n`);

  await analyzeFullVideoWithLlm(transcript, videoTitle);

  console.info("\n\nDone!");
}

const argsSchema = z.object({
  url: z.string(),
  model: z.string().default("gemini-2.5-flash"),
  debug: z.boolean().default(false),
});

const options = {
  url: { type: "string" },
  model: { type: "string" },
  debug: { type: "boolean" },
} as const satisfies ParseArgsOptionsConfig;
