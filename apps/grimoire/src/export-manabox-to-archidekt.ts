import { readFile } from "node:fs/promises";
import { outputFile } from "fs-extra";
import { parse } from "papaparse";
import { z } from "zod";

const inputPath = "ManaBox_Collection.csv";
const outputDir = "output/lists";

const manaBoxRowSchema = z.object({
  "Binder Name": z.string(),
  "Binder Type": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Name: z.string(),
  "Set code": z.string(),
  "Collector number": z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Foil: z.string(),
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Quantity: z.string(),
});

type ManaBoxRow = z.infer<typeof manaBoxRowSchema>;

function formatCardForArchidekt(row: ManaBoxRow): string {
  const setCode = row["Set code"].toLowerCase();
  const foilMarker = row.Foil === "foil" ? " *F*" : "";
  return `${row.Quantity} ${row.Name} (${setCode}) ${row["Collector number"]}${foilMarker}`;
}

console.info(`Reading ${inputPath}...`);

const csvContent = await readFile(inputPath, "utf-8");

console.info("Parsing CSV...");

const parsed = parse(csvContent, {
  header: true,
  skipEmptyLines: true,
});

const wishlistCards: Array<string> = [];
const bulkCards: Array<string> = [];

for (const row of parsed.data) {
  const validRow = manaBoxRowSchema.parse(row);
  const formattedCard = formatCardForArchidekt(validRow);

  if (validRow["Binder Type"] === "list") {
    wishlistCards.push(formattedCard);
  }

  if (
    validRow["Binder Type"] === "binder" &&
    validRow["Binder Name"] === "Bulk"
  ) {
    bulkCards.push(formattedCard);
  }
}

console.info(`Found ${wishlistCards.length} wishlist cards`);
console.info(`Found ${bulkCards.length} bulk cards`);

console.info("Writing output files...");

const wishlistPath = `${outputDir}/wishlist.txt`;
const bulkPath = `${outputDir}/bulk.txt`;

await outputFile(wishlistPath, wishlistCards.join("\n"), "utf-8");
await outputFile(bulkPath, bulkCards.join("\n"), "utf-8");

console.info(`Wrote ${wishlistPath}`);
console.info(`Wrote ${bulkPath}`);
console.info("Done!");
