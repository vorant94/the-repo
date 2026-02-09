import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { execFile } from "../src/shared/exec.ts";
import { createTempDir } from "./helpers/temp-dir.ts";

describe("wish-trade command", () => {
  it("should create wishlist.txt and bulk.txt from valid CSV", async () => {
    await using tempDir = await createTempDir("wish-trade");
    const inputPath = join(tempDir.path, "input.csv");
    const csvContent = [
      "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
      "Wishlist,list,Lightning Bolt,lea,161,normal,4",
      "Wishlist,list,Counterspell,lea,54,normal,2",
      "Bulk,binder,Fiery Temper,mom,142,normal,1",
    ].join("\n");

    await writeFile(inputPath, csvContent, "utf-8");

    await execFile("grimoire", [
      "wish-trade",
      "--inputPath",
      inputPath,
      "--outputDir",
      tempDir.path,
    ]);

    const wishlistContent = await readFile(
      join(tempDir.path, "wishlist.txt"),
      "utf-8",
    );
    const bulkContent = await readFile(join(tempDir.path, "bulk.txt"), "utf-8");

    expect(wishlistContent).toBe("4 Lightning Bolt\n2 Counterspell");
    expect(bulkContent).toBe("1 Fiery Temper (mom) 142");
  });

  it("should aggregate quantities for duplicate wishlist cards", async () => {
    await using tempDir = await createTempDir("wish-trade");
    const inputPath = join(tempDir.path, "input.csv");
    const csvContent = [
      "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
      "Wishlist,list,Lightning Bolt,lea,161,normal,4",
      "Wishlist,list,Lightning Bolt,usg,203,normal,2",
      "Wishlist,list,Counterspell,lea,54,normal,1",
    ].join("\n");

    await writeFile(inputPath, csvContent, "utf-8");

    await execFile("grimoire", [
      "wish-trade",
      "--inputPath",
      inputPath,
      "--outputDir",
      tempDir.path,
    ]);

    const wishlistContent = await readFile(
      join(tempDir.path, "wishlist.txt"),
      "utf-8",
    );

    expect(wishlistContent).toContain("6 Lightning Bolt");
    expect(wishlistContent).toContain("1 Counterspell");
  });

  it("should handle foil cards in bulk output", async () => {
    await using tempDir = await createTempDir("wish-trade");
    const inputPath = join(tempDir.path, "input.csv");
    const csvContent = [
      "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity",
      "Bulk,binder,Fiery Temper,mom,142,foil,1",
      "Bulk,binder,Lightning Bolt,lea,161,normal,2",
    ].join("\n");

    await writeFile(inputPath, csvContent, "utf-8");

    await execFile("grimoire", [
      "wish-trade",
      "--inputPath",
      inputPath,
      "--outputDir",
      tempDir.path,
    ]);

    const bulkContent = await readFile(join(tempDir.path, "bulk.txt"), "utf-8");

    expect(bulkContent).toContain("1 Fiery Temper (mom) 142 *F*");
    expect(bulkContent).toContain("2 Lightning Bolt (lea) 161");
  });

  it("should handle empty CSV (only headers)", async () => {
    await using tempDir = await createTempDir("wish-trade");
    const inputPath = join(tempDir.path, "input.csv");
    const csvContent =
      "Binder Name,Binder Type,Name,Set code,Collector number,Foil,Quantity";

    await writeFile(inputPath, csvContent, "utf-8");

    await execFile("grimoire", [
      "wish-trade",
      "--inputPath",
      inputPath,
      "--outputDir",
      tempDir.path,
    ]);

    const wishlistContent = await readFile(
      join(tempDir.path, "wishlist.txt"),
      "utf-8",
    );
    const bulkContent = await readFile(join(tempDir.path, "bulk.txt"), "utf-8");

    expect(wishlistContent).toBe("");
    expect(bulkContent).toBe("");
  });
});
