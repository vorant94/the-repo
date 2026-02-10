import dedent from "dedent";
import { describe, expect, it } from "vitest";
import { formatTimestamp, splitSrtByChapters } from "./srt.ts";
import type { Chapter } from "./transcript.ts";

describe("formatTimestamp", () => {
  it("should format zero seconds", () => {
    const result = formatTimestamp(0);

    expect(result).toBe("00:00:00");
  });

  it("should format seconds only", () => {
    const result = formatTimestamp(45);

    expect(result).toBe("00:00:45");
  });

  it("should format minutes and seconds", () => {
    const result = formatTimestamp(125);

    expect(result).toBe("00:02:05");
  });

  it("should format hours, minutes, and seconds", () => {
    const result = formatTimestamp(3661);

    expect(result).toBe("01:01:01");
  });

  it("should truncate fractional seconds", () => {
    const result = formatTimestamp(59.9);

    expect(result).toBe("00:00:59");
  });
});

describe("splitSrtByChapters", () => {
  it("should split blocks into correct chapters based on start timestamp", () => {
    const srtContent = dedent`
      1
      00:00:05,000 --> 00:00:10,000
      First block

      2
      00:01:05,000 --> 00:01:10,000
      Second block

      3
      00:02:05,000 --> 00:02:10,000
      Third block
    `;

    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 0, end_time: 60 },
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 2", start_time: 60, end_time: 120 },
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 3", start_time: 120, end_time: 180 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters(srtContent, chapters);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      title: "Chapter 1",
      srtContent: dedent`
        1
        00:00:05,000 --> 00:00:10,000
        First block
      `,
    });
    expect(result[1]).toEqual({
      title: "Chapter 2",
      srtContent: dedent`
        2
        00:01:05,000 --> 00:01:10,000
        Second block
      `,
    });
    expect(result[2]).toEqual({
      title: "Chapter 3",
      srtContent: dedent`
        3
        00:02:05,000 --> 00:02:10,000
        Third block
      `,
    });
  });

  it("should exclude chapters with no matching blocks", () => {
    const srtContent = dedent`
      1
      00:00:05,000 --> 00:00:10,000
      First block
    `;

    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 0, end_time: 60 },
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 2", start_time: 60, end_time: 120 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters(srtContent, chapters);

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Chapter 1");
  });

  it("should include block at exact start_time", () => {
    const srtContent = dedent`
      1
      00:01:00,000 --> 00:01:05,000
      At boundary
    `;

    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 60, end_time: 120 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters(srtContent, chapters);

    expect(result).toHaveLength(1);
    expect(result[0]?.srtContent).toContain("At boundary");
  });

  it("should exclude block at exact end_time", () => {
    const srtContent = dedent`
      1
      00:02:00,000 --> 00:02:05,000
      At end boundary
    `;

    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 60, end_time: 120 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters(srtContent, chapters);

    expect(result).toHaveLength(0);
  });

  it("should return empty array when SRT content is empty", () => {
    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 0, end_time: 60 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters("", chapters);

    expect(result).toEqual([]);
  });

  it("should skip malformed blocks with fewer than 2 lines", () => {
    const srtContent = dedent`
      1

      2
      00:00:05,000 --> 00:00:10,000
      Valid block
    `;

    const chapters = [
      // biome-ignore lint/style/useNamingConvention: external API field names from yt-dlp
      { title: "Chapter 1", start_time: 0, end_time: 60 },
    ] as Array<Chapter>;

    const result = splitSrtByChapters(srtContent, chapters);

    expect(result).toHaveLength(1);
    expect(result[0]?.srtContent).toContain("Valid block");
    expect(result[0]?.srtContent).not.toContain("1\n");
  });
});
