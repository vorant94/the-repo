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

function parseTop64Cards(html: string): Array<string> {
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

  return Array.from(cardNames).sort();
}

const top64Url = "https://paupergeddon.com/Top64.html";

console.info(`Fetching ${top64Url}...`);

const response = await fetch(top64Url);
if (!response.ok) {
  throw new Error(`Failed to fetch ${top64Url}: ${response.status}`);
}

const html = await response.text();
const cardNames = parseTop64Cards(html);

console.info(`Found ${cardNames.length} unique cards`);

console.info("Formatting output...");
const output = cardNames.join("\n");

const outputPath = "output/pauper-staples.txt";

console.info(`Writing to ${outputPath}...`);
await outputFile(outputPath, output, "utf-8");

console.info("Done!");
