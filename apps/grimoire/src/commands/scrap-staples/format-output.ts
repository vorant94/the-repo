import { log } from "@clack/prompts";
import { formatDecklistCard } from "../../formatters/decklist.ts";

export function formatOutput(cardNames: Set<string>): string {
  log.step("Formatting output...");

  return Array.from(cardNames)
    .sort()
    .map((name) => formatDecklistCard({ quantity: 1, name }))
    .join("\n");
}
