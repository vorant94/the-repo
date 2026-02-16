import { readFile } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTempDir } from "../../shared/temp-dir.ts";
import { scrapStaples } from "./scrap-staples.ts";

const pauperFixtureHtml = await readFile(
  new URL("./assets/scrap-staples-pauper-fixture.html", import.meta.url),
  "utf-8",
);

const pdhFixtureHtml = await readFile(
  new URL("./assets/scrap-staples-pdh-fixture.html", import.meta.url),
  "utf-8",
);

describe("scrap-staples", () => {
  let originalArgv: Array<string> = [];

  beforeEach(() => {
    originalArgv = process.argv;
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("pauper", () => {
    it("should create non-empty output file", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
        Promise.resolve(new Response(pauperFixtureHtml)),
      );

      await using tempDir = await createTempDir("grimoire-scrap-staples");
      const outputPath = join(tempDir.path, "staples.txt");
      process.argv = ["node", "grimoire", "pauper", "--outputPath", outputPath];

      await scrapStaples();

      const content = await readFile(outputPath, "utf-8");
      expect(content.length).toBeGreaterThan(0);
    });

    it("should output sorted decklist lines in '1 CardName' format", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
        Promise.resolve(new Response(pauperFixtureHtml)),
      );

      await using tempDir = await createTempDir("grimoire-scrap-staples");
      const outputPath = join(tempDir.path, "staples.txt");
      process.argv = ["node", "grimoire", "pauper", "--outputPath", outputPath];

      await scrapStaples();

      const content = await readFile(outputPath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        expect(line).toMatch(/^1 .+$/);
      }
      const sortedLines = lines.toSorted();
      expect(lines).toEqual(sortedLines);
    });

    it("should not contain basic lands in output", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
        Promise.resolve(new Response(pauperFixtureHtml)),
      );

      await using tempDir = await createTempDir("grimoire-scrap-staples");
      const outputPath = join(tempDir.path, "staples.txt");
      process.argv = ["node", "grimoire", "pauper", "--outputPath", outputPath];

      await scrapStaples();

      const content = await readFile(outputPath, "utf-8");
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
        expect(content).not.toContain(land);
      }
    });
  });

  describe("pdh", () => {
    it("should create non-empty output file", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
        Promise.resolve(new Response(pdhFixtureHtml)),
      );

      await using tempDir = await createTempDir("grimoire-scrap-staples");
      const outputPath = join(tempDir.path, "staples.txt");
      process.argv = ["node", "grimoire", "pdh", "--outputPath", outputPath];

      await scrapStaples();

      const content = await readFile(outputPath, "utf-8");
      expect(content.length).toBeGreaterThan(0);
    });

    it("should output sorted decklist lines in '1 CardName' format", async () => {
      vi.spyOn(globalThis, "fetch").mockImplementationOnce(() =>
        Promise.resolve(new Response(pdhFixtureHtml)),
      );

      await using tempDir = await createTempDir("grimoire-scrap-staples");
      const outputPath = join(tempDir.path, "staples.txt");
      process.argv = ["node", "grimoire", "pdh", "--outputPath", outputPath];

      await scrapStaples();

      const content = await readFile(outputPath, "utf-8");
      const lines = content.split("\n").filter((line) => line.trim());
      expect(lines.length).toBeGreaterThan(0);
      for (const line of lines) {
        expect(line).toMatch(/^1 .+$/);
      }
      const sortedLines = lines.toSorted();
      expect(lines).toEqual(sortedLines);
    });
  });
});
