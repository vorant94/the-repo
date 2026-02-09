import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { execFile } from "../src/shared/exec.ts";
import { createTempDir } from "../src/shared/temp-dir.ts";

describe("scrap-pauper command", () => {
  it("should fetch real paupergeddon.com URL and create output file", async () => {
    await using tempDir = await createTempDir("grimoire-e2e-scrap-pauper");
    await execFile("grimoire", [
      "scrap-pauper",
      "--outputPath",
      `${tempDir.path}/staples.txt`,
    ]);

    const staplesContent = await readFile(
      join(tempDir.path, "staples.txt"),
      "utf-8",
    );

    expect(staplesContent.length).toBeGreaterThan(0);
  });

  it("should output expected format with sorted decklist lines", async () => {
    await using tempDir = await createTempDir("grimoire-e2e-scrap-pauper");
    await execFile("grimoire", [
      "scrap-pauper",
      "--outputPath",
      `${tempDir.path}/staples.txt`,
    ]);

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
    await using tempDir = await createTempDir("grimoire-e2e-scrap-pauper");
    await execFile("grimoire", [
      "scrap-pauper",
      "--outputPath",
      `${tempDir.path}/staples.txt`,
    ]);

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
    await using tempDir = await createTempDir("grimoire-e2e-scrap-pauper");
    const customPath = join(tempDir.path, "custom-output.txt");

    await execFile("grimoire", ["scrap-pauper", "--outputPath", customPath]);

    const staplesContent = await readFile(customPath, "utf-8");

    expect(staplesContent.length).toBeGreaterThan(0);
  });
});
