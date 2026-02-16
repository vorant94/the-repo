import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { execFile } from "../src/shared/exec.ts";
import { createTempDir } from "../src/shared/temp-dir.ts";

describe("merge command", () => {
  const tempDirPrefix = "grimoire-e2e-merge";

  it("should merge two decklists taking max quantity per card", async () => {
    await using tempDir = await createTempDir(tempDirPrefix);
    const deck1Path = join(tempDir.path, "deck1.txt");
    const deck2Path = join(tempDir.path, "deck2.txt");

    await writeFile(
      deck1Path,
      ["4 Lightning Bolt", "2 Counterspell", "1 Brainstorm"].join("\n"),
      "utf-8",
    );
    await writeFile(
      deck2Path,
      ["2 Lightning Bolt", "4 Counterspell", "1 Ponder"].join("\n"),
      "utf-8",
    );

    await execFile("grimoire", [
      "merge",
      deck1Path,
      deck2Path,
      "--outputPath",
      `${tempDir.path}/merged.txt`,
    ]);

    const mergedContent = await readFile(
      join(tempDir.path, "merged.txt"),
      "utf-8",
    );

    expect(mergedContent).toContain("4 Lightning Bolt");
    expect(mergedContent).toContain("4 Counterspell");
    expect(mergedContent).toContain("1 Brainstorm");
    expect(mergedContent).toContain("1 Ponder");
  });

  it("should output sorted alphabetically", async () => {
    await using tempDir = await createTempDir(tempDirPrefix);
    const deck1Path = join(tempDir.path, "deck1.txt");
    const deck2Path = join(tempDir.path, "deck2.txt");

    await writeFile(
      deck1Path,
      ["4 Ponder", "2 Lightning Bolt", "1 Counterspell"].join("\n"),
      "utf-8",
    );
    await writeFile(deck2Path, ["1 Brainstorm"].join("\n"), "utf-8");

    await execFile("grimoire", [
      "merge",
      deck1Path,
      deck2Path,
      "--outputPath",
      `${tempDir.path}/merged.txt`,
    ]);

    const mergedContent = await readFile(
      join(tempDir.path, "merged.txt"),
      "utf-8",
    );

    const lines = mergedContent.split("\n");
    expect(lines[0]).toBe("1 Brainstorm");
    expect(lines[1]).toBe("1 Counterspell");
    expect(lines[2]).toBe("2 Lightning Bolt");
    expect(lines[3]).toBe("4 Ponder");
  });

  it("should handle collection format input", async () => {
    await using tempDir = await createTempDir(tempDirPrefix);
    const deck1Path = join(tempDir.path, "deck1.txt");
    const deck2Path = join(tempDir.path, "deck2.txt");

    await writeFile(
      deck1Path,
      ["4 Lightning Bolt (lea) 161", "2 Counterspell (lea) 54"].join("\n"),
      "utf-8",
    );
    await writeFile(
      deck2Path,
      ["1 Lightning Bolt", "4 Ponder (m10) 68"].join("\n"),
      "utf-8",
    );

    await execFile("grimoire", [
      "merge",
      deck1Path,
      deck2Path,
      "--outputPath",
      `${tempDir.path}/merged.txt`,
    ]);

    const mergedContent = await readFile(
      join(tempDir.path, "merged.txt"),
      "utf-8",
    );

    expect(mergedContent).toContain("4 Lightning Bolt");
    expect(mergedContent).toContain("2 Counterspell");
    expect(mergedContent).toContain("4 Ponder");
  });

  it("should merge 3+ decklists", async () => {
    await using tempDir = await createTempDir(tempDirPrefix);
    const deck1Path = join(tempDir.path, "deck1.txt");
    const deck2Path = join(tempDir.path, "deck2.txt");
    const deck3Path = join(tempDir.path, "deck3.txt");

    await writeFile(deck1Path, ["4 Lightning Bolt"].join("\n"), "utf-8");
    await writeFile(
      deck2Path,
      ["2 Lightning Bolt", "1 Ponder"].join("\n"),
      "utf-8",
    );
    await writeFile(
      deck3Path,
      ["3 Lightning Bolt", "2 Ponder", "1 Brainstorm"].join("\n"),
      "utf-8",
    );

    await execFile("grimoire", [
      "merge",
      deck1Path,
      deck2Path,
      deck3Path,
      "--outputPath",
      `${tempDir.path}/merged.txt`,
    ]);

    const mergedContent = await readFile(
      join(tempDir.path, "merged.txt"),
      "utf-8",
    );

    expect(mergedContent).toContain("4 Lightning Bolt");
    expect(mergedContent).toContain("2 Ponder");
    expect(mergedContent).toContain("1 Brainstorm");
  });
});
