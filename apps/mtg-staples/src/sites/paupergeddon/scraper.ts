import { TOP64_URL } from "./config.ts";
import { parseTop64Cards } from "./parser.ts";

export async function scrapeTop64Cards(): Promise<Array<string>> {
  console.info(`Fetching ${TOP64_URL}...`);
  const response = await fetch(TOP64_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${TOP64_URL}: ${response.status}`);
  }

  const html = await response.text();
  const cards = parseTop64Cards(html);

  console.info(`Found ${cards.length} unique cards`);
  return cards;
}
