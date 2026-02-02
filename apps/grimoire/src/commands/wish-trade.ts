import { readFile } from "node:fs/promises";
import { type ParseArgsConfig, parseArgs } from "node:util";
import { outputFile } from "fs-extra";
import Papa from "papaparse";
import { z } from "zod";
import {
  type CollectionCard,
  formatCollectionCard,
} from "../formatters/collection.ts";
import { formatDecklistCard } from "../formatters/decklist.ts";
import { manaBoxCollectionCardSchema } from "../formatters/manabox-collection.ts";

export async function wishTrade() {
  const { values } = parseArgs({
    options,
    strict: true,
  });

  const { inputPath, outputDir } = argsSchema.parse(values);

  console.info(`Reading ${inputPath}...`);

  const csvContent = await readFile(inputPath, "utf-8");

  console.info("Parsing CSV...");

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

  console.info(`Found ${wishlistCards.size} wishlist cards`);
  console.info(`Found ${bulkCards.length} bulk cards`);

  console.info("Writing output files...");

  const wishlistPath = `${outputDir}/wishlist.txt`;
  const bulkPath = `${outputDir}/bulk.txt`;

  const wishlistContent = wishlistCards
    .entries()
    .toArray()
    .map(([name, quantity]) => formatDecklistCard({ name, quantity }))
    .join("\n");
  await outputFile(wishlistPath, wishlistContent, "utf-8");

  const bulkContent = bulkCards
    .map((card) => formatCollectionCard(card))
    .join("\n");
  await outputFile(bulkPath, bulkContent, "utf-8");

  console.info(`Wrote ${wishlistPath}`);
  console.info(`Wrote ${bulkPath}`);
  console.info("Done!");
}

const argsSchema = z.object({
  inputPath: z.string().default("ManaBox_Collection.csv"),
  outputDir: z.string().default("."),
});

const options = {
  inputPath: { type: "string" },
  outputDir: { type: "string" },
} as const satisfies ParseArgsConfig["options"];
