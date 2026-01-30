import { readFile } from "node:fs/promises";
import { outputFile } from "fs-extra";
import Papa from "papaparse";

const inputPath = "ManaBox_Collection.csv";
const outputDir = "output/manabox";

interface ManaBoxRow {
  "Binder Name": string;
  "Binder Type": string;
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Name: string;
  "Set code": string;
  "Collector number": string;
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Foil: string;
  // biome-ignore lint/style/useNamingConvention: CSV header name from external ManaBox export format
  Quantity: string;
}

function formatCardForArchidekt(row: ManaBoxRow): string {
  const setCode = row["Set code"].toLowerCase();
  const foilMarker = row.Foil === "foil" ? " *F*" : "";
  return `${row.Quantity} ${row.Name} (${setCode}) ${row["Collector number"]}${foilMarker}`;
}

console.info(`Reading ${inputPath}...`);

const csvContent = await readFile(inputPath, "utf-8");

console.info("Parsing CSV...");

const parsed = Papa.parse<ManaBoxRow>(csvContent, {
  header: true,
  skipEmptyLines: true,
});

const wishlistCards: Array<string> = [];
const bulkCards: Array<string> = [];

for (const row of parsed.data) {
  if (!row.Name || !row["Set code"] || !row["Collector number"]) {
    continue;
  }

  const formattedCard = formatCardForArchidekt(row);

  if (row["Binder Type"] === "list") {
    wishlistCards.push(formattedCard);
  }

  if (row["Binder Type"] === "binder" && row["Binder Name"] === "Bulk") {
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
