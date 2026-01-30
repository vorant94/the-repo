import { top64Url } from "./config.ts";
import { parseTop64Cards } from "./parser.ts";

export async function scrapeTop64Cards(): Promise<Array<string>> {
  console.info(`Fetching ${top64Url}...`);

  const response = await fetch(top64Url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${top64Url}: ${response.status}`);
  }

  const html = await response.text();
  const cards = parseTop64Cards(html);

  console.info(`Found ${cards.length} unique cards`);
  return cards;
}
