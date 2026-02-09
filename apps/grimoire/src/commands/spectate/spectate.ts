import console from "node:console";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { getContext, runWithinContext } from "./context.ts";
import { analyzeWithOllama } from "./ollama.ts";
import {
  buildSystemPromptForChapter,
  buildSystemPromptForFullVideo,
} from "./prompts.ts";
import { formatTimestamp, splitSrtByChapters } from "./srt.ts";
import type { Chapter } from "./transcript.ts";
import { fetchTranscript } from "./transcript.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const args = argsSchema.parse(values);

  await runWithinContext(args, async () => {
    const { srtContent, title, chapters } = await fetchTranscript();

    const hasChapters = chapters && chapters.length > 0;

    await (hasChapters
      ? analyzeWithChapters(srtContent, chapters, title)
      : analyzeWithoutChapters(srtContent, title));
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

    const systemPrompt = buildSystemPromptForChapter(
      chapterTranscript.title,
      videoTitle,
    );
    await analyzeWithOllama(chapterTranscript.srtContent, systemPrompt);

    console.info("\n");
  }

  console.info("Done!");
}

async function analyzeWithoutChapters(
  srtContent: string,
  videoTitle?: string,
): Promise<void> {
  const { model } = getContext();
  console.info(`Analyzing transcript with ${accent(model)}...\n`);

  const systemPrompt = buildSystemPromptForFullVideo(videoTitle);
  await analyzeWithOllama(srtContent, systemPrompt);

  console.info("\n\nDone!");
}

const argsSchema = z.object({
  url: z.string(),
  model: z.string().default("llama3.1"),
});

const options = {
  url: { type: "string" },
  model: { type: "string" },
} as const satisfies ParseArgsOptionsConfig;
