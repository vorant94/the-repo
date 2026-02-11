import { readFile } from "node:fs/promises";
import { type ParseArgsConfig, parseArgs } from "node:util";
import { log } from "@clack/prompts";
import { outputFile } from "fs-extra";
import Papa from "papaparse";
import { z } from "zod";
import {
  type CollectionCard,
  formatCollectionCard,
} from "../formatters/collection.ts";
import { formatDecklistCard } from "../formatters/decklist.ts";
import { manaBoxCollectionCardSchema } from "../formatters/manabox-collection.ts";
import { accent } from "../shared/logger.ts";

export async function wishTrade() {
  const { values } = parseArgs({
    options,
    strict: true,
  });

  const { inputPath, outputDir } = argsSchema.parse(values);

  log.step(`Reading ${inputPath}...`);

  const csvContent = await readFile(inputPath, "utf-8");

  log.step("Parsing CSV...");

  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  const wishlistCards = new Map<string, number>();
  const bulkCards: Array<CollectionCard> = [];

  for (const row of parsed.data) {
    const validRow = manaBoxCollectionCardSchema.parse(row);

    if (validRow["Binder Type"] === "list") {
      const existing = wishlistCards.get(validRow.Name) ?? 0;

      wishlistCards.set(validRow.Name, existing + validRow.Quantity);
    }

    if (
      validRow["Binder Type"] === "binder" &&
      validRow["Binder Name"] === "Bulk"
    ) {
      bulkCards.push({
        quantity: validRow.Quantity,
        name: validRow.Name,
        setCode: validRow["Set code"],
        collectorNumber: validRow["Collector number"],
        foil: validRow.Foil,
      });
    }
  }

  log.info(`Found ${accent(wishlistCards.size)} wishlist cards`);
  log.info(`Found ${accent(bulkCards.length)} bulk cards`);

  log.step("Formatting output...");

  const wishlistPath = `${outputDir}/wishlist.txt`;
  const bulkPath = `${outputDir}/bulk.txt`;

  const wishlistContent = wishlistCards
    .entries()
    .toArray()
    .map(([name, quantity]) => formatDecklistCard({ name, quantity }))
    .join("\n");
  log.info(`Writing to ${accent(wishlistPath)}...`);
  await outputFile(wishlistPath, wishlistContent, "utf-8");

  const bulkContent = bulkCards
    .map((card) => formatCollectionCard(card))
    .join("\n");
  log.info(`Writing to ${accent(bulkPath)}...`);
  await outputFile(bulkPath, bulkContent, "utf-8");

  log.success("Done!");
}

const argsSchema = z.object({
  inputPath: z.string().default("ManaBox_Collection.csv"),
  outputDir: z.string().default("."),
});

const options = {
  inputPath: { type: "string" },
  outputDir: { type: "string" },
} as const satisfies ParseArgsConfig["options"];
