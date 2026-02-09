import console from "node:console";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import { z } from "zod";
import { accent } from "../../shared/logger.ts";
import { slugify } from "../../shared/slugify.ts";
import { createTempDir } from "../../shared/temp-dir.ts";
import { getContext, runWithinContext } from "./context.ts";
import { analyzeWithOllama } from "./ollama.ts";
import {
  buildSystemPromptForChapter,
  buildSystemPromptForFullVideo,
} from "./prompts.ts";
import {
  type ChapterTranscript,
  formatTimestamp,
  splitSrtByChapters,
} from "./srt.ts";
import type { Chapter } from "./transcript.ts";
import { fetchTranscript } from "./transcript.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const args = argsSchema.parse(values);

  await using tempDir = args.debug
    ? await createTempDir("grimoire-spectate-debug")
    : null;
  const debugDir = tempDir?.path;

  if (debugDir) {
    console.info(
      `Debug mode enabled. Files will be saved to: ${accent(debugDir)}\n`,
    );
  }

  await runWithinContext({ ...args, debugDir }, async () => {
    const { srtContent, title, chapters } = await fetchTranscript();

    void writeTranscriptContentDebugFile(srtContent);

    const hasChapters = chapters && chapters.length > 0;

    await (hasChapters
      ? analyzeWithChapters(srtContent, chapters, title)
      : analyzeWithoutChapters(srtContent, title));

    await promptForDebugCleanup();
  });
}

async function promptForDebugCleanup(): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    await rl.question(
      `\nDebug files in ${accent(debugDir)} will be deleted. Press Enter to continue...`,
    );
  } finally {
    rl.close();
  }
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

    const chapterDebugFileName = getChapterTranscriptDebugFileName(
      i + 1,
      chapterTranscript,
    );

    void writeChapterTranscriptDebugFile(
      chapterDebugFileName,
      chapterTranscript,
    );

    const startTime = formatTimestamp(chapter.start_time);
    const endTime = formatTimestamp(chapter.end_time);
    const timeRange = `[${startTime} - ${endTime}]`;

    console.info(`\n--- ${accent(chapterTranscript.title)} ${timeRange} ---\n`);
    console.info(`Analyzing with ${accent(model)}...\n`);

    const systemPrompt = buildSystemPromptForChapter(
      chapterTranscript.title,
      videoTitle,
    );
    await analyzeWithOllama(
      chapterTranscript.srtContent,
      systemPrompt,
      `${chapterDebugFileName}.md`,
    );

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
  await analyzeWithOllama(srtContent, systemPrompt, "analysis.md");

  console.info("\n\nDone!");
}

async function writeTranscriptContentDebugFile(
  srtContent: string,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  await writeFile(join(debugDir, "transcript.srt"), srtContent, "utf-8");
}

function getChapterTranscriptDebugFileName(
  chapterIndex: number,
  chapterTranscript: ChapterTranscript,
): string {
  const paddedIndex = String(chapterIndex).padStart(2, "0");
  const titleSlug = slugify(chapterTranscript.title);

  return `chapter-${paddedIndex}-${titleSlug}`;
}

async function writeChapterTranscriptDebugFile(
  fileName: string,
  chapterTranscript: ChapterTranscript,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  await writeFile(
    join(debugDir, `${fileName}.srt`),
    chapterTranscript.srtContent,
    "utf-8",
  );
}

const argsSchema = z.object({
  url: z.string(),
  model: z.string().default("llama3.1"),
  debug: z.boolean().default(false),
});

const options = {
  url: { type: "string" },
  model: { type: "string" },
  debug: { type: "boolean" },
} as const satisfies ParseArgsOptionsConfig;
