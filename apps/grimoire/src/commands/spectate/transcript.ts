import console from "node:console";
import { z } from "zod";
import { execFile } from "../../shared/exec.ts";
import { accent } from "../../shared/logger.ts";

export interface TranscriptData {
  srtContent: string;
  title?: string;
  chapters?: Array<Chapter> | null;
}

const chapterSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  start_time: z.number(),
  // biome-ignore lint/style/useNamingConvention: external API field name from yt-dlp
  end_time: z.number(),
  title: z.string(),
});

export type Chapter = z.infer<typeof chapterSchema>;

export async function fetchTranscript(url: string): Promise<TranscriptData> {
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
