import { type FileHandle, open, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { text } from "@clack/prompts";
import { accent } from "../../shared/logger.ts";
import { slugify } from "../../shared/slugify.ts";
import { getContext } from "./context.ts";
import type { ChapterTranscript } from "./srt.ts";

export async function writeFullVideoTranscriptDebugFile(
  transcript: string,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  await writeFile(
    join(debugDir, "full-video-transcript.srt"),
    transcript,
    "utf-8",
  );
}

export async function writeFullVideoSystemPromptDebugFile(
  systemPrompt: string,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  await writeFile(
    join(debugDir, "full-video-system-prompt.md"),
    systemPrompt,
    "utf-8",
  );
}

export async function createFullVideoDebugFileHandle(): Promise<FileHandle | null> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return null;
  }

  return await open(join(debugDir, "full-video-analysis.md"), "w");
}

export async function writeChapterTranscriptDebugFile(
  chapterIndex: number,
  chapterTranscript: ChapterTranscript,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  const paddedIndex = String(chapterIndex).padStart(2, "0");
  const titleSlug = slugify(chapterTranscript.title);

  await writeFile(
    join(debugDir, `chapter-${paddedIndex}-${titleSlug}-transcript.srt`),
    chapterTranscript.srtContent,
    "utf-8",
  );
}

export async function writeChapterSystemPromptDebugFile(
  chapterIndex: number,
  chapterTranscript: ChapterTranscript,
  systemPrompt: string,
): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  const paddedIndex = String(chapterIndex).padStart(2, "0");
  const titleSlug = slugify(chapterTranscript.title);

  await writeFile(
    join(debugDir, `chapter-${paddedIndex}-${titleSlug}-system-prompt.md`),
    systemPrompt,
    "utf-8",
  );
}

export async function createChapterAnalysisDebugFileHandle(
  chapterIndex: number,
  chapterTranscript: ChapterTranscript,
): Promise<FileHandle | null> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return null;
  }

  const paddedIndex = String(chapterIndex).padStart(2, "0");
  const titleSlug = slugify(chapterTranscript.title);

  return await open(
    join(debugDir, `chapter-${paddedIndex}-${titleSlug}-analysis.md`),
    "w",
  );
}

export async function pauseBeforeDebugCleanup(): Promise<void> {
  const { debugDir } = getContext();
  if (!debugDir) {
    return;
  }

  await text({
    message: `Debug files in ${accent(debugDir)} will be deleted. Press Enter to continue...`,
  });
}
