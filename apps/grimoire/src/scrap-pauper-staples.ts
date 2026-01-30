import { outputFile } from "fs-extra";
import { parseHTML } from "linkedom";

const basicLands = new Set([
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
]);
const top64Url = "https://paupergeddon.com/Top64.html";
const outputPath = "output/staples/pauper.txt";

console.info(`Fetching ${top64Url}...`);

const response = await fetch(top64Url);
if (!response.ok) {
  throw new Error(`Failed to fetch ${top64Url}: ${response.status}`);
}

console.info("Parsing...");

const html = await response.text();
const { document } = parseHTML(html);

const cardElements = document.querySelectorAll("span.card-hover");

const cardNames = new Set<string>();
for (const element of cardElements) {
  const text = element.textContent?.trim();
  if (!text) {
    continue;
  }

  // Extract card name by removing quantity prefix (e.g., "4 Fiery Temper" -> "Fiery Temper")
  const parts = text.split(" ");
  const cardName = parts.slice(1).join(" ");
  if (!cardName) {
    continue;
  }

  if (basicLands.has(cardName)) {
    continue;
  }

  cardNames.add(cardName);
}

console.info(`Found ${cardNames.size} unique cards`);

console.info("Formatting output...");

const output = Array.from(cardNames).sort().join("\n");

console.info(`Writing to ${outputPath}...`);

await outputFile(outputPath, output, "utf-8");

console.info("Done!");
