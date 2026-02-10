import process from "node:process";
import { streamText } from "ai";
import { ollama } from "ollama-ai-provider";
import { getContext } from "./context.ts";
import {
  createChapterAnalysisDebugFileHandle,
  createFullVideoDebugFileHandle,
  writeChapterSystemPromptDebugFile,
  writeFullVideoSystemPromptDebugFile,
} from "./debug.ts";
import {
  buildSystemPromptForChapter,
  buildSystemPromptForFullVideo,
} from "./prompts.ts";
import type { ChapterTranscript } from "./srt.ts";

export async function analyzeChapterWithLlm(
  chapterIndex: number,
  chapterTranscript: ChapterTranscript,
  videoTitle?: string,
): Promise<void> {
  const { model } = getContext();

  const systemPrompt = buildSystemPromptForChapter(
    chapterTranscript.title,
    videoTitle,
  );

  void writeChapterSystemPromptDebugFile(
    chapterIndex,
    chapterTranscript,
    systemPrompt,
  );

  const { textStream } = streamText({
    model: ollama(model),
    system: systemPrompt,
    prompt: chapterTranscript.srtContent,
  });

  const fileHandle = await createChapterAnalysisDebugFileHandle(
    chapterIndex,
    chapterTranscript,
  );

  try {
    for await (const chunk of textStream) {
      process.stdout.write(chunk);
      await fileHandle?.write(chunk);
    }
  } finally {
    await fileHandle?.close();
  }
}

export async function analyzeFullVideoWithLlm(
  transcript: string,
  videoTitle?: string,
): Promise<void> {
  const { model } = getContext();

  const systemPrompt = buildSystemPromptForFullVideo(videoTitle);

  void writeFullVideoSystemPromptDebugFile(systemPrompt);

  const { textStream } = streamText({
    model: ollama(model),
    system: systemPrompt,
    prompt: transcript,
  });

  const fileHandle = await createFullVideoDebugFileHandle();

  try {
    for await (const chunk of textStream) {
      process.stdout.write(chunk);
      await fileHandle?.write(chunk);
    }
  } finally {
    await fileHandle?.close();
  }
}
