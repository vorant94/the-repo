import { log } from "@clack/prompts";
import { accent } from "../../shared/logger.ts";

export async function fetchPage(url: string): Promise<string> {
  log.step(`Fetching ${accent(url)}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return await response.text();
}
