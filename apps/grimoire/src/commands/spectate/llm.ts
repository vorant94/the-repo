import process from "node:process";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const { model, llmApiKey } = getContext();

  const systemPrompt = buildSystemPromptForChapter(
    chapterTranscript.title,
    videoTitle,
  );

  void writeChapterSystemPromptDebugFile(
    chapterIndex,
    chapterTranscript,
    systemPrompt,
  );

  const client = new GoogleGenerativeAI(llmApiKey);
  const agent = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await agent.generateContentStream(
    chapterTranscript.srtContent,
  );

  const fileHandle = await createChapterAnalysisDebugFileHandle(
    chapterIndex,
    chapterTranscript,
  );

  try {
    for await (const chunk of result.stream) {
      const text = chunk.text();
      process.stdout.write(text);
      await fileHandle?.write(text);
    }
  } finally {
    await fileHandle?.close();
  }
}

export async function analyzeFullVideoWithLlm(
  transcript: string,
  videoTitle?: string,
): Promise<void> {
  const { model, llmApiKey } = getContext();

  const systemPrompt = buildSystemPromptForFullVideo(videoTitle);

  void writeFullVideoSystemPromptDebugFile(systemPrompt);

  const client = new GoogleGenerativeAI(llmApiKey);
  const agent = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await agent.generateContentStream(transcript);

  const fileHandle = await createFullVideoDebugFileHandle();

  try {
    for await (const chunk of result.stream) {
      const text = chunk.text();
      process.stdout.write(text);
      await fileHandle?.write(text);
    }
  } finally {
    await fileHandle?.close();
  }
}
