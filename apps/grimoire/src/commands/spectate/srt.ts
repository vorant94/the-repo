import type { Chapter } from "./transcript.ts";

export interface ChapterTranscript {
  title: string;
  srtContent: string;
}

export function splitSrtByChapters(
  srtContent: string,
  chapters: Array<Chapter>,
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

// Manual duration formatting is used because date-fns and other time libraries
// account for timezones when formatting, which complicates pure duration display.
// This converts raw seconds to HH:MM:SS without timezone considerations.
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secsStr = String(secs).padStart(2, "0");

  return `${hoursStr}:${minutesStr}:${secsStr}`;
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
