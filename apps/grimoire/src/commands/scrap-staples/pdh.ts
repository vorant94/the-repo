import { log } from "@clack/prompts";
import { parseHTML } from "linkedom";
import { accent } from "../../shared/logger.ts";

export function parsePdhCards(html: string): Set<string> {
  log.step("Parsing...");

  const { document } = parseHTML(html);

  const cardImages = document.querySelectorAll("a.gallery-item img");

  const cardNames = new Set<string>();
  for (const img of cardImages) {
    const cardName = img.getAttribute("alt")?.trim();
    if (!cardName) {
      continue;
    }

    cardNames.add(cardName);
  }

  log.info(`Found ${accent(cardNames.size)} unique cards`);
  return cardNames;
}
