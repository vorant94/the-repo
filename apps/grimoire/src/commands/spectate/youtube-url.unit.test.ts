import { describe, expect, it } from "vitest";
import { extractVideoId } from "./youtube-url.ts";

describe("extractVideoId", () => {
  it("extracts video ID from youtube.com/watch?v= URL", () => {
    const videoId = extractVideoId(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtube.com/watch?v= URL without www", () => {
    const videoId = extractVideoId("https://youtube.com/watch?v=dQw4w9WgXcQ");
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtu.be URL", () => {
    const videoId = extractVideoId("https://youtu.be/dQw4w9WgXcQ");
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from URL with timestamp parameter", () => {
    const videoId = extractVideoId(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120",
    );
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("extracts video ID from youtu.be URL with timestamp parameter", () => {
    const videoId = extractVideoId("https://youtu.be/dQw4w9WgXcQ?t=120");
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("throws on invalid YouTube URL without video ID", () => {
    expect(() => extractVideoId("https://www.youtube.com")).toThrow(
      "Invalid YouTube URL",
    );
  });

  it("throws on non-YouTube URL", () => {
    expect(() => extractVideoId("https://example.com/watch?v=123")).toThrow(
      "Invalid YouTube URL",
    );
  });

  it("throws on youtu.be URL without video ID", () => {
    expect(() => extractVideoId("https://youtu.be/")).toThrow(
      "Invalid YouTube URL",
    );
  });
});
