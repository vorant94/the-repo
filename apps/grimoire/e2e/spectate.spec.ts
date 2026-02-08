import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exec } from "./helpers/exec.ts";
import { createTempDir, type TempDir } from "./helpers/temp-dir.ts";

describe("spectate command", () => {
  let tempDir: TempDir;

  beforeEach(async () => {
    tempDir = await createTempDir("spectate");
  });

  afterEach(async () => {
    await tempDir.cleanup();
  });

  it("should fetch and format YouTube video transcript", async () => {
    // Using a stable YouTube video with captions
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const outputPath = join(tempDir.path, "transcript.txt");

    await exec(
      `grimoire spectate --url "${testUrl}" --outputPath "${outputPath}"`,
    );

    const transcriptContent = await readFile(outputPath, "utf-8");

    // Verify transcript was fetched and formatted
    expect(transcriptContent.length).toBeGreaterThan(0);

    // Verify timestamp format [MM:SS] or [HH:MM:SS]
    expect(transcriptContent).toMatch(/\[\d{2}:\d{2}\]/);

    // Verify content structure: timestamp followed by text
    const lines = transcriptContent.split("\n");
    expect(lines[0]).toMatch(/^\[\d{2}:\d{2}(:\d{2})?\] .+/);
  });

  it("should use default output path when not specified", async () => {
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const defaultOutputPath = join(tempDir.path, "transcript.txt");

    // Change to temp directory before running command
    await exec(`cd "${tempDir.path}" && grimoire spectate --url "${testUrl}"`);

    const transcriptContent = await readFile(defaultOutputPath, "utf-8");
    expect(transcriptContent.length).toBeGreaterThan(0);
  });

  it("should format timestamps correctly for videos under 1 hour", async () => {
    const testUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const outputPath = join(tempDir.path, "transcript.txt");

    await exec(
      `grimoire spectate --url "${testUrl}" --outputPath "${outputPath}"`,
    );

    const transcriptContent = await readFile(outputPath, "utf-8");

    // For videos under 1 hour, should use MM:SS format (not HH:MM:SS)
    const lines = transcriptContent.split("\n");
    const firstLine = lines[0];

    if (firstLine) {
      expect(firstLine).toMatch(/^\[\d{2}:\d{2}\] /);
    }
  });
});
