import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exec } from "./helpers/exec.ts";
import { createTempDir, type TempDir } from "./helpers/temp-dir.ts";

describe("scrap-pauper command", () => {
  let tempDir: TempDir;

  beforeEach(async () => {
    tempDir = await createTempDir("scrap-pauper");
  });

  afterEach(async () => {
    await tempDir.cleanup();
  });

  it("should fetch real paupergeddon.com URL and create output file", async () => {
    await exec(
      `grimoire scrap-pauper --outputPath ${tempDir.path}/staples.txt`,
    );

    const staplesContent = await readFile(
      join(tempDir.path, "staples.txt"),
      "utf-8",
    );

    expect(staplesContent.length).toBeGreaterThan(0);
  });

  it("should output expected format with sorted decklist lines", async () => {
    await exec(
      `grimoire scrap-pauper --outputPath ${tempDir.path}/staples.txt`,
    );

    const staplesContent = await readFile(
      join(tempDir.path, "staples.txt"),
      "utf-8",
    );

    const lines = staplesContent.split("\n").filter((line) => line.trim());
    expect(lines.length).toBeGreaterThan(0);

    for (const line of lines) {
      expect(line).toMatch(/^1 .+$/);
    }

    const sortedLines = lines.toSorted();
    expect(lines).toEqual(sortedLines);
  });

  it("should not contain basic lands in output", async () => {
    await exec(
      `grimoire scrap-pauper --outputPath ${tempDir.path}/staples.txt`,
    );

    const staplesContent = await readFile(
      join(tempDir.path, "staples.txt"),
      "utf-8",
    );

    const basicLands = [
      "Plains",
      "Island",
      "Swamp",
      "Mountain",
      "Forest",
      "Snow-Covered Plains",
      "Snow-Covered Island",
      "Snow-Covered Swamp",
      "Snow-Covered Mountain",
      "Snow-Covered Forest",
    ];

    for (const land of basicLands) {
      expect(staplesContent).not.toContain(land);
    }
  });

  it("should support custom output path", async () => {
    const customPath = join(tempDir.path, "custom-output.txt");

    await exec(`grimoire scrap-pauper --outputPath ${customPath}`);

    const staplesContent = await readFile(customPath, "utf-8");

    expect(staplesContent.length).toBeGreaterThan(0);
  });
});
