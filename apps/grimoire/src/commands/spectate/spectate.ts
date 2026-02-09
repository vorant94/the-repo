import console from "node:console";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { analyzeWithOllama } from "./ollama.ts";
import {
  buildSystemPromptForChapter,
  buildSystemPromptForFullVideo,
} from "./prompts.ts";
import { formatTimestamp, splitSrtByChapters } from "./srt.ts";
import type { chapterSchema } from "./transcript.ts";
import { fetchTranscript } from "./transcript.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const { url, model } = argsSchema.parse(values);

  const { srtContent, title, chapters } = await fetchTranscript(url);

  const hasChapters = chapters && chapters.length > 0;

  await (hasChapters
    ? analyzeWithChapters(srtContent, chapters, title, model)
    : analyzeWithoutChapters(srtContent, title, model));
}

async function analyzeWithChapters(
  srtContent: string,
  chapters: Array<z.infer<typeof chapterSchema>>,
  videoTitle: string | undefined,
  model: string,
): Promise<void> {
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
      videoTitle,
      chapterTranscript.title,
    );
    await analyzeWithOllama(chapterTranscript.srtContent, systemPrompt, model);

    console.info("\n");
  }

  console.info("Done!");
}

async function analyzeWithoutChapters(
  srtContent: string,
  videoTitle: string | undefined,
  model: string,
): Promise<void> {
  console.info(`Analyzing transcript with ${accent(model)}...\n`);

  const systemPrompt = buildSystemPromptForFullVideo(videoTitle);
  await analyzeWithOllama(srtContent, systemPrompt, model);

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
