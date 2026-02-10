import console from "node:console";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { confirm } from "@inquirer/prompts";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { createTempDir } from "../../shared/temp-dir.ts";
import { getCachedAnalysis, setCachedAnalysis } from "./cache.ts";
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
import { extractVideoId } from "./youtube-url.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const args = argsSchema.parse(values);

  const videoId = extractVideoId(args.url);
  const cached = await getCachedAnalysis(videoId);

  if (cached) {
    console.info(`\n--- Cached Analysis (${accent(cached.model)}) ---\n`);
    console.info(cached.analysis);
    console.info("\n");

    const shouldRegenerate = await confirm({
      message: "Re-generate analysis?",
      default: false,
    });

    if (!shouldRegenerate) {
      return;
    }
  }

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

    const analysis = await (hasChapters
      ? analyzeWithChapters(srtContent, chapters, title)
      : analyzeWithoutChapters(srtContent, title));

    await setCachedAnalysis(videoId, args.model, analysis);

    await promptForDebugCleanup();
  });
}

async function analyzeWithChapters(
  srtContent: string,
  chapters: Array<Chapter>,
  videoTitle?: string,
): Promise<string> {
  const { model } = getContext();
  const chapterTranscripts = splitSrtByChapters(srtContent, chapters);
  const parts: Array<string> = [];

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

    const header = `--- ${chapterTranscript.title} ${timeRange} ---`;

    console.info(`\n${header}\n`);
    console.info(`Analyzing with ${accent(model)}...\n`);

    void writeChapterTranscriptDebugFile(i + 1, chapterTranscript);

    const chapterAnalysis = await analyzeChapterWithLlm(
      i + 1,
      chapterTranscript,
      videoTitle,
    );

    parts.push(`${header}\n\n${chapterAnalysis}`);

    console.info("\n");
  }

  console.info("Done!");

  return parts.join("\n\n");
}

async function analyzeWithoutChapters(
  transcript: string,
  videoTitle?: string,
): Promise<string> {
  const { model } = getContext();
  console.info(`Analyzing transcript with ${accent(model)}...\n`);

  const analysis = await analyzeFullVideoWithLlm(transcript, videoTitle);

  console.info("\n\nDone!");

  return analysis;
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
