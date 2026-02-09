import console from "node:console";
import process from "node:process";
import { type ParseArgsOptionsConfig, parseArgs } from "node:util";
import dedent from "dedent";
import { Ollama } from "ollama";
import { z } from "zod";
import { execFile } from "../shared/exec.ts";
import { accent } from "../shared/logger.ts";

export async function spectate() {
  const { values } = parseArgs({ options, strict: true });
  const { url, model } = argsSchema.parse(values);

  const { srtContent, title, chapters } = await fetchTranscript(url);

  if (chapters && chapters.length > 0) {
    await analyzeWithChapters(srtContent, chapters, title, model);
  } else {
    await analyzeWithoutChapters(srtContent, title, model);
  }
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

interface TranscriptData {
  srtContent: string;
  title: string | undefined;
  chapters: Array<z.infer<typeof chapterSchema>> | null | undefined;
}

async function fetchTranscript(url: string): Promise<TranscriptData> {
  console.info(`Fetching transcript from ${accent(url)}...`);

  const metadata = await fetchYtDlpMetadata(url);
  const srtUrl = findSrtUrl(metadata);

  if (!srtUrl) {
    throw new Error("No English SRT subtitles found for this video");
  }

  const srtContent = await fetchSrt(srtUrl);
  console.info("Transcript fetched successfully");

  return {
    srtContent,
    title: metadata.title,
    chapters: metadata.chapters,
  };
}

const subtitleEntrySchema = z.object({
  ext: z.string(),
  url: z.string(),
});

const chapterSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  start_time: z.number(),
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  end_time: z.number(),
  title: z.string(),
});

const ytDlpMetadataSchema = z.object({
  subtitles: z.record(z.string(), z.array(subtitleEntrySchema)).optional(),
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  automatic_captions: z
    .record(z.string(), z.array(subtitleEntrySchema))
    .optional(),
  title: z.string().optional(),
  chapters: z.array(chapterSchema).nullable().optional(),
});

type YtDlpMetadata = z.infer<typeof ytDlpMetadataSchema>;

async function fetchYtDlpMetadata(url: string): Promise<YtDlpMetadata> {
  const { stdout } = await execFile("yt-dlp", [
    "--dump-json",
    "--skip-download",
    url,
  ]);

  const metadata = JSON.parse(stdout);
  return ytDlpMetadataSchema.parse(metadata);
}

function findSrtUrl(metadata: YtDlpMetadata): string | null {
  const manualSubs = metadata.subtitles?.en;
  if (manualSubs) {
    const srtEntry = manualSubs.find((entry) => entry.ext === "srt");
    if (srtEntry) {
      return srtEntry.url;
    }
  }

  const autoCaptions = metadata.automatic_captions?.en;
  if (autoCaptions) {
    const srtEntry = autoCaptions.find((entry) => entry.ext === "srt");
    if (srtEntry) {
      return srtEntry.url;
    }
  }

  return null;
}

async function fetchSrt(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch SRT: ${response.status}`);
  }

  return await response.text();
}

function parseSrtTimestamp(timestamp: string): number {
  const parts = timestamp.split(",");
  const time = parts[0];
  const milliseconds = parts[1];

  if (!time || !milliseconds) {
    throw new Error(`Invalid SRT timestamp format: ${timestamp}`);
  }

  const timeParts = time.split(":").map(Number);
  const hours = timeParts[0];
  const minutes = timeParts[1];
  const seconds = timeParts[2];

  if (hours === undefined || minutes === undefined || seconds === undefined) {
    throw new Error(`Invalid SRT time format: ${time}`);
  }

  return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secsStr}`;
}

interface ChapterTranscript {
  title: string;
  srtContent: string;
}

function splitSrtByChapters(
  srtContent: string,
  chapters: Array<z.infer<typeof chapterSchema>>,
): Array<ChapterTranscript> {
  const blocks = srtContent.split("\n\n").filter((block) => block.trim());
  const result: Array<ChapterTranscript> = [];

  for (const chapter of chapters) {
    const chapterBlocks: Array<string> = [];

    for (const block of blocks) {
      const lines = block.split("\n");
      if (lines.length < 2) {
        continue;
      }

      const timestampLine = lines[1];
      if (!timestampLine) {
        continue;
      }

      const startTimestamp = timestampLine.split(" --> ")[0];
      if (!startTimestamp) {
        continue;
      }

      const startTime = parseSrtTimestamp(startTimestamp);

      if (startTime >= chapter.start_time && startTime < chapter.end_time) {
        chapterBlocks.push(block);
      }
    }

    if (chapterBlocks.length > 0) {
      result.push({
        title: chapter.title,
        srtContent: chapterBlocks.join("\n\n"),
      });
    }
  }

  return result;
}

function buildSystemPromptForChapter(
  videoTitle: string | undefined,
  chapterTitle: string,
): string {
  const titleContext = videoTitle ? `Video: ${videoTitle}\n` : "";

  return dedent`
    ${titleContext}Chapter: ${chapterTitle}

    You are analyzing a transcript from a Magic: The Gathering Pauper format gameplay video.

    IMPORTANT: This chapter represents a SINGLE match-up only. Each chapter contains one match-up between two decks, with up to 3 games (best of 3 format).

    If this chapter is an intro, outro, or other non-gameplay section without any actual games, simply respond with "No games in this chapter".

    If games are present, extract information for this ONE match-up:
    1. The player's deck archetype
    2. The opponent's deck archetype
    3. Game numbers (Game 1, Game 2, Game 3 - maximum 3 games per match-up)
    4. Result for each game (win/loss) if mentioned

    DO NOT identify multiple different match-ups in a single chapter. There is only ONE match-up per chapter.

    Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

    Format your response clearly with each game on a separate line.
  `;
}

function buildSystemPromptForFullVideo(videoTitle: string | undefined): string {
  const titleContext = videoTitle ? `Video: ${videoTitle}\n` : "";

  return dedent`
    ${titleContext}
    You are analyzing a transcript from a Magic: The Gathering Pauper format gameplay video.

    This video may contain multiple match-ups (e.g., Round 1, Round 2, Round 3). Each match-up is best of 3, so there can be up to 3 games per match-up.

    Extract the match-up information for all games played. For each match-up, identify:
    1. Round/match number (if mentioned)
    2. The player's deck archetype
    3. The opponent's deck archetype
    4. Game numbers within that match (Game 1, Game 2, Game 3)
    5. Result for each game (win/loss) if mentioned

    Use standard Pauper archetype names (e.g., Mono-Blue Terror, Mono-Red Madness, Golgari Gardens, Affinity, Boros Synth, Dimir Faeries, Bogles, Burn, etc.).

    Format your response clearly, grouping games by match-up.
  `;
}

const ollama = new Ollama();

async function analyzeWithOllama(
  transcript: string,
  systemPrompt: string,
  model: string,
): Promise<void> {
  const response = await ollama.chat({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: transcript },
    ],
    stream: true,
  });

  for await (const part of response) {
    if (part.message.content) {
      process.stdout.write(part.message.content);
    }
  }
}
