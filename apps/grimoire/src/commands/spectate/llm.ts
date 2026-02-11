import { stream } from "@clack/prompts";
import {
  type GenerateContentStreamResult,
  GoogleGenerativeAI,
} from "@google/generative-ai";
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
): Promise<string> {
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

  await using fileHandle = await createChapterAnalysisDebugFileHandle(
    chapterIndex,
    chapterTranscript,
  );

  const parts: Array<string> = [];

  await stream.info(
    (async function* (result: GenerateContentStreamResult) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        parts.push(text);
        await fileHandle?.write(text);
        yield text;
      }
    })(result),
  );

  return parts.join("");
}

export async function analyzeFullVideoWithLlm(
  transcript: string,
  videoTitle?: string,
): Promise<string> {
  const { model, llmApiKey } = getContext();

  const systemPrompt = buildSystemPromptForFullVideo(videoTitle);

  void writeFullVideoSystemPromptDebugFile(systemPrompt);

  const client = new GoogleGenerativeAI(llmApiKey);
  const agent = client.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await agent.generateContentStream(transcript);

  await using fileHandle = await createFullVideoDebugFileHandle();

  const parts: Array<string> = [];

  await stream.info(
    (async function* (result: GenerateContentStreamResult) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        parts.push(text);
        await fileHandle?.write(text);
        yield text;
      }
    })(result),
  );

  return parts.join("");
}
