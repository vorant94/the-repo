import type { Format } from "../../types.ts";
import { buildStaplesUrl } from "./config.ts";
import { parseCardNames } from "./parser.ts";

export async function scrapeStaples(format: Format): Promise<Array<string>> {
  const url = buildStaplesUrl(format);

  console.info(`Fetching ${format} staples from ${url}...`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch page: ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();

  console.info("Parsing card names...");
  const cardNames = parseCardNames(html);

  console.info(`Found ${cardNames.length} cards`);

  return cardNames;
}
